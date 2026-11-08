"use client";

import { REPORT_SENT_TOAST } from "@/utils/report";
import { Flex } from "@novelist-world/ui";
import type { Comment, PromptSource, Reply } from "@nw/types";
import { stubHandle } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoArrowBackOutline } from "react-icons/io5";
import { RiArrowGoBackLine, RiCheckboxCircleLine, RiFlagFill } from "react-icons/ri";
import { ShouldRender } from "@/components/common";
import { HiddenItem } from "@/components/common/hidden-item";
import { LikeButton } from "@/components/common/like-button";
import { MuseAvatar } from "@/components/common/muse-avatar";
import { NovelistAvatar } from "@/components/common/novelist-avatar";
import { DeletedThreadArt } from "@/components/book-art";
import { MissingPage } from "@/components/deleted-content/missing-page";
import { AppAlertDialog } from "@/components/dialog";
import {
  museToSource,
  novelistToSource,
} from "@/components/event-thread-input/helpers";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { InlineMusicPlayer } from "@/components/inline-music-player/page";
import { LoadMore } from "@/components/load-more/page";
import { MobileReplyComposer } from "@/components/mobile-reply-composer";
import { AppDropdownMenuResponsive } from "@/components/profile-more-dropdown";
import PromptInput from "@/components/prompt-input";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import {
  UpdatePromptForm,
  type UpdatePromptProps,
} from "@/components/update-prompt";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { useBindPageLoader, usePageRouter } from "@/hooks/use-page-router";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import {
  type CustomEventType,
  EVENTS,
  type PromptCommentReplyUpdatedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import {
  displayDate,
  getFileNameFromUrl,
  toFormattedDate,
} from "@/utils/helpers";
import {
  getOutgoingThreadsAction,
  getUnreadReplyCount,
} from "../../outgoing-threads/actions";
import {
  concludeCommentAction,
  deleteCommentAction,
  deletePromptAction,
  deleteReplyAction,
  getCommentAction,
  getRepliesAction,
  reportAction,
} from "../actions";
import * as S from "./styles";

const useGetComment = (commentId: string) => {
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { on: onPromptEvent, off: offPromptEvent } = useCustomEvents(
    EVENTS.PROMPT.base,
  );
  const { on: onCommentEvent, off: offCommentEvent } = useCustomEvents(
    EVENTS.COMMENT.base,
  );

  useEffect(() => {
    const handlePromptUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      const updatedText = e.detail.text;

      setComment((prev) => {
        if (!prev) return prev;
        const newComment: Comment = { ...prev };
        if (newComment.prompt === null) return prev;
        newComment.prompt.text = updatedText || "";
        return newComment;
      });
    };

    onPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);

    return () => {
      offPromptEvent(EVENTS.PROMPT.UPDATED, handlePromptUpdated);
    };
  }, [onPromptEvent]);

  useEffect(() => {
    const handleCommentUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      const updatedText = e.detail.text;

      setComment((prev) => {
        if (!prev) return prev;
        const newComment: Comment = { ...prev };
        newComment.text = updatedText || "";
        return newComment;
      });
    };

    onCommentEvent(EVENTS.COMMENT.UPDATED, handleCommentUpdated);

    return () => {
      offCommentEvent(EVENTS.COMMENT.UPDATED, handleCommentUpdated);
    };
  }, [onCommentEvent]);

  const fetchComment = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const _comment = await getCommentAction(commentId);

    if (_comment === null) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if ("message" in _comment) {
      setLoading(false);
      return;
    }

    setComment(_comment);
    setLoading(false);
  }, [commentId]);

  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  return { comment, loading, notFound, refetch: fetchComment, setComment };
};

const PAGE_SIZE = 2;

const useGetReplies = (commentId: string) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const refreshLatestReplies = useCallback(async () => {
    const _replies = await getRepliesAction(commentId, 1, PAGE_SIZE);

    if (!_replies || "message" in _replies) return;

    setReplies((prev) => {
      // Merge without duplicates
      const existingIds = new Set(prev.map((r) => r.id));
      const newReplies = _replies.filter((r) => !existingIds.has(r.id));

      return [...newReplies, ...prev];
    });
  }, [commentId]);

  const fetchReplies = useCallback(
    async (page: number, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setInitialLoading(true);
      }

      const _replies = await getRepliesAction(commentId, page, PAGE_SIZE);

      if (!_replies || "message" in _replies) {
        setInitialLoading(false);
        setLoadingMore(false);
        return;
      }

      setReplies((prev) => (append ? [...prev, ..._replies] : _replies));

      if (_replies.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setInitialLoading(false);
      setLoadingMore(false);
    },
    [commentId],
  );

  useEffect(() => {
    setReplies([]);
    setPageNumber(1);
    setHasMore(true);
    fetchReplies(1, false);
  }, [fetchReplies]);

  const loadMore = async () => {
    const nextPage = pageNumber + 1;
    await fetchReplies(nextPage, true);
    setPageNumber(nextPage);
  };

  return {
    hasMore,
    initialLoading,
    loadingMore,
    loadMore,
    refreshLatestReplies,
    replies,
    setReplies,
  };
};

type ReplyItemProps = {
  reply: Reply;
  highlightedReplyId: string | null;
  onEdit: (reply: Reply) => void;
  onRequestDelete: (replyId: string) => void;
  onRequestReport: (replyId: string) => void;
};

const ReplyItem = ({
  reply,
  highlightedReplyId,
  onEdit,
  onRequestDelete,
  onRequestReport,
}: ReplyItemProps) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");

  const { errorToast } = useUIContext();

  const [replyState, setReplyState] = useState({
    reacted: false,
    reactions: 0,
  });

  // Live state, not the fetched prop: the prop never updates after a like,
  // so passing it would make the next click like again instead of unliking.
  const toggleReplyLike = useToggleLike({
    id: reply.id || "",
    liked: replyState.reacted,
    type: "reply",
  });
  const replyLikePendingRef = useRef(false);

  // Re-sync only when the fetched like data changes. A text edit replaces
  // the reply object and must not reset the heart to the stale fetched value.
  const fetchedReplyReacted = reply.reacted || false;
  const fetchedReplyReactions = reply.reactions || 0;
  useEffect(() => {
    setReplyState({
      reacted: fetchedReplyReacted,
      reactions: fetchedReplyReactions,
    });
  }, [fetchedReplyReacted, fetchedReplyReactions]);

  const handleReplyLikeToggle = useCallback(async () => {
    if (replyLikePendingRef.current) return;
    replyLikePendingRef.current = true;
    const previous = replyState;
    setReplyState({
      reacted: !previous.reacted,
      reactions: previous.reacted
        ? previous.reactions - 1
        : previous.reactions + 1,
    });

    try {
      const response = await toggleReplyLike.toggleLike().catch(() => null);

      if (!response || "message" in response) {
        setReplyState(previous);
        errorToast(
          previous.reacted
            ? "Couldn't unlike this reply."
            : "Couldn't like this reply.",
        );
        return;
      }

      setReplyState({
        reacted: response.reacted,
        reactions: response.reactions,
      });
    } finally {
      replyLikePendingRef.current = false;
    }
  }, [toggleReplyLike, replyState, errorToast]);

  const onReplyLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;
    return handleReplyLikeToggle;
  }, [authState, handleReplyLikeToggle]);

  return (
    <S.ReplyWrapper key={reply.id} $highlight={highlightedReplyId === reply.id}>
      <Flex
        direction="column"
        gap={0}
        style={{ marginBottom: "10px", position: "relative" }}
        className={highlightedReplyId === reply.id ? "highlight" : ""}
      >
        <S.DropdownMenuContainer>
          <ShouldRender if={authState === "LOGGED_IN"}>
            <AppDropdownMenuResponsive
              trigger={<BsThreeDots size={18} />}
              items={
                novelist?.muses.some(
                  (muse) => muse.id === reply.source.sourceId,
                ) || reply.source.sourceId === novelist?.id
                  ? [
                      {
                        icon: <FaRegEdit />,
                        label: `Edit reply`,
                        onClick: () => {
                          onEdit(reply);
                        },
                      },
                      {
                        separator: true,
                      },
                      {
                        icon: <FaRegTrashCan />,
                        label: `Delete this reply`,
                        onClick: () => {
                          onRequestDelete(reply.id);
                        },
                        variant: "danger",
                      },
                    ]
                  : [
                      {
                        icon: <RiFlagFill />,
                        label: `Report this reply`,
                        onClick: () => {
                          onRequestReport(reply.id);
                        },
                        variant: "danger",
                      },
                    ]
              }
            />
          </ShouldRender>
        </S.DropdownMenuContainer>
        <S.ReplyHeaderContainer>
          <ShouldRender if={reply?.source.sourceType === "MUSE"}>
            <MuseAvatar
              preview
              museId={reply?.source.sourceId || ""}
              image={reply?.source.image || ""}
              name={reply?.source.name || ""}
              avatar={reply?.source.avatar}
            />
          </ShouldRender>
          <ShouldRender if={reply?.source.sourceType === "NOVELIST"}>
            <NovelistAvatar
              preview
              username={reply?.source.urlProp || ""}
              image={reply?.source.image || ""}
              name={reply?.source.name || ""}
              avatar={reply?.source.avatar}
            />
          </ShouldRender>
          <S.SourceInfo>
            <S.SourceName>{reply?.source.name}</S.SourceName>
            <ShouldRender if={Boolean(reply?.createdOn)}>
              <S.PromptSubheader
                title={reply?.createdOn ? displayDate(reply.createdOn) : ""}
                dateTime={reply?.createdOn}
              >
                {reply?.createdOn ? toFormattedDate(reply?.createdOn) : ""}
              </S.PromptSubheader>
            </ShouldRender>
          </S.SourceInfo>
        </S.ReplyHeaderContainer>

        <S.PromptTextContainer>
          <RichTextRenderer
            savedText={reply.text ?? ""}
            collapsedHeight={100}
            overlayHidden
          />
        </S.PromptTextContainer>
        {reply.media && (
          <S.MediaContainer>
            <ShouldRender if={reply?.media.toLocaleLowerCase().endsWith("mp4")}>
              <S.PromptVideo src={`${reply?.media}#t=0.3`} controls />
            </ShouldRender>
            <ShouldRender
              if={!reply?.media.toLocaleLowerCase().endsWith("mp4")}
            >
              <AppImageViewer src={reply?.media} alt="Reply media">
                <S.PromptImage src={reply.media || ""} alt="image" />
              </AppImageViewer>
            </ShouldRender>
          </S.MediaContainer>
        )}
        <S.PromptContentFooter>
          <LikeButton
            onLike={onReplyLike}
            parentId={reply.id}
            liked={replyState.reacted}
            likes={replyState.reactions}
          />
        </S.PromptContentFooter>
      </Flex>
    </S.ReplyWrapper>
  );
};

export default function ThreadPage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const cachedOutgoingThreads = useGlobalState("cachedOutgoingThreads");
  const setGlobalState = useGlobalStoreSet();
  const commentId = params?.slug as string;
  const {
    comment,
    loading: loadingComments,
    notFound,
    setComment,
  } = useGetComment(commentId);
  const {
    replies,
    initialLoading,
    loadingMore,
    loadMore,
    hasMore,
    setReplies,
    refreshLatestReplies,
  } = useGetReplies(commentId);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const replyAreaRef = useRef<HTMLDivElement | null>(null);
  const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(
    null,
  );

  const { successToast, errorToast } = useUIContext();

  // State for optimistic updates
  const [promptState, setPromptState] = useState({
    reacted: false,
    reactions: 0,
  });

  // Top level of ThreadPage. `liked` is the live state, not the fetched prop,
  // so a second click unlikes instead of liking again.
  const togglePromptLike = useToggleLike({
    id: comment?.prompt?.id || "",
    liked: promptState.reacted,
    type: "prompt",
  });
  const promptLikePendingRef = useRef(false);

  useEffect(() => {
    if (comment?.prompt) {
      setPromptState({
        reacted: comment.prompt.reacted || false,
        reactions: comment.prompt.reactions || 0,
      });
    }
  }, [comment?.prompt]);

  // Handle toggle
  const handlePromptLikeToggle = useCallback(async () => {
    if (promptLikePendingRef.current) return;
    promptLikePendingRef.current = true;
    const previous = promptState;
    setPromptState({
      reacted: !previous.reacted,
      reactions: previous.reacted
        ? previous.reactions - 1
        : previous.reactions + 1,
    });

    try {
      const response = await togglePromptLike.toggleLike().catch(() => null);

      if (!response || "message" in response) {
        // rollback to the exact pre-click state
        setPromptState(previous);
        errorToast(
          previous.reacted
            ? "Couldn't unlike this prompt."
            : "Couldn't like this prompt.",
        );
        return;
      }

      setPromptState({
        reacted: response.reacted,
        reactions: response.reactions,
      });
    } finally {
      promptLikePendingRef.current = false;
    }
  }, [togglePromptLike, promptState, errorToast]);

  // Memoized onLike
  const onPromptLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;
    return handlePromptLikeToggle;
  }, [authState, handlePromptLikeToggle]);

  const [commentState, setCommentState] = useState({
    reacted: false,
    reactions: 0,
  });

  // Live state, not the fetched prop (see togglePromptLike).
  const toggleCommentLike = useToggleLike({
    id: comment?.id || "",
    liked: commentState.reacted,
    type: "comment",
  });
  const commentLikePendingRef = useRef(false);

  // Re-sync only when the fetched like data changes. Concluding the thread
  // replaces the comment object and must not reset the heart.
  const fetchedCommentReacted = comment?.reacted || false;
  const fetchedCommentReactions = comment?.reactions || 0;
  useEffect(() => {
    setCommentState({
      reacted: fetchedCommentReacted,
      reactions: fetchedCommentReactions,
    });
  }, [fetchedCommentReacted, fetchedCommentReactions]);

  const handleCommentLikeToggle = useCallback(async () => {
    if (commentLikePendingRef.current) return;
    commentLikePendingRef.current = true;
    const previous = commentState;
    setCommentState({
      reacted: !previous.reacted,
      reactions: previous.reacted
        ? previous.reactions - 1
        : previous.reactions + 1,
    });

    try {
      const response = await toggleCommentLike.toggleLike().catch(() => null);

      if (!response || "message" in response) {
        setCommentState(previous);
        errorToast(
          previous.reacted
            ? "Couldn't unlike this comment."
            : "Couldn't like this comment.",
        );
        return;
      }

      setCommentState({
        reacted: response.reacted,
        reactions: response.reactions,
      });
    } finally {
      commentLikePendingRef.current = false;
    }
  }, [toggleCommentLike, commentState, errorToast]);

  const onCommentLike = useMemo(() => {
    if (authState !== "LOGGED_IN") return undefined;
    return handleCommentLikeToggle;
  }, [authState, handleCommentLikeToggle]);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showDeleteCommentAlert, setShowDeleteCommentAlert] = useState(false);
  const [showReportCommentAlert, setShowReportCommentAlert] = useState(false);
  const [showDeletePromptAlert, setShowDeletePromptAlert] = useState(false);
  const [showReportPromptAlert, setShowReportPromptAlert] = useState(false);
  const [showEditPromptAlert, setShowEditPromptAlert] = useState(false);
  const [editPromptPayload, setEditPromptPayload] =
    useState<UpdatePromptProps["payload"]>(null);
  const [editPromptType, setEditPromptType] =
    useState<UpdatePromptProps["type"]>("prompt");
  const [selectedReplyId, setSelectedReplyId] = useState("");
  const isPromptOwner =
    novelist?.muses.some(
      (muse) => muse.id === comment?.prompt?.source.sourceId,
    ) || comment?.prompt?.source.sourceId === novelist?.id;
  const isCommentOwner =
    novelist?.muses.some((muse) => muse.id === comment?.source.sourceId) ||
    comment?.source.sourceId === novelist?.id;
  const canConcludeComment = isCommentOwner || isPromptOwner;

  const { routeToPage } = usePageRouter();
  useBindPageLoader(loadingComments);
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;

  // Lock the outer page scroll on mobile so the fixed thread layout isn't
  // scrollable and doesn't show a top gap from a previous page's scroll
  // offset carried over via Next.js client-side navigation. The document
  // scrolls, not .page-container (see rp/styles.ts).
  useEffect(() => {
    if (!isMobile) return;
    const el = document.scrollingElement as HTMLElement | null;
    if (!el) return;
    el.style.overflow = "hidden";
    el.scrollTop = 0;
    return () => {
      el.style.overflow = "";
    };
  }, [isMobile]);

  const { on: onReplyEvent, off: offReplyEvent } = useCustomEvents(
    EVENTS.REPLY.base,
  );

  const isOOCPost = comment?.prompt?.source.sourceType === "NOVELIST";

  const initialSelection: PromptSource | undefined = useMemo(() => {
    if (!novelist) return undefined;

    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);

    // 1️⃣ If OOC post → always novelist
    if (isOOCPost) {
      return novelistSource;
    }

    // 2️⃣ If there are replies, find latest reply from our muses
    if (replies?.length) {
      const museIds = new Set((novelist.muses ?? []).map((m) => m.id));

      const latestMuseReply = [...replies]
        .reverse() // assuming replies are chronological
        .find((reply) => museIds.has(reply.source.sourceId));

      if (latestMuseReply) {
        return latestMuseReply.source;
      }
    }

    // 3️⃣ Fallback → first muse if available
    if (museSources.length > 0) {
      return museSources[0];
    }

    // 4️⃣ Final fallback → novelist
    return novelistSource;
  }, [novelist, replies, isOOCPost]);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!initialLoading && replies.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true; // prevent future triggers
      const lastReply = replies[0];

      // Scroll to bottom
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      // // Highlight last reply
      // setHighlightedReplyId(lastReply.id);

      // // Remove highlight after 1 second
      // highlightTimer.current = setTimeout(() => {
      //   setHighlightedReplyId(null);
      // }, 1000);

      // // Cleanup on unmount
      // return () => {
      //   if (highlightTimer.current) {
      //     clearTimeout(highlightTimer.current);
      //   }
      // };
    }
  }, [initialLoading, replies]);

  useEffect(() => {
    const handleReplyUpdated = (
      e: CustomEventType<PromptCommentReplyUpdatedPayload>,
    ) => {
      const { id, text } = e.detail;

      setReplies((prev) =>
        prev
          ? prev.map((reply) =>
              reply.id === id ? { ...reply, text: text ?? "" } : reply,
            )
          : prev,
      );
    };

    onReplyEvent(EVENTS.REPLY.UPDATED, handleReplyUpdated);

    return () => {
      offReplyEvent(EVENTS.REPLY.UPDATED, handleReplyUpdated);
    };
  }, [onReplyEvent, setReplies]);

  const handleReportPrompt = async () => {
    if (!comment?.prompt?.id) return;

    const response = await reportAction(comment?.prompt?.id, "", "PROMPT");
    if (response?.message === API_MESSAGE.Success) {
      setShowReportPromptAlert(false);
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this prompt.");
    }
  };

  const handleReportReply = async () => {
    if (!selectedReplyId || selectedReplyId === "") return;

    const response = await reportAction(selectedReplyId, "", "REPLY");
    if (response?.message === API_MESSAGE.Success) {
      setShowReportAlert(false);
      setSelectedReplyId("");
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this reply.");
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedReplyId || selectedReplyId === "") return;

    const response = await deleteReplyAction(selectedReplyId);
    if (response?.message === API_MESSAGE.Success) {
      setReplies((prev) => prev.filter((r) => r.id !== selectedReplyId));
      setSelectedReplyId("");
      setShowDeleteAlert(false);
      successToast("Reply deleted.");
    } else {
      errorToast("There was an issue while deleting this reply.");
    }
  };

  const handleDeleteComment = async () => {
    if (!comment?.id) return;

    const response = await deleteCommentAction(comment.id);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Thread deleted.");
      onBackClick();
    } else {
      errorToast("There was an issue while deleting this thread.");
    }
  };

  const handleDeletePrompt = async () => {
    if (!comment?.prompt?.id) return;

    const response = await deletePromptAction(comment.prompt.id);
    if (response?.message === API_MESSAGE.Success) {
      successToast("Prompt deleted.");
      routeToPromptSource(comment.prompt.source);
    } else {
      errorToast("There was an issue while deleting this prompt.");
    }
  };

  const handleReportComment = async () => {
    if (!comment?.id) return;

    const response = await reportAction(comment?.id, "", "COMMENT");
    if (response?.message === API_MESSAGE.Success) {
      setShowReportCommentAlert(false);
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this comment.");
    }
  };

  const handleToggleConcluded = async () => {
    if (!comment?.id) return;

    const next = !comment.concluded;
    const response = await concludeCommentAction(comment.id, next);
    if (response?.message === API_MESSAGE.Success) {
      setComment((prev) => (prev ? { ...prev, concluded: next } : prev));
      successToast(
        next ? "Thread marked as concluded." : "Thread reopened.",
      );
      // Concluding answers/closes the thread — drop it from the outgoing
      // pending list if we owed a reply on it.
      if (next) await refreshOutgoingThreadsIfPending();
    } else {
      errorToast("There was an issue while updating this thread.");
    }
  };

  const concludeItem = {
    icon: comment?.concluded ? <RiArrowGoBackLine /> : <RiCheckboxCircleLine />,
    label: comment?.concluded ? `Reopen thread` : `Mark as concluded`,
    onClick: handleToggleConcluded,
  };
  const reportCommentItem = {
    icon: <RiFlagFill />,
    label: `Report this reply`,
    onClick: () => setShowReportCommentAlert(true),
    variant: "danger" as const,
  };

  // After deleting the prompt, land on its author's page: a muse page for
  // in-character posts, the novelist's profile for OOC posts.
  const routeToPromptSource = (source: PromptSource | undefined) => {
    if (!source?.sourceId) return;
    if (source.sourceType === "NOVELIST") {
      routeToPage(
        source.urlProp
          ? ROUTES.Profile.View(source.urlProp).Index
          : ROUTES.Home,
      );
      return;
    }
    routeToPage(ROUTES.Muse.View(source.sourceId));
  };

  const onBackClick = () => {
    if (!comment?.prompt?.id) return;
    routeToPage(`${ROUTES.Prompt.View(comment.prompt.id)}?threadOpen=true`);
  };

  // After a reply is sent, if this thread is one where we owed a reply (it's
  // in the cached outgoing-threads list), refetch that list so the now-answered
  // thread stops showing as pending. Matches by parentId — the outgoing card's
  // parentId is this page's commentId (ROUTES.Thread.View(parentId)).
  const refreshOutgoingThreadsIfPending = useCallback(async () => {
    const isPending = cachedOutgoingThreads?.some(
      (thread) => thread.parentId === commentId,
    );
    if (!isPending) return;

    // Refetch both the list (feeds the outgoing-threads page + right-sidebar
    // preview) and the unread reply count (feeds the badges in user-menu,
    // left-nav, and right-sidebar). Page size 5 matches the outgoing-threads
    // page that seeds the same cache.
    const [list, count] = await Promise.all([
      getOutgoingThreadsAction(1, 5),
      getUnreadReplyCount(),
    ]);

    if (list === null) {
      // 404 → no outgoing threads left at all.
      setGlobalState({ cachedOutgoingThreads: [] });
    } else if (!("message" in list)) {
      setGlobalState({ cachedOutgoingThreads: list });
    }

    if (count === null) {
      setGlobalState({ unreadReplyCount: 0 });
    } else if (typeof count === "number") {
      setGlobalState({ unreadReplyCount: count });
    }
  }, [cachedOutgoingThreads, commentId, setGlobalState]);

  const handleReplySent = useCallback(async () => {
    await refreshLatestReplies();
    await refreshOutgoingThreadsIfPending();
  }, [refreshLatestReplies, refreshOutgoingThreadsIfPending]);

  const loadReplies = () => {
    // A reply by someone the reader blacklisted is a stub with "Show"
    // (BLOCK_BLACKLIST_PLAN.md B11); one by someone blocked never arrives.
    return [...replies].reverse().map((reply) => (
      <HiddenItem
        key={reply.id}
        reason={reply.hiddenReason}
        kind="reply"
        handle={stubHandle(reply.source)}
      >
        <ReplyItem
          reply={reply}
          highlightedReplyId={highlightedReplyId}
          onEdit={(r) => {
            setEditPromptPayload(r);
            setEditPromptType("reply");
            setSelectedReplyId(r.id);
            setShowEditPromptAlert(true);
          }}
          onRequestDelete={(id) => {
            setShowDeleteAlert(true);
            setSelectedReplyId(id);
          }}
          onRequestReport={(id) => {
            setShowReportAlert(true);
            setSelectedReplyId(id);
          }}
        />
      </HiddenItem>
    ));
  };

  if (!loadingComments && notFound) {
    return (
      // On the canvas, not inside the conversation's sheet: there is no
      // conversation for the sheet to hold.
      <S.ParentContainer>
        <MissingPage
          art={<DeletedThreadArt />}
          title="This thread has come unravelled"
          message="Somebody pulled the loose end and the whole conversation went with it. The words were right here a moment ago, we swear."
          aside="(Or the link is wrong. Threads are slippery like that.)"
          actionLabel="Find a thread still in one piece"
          onAction={() => routeToPage(ROUTES.Home)}
        />
      </S.ParentContainer>
    );
  }

  return (
    <S.ParentContainer>
      <AppAlertDialog
        closeOnConfirm
        heading={`Report this prompt?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportPromptAlert}
        onOpenChange={setShowReportPromptAlert}
        onConfirm={handleReportPrompt}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Delete this prompt?`}
        text={`Deleting the prompt will remove all of its threads and replies too. Are you sure you want to delete this prompt?`}
        open={showDeletePromptAlert}
        onOpenChange={setShowDeletePromptAlert}
        onConfirm={handleDeletePrompt}
        actionButtonLabel="Delete"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Report this reply?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportCommentAlert}
        onOpenChange={setShowReportCommentAlert}
        onConfirm={handleReportComment}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Delete this thread?`}
        text={`Deleting this thread will remove all of its replies too. Are you sure you want to delete this thread?`}
        open={showDeleteCommentAlert}
        onOpenChange={setShowDeleteCommentAlert}
        onConfirm={handleDeleteComment}
        actionButtonLabel="Delete"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Report this reply?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportAlert}
        onOpenChange={setShowReportAlert}
        onConfirm={handleReportReply}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        closeOnConfirm
        heading={`Delete this reply?`}
        text={`This action is permanent. Are you sure you want to delete this reply?`}
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDeleteReply}
        actionButtonLabel="Delete"
      />
      <UpdatePromptForm
        type={editPromptType}
        payload={editPromptPayload}
        open={showEditPromptAlert}
        setOpen={setShowEditPromptAlert}
      />
      <S.RepliesContainer>
        <S.HeaderContainer>
          <Flex>
            <S.BackButton
              type="button"
              onClick={() => onBackClick()}
              aria-label="Go back"
            >
              <IoArrowBackOutline size={22} />
            </S.BackButton>
            <ShouldRender if={comment?.prompt?.source.sourceType === "MUSE"}>
              <MuseAvatar
                preview
                museId={comment?.prompt?.source.sourceId || ""}
                image={comment?.prompt?.source.image || ""}
                name={comment?.prompt?.source.name || ""}
                avatar={comment?.prompt?.source.avatar}
              />
            </ShouldRender>
            <ShouldRender
              if={comment?.prompt?.source.sourceType === "NOVELIST"}
            >
              <NovelistAvatar
                preview
                username={comment?.prompt?.source.urlProp || ""}
                image={comment?.prompt?.source.image || ""}
                name={comment?.prompt?.source.name || ""}
                avatar={comment?.prompt?.source.avatar}
              />
            </ShouldRender>
            <S.SourceInfo>
              <S.SourceName>{comment?.prompt?.source.name}</S.SourceName>
              <Flex gap={4}>
                <ShouldRender if={Boolean(comment?.prompt?.createdOn)}>
                  <S.PromptSubheader
                    title={
                      comment?.prompt?.createdOn
                        ? displayDate(comment?.prompt?.createdOn)
                        : ""
                    }
                    dateTime={comment?.prompt?.createdOn}
                  >
                    {comment?.prompt?.createdOn
                      ? toFormattedDate(comment?.prompt?.createdOn)
                      : ""}
                  </S.PromptSubheader>
                </ShouldRender>
                <ShouldRender
                  if={
                    comment?.prompt?.song !== undefined &&
                    comment?.prompt?.song !== null &&
                    comment?.prompt?.song.length > 0
                  }
                >
                  <InlineMusicPlayer
                    url={comment?.prompt?.song || ""}
                    name={getFileNameFromUrl(comment?.prompt?.song || "")}
                  />
                </ShouldRender>
              </Flex>
            </S.SourceInfo>
          </Flex>
          <S.HeaderDropdownMenuContainer>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <AppDropdownMenuResponsive
                trigger={<BsThreeDots size={18} />}
                items={
                  isPromptOwner
                    ? [
                        {
                          icon: <FaRegEdit />,
                          label: `Edit prompt`,
                          onClick: () => {
                            setEditPromptPayload(comment?.prompt || null);
                            setEditPromptType("prompt");
                            setShowEditPromptAlert(true);
                          },
                        },
                        // This page is one thread, so the prompt's menu can
                        // conclude/reopen it too — same item as the reply's.
                        concludeItem,
                        {
                          separator: true,
                        },
                        {
                          icon: <FaRegTrashCan />,
                          label: `Delete this prompt`,
                          onClick: () => setShowDeletePromptAlert(true),
                          variant: "danger",
                        },
                      ]
                    : [
                        // The reply's owner can conclude too, from either menu.
                        ...(canConcludeComment
                          ? [concludeItem, { separator: true }]
                          : []),
                        {
                          icon: <RiFlagFill />,
                          label: `Report this prompt`,
                          onClick: () => setShowReportPromptAlert(true),
                          variant: "danger",
                        },
                      ]
                }
              />
            </ShouldRender>
          </S.HeaderDropdownMenuContainer>
        </S.HeaderContainer>
        <Flex direction="column">
          <S.PromptTextContainer>
            <RichTextRenderer
              savedText={comment?.prompt?.text ?? ""}
              collapsedHeight={100}
              overlayHidden
            />
          </S.PromptTextContainer>
          {comment?.prompt?.media && (
            <S.MediaContainer>
              <ShouldRender
                if={comment?.prompt?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <S.PromptVideo
                  src={`${comment?.prompt?.media}#t=0.3`}
                  controls
                />
              </ShouldRender>
              <ShouldRender
                if={!comment?.prompt?.media.toLocaleLowerCase().endsWith("mp4")}
              >
                <AppImageViewer src={comment?.prompt?.media} alt="Prompt media">
                  <S.PromptImage
                    src={comment?.prompt?.media || ""}
                    alt="image"
                  />
                </AppImageViewer>
              </ShouldRender>
            </S.MediaContainer>
          )}
          {comment !== undefined &&
            comment?.prompt !== undefined &&
            comment.prompt?.id !== undefined && (
              <S.PromptContentFooter>
                <LikeButton
                  onLike={onPromptLike}
                  parentId={comment?.prompt?.id}
                  liked={promptState.reacted}
                  likes={promptState.reactions}
                />
              </S.PromptContentFooter>
            )}
        </Flex>
        <Flex
          direction="column"
          style={{ marginBottom: "10px", position: "relative" }}
        >
          <S.DropdownMenuContainer>
            <ShouldRender if={authState === "LOGGED_IN"}>
              <AppDropdownMenuResponsive
                trigger={<BsThreeDots size={18} />}
                items={
                  isCommentOwner
                    ? [
                        {
                          icon: <FaRegEdit />,
                          label: `Edit reply`,
                          onClick: () => {
                            setEditPromptPayload(comment);
                            setEditPromptType("comment");
                            setShowEditPromptAlert(true);
                          },
                        },
                        concludeItem,
                        {
                          separator: true,
                        },
                        {
                          icon: <FaRegTrashCan />,
                          label: `Delete this reply`,
                          onClick: () => setShowDeleteCommentAlert(true),
                          variant: "danger",
                        },
                      ]
                    : canConcludeComment
                      ? [concludeItem, { separator: true }, reportCommentItem]
                      : [reportCommentItem]
                }
              />
            </ShouldRender>
          </S.DropdownMenuContainer>
          <S.ReplyHeaderContainer>
            <ShouldRender if={comment?.source.sourceType === "MUSE"}>
              <MuseAvatar
                preview
                museId={comment?.source.sourceId || ""}
                image={comment?.source.image || ""}
                name={comment?.source.name || ""}
                avatar={comment?.source.avatar}
              />
            </ShouldRender>
            <ShouldRender if={comment?.source.sourceType === "NOVELIST"}>
              <NovelistAvatar
                preview
                username={comment?.source.urlProp || ""}
                image={comment?.source.image || ""}
                name={comment?.source.name || ""}
                avatar={comment?.source.avatar}
              />
            </ShouldRender>
            <S.SourceInfo>
              <S.SourceName>{comment?.source.name}</S.SourceName>
              <ShouldRender if={Boolean(comment?.createdOn)}>
                <S.PromptSubheader
                  title={
                    comment?.createdOn ? displayDate(comment.createdOn) : ""
                  }
                  dateTime={comment?.createdOn}
                >
                  {comment?.createdOn
                    ? toFormattedDate(comment?.createdOn)
                    : ""}
                </S.PromptSubheader>
              </ShouldRender>
              <ShouldRender if={Boolean(comment?.concluded)}>
                <S.ConcludedChip>
                  <RiCheckboxCircleLine size={13} />
                  Concluded
                </S.ConcludedChip>
              </ShouldRender>
            </S.SourceInfo>
          </S.ReplyHeaderContainer>
          {/* The opening comment's words and media sit behind a stub when the
              reader blacklisted its author (B11); the header and its Report
              stay. */}
          <HiddenItem
            reason={comment?.hiddenReason}
            kind="comment"
            handle={stubHandle(comment?.source)}
          >
            <S.PromptTextContainer>
              <RichTextRenderer
                savedText={comment?.text ?? ""}
                collapsedHeight={100}
                overlayHidden
              />
            </S.PromptTextContainer>
            {comment?.media && (
              <S.MediaContainer>
                <ShouldRender
                  if={comment?.media.toLocaleLowerCase().endsWith("mp4")}
                >
                  <S.PromptVideo src={`${comment?.media}#t=0.3`} controls />
                </ShouldRender>
                <ShouldRender
                  if={!comment?.media.toLocaleLowerCase().endsWith("mp4")}
                >
                  <AppImageViewer src={comment?.media} alt="Comment media">
                    <S.PromptImage src={comment.media || ""} alt="image" />
                  </AppImageViewer>
                </ShouldRender>
              </S.MediaContainer>
            )}
          </HiddenItem>
          {comment !== undefined && comment?.prompt !== undefined && (
            <S.PromptContentFooter>
              <LikeButton
                onLike={onCommentLike}
                parentId={comment?.id}
                liked={commentState?.reacted}
                likes={commentState?.reactions}
              />
            </S.PromptContentFooter>
          )}
        </Flex>
        <ShouldRender if={hasMore}>
          <S.LoadMoreDivider>
            <LoadMore
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          </S.LoadMoreDivider>
        </ShouldRender>

        {loadReplies()}
        <ShouldRender if={Boolean(comment?.concluded)}>
          <S.ConcludedNotice>
            <RiCheckboxCircleLine size={16} />
            This thread has been concluded. No new replies can be added.
          </S.ConcludedNotice>
        </ShouldRender>
        <div ref={replyAreaRef}>
          {authState === "LOGGED_IN" &&
            !initialLoading &&
            comment?.prompt?.canInteract &&
            !comment?.concluded &&
            !isMobile && (
              <PromptInput
                parentId={commentId}
                type="reply"
                initialSelection={initialSelection}
                dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
                onSend={handleReplySent}
              />
            )}
        </div>
      </S.RepliesContainer>

      {/* Fixed bottom reply bar — mobile only */}
      {authState === "LOGGED_IN" &&
        !initialLoading &&
        comment?.prompt?.canInteract &&
        !comment?.concluded &&
        isMobile && (
          <MobileReplyComposer
            parentId={commentId}
            type="reply"
            initialSelection={initialSelection}
            dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
            onSend={handleReplySent}
          />
        )}
    </S.ParentContainer>
  );
}
