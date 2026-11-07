import { deleteComment, deletePrompt, report } from "@nw/api/endpoints/thread";
import { queryKeys, useApi, useSession } from "@nw/features";
import {
  API_MESSAGE,
  type Comment,
  type Friend,
  type Prompt,
  type PromptSource,
  type SubmitPromptType,
} from "@nw/types";
import {
  type InfiniteData,
  type QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  type ComposerMode,
  PromptComposer,
} from "@/components/compose/prompt-composer";
import {
  buildOptimisticPrompt,
  novelistToSource,
} from "@/components/compose/sources";
import { discardOutbox, getStore, useOutboxPosts } from "@/lib/local-store";
import { alertReportSent } from "@/lib/report";
import { LikersSheet } from "@/components/feed/likers-sheet";
import type { PromptReaction } from "@/components/feed/prompt-card";
import { ShareSheet } from "@/components/feed/share-sheet";
import { SharedWithSheet } from "@/components/feed/shared-with-sheet";
import {
  PostActions,
  type PostActionsTarget,
} from "@/components/thread/post-actions";

/**
 * Everything a feed of prompt cards can do, owned once per screen.
 *
 * Explore had all of this inline: which cards have their comments open, which
 * long bodies are unfolded, the composer for a new post or a comment, the
 * share sheet, the likers sheet, the ⋯ menu with edit, delete and report, and
 * the cache writes that keep a post you just wrote at the top of the feed
 * instead of behind a spinner. Home draws the same cards in a mixed feed and
 * needs every one of those, so they moved here and both screens call this.
 *
 * ## One set of sheets per screen
 *
 * The sheets come back as an element (`sheets`) for the screen to mount once,
 * under its list. A modal inside every cell of a recycling list is a modal
 * mounted forty times; see `prompt-card.tsx`.
 *
 * ## Both feed caches, always
 *
 * Every write goes to `explorePrompts` and `oocPosts`, whichever screen made
 * it: the same prompt can be in either feed depending on who posted it, and a
 * like made on one tab is forgotten on the other if only the visible cache is
 * patched. This is web's `handlePromptReacted` and `handlePromptSent` doing the
 * same job to its global cache. Home reads those same two keys, so a heart
 * given there is already right when Explore is opened.
 *
 * ## Why the open-card sets live here
 *
 * A card is a *slot* in a recycling list, and anything it holds belongs to the
 * slot rather than to the prompt — see the note at the top of
 * `prompt-card.tsx`. Sets of ids, read as a boolean per card, is what lets more
 * than one be open at once (web's behaviour) and what keeps a recycled cell
 * from carrying one prompt's open comments to the next.
 */

/** One frozen empty set, so resetting the open cards is not a new allocation. */
export const EMPTY_SET: ReadonlySet<string> = new Set();

/** One page of an infinite feed, as the cache holds it. */
type Pages = InfiniteData<Prompt[], number> | undefined;

/**
 * Every root a list of prompts is cached under: the two discovery feeds, a
 * novelist's prompts and posts, a character's prompts. A card edited in one
 * has to change in the others, which is why a write walks them all rather than
 * the feed the reader happens to be on.
 */
const FEED_ROOTS = [["explore"], ["novelist"], ["muse"]] as const;

/** Web's rule for which feed a new post belongs to. */
const feedKeyFor = (source: PromptSource) =>
  source.sourceType === "NOVELIST"
    ? queryKeys.oocPosts()
    : queryKeys.explorePrompts();

/** The props a `PromptCard` takes from this hook, ready to spread. */
export interface PromptCardActions {
  onCommentMore?: (comment: Comment) => void;
  onCompose?: (prompt: Prompt) => void;
  onMore?: (prompt: Prompt) => void;
  onShare: (prompt: Prompt) => void;
  onShowCommentLikers: (comment: Comment) => void;
  onShowSharedWith: (prompt: Prompt) => void;
  onOpenThread: (threadId: string) => void;
  onReacted: (promptId: string, next: PromptReaction) => void;
  onShowLikers: (prompt: Prompt) => void;
  onToggleComments: (promptId: string) => void;
  onUnfold: (promptId: string) => void;
}

export const usePromptFeedActions = ({
  onDeleted,
}: {
  /** The prompt was deleted — for a screen that showed only that prompt. */
  onDeleted?: () => void;
} = {}) => {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { novelist, status } = useSession();

  /** Read through a ref, so a screen's inline callback does not move `runDelete`. */
  const onDeletedRef = useRef(onDeleted);
  onDeletedRef.current = onDeleted;

  // Only a signed-in novelist can write, report or edit; a signed-out reader
  // gets neither button rather than a sheet with nothing in it.
  const canAct = status === "signed-in";

  // ─── Open cards ──────────────────────────────────────────────────────────

  const [expandedIds, setExpandedIds] =
    useState<ReadonlySet<string>>(EMPTY_SET);
  const [unfoldedIds, setUnfoldedIds] =
    useState<ReadonlySet<string>>(EMPTY_SET);

  const toggleComments = useCallback((promptId: string) => {
    setExpandedIds((open) => {
      const next = new Set(open);
      if (!next.delete(promptId)) next.add(promptId);
      return next;
    });
  }, []);

  const unfold = useCallback((promptId: string) => {
    setUnfoldedIds((open) => {
      const next = new Set(open);
      if (!next.delete(promptId)) next.add(promptId);
      return next;
    });
  }, []);

  /** Forget every open card — when the list under them is swapped. */
  const reset = useCallback(() => {
    setExpandedIds(EMPTY_SET);
    setUnfoldedIds(EMPTY_SET);
  }, []);

  // ─── Cache writes ────────────────────────────────────────────────────────

  /** One feed's pages, rewritten. `undefined` back leaves the cache alone. */
  const editFeed = useCallback(
    (key: QueryKey, edit: (pages: Prompt[][]) => Prompt[][] | undefined) => {
      queryClient.setQueryData(key, (data: Pages) => {
        if (!data) return data;
        const pages = edit(data.pages);
        return pages ? { ...data, pages } : data;
      });
    },
    [queryClient],
  );

  /**
   * The same rewrite across every paged list under `FEED_ROOTS`.
   *
   * Answering `undefined` when nothing matched is what keeps this from touching
   * a list the prompt is not in: react-query skips the write, so no card there
   * re-renders and no list is marked fresh for a change it never had.
   */
  const editFeeds = useCallback(
    (edit: (pages: Prompt[][]) => Prompt[][] | undefined) => {
      for (const queryKey of FEED_ROOTS) {
        queryClient.setQueriesData<Pages>({ queryKey }, (data) => {
          if (!data?.pages?.every(Array.isArray)) return undefined;
          const pages = edit(data.pages);
          return pages ? { ...data, pages } : undefined;
        });
      }
    },
    [queryClient],
  );

  /** Web's `handlePromptSent`: the new post at the head of its own feed. */
  const prependPrompt = useCallback(
    (prompt: Prompt) => {
      const prepend = (pages: Prompt[][]) =>
        pages.length === 0
          ? [[prompt]]
          : [[prompt, ...pages[0]], ...pages.slice(1)];
      editFeed(feedKeyFor(prompt.source), prepend);
      // And the writer's own list, when it has been opened.
      if (novelist) {
        editFeed(
          prompt.source.sourceType === "NOVELIST"
            ? queryKeys.novelistPosts(novelist.id)
            : queryKeys.novelistPrompts(novelist.id),
          prepend,
        );
      }
    },
    [editFeed, novelist],
  );

  const patchPrompt = useCallback(
    (promptId: string, patch: (prompt: Prompt) => Prompt) => {
      editFeeds((pages) => {
        let touched = false;
        const next = pages.map((page) => {
          if (!page.some((prompt) => prompt.id === promptId)) return page;
          touched = true;
          return page.map((prompt) =>
            prompt.id === promptId ? patch(prompt) : prompt,
          );
        });
        return touched ? next : undefined;
      });
      // The prompt page reads its own entry, not any of the lists.
      queryClient.setQueryData(
        queryKeys.prompt(promptId),
        (prompt: Prompt | null | undefined) => prompt && patch(prompt),
      );
    },
    [editFeeds, queryClient],
  );

  const dropPrompt = useCallback(
    (promptId: string) => {
      editFeeds((pages) => {
        if (!pages.some((page) => page.some((p) => p.id === promptId))) {
          return undefined;
        }
        return pages.map((page) => page.filter((p) => p.id !== promptId));
      });
      queryClient.setQueryData(queryKeys.prompt(promptId), null);
    },
    [editFeeds, queryClient],
  );

  /** Write a settled heart back into whichever lists hold that prompt. */
  const handleReacted = useCallback(
    (promptId: string, next: PromptReaction) =>
      patchPrompt(promptId, (prompt) => ({ ...prompt, ...next })),
    [patchPrompt],
  );

  // ─── Writing ─────────────────────────────────────────────────────────────

  const [composer, setComposer] = useState<ComposerMode | null>(null);
  const [sharing, setSharing] = useState<Prompt | null>(null);
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );
  const [menu, setMenu] = useState<
    (PostActionsTarget & { prompt: Prompt }) | null
  >(null);
  const [commentMenu, setCommentMenu] = useState<
    (PostActionsTarget & { comment: Comment }) | null
  >(null);
  const [sharedWith, setSharedWith] = useState<Friend[] | null>(null);
  /** The prompt of the comment being edited, for the list to refresh after. */
  const editedCommentPrompt = useRef<string | null>(null);

  /** Web's share button on the footer — the same sheet the menu opens. */
  const openShare = useCallback((prompt: Prompt) => setSharing(prompt), []);

  /** Stable: the sheet reads the prompt it was given, nothing else. */
  const openLikers = useCallback(
    (prompt: Prompt) => setLikers({ count: prompt.reactions, id: prompt.id }),
    [],
  );

  /**
   * The same sheet for anything else on the screen with a heart — an activity
   * card's, say — so a feed that mixes cards mounts one likers sheet.
   */
  const showLikers = useCallback(
    (target: { count: number; id: string }) => setLikers(target),
    [],
  );

  /**
   * Whether a source is this novelist — themselves, or one of their muses.
   *
   * Read through a ref, so it never changes. The session's novelist is a new
   * object every time the session query settles — twice on a cold start — and
   * this sits under `openMenu`, which sits in `cardProps`: depending on it
   * directly re-rendered every card on the screen each time, for a question
   * that is only asked when a menu is opened.
   */
  const novelistRef = useRef(novelist);
  novelistRef.current = novelist;
  const ownedBy = useCallback((source: PromptSource | undefined) => {
    const current = novelistRef.current;
    if (!source || !current) return false;
    if (source.sourceId === current.id) return true;
    return (current.muses ?? []).some((muse) => muse.id === source.sourceId);
  }, []);

  const openCommentMenu = useCallback(
    (comment: Comment) =>
      setCommentMenu({
        comment,
        owned: ownedBy(comment.source),
        variant: "comment",
      }),
    [ownedBy],
  );

  const openCommentLikers = useCallback(
    (comment: Comment) =>
      setLikers({ count: comment.reactions, id: comment.id }),
    [],
  );

  const openSharedWith = useCallback(
    (prompt: Prompt) => setSharedWith(prompt.sharedWith ?? []),
    [],
  );

  const openCompose = useCallback(() => {
    if (!novelist) return;
    setComposer({
      dropdownSelection: "ALL",
      initialSource: novelistToSource(novelist),
      kind: "create",
      type: "prompt",
    });
  }, [novelist]);

  /**
   * A comment on a prompt. Web's rule: an out-of-character prompt takes only
   * out-of-character comments, an in-character one only in-character — so the
   * composer is narrowed to the matching kind of sender before it opens.
   */
  const openComment = useCallback((prompt: Prompt) => {
    setComposer({
      dropdownSelection:
        prompt.source.sourceType === "NOVELIST" ? "NOVELIST" : "MUSE",
      kind: "create",
      parent: {
        author: prompt.source,
        createdOn: prompt.createdOn,
        id: prompt.id,
        media: prompt.media,
        reacted: prompt.reacted,
        reactions: prompt.reactions,
        text: prompt.text,
        variant: "prompt",
      },
      parentId: prompt.id,
      type: "comment",
    });
  }, []);

  const openMenu = useCallback(
    (prompt: Prompt) =>
      setMenu({ owned: ownedBy(prompt.source), prompt, variant: "prompt" }),
    [ownedBy],
  );

  const handleSent = useCallback(
    (prompt: Prompt, type: SubmitPromptType) => {
      if (type === "prompt") {
        prependPrompt(prompt);
        return;
      }
      // A comment: the prompt's count moves, and its comment list — if
      // anybody has opened it — is out of date.
      const parentId = composer?.kind === "create" ? composer.parentId : null;
      if (!parentId) return;
      patchPrompt(parentId, (entry) => ({
        ...entry,
        commentCount: entry.commentCount + 1,
      }));
      void queryClient.invalidateQueries({
        queryKey: queryKeys.promptComments(parentId),
      });
    },
    [composer, patchPrompt, prependPrompt, queryClient],
  );

  const handleEdited = useCallback(
    (id: string, html: string, type: SubmitPromptType) => {
      if (type === "prompt") {
        patchPrompt(id, (entry) => ({ ...entry, text: html }));
        return;
      }
      const promptId = editedCommentPrompt.current;
      if (promptId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.promptComments(promptId),
        });
      }
    },
    [patchPrompt, queryClient],
  );

  const runDelete = useCallback(
    async (prompt: Prompt) => {
      const result = await deletePrompt(api, prompt.id).catch(() => null);
      if (result?.message !== API_MESSAGE.Success) {
        Alert.alert(
          "Could not delete",
          "There was an issue while deleting this. Please try again.",
        );
        return;
      }
      dropPrompt(prompt.id);
      onDeletedRef.current?.();
    },
    [api, dropPrompt],
  );

  const runCommentDelete = useCallback(
    async (comment: Comment) => {
      const result = await deleteComment(api, comment.id).catch(() => null);
      if (result?.message !== API_MESSAGE.Success) {
        Alert.alert(
          "Could not delete",
          "There was an issue while deleting this. Please try again.",
        );
        return;
      }
      patchPrompt(comment.promptId, (entry) => ({
        ...entry,
        commentCount: Math.max(entry.commentCount - 1, 0),
      }));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.promptComments(comment.promptId),
      });
    },
    [api, patchPrompt, queryClient],
  );

  const runCommentReport = useCallback(
    async (comment: Comment) => {
      const result = await report(api, comment.id, "", "COMMENT").catch(
        () => null,
      );
      if (result?.message === API_MESSAGE.Success) {
        alertReportSent();
        return;
      }
      Alert.alert(
        "Could not report",
        "There was an issue while reporting this. Please try again.",
      );
    },
    [api],
  );

  const runReport = useCallback(
    async (prompt: Prompt) => {
      const result = await report(api, prompt.id, "", "PROMPT").catch(
        () => null,
      );
      if (result?.message === API_MESSAGE.Success) {
        alertReportSent();
        return;
      }
      Alert.alert(
        "Could not report",
        "There was an issue while reporting this. Please try again.",
      );
    },
    [api],
  );

  /**
   * Pushes inside the current tab's own stack — every tab that draws these
   * cards registers `threads/[threadId]`, so the reader stays where they were.
   */
  const openThread = useCallback(
    (threadId: string) =>
      router.push({
        params: { threadId },
        pathname: "/threads/[threadId]",
      }),
    [router],
  );

  /*
   * One object, stable while its callbacks are: a screen's `renderItem` can
   * list it as a single dependency and every memoised card keeps comparing in
   * one pointer check per prop.
   */
  /*
   * Prompts and posts written offline, as cards: drawn at the head of the
   * feed they belong to until they are sent (`local-store/outbox.ts`). Not
   * written into the query cache — the feed persists its pages, and a
   * waiting card must never be saved as if it were a real one.
   */
  const queuedPosts = useOutboxPosts();
  const queuedPrompts = useMemo<Prompt[]>(
    () =>
      queuedPosts
        .filter((entry) => entry.type === "prompt")
        .map((entry) => ({
          ...buildOptimisticPrompt(entry.payload.source, entry.payload),
          canInteract: false,
          createdOn: entry.createdAt,
          id: entry.id,
        })),
    [queuedPosts],
  );
  const discardQueued = useCallback((id: string) => {
    const store = getStore();
    if (store) void discardOutbox(store, id).catch(() => undefined);
  }, []);

  const cardProps = useMemo<PromptCardActions>(
    () => ({
      onCommentMore: canAct ? openCommentMenu : undefined,
      onCompose: canAct ? openComment : undefined,
      onDiscardQueued: discardQueued,
      onMore: canAct ? openMenu : undefined,
      onOpenThread: openThread,
      onReacted: handleReacted,
      onShare: openShare,
      onShowCommentLikers: openCommentLikers,
      onShowLikers: openLikers,
      onShowSharedWith: openSharedWith,
      onToggleComments: toggleComments,
      onUnfold: unfold,
    }),
    [
      canAct,
      discardQueued,
      handleReacted,
      openComment,
      openCommentLikers,
      openCommentMenu,
      openLikers,
      openMenu,
      openShare,
      openSharedWith,
      openThread,
      toggleComments,
      unfold,
    ],
  );

  const sheets: ReactNode = (
    <>
      <PromptComposer
        mode={composer}
        onClose={() => setComposer(null)}
        onEdited={handleEdited}
        onSent={handleSent}
      />

      <ShareSheet onClose={() => setSharing(null)} prompt={sharing} />

      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />

      <PostActions
        onClose={() => setMenu(null)}
        onDelete={() => {
          if (menu) void runDelete(menu.prompt);
        }}
        onEdit={() => {
          if (!menu) return;
          setComposer({
            html: menu.prompt.text,
            id: menu.prompt.id,
            kind: "edit",
            type: "prompt",
          });
        }}
        onReport={() => {
          if (menu) void runReport(menu.prompt);
        }}
        onShare={() => {
          if (menu) setSharing(menu.prompt);
        }}
        target={menu}
      />

      <PostActions
        onClose={() => setCommentMenu(null)}
        onDelete={() => {
          if (commentMenu) void runCommentDelete(commentMenu.comment);
        }}
        onEdit={() => {
          if (!commentMenu) return;
          editedCommentPrompt.current = commentMenu.comment.promptId;
          setComposer({
            html: commentMenu.comment.text,
            id: commentMenu.comment.id,
            kind: "edit",
            type: "comment",
          });
        }}
        onReport={() => {
          if (commentMenu) void runCommentReport(commentMenu.comment);
        }}
        target={commentMenu}
      />

      <SharedWithSheet
        friends={sharedWith}
        onClose={() => setSharedWith(null)}
      />
    </>
  );

  return {
    canAct,
    cardProps,
    discardQueued,
    expandedIds,
    novelist,
    openCompose,
    queuedPrompts,
    reset,
    sheets,
    showLikers,
    unfoldedIds,
  };
};
