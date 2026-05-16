import { ShouldRender } from "@novelist-world/ui";
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
import * as CommentS from "@/app/rp/prompt/[slug]/comment/styles";
import { MobileReplyComposer } from "@/components/mobile-reply-composer";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { PromptSource, Prompt as PromptType } from "@/types";
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
  const swipeTouchStartX = useRef<number | null>(null);

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

  // Lock outer page scroll while the overlay is open
  // Preserve scroll position and lock outer page scroll while overlay is open
  useEffect(() => {
    if (!showCommentOverlay) return;
    const el = document.querySelector(".page-container") as HTMLElement | null;
    if (!el) return;
    const savedScrollTop = el.scrollTop;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
      el.scrollTop = savedScrollTop;
    };
  }, [showCommentOverlay]);

  const buttonText = useMemo(() => {
    return open
      ? "Hide Threads"
      : comments.length === 0
        ? "Start new thread"
        : "View Threads";
  }, [open, comments.length]);

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
      {authState === "LOGGED_IN" && canInteract && (
        <>
          {isMobile ? (
            <PromptComposeTrigger
              avatarSrc={initialSelection?.image ?? novelist?.image ?? null}
              avatarAlt={initialSelection?.name ?? novelist?.username ?? "You"}
              onClick={handleAddCommentClick}
              placeholders={
                isOOCPost ? COMMENT_OOC_PLACEHOLDERS : COMMENT_PLACEHOLDERS
              }
            />
          ) : (
            <PromptInput
              className="comment-action"
              initialSelection={initialSelection}
              dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
              parentId={promptId}
              type="comment"
              onSend={refetchComments}
            />
          )}
        </>
      )}
      <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
        <S.PromptThreads.Root className={classNames({ open })}>
          {comments.length > 0 && (
            <S.PromptThreads.Header>
              <S.PromptThreads.LeftPre />
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
              <ShouldRender if={comments.length === 1}>
                <S.PromptThreads.LeftPlaceholder />
              </ShouldRender>
              <S.PromptThreads.LeftPost />
              <Collapsible.Trigger asChild>
                <S.PromptThreads.Toggle $active={open}>
                  {buttonText}{" "}
                  <S.ThreadsCounter>{comments.length}</S.ThreadsCounter>
                </S.PromptThreads.Toggle>
              </Collapsible.Trigger>
              <S.PromptThreads.Right />
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
            className={classNames(theme, accent)}
            style={{ display: "contents" }}
            onTouchStart={(e) => {
              swipeTouchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (swipeTouchStartX.current === null) return;
              const deltaX =
                (e.changedTouches[0]?.clientX ?? 0) - swipeTouchStartX.current;
              swipeTouchStartX.current = null;
              if (deltaX > 60) closeOverlay();
            }}
          >
            <CommentS.PageContainer $closing={overlayClosing}>
              <CommentS.HeaderContainer>
                <CommentS.BackButton onClick={closeOverlay} aria-label="Back">
                  ←
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
                <div onTouchStart={(e) => e.stopPropagation()}>
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
