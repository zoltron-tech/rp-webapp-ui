import type { PromptSource, Prompt as PromptType } from "@nw/types";
import classNames from "classnames";
import { Collapsible, Separator } from "radix-ui";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import * as CommentS from "@/app/rp/prompt/[slug]/comment/styles";
import { MobileReplyComposer } from "@/components/mobile-reply-composer";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import {
  type CustomEventType,
  EVENTS,
  type ItemDeletedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { Comment } from "../comment";
import { AvatarNew } from "../common/avatar-new";
import { museToSource, novelistToSource } from "../event-thread-input/helpers";
import {
  COMMENT_OOC_PLACEHOLDERS,
  COMMENT_PLACEHOLDERS,
  PromptComposeTrigger,
} from "../prompt-compose-trigger";
import PromptInput from "../prompt-input";
import { useGetComments } from "./helpers";
import { usePromptState } from "./prompt.store";
import { PromptContent } from "./prompt-content";
import { PromptHeader } from "./prompt-header";
import * as S from "./styled";

export const PromptThreads: FC = () => {
  const threadsOpen = usePromptState("threadOpen");
  const novelist = useGlobalState("novelist");
  const [open, setOpen] = useState(threadsOpen);
  const { routeToPage } = usePageRouter();
  const promptId = usePromptState("id");
  const promptSource = usePromptState("source");
  const authState = useGlobalState("authState");
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const canInteract = usePromptState("canInteract");
  const { comments, refetch: refetchComments } = useGetComments(promptId);
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;
  const setGlobalState = useGlobalStoreSet();
  const [showCommentOverlay, setShowCommentOverlay] = useState(false);
  const [overlayClosing, setOverlayClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeOverlay = useCallback(() => {
    setOverlayClosing(true);
    setTimeout(() => {
      setShowCommentOverlay(false);
      setOverlayClosing(false);
    }, 260);
  }, []);

  // Read enough prompt store fields to build the activePrompt snapshot.
  const promptText = usePromptState("text");
  const promptMedia = usePromptState("media");
  const promptCreatedOn = usePromptState("createdOn");
  const promptPrivacy = usePromptState("privacy");
  const promptReacted = usePromptState("reacted");
  const promptReactions = usePromptState("reactions");
  const promptSharedWith = usePromptState("sharedWith");
  const promptSong = usePromptState("song");
  const promptAlert = usePromptState("promptAlert");

  /** Snapshot of the current prompt to cache in global state. */
  const promptSnapshot = useMemo<PromptType>(
    () =>
      ({
        canInteract: canInteract ?? false,
        createdOn: promptCreatedOn,
        id: promptId,
        media: promptMedia,
        privacy: promptPrivacy,
        reacted: promptReacted,
        reactions: promptReactions,
        sharedWith: promptSharedWith,
        song: promptSong,
        source: promptSource,
        text: promptText,
      }) as PromptType,
    [
      canInteract,
      promptCreatedOn,
      promptId,
      promptMedia,
      promptPrivacy,
      promptReacted,
      promptReactions,
      promptSharedWith,
      promptSong,
      promptSource,
      promptText,
    ],
  );

  const handleAddCommentClick = () => {
    setGlobalState({ activePrompt: promptSnapshot });
    if (isMobile) {
      setShowCommentOverlay(true);
    } else {
      routeToPage(
        ROUTES.Prompt.Comment(promptId, {
          dropdownSelection: isOOCPost ? "NOVELIST" : "MUSE",
        }),
        { skipLoading: true },
      );
    }
  };

  // Preserve scroll position and lock outer page scroll while overlay is
  // open. The document scrolls, not .page-container (see rp/styles.ts).
  useEffect(() => {
    if (!showCommentOverlay) return;
    const el = document.scrollingElement as HTMLElement | null;
    if (!el) return;
    const savedScrollTop = el.scrollTop;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
      el.scrollTop = savedScrollTop;
    };
  }, [showCommentOverlay]);

  // Swipe-right-to-dismiss, attached as NATIVE listeners on the panel node.
  // Using native listeners (instead of React synthetic onTouch* props) means
  // touches inside the muse-select dialog — which Radix portals to
  // document.body, a DOM sibling of the panel — never reach this handler.
  // React synthetic events would otherwise bubble across the portal through the
  // React tree and let the panel intercept the dialog's touch gestures,
  // breaking its internal scrolling.
  useEffect(() => {
    const el = panelRef.current;
    if (!showCommentOverlay || !el) return;
    let startX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-no-swipe]")) {
        startX = null;
        return;
      }
      startX = e.touches[0]?.clientX ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX === null) return;
      const deltaX = (e.changedTouches[0]?.clientX ?? 0) - startX;
      startX = null;
      if (deltaX > 60) closeOverlay();
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [showCommentOverlay, closeOverlay]);

  // Footer "Reply" action (in PromptContent) opens the thread list for this
  // prompt by emitting on the shared prompt event bus.
  const { on: onPromptEvent, off: offPromptEvent } = useCustomEvents(
    EVENTS.PROMPT.base,
  );
  useEffect(() => {
    const handleOpenThreads = (e: CustomEventType<ItemDeletedPayload>) => {
      if (e.detail.id !== promptId) return;
      setOpen(true);
    };
    onPromptEvent(EVENTS.PROMPT.OPEN_THREADS, handleOpenThreads);
    return () => offPromptEvent(EVENTS.PROMPT.OPEN_THREADS, handleOpenThreads);
  }, [onPromptEvent, offPromptEvent, promptId]);

  const buttonText = useMemo(() => {
    if (isMobile) {
      return open ? "Hide" : comments.length === 0 ? "New thread" : "Threads";
    }
    return open
      ? "Hide Threads"
      : comments.length === 0
        ? "Start new thread"
        : "View Threads";
  }, [open, comments.length, isMobile]);

  const isOOCPost = promptSource.sourceType === "NOVELIST";

  const initialSelection: PromptSource | undefined = useMemo(() => {
    if (!novelist) return undefined;

    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);

    // 1️⃣ If OOC post → always novelist
    if (isOOCPost) {
      return novelistSource;
    }

    if (museSources.length > 0) {
      return museSources[0];
    }

    // 4️⃣ Final fallback → novelist
    return novelistSource;
  }, [novelist, isOOCPost]);

  return (
    <>
      {authState === "LOGGED_IN" &&
        canInteract &&
        (isMobile ? (
          <PromptComposeTrigger
            avatarSrc={initialSelection?.image ?? novelist?.image ?? null}
            avatarAlt={initialSelection?.name ?? novelist?.username ?? "You"}
            avatarNwImage={initialSelection?.avatar ?? novelist?.avatar}
            onClick={handleAddCommentClick}
            placeholders={
              isOOCPost ? COMMENT_OOC_PLACEHOLDERS : COMMENT_PLACEHOLDERS
            }
          />
        ) : (
          <PromptInput
            className="comment-action"
            noShell
            // Collapsed until asked for: an open rich-text editor (sender
            // chip, toolbar, tool buttons) in every card of the feed buried
            // the prompts it was there to reply to.
            defaultOpen={false}
            initialSelection={initialSelection}
            dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
            parentId={promptId}
            type="comment"
            onSend={refetchComments}
          />
        ))}
      <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
        <S.PromptThreads.Root className={classNames({ open })}>
          {comments.length > 0 && (
            <S.PromptThreads.Header>
              <S.PromptThreads.Avatars>
                {comments.slice(0, 2).map((comment) => {
                  const source = comment.source;
                  if (!source) return null;
                  return (
                    <AvatarNew
                      key={comment.id}
                      src={source.image}
                      alt={source.name}
                      style={{ cursor: "default" }}
                    />
                  );
                })}
              </S.PromptThreads.Avatars>
              <S.PromptThreads.Divider />
              <Collapsible.Trigger asChild>
                <S.PromptThreads.Toggle $active={open}>
                  {buttonText}
                  <S.ThreadsCounter>{comments.length}</S.ThreadsCounter>
                  <span className="toggle-caret">
                    <MdOutlineKeyboardArrowDown size={14} />
                  </span>
                </S.PromptThreads.Toggle>
              </Collapsible.Trigger>
            </S.PromptThreads.Header>
          )}
          <S.PromptThreads.Content>
            {comments.map((comment, index) => (
              <Comment
                key={comment.id}
                comment={comment}
                hide-separator={!canInteract && index === 0}
              />
            ))}
          </S.PromptThreads.Content>
        </S.PromptThreads.Root>
      </Collapsible.Root>

      {showCommentOverlay &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className={classNames(theme, accent)}
            style={{ display: "contents" }}
          >
            <CommentS.PageContainer $closing={overlayClosing}>
              <CommentS.HeaderContainer>
                <CommentS.BackButton
                  onClick={closeOverlay}
                  aria-label="Go back"
                >
                  <IoArrowBackOutline size={22} />
                </CommentS.BackButton>
                <CommentS.HeaderPromptWrap>
                  <PromptHeader />
                </CommentS.HeaderPromptWrap>
              </CommentS.HeaderContainer>
              <CommentS.ScrollArea>
                <Separator.Root
                  orientation="horizontal"
                  style={{
                    background: "var(--bg-6)",
                    height: 1,
                    marginBlock: 0,
                  }}
                />
                <PromptContent disableCollapse />
              </CommentS.ScrollArea>
              {authState === "LOGGED_IN" && canInteract && (
                <div data-no-swipe>
                  <MobileReplyComposer
                    parentId={promptId}
                    type="comment"
                    dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
                    initialSelection={initialSelection}
                    onSend={() => {
                      closeOverlay();
                      refetchComments();
                    }}
                  />
                </div>
              )}
            </CommentS.PageContainer>
          </div>,
          document.body,
        )}
    </>
  );
};
