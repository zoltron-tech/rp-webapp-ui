"use client";

import type { Comment as CommentType, PromptSource } from "@nw/types";
import {
  type FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Comment } from "@/components/comment";
import { usePromptStateSet } from "@/components/prompt/prompt.store";
import { PromptContent } from "@/components/prompt/prompt-content";
import { PromptHeader } from "@/components/prompt/prompt-header";
import * as PromptS from "@/components/prompt/styled";
import PromptInput from "@/components/prompt-input";
import { museToSource, PromptEvent } from "@/components/prompt-input/helpers";
import { StoreProvider } from "@/context/store/context";
import { useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePromoHarness } from "./harness";
import { installGifStub } from "./network-stub";
import {
  MUSES,
  NOVELIST,
  PROMPT,
  PROMPT_ID,
  SENT_COMMENT_BASE,
} from "./prompt-data";
import { applyFrame, DURATION, resetActions } from "./prompt-timeline";
import * as S from "./styles";

/** The senders the composer will offer, derived exactly as `PromptForm` does. */
const SOURCES: PromptSource[] = MUSES.map(museToSource);

/**
 * Moves the prompt's comment counter once the comment lands.
 *
 * Its own component because the counter lives in the prompt store, which the
 * scene creates — so only something rendered inside the provider can write to
 * it. In the app the count comes back with the refetched thread list.
 */
const CommentCount: FC<{ count: number }> = ({ count }) => {
  const setPromptState = usePromptStateSet();
  useEffect(() => {
    setPromptState({ commentCount: count });
  }, [count, setPromptState]);
  return null;
};

/**
 * A prompt, its composer, and the comment the composer posts.
 *
 * Laid out the way `PromptThreads` lays it out on desktop — the same
 * `PromptInput`, with the same props — but with the fetched thread list
 * replaced by the one comment this scene writes, so nothing has to be fetched.
 */
export const PromoPromptScene = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const setGlobalState = useGlobalStoreSet();

  /** Bumped to remount the composer when the capture seeks back to the top. */
  const [take, setTake] = useState(0);
  const [sent, setSent] = useState<CommentType | null>(null);

  const { emit } = useCustomEvents("prompt-input", PROMPT_ID);

  // The composer builds its sender list off the signed-in novelist's muses, so
  // the fixture novelist goes into the global store the shell set up.
  useLayoutEffect(() => {
    setGlobalState({ novelist: NOVELIST });
  }, [setGlobalState]);

  // The GIF picker is the one thing in this scene that would reach outside;
  // hand it fixtures instead. Installed before it can mount.
  useLayoutEffect(() => installGifStub(), []);

  /**
   * Nothing is posted.
   *
   * The scene drives the real composer, Send button included, and the real
   * submit handler would put a comment on novelist.world. So the submit is
   * caught in the capture phase, before React's own handler sees it, and the
   * two things a successful send does — emptying the editor and putting the
   * comment on the prompt — happen here instead. The comment's body is lifted
   * straight out of the editor, so the thread shows the markup the toolbar
   * actually built.
   */
  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;

    const intercept = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      const editor = composer.querySelector<HTMLElement>(
        '[contenteditable="true"][data-placeholder]',
      );
      const museId =
        composer.querySelector<HTMLInputElement>('input[name="muse"]')?.value ??
        "";
      const muse = MUSES.find((candidate) => candidate.id === museId);

      setSent({
        ...SENT_COMMENT_BASE,
        source: muse ? museToSource(muse) : SOURCES[0],
        text: editor?.innerHTML ?? "",
      });

      // What `PromptTextField` listens for to empty itself after a send.
      emit(PromptEvent.Sent, {});
    };

    composer.addEventListener("submit", intercept, true);
    return () => composer.removeEventListener("submit", intercept, true);
  }, [emit, take]);

  useLayoutEffect(() => {
    if (rootRef.current) applyFrame(rootRef.current, 0);
  }, []);

  const lastT = useRef(0);
  const seek = useCallback((t: number) => {
    // Seeking back to the top — the capture does it once, after running to the
    // end to warm the images up — has to undo what was typed and posted.
    // Remounting the composer is the only honest way to un-type it.
    if (t < 200 && lastT.current >= 200) {
      resetActions();
      setSent(null);
      setTake((current) => current + 1);
    }
    lastT.current = t;
    if (rootRef.current) applyFrame(rootRef.current, t);
  }, []);

  usePromoHarness(DURATION, seek);

  return (
    <S.Root ref={rootRef}>
      <S.PromptStage data-promo="stage">
        <StoreProvider
          storeId="prompt"
          initial={{ ...PROMPT, promptAlert: null, threadOpen: true }}
        >
          <CommentCount count={sent ? 1 : 0} />
          <PromptS.PromptRoot>
            <PromptHeader />
            <PromptContent disableCollapse />

            <div data-promo="composer" ref={composerRef}>
              <PromptInput
                key={take}
                className="comment-action"
                noShell
                type="comment"
                parentId={PROMPT_ID}
                dropdownSelection="MUSE"
                initialSelection={SOURCES[0]}
              />
            </div>

            {sent && (
              <div data-promo="sent-comment">
                <Comment comment={sent} />
              </div>
            )}
          </PromptS.PromptRoot>
        </StoreProvider>
      </S.PromptStage>
    </S.Root>
  );
};
