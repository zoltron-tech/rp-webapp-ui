import { Ionicons } from "@expo/vector-icons";
import {
  concludeComment,
  deleteComment,
  deletePrompt,
  deleteReply,
  getComment,
  getReplies,
  report,
} from "@nw/api/endpoints/thread";
import { queryKeys, useApi, useSession } from "@nw/features";
import {
  API_MESSAGE,
  type Comment,
  type Prompt,
  type PromptSource,
  type Reply,
  stubHandle,
} from "@nw/types";
import { pluralize } from "@nw/utils";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import {
  type ComposerMode,
  PromptComposer,
} from "@/components/compose/prompt-composer";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { ShareSheet } from "@/components/feed/share-sheet";
import { EmptyScene } from "@/components/empty-feed";
import { ListStatus } from "@/components/list-status";
import { PromptCardSkeleton } from "@/components/skeleton";
import { HiddenItem } from "@/components/thread/hidden-item";
import { type PostVariant, ThreadPost } from "@/components/thread/post";
import {
  PostActions,
  type PostActionsTarget,
} from "@/components/thread/post-actions";
import { museToSource } from "@/components/compose/sources";
import { useTabBarScroll } from "@/context/tab-bar";
import { findCached } from "@/lib/cache-seed";
import { alertReportSent } from "@/lib/report";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { Avatar } from "@/components/avatar";
import { QueuedPostRow } from "@/components/queued-post-row";
import {
  discardOutbox,
  getStore,
  hydrateThreadPage,
  markThreadOpened,
  useOutboxPosts,
} from "@/lib/local-store";
import { Button } from "@/components/button";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * `/threads/:threadId` — one thread, read top to bottom.
 *
 * Lives here rather than in a route file because **two** tabs push it: an
 * Interactions card opens the thread it started, and a comment on an Explore
 * card opens the thread it is the root of. Expo Router calls that a shared
 * route — one screen, one route file per group, so the pushed screen belongs
 * to the tab it was opened from and the bar neither moves nor changes which
 * tab is lit. The alternative is a single route outside both groups, which
 * would drop the reader out of their tab on the way in.
 *
 * The native counterpart to `apps/web/src/app/rp/thread/[slug]`. The id is a
 * **comment** id, which is what the outgoing card links by (`parentId`), and
 * `getComment` answers with the comment *and* the prompt it hangs off — so the
 * whole head of the thread is one request and the replies are the other.
 *
 * Reading order is web's: the prompt, the reply that opened the thread, then
 * the replies under it, oldest first.
 *
 * ## Writing into it
 *
 * A Reply button under the replies opens the composer (`PromptComposer`) as a
 * reply to the opening comment, narrowed to the matching kind of sender as
 * web's `dropdownSelection` narrows it; the ⋯ menu's Edit opens the same
 * composer on any post that is yours, and Share opens the share sheet on the
 * prompt. Neither button appears on a concluded thread, which still draws its
 * notice: "this thread is closed" is worth knowing whether or not you could
 * have replied to it.
 *
 * ## What is deliberately not here
 *
 * The opening comment's ⋯ also concludes the thread or reopens it, for the
 * comment's author and the prompt's owner, as on web.
 *
 * ## Where it departs from web
 *
 * **The blocks are connected, not stacked.** A short spine runs between the
 * prompt, the opening reply and the replies section, aligned to the column the
 * avatars sit in. Three cards in a column are three cards; the same three with
 * a line between them are a thread, and on a phone that line is the only thing
 * still saying so once the top of the screen has scrolled away.
 *
 * **Older replies load upward, behind a button.** Web pages at two replies at a
 * time and reverses the whole list for display; this pages at ten, which is a
 * screenful rather than a third of one, and keeps the same ordering. Appending
 * older replies to the *top* is what the ordering demands, and doing it on a
 * scroll trigger would move the reader's place under their thumb — so it is a
 * button they press, above the list, exactly where web puts its own.
 *
 * **One request answers ownership.** Web recomputes `isPromptOwner` and
 * `isCommentOwner` inline in three places from `novelist.muses`; that is one
 * helper here (`ownedBy`), because three copies of a rule about who may delete
 * something is three chances to get it wrong.
 *
 * ## Why the fetch is local rather than in `@nw/features`
 *
 * The same reason the novelist profile's and the interactions list's are: every
 * hook in that package has a consumer on both clients, which is the rule that
 * makes it a contract rather than a guess. Web reads this through `useState`
 * and a manual page counter, so lifting a `useThread` now would be inventing an
 * interface for one caller. The query *keys* are shared already, so the cache
 * entries are the ones web will join.
 */

/**
 * Ten, where web uses two.
 *
 * Web's page size is tuned for a desktop column where two replies fill the
 * viewport and "load more" is a click away. Two on a phone is a button after
 * every other post; ten is roughly a screenful, and the request costs the same.
 */
const PAGE_SIZE = 10;

/**
 * Whether a write went through.
 *
 * These endpoints answer `{ message: "success" }` on success and some other
 * `message` on failure, so "has a message" is **not** an error test — reading
 * it as one is how a delete that worked reports that it did not. Web compares
 * against `API_MESSAGE.Success` in seven places; this is the same comparison,
 * once.
 */
const succeeded = (result: { message?: unknown } | null | undefined): boolean =>
  result?.message === API_MESSAGE.Success;

/**
 * The line between two blocks of the thread.
 *
 * Aligned to the avatar column rather than centred: every block reserves the
 * same 3pt left rule, so an avatar's centre is a fixed distance from the left
 * edge of the content and the spine can meet it. A centred connector would have
 * been alignment-proof and would also have read as a decorative divider rather
 * than as the thread continuing.
 */
const Spine = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.spine, { backgroundColor: theme.material.edge }]} />
  );
};

export const ThreadScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { novelist, status } = useSession();
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  /*
   * From disk first, if this thread was kept (`local-store/interactions.ts`):
   * the head and the replies are placed in the cache before the fetch, and
   * only then does the thread count as opened — the mark is what keeps it
   * among the ten the next cold start can show.
   */
  useEffect(() => {
    const store = getStore();
    if (!store || !threadId) return;
    void hydrateThreadPage(store, queryClient, threadId)
      .catch(() => undefined)
      .then(() => markThreadOpened(store, threadId))
      .catch(() => undefined);
  }, [queryClient, threadId]);

  const tabBarScroll = useTabBarScroll();
  // The tab bar steps aside here: the reply bar takes its place.
  useHideTabBar();
  const insets = useSafeAreaInsets();

  const thread = useQuery({
    enabled: Boolean(threadId),
    /*
     * The head of the thread, from the prompt card the reader tapped it on.
     *
     * A prompt's comments are cached whole under that prompt, and the prompt
     * itself sits in whichever feed drew the card — so the two posts at the top
     * are on screen at once and only the replies are waited for. A comment with
     * no cached prompt draws a ghost where the prompt goes, never the "no
     * longer available" note, which is only true of the server's answer.
     */
    placeholderData: (): Comment | undefined => {
      if (!threadId) return undefined;
      const cached = findCached(
        queryClient,
        [["prompt"]],
        (entity): Comment | undefined =>
          entity.id === threadId &&
          "promptId" in entity &&
          Array.isArray(entity.replies)
            ? (entity as unknown as Comment)
            : undefined,
      );
      if (!cached) return undefined;
      const prompt =
        cached.prompt ??
        findCached(
          queryClient,
          [["explore"], ["novelist"], ["prompt"]],
          (entity): Prompt | undefined =>
            entity.id === cached.promptId && "commentCount" in entity
              ? (entity as unknown as Prompt)
              : undefined,
        ) ??
        null;
      return { ...cached, prompt };
    },
    queryFn: async (): Promise<Comment | null> => {
      const result = await getComment(api, threadId);
      // `null` is a 404 — the thread was deleted, which is an empty state. A
      // `message` is a real failure, and the two must not collapse: one is
      // something to explain, the other something to retry.
      if (result === null) return null;
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.thread(threadId ?? ""),
  });

  const repliesQuery = useInfiniteQuery({
    enabled: Boolean(threadId),
    getNextPageParam: (
      lastPage: Reply[],
      _all: Reply[][],
      lastPageParam: number,
    ) => (lastPage.length >= PAGE_SIZE ? lastPageParam + 1 : undefined),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<Reply[]> => {
      const result = await getReplies(api, threadId, pageParam, PAGE_SIZE);
      if (result === null) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: queryKeys.threadReplies(threadId ?? ""),
  });

  /*
   * Newest-first pages, read oldest-first.
   *
   * The endpoint answers newest first and page 2 is older than page 1, so the
   * pages concatenated are already in newest-to-oldest order across the whole
   * list — reversing that once gives the conversation. This is web's
   * `[...replies].reverse()`, with the pages flattened first.
   */
  const replies = useMemo(
    () => (repliesQuery.data?.pages ?? []).flat().reverse(),
    [repliesQuery.data],
  );

  /*
   * Pull down: the head (with its prompt) and every reply page shown, fresh
   * from the server. Nothing is written to the device here — the store
   * writes through on every successful fetch (`attachPersistence`), so the
   * kept copy of this thread is replaced by what came back, and a thread the
   * server says is gone (404 → null) is deleted from it. Offline, the pull
   * just settles (`usePullToRefresh`) and the kept copy stays on screen.
   */
  const pull = usePullToRefresh(() =>
    Promise.all([thread.refetch(), repliesQuery.refetch()]),
  );

  /** The newest reply — the turn a new reply answers. */
  const latest = replies.length > 0 ? replies[replies.length - 1] : null;

  /**
   * Whether a post's source is this novelist — themselves, or one of their
   * muses writing in character.
   *
   * Web spells this out three times over. Once, here, is enough.
   */
  const ownedBy = useCallback(
    (source: PromptSource | undefined) => {
      if (!source || !novelist) return false;
      if (source.sourceId === novelist.id) return true;
      return (novelist.muses ?? []).some((muse) => muse.id === source.sourceId);
    },
    [novelist],
  );

  /** Which post the overflow sheet is open for, and what it may offer. */
  const [actions, setActions] = useState<
    (PostActionsTarget & { id: string }) | null
  >(null);

  const openMenu = useCallback(
    (id: string, variant: PostVariant, source: PromptSource | undefined) =>
      setActions({ id, owned: ownedBy(source), variant }),
    [ownedBy],
  );

  const closeMenu = useCallback(() => setActions(null), []);

  const [composer, setComposer] = useState<ComposerMode | null>(null);
  const [sharing, setSharing] = useState(false);

  // Replies written offline into this thread, drawn after the ones that are
  // here (`local-store/outbox.ts`).
  const allQueued = useOutboxPosts();
  const queuedReplies = useMemo(
    () =>
      allQueued.filter(
        (entry) =>
          entry.type === "reply" && entry.payload.commentId === threadId,
      ),
    [allQueued, threadId],
  );
  const discardQueued = useCallback((id: string) => {
    const store = getStore();
    if (store) void discardOutbox(store, id).catch(() => undefined);
  }, []);

  /** Whose likes are being shown: the post's id and the count on its heart. */
  const [likers, setLikers] = useState<{ count: number; id: string } | null>(
    null,
  );

  /** The text of whichever post the menu is open for, for the editor. */
  const textOf = useCallback(
    (id: string, variant: PostVariant): string | null => {
      const head = thread.data;
      if (!head) return null;
      if (variant === "prompt")
        return head.prompt?.id === id ? head.prompt.text : null;
      if (variant === "comment") return head.id === id ? head.text : null;
      const pages = repliesQuery.data?.pages ?? [];
      return pages.flat().find((reply) => reply.id === id)?.text ?? null;
    },
    [repliesQuery.data, thread.data],
  );

  const refreshThread = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.thread(threadId ?? ""),
    });
  }, [queryClient, threadId]);

  const runReport = useCallback(
    async (id: string, variant: PostVariant) => {
      // Web sends an empty reason and lets moderation ask; the endpoint's third
      // argument is the target's own vocabulary, upper-cased.
      // These endpoints do not pass `catchErrors`, so a network failure
      // rejects rather than resolving to `{ message: "error" }`. Without the
      // catch that is an unhandled rejection and the reader is told nothing.
      const result = await report(api, id, "", variant.toUpperCase()).catch(
        () => null,
      );

      if (succeeded(result)) {
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

  const runDelete = useCallback(
    async (id: string, variant: PostVariant) => {
      const result = await (variant === "prompt"
        ? deletePrompt(api, id)
        : variant === "comment"
          ? deleteComment(api, id)
          : deleteReply(api, id)
      ).catch(() => null);

      if (!succeeded(result)) {
        Alert.alert(
          "Could not delete",
          "There was an issue while deleting this. Please try again.",
        );
        return;
      }

      // Deleting a reply leaves a thread to go back to; deleting the prompt or
      // the opening reply takes the thread with it, so this screen has nothing
      // left to show and the list behind it is now wrong.
      if (variant === "reply") {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.threadReplies(threadId ?? ""),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.thread(threadId ?? ""),
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.outgoingThreads(),
      });
      router.back();
    },
    [api, queryClient, router, threadId],
  );

  const comment = thread.data;
  const prompt = comment?.prompt ?? null;

  const toggleConcluded = useCallback(async () => {
    if (!comment) return;
    const next = !comment.concluded;
    const result = await concludeComment(api, comment.id, next).catch(
      () => null,
    );
    if (result?.message !== API_MESSAGE.Success) {
      Alert.alert("Not saved", "Could not update that thread. Try again.");
      return;
    }
    queryClient.setQueryData<typeof comment>(
      queryKeys.thread(threadId ?? ""),
      (current) => (current ? { ...current, concluded: next } : current),
    );
  }, [api, comment, queryClient, threadId]);

  /**
   * Who the reply bar shows and the composer opens as. Web's rule: yourself on
   * an out-of-character thread; on an in-character one the character of yours
   * that spoke last here, so a conversation carries on in the same voice, and
   * your first character when none has yet.
   */
  const replyMuse = useMemo(() => {
    const muses = novelist?.muses ?? [];
    const lastOwn = [...replies]
      .reverse()
      .find((reply) => muses.some((m) => m.id === reply.source.sourceId));
    return (
      muses.find((muse) => muse.id === lastOwn?.source.sourceId) ?? muses[0]
    );
  }, [novelist, replies]);
  const isOoc = comment?.source.sourceType === "NOVELIST";
  const replyAs = isOoc ? novelist : (replyMuse ?? novelist);

  // Reading a thread clears its replies, so the tab's count may have moved.
  useEffect(
    () => () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.outgoingUnreadCount(),
      });
    },
    [queryClient],
  );

  /** Web opens on the newest reply; the prompt is a scroll up. Once only. */
  const scrollRef = useRef<ScrollView>(null);
  const openedAtEnd = useRef(false);
  const openAtEnd = useCallback(() => {
    if (openedAtEnd.current || !repliesQuery.isSuccess) return;
    if (replies.length === 0) return;
    openedAtEnd.current = true;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [replies.length, repliesQuery.isSuccess]);

  const openReply = () => {
    if (!comment) return;
    setComposer({
      // Web's rule: an out-of-character thread takes only
      // out-of-character replies, an in-character one only muses.
      dropdownSelection: isOoc ? "NOVELIST" : "MUSE",
      initialSource: !isOoc && replyMuse ? museToSource(replyMuse) : undefined,
      kind: "create",
      // What is being answered is the last turn, not the opening
      // one: the newest reply when there is one, the comment
      // otherwise. `replies` is oldest-first, so the newest is last.
      parent: latest
        ? {
            author: latest.source,
            createdOn: latest.createdOn,
            id: latest.id,
            media: latest.media,
            reacted: latest.reacted,
            reactions: latest.reactions,
            text: latest.text,
            variant: "reply",
          }
        : {
            author: comment.source,
            createdOn: comment.createdOn,
            id: comment.id,
            media: comment.media,
            reacted: comment.reacted,
            reactions: comment.reactions,
            text: comment.text,
            variant: "comment",
          },
      parentId: comment.id,
      type: "reply",
    });
  };

  // Only a signed-in novelist has anything to do in the menu: reporting needs
  // an account and deleting needs to be your own. Hiding the dots is better
  // than opening a sheet with nothing in it.
  const canAct = status === "signed-in";

  // Opened cold: the thread's shape — prompt, comment — as ghosts.
  if (thread.isPending) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ gap: space.lg }}>
          <PromptCardSkeleton reply={false} />
          <PromptCardSkeleton reply={false} />
        </View>
      </ScrollView>
    );
  }

  if (thread.error) {
    return (
      <ListStatus error={thread.error} onRetry={() => void thread.refetch()} />
    );
  }

  if (!comment) {
    return (
      <EmptyScene
        aside="(Or the link is wrong. Threads are slippery like that.)"
        scene="torn-thread"
        subtitle="Somebody pulled the loose end and the whole conversation went with it. The words were right here a moment ago, we swear."
        title="This thread has come unravelled"
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        onContentSizeChange={openAtEnd}
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
        style={styles.scroll}
      >
        {prompt ? (
          <>
            <ThreadPost
              author={prompt.source}
              createdOn={prompt.createdOn}
              id={prompt.id}
              media={prompt.media}
              onMore={
                canAct
                  ? () => openMenu(prompt.id, "prompt", prompt.source)
                  : undefined
              }
              onShowLikers={() =>
                setLikers({ count: prompt.reactions, id: prompt.id })
              }
              reacted={prompt.reacted}
              reactions={prompt.reactions}
              text={prompt.text}
              variant="prompt"
            />
            <Pressable
              accessibilityRole="link"
              hitSlop={space.sm}
              onPress={() =>
                router.push({
                  params: { promptId: prompt.id },
                  pathname: "/prompt/[promptId]",
                })
              }
              style={styles.openPrompt}
            >
              <Text
                style={[styles.openPromptLabel, { color: theme.accent.text }]}
              >
                Open the prompt
              </Text>
            </Pressable>
          </>
        ) : thread.isPlaceholderData ? (
          <PromptCardSkeleton reply={false} />
        ) : (
          /*
           * A comment whose prompt is gone. The API answers the comment on its
           * own in that case, and saying so is better than a thread that
           * silently begins in the middle.
           */
          <View
            style={[
              styles.missing,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons
              color={theme.textGray}
              name="help-circle-outline"
              size={16}
            />
            <Text style={[styles.missingLabel, { color: theme.textGray }]}>
              The prompt this thread started from is no longer available.
            </Text>
          </View>
        )}

        <Spine />

        <View style={[styles.sheet, theme.material.card]}>
          {/* The opening comment of someone the reader blacklisted waits
              behind a stub (BLOCK_BLACKLIST_PLAN.md B11). */}
          <HiddenItem
            handle={stubHandle(comment.source)}
            kind="comment"
            reason={comment.hiddenReason}
          >
            <ThreadPost
              author={comment.source}
              concluded={comment.concluded}
              createdOn={comment.createdOn}
              flat
              id={comment.id}
              media={comment.media}
              onMore={
                canAct
                  ? () => openMenu(comment.id, "comment", comment.source)
                  : undefined
              }
              onShowLikers={() =>
                setLikers({ count: comment.reactions, id: comment.id })
              }
              reacted={comment.reacted}
              reactions={comment.reactions}
              text={comment.text}
              variant="comment"
            />
          </HiddenItem>

          <View
            style={[
              styles.repliesHeader,
              { borderTopColor: theme.material.edge },
            ]}
          >
            <Ionicons
              color={theme.textGray}
              name="return-down-forward-outline"
              size={14}
            />
            <Text style={[styles.repliesLabel, { color: theme.textGray }]}>
              {replies.length === 0 && !repliesQuery.isPending
                ? "No replies yet"
                : `${replies.length} ${pluralize("reply", replies.length)}`}
            </Text>
            <View
              style={[styles.rule, { backgroundColor: theme.material.edge }]}
            />
          </View>

          {repliesQuery.isPending ? (
            <View style={styles.pending}>
              <PromptCardSkeleton reply={false} />
              <PromptCardSkeleton reply={false} />
            </View>
          ) : null}

          {/*
          An empty thread is the common case — most of these are waiting on
          somebody — so it gets a sentence rather than the bare "No replies yet"
          in the header above. It says what the state *means*, which is the
          difference between a screen that looks broken and one that looks
          finished.
        */}
          {!repliesQuery.isPending && replies.length === 0 ? (
            <Text style={[styles.emptyBody, { color: theme.textGray }]}>
              {comment.concluded
                ? "This thread was closed before anyone replied."
                : "Nothing has come back yet. When someone answers, it lands here."}
            </Text>
          ) : null}

          {/*
          Above the list, because the replies it fetches are older than the ones
          already drawn and belong at the top. A scroll trigger would put them
          there too — under the reader's thumb, mid-sentence.
        */}
          {repliesQuery.hasNextPage ? (
            <View style={styles.earlier}>
              <View
                style={[styles.rule, { backgroundColor: theme.material.edge }]}
              />
              <Button
                busy={repliesQuery.isFetchingNextPage}
                busyLabel="Loading…"
                icon="arrow-up"
                label="Earlier replies"
                onPress={() => void repliesQuery.fetchNextPage()}
                size="sm"
              />
              <View
                style={[styles.rule, { backgroundColor: theme.material.edge }]}
              />
            </View>
          ) : null}

          {replies.map((reply) => (
            <HiddenItem
              handle={stubHandle(reply.source)}
              key={reply.id}
              kind="reply"
              reason={reply.hiddenReason}
            >
              <ThreadReply
                canAct={canAct}
                onMenu={openMenu}
                onShowLikers={setLikers}
                reply={reply}
              />
            </HiddenItem>
          ))}
          {queuedReplies.map((entry) => (
            <QueuedPostRow
              entry={entry}
              key={entry.id}
              onDiscard={discardQueued}
            />
          ))}
        </View>

        {comment.concluded ? (
          <View
            style={[
              styles.concluded,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.success,
              },
            ]}
          >
            <Ionicons
              color={theme.success}
              name="checkmark-circle-outline"
              size={16}
            />
            <Text style={[styles.concludedLabel, { color: theme.text }]}>
              This thread has been concluded. No new replies can be added.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/*
        Web's fixed reply bar: your face and a field that is not a field, docked
        under the conversation. It was a button at the very end of the thread,
        which on a long one meant scrolling past every reply to answer any of
        them. The tab bar steps aside for it, as it does in a conversation.
      */}
      {canAct && prompt?.canInteract && !comment.concluded ? (
        <View
          style={[
            styles.replyBar,
            {
              backgroundColor: theme.glass.opaque,
              borderTopColor: theme.glass.edge,
              paddingBottom: Math.max(insets.bottom, space.m),
            },
          ]}
        >
          <Pressable
            accessibilityHint="Opens the composer"
            accessibilityLabel="Reply to this thread"
            accessibilityRole="button"
            onPress={openReply}
            style={({ pressed }) => [
              styles.replyRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Avatar
              image={replyAs?.avatar}
              name={replyAs?.firstName}
              size={36}
              uri={replyAs?.avatar?.src ?? replyAs?.image}
            />
            <View
              style={[
                styles.replyField,
                {
                  backgroundColor: theme.glass.field,
                  borderColor: theme.glass.fieldEdge,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.replyPlaceholder, { color: theme.textGray }]}
              >
                Reply to {(latest ?? comment).source.name.trim()}…
              </Text>
            </View>
            <View
              style={[styles.replySend, { backgroundColor: theme.accent.fill }]}
            >
              <Ionicons color={theme.accent.onFill} name="arrow-up" size={18} />
            </View>
          </Pressable>
        </View>
      ) : null}

      <PostActions
        concluded={comment?.concluded}
        onClose={closeMenu}
        onConclude={
          actions?.variant === "comment" &&
          (actions.owned || ownedBy(prompt?.source))
            ? () => void toggleConcluded()
            : undefined
        }
        onDelete={() => {
          if (actions) void runDelete(actions.id, actions.variant);
        }}
        onEdit={() => {
          if (!actions) return;
          const html = textOf(actions.id, actions.variant);
          if (html === null) return;
          setComposer({
            html,
            id: actions.id,
            kind: "edit",
            type: actions.variant === "post" ? "prompt" : actions.variant,
          });
        }}
        onReport={() => {
          if (actions) void runReport(actions.id, actions.variant);
        }}
        onShare={
          actions?.variant === "prompt" && prompt
            ? () => setSharing(true)
            : undefined
        }
        target={actions}
      />

      <PromptComposer
        mode={composer}
        onClose={() => setComposer(null)}
        // The thread and its replies are one query prefix; either kind of
        // change is a refetch of both, which is cheaper to get right than
        // patching a reply inside a paged list.
        onEdited={() => void refreshThread()}
        onSent={() => void refreshThread()}
      />

      <LikersSheet
        count={likers?.count ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />

      <ShareSheet
        onClose={() => setSharing(false)}
        prompt={sharing ? prompt : null}
      />
    </View>
  );
};

/**
 * One reply, with callbacks that are its own.
 *
 * The list used to build two closures per reply per render, which is what
 * kept `ThreadPost`'s memo from ever holding. Here they are made once per
 * reply and change only when the reply does.
 */
const ThreadReply = memo(
  ({
    canAct,
    onMenu,
    onShowLikers,
    reply,
  }: {
    canAct: boolean;
    onMenu: (
      id: string,
      variant: PostVariant,
      source: PromptSource | undefined,
    ) => void;
    onShowLikers: (likers: { count: number; id: string }) => void;
    reply: Reply;
  }) => {
    const edge = useAppTheme().material.edge;
    const { id, reactions, source } = reply;
    const more = useCallback(
      () => onMenu(id, "reply", source),
      [id, onMenu, source],
    );
    const likers = useCallback(
      () => onShowLikers({ count: reactions, id }),
      [id, onShowLikers, reactions],
    );

    return (
      <>
        <View style={[styles.messageRule, { backgroundColor: edge }]} />
        <ThreadPost
          author={source}
          createdOn={reply.createdOn}
          flat
          id={id}
          media={reply.media}
          onMore={canAct ? more : undefined}
          onShowLikers={likers}
          reacted={reply.reacted}
          reactions={reactions}
          text={reply.text}
          variant="reply"
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  openPrompt: { alignSelf: "flex-end", paddingTop: space.xs },
  openPromptLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  concluded: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.m,
  },
  concludedLabel: { flex: 1, fontSize: fontSize.label, lineHeight: 18 },
  /*
   * `gap` is small because the spine supplies the separation between the three
   * blocks; a wide gap *and* a connector reads as two ideas about the same
   * space.
   */
  content: { gap: space.sm, padding: space.md, paddingBottom: space.lg },
  earlier: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  emptyBody: {
    fontSize: fontSize.label,
    lineHeight: 19,
    paddingBottom: space.ml,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    textAlign: "center",
  },
  pending: { gap: space.ms, padding: space.m },
  loadMore: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: space.md,
  },
  loadMoreLabel: { fontSize: fontSize.label, fontWeight: "600" },
  /* Web's inset divider between messages. */
  messageRule: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: space.md,
  },
  missing: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.m,
  },
  missingLabel: { flex: 1, fontSize: fontSize.label, lineHeight: 18 },
  /*
   * Left-aligned with the rule trailing off to the right, rather than a label
   * centred between two rules. A centred label is a chapter break; this is a
   * heading for the list under it, and headings sit at the start of the line.
   */
  repliesHeader: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.s,
    marginHorizontal: space.md,
    paddingBottom: space.xs,
    paddingTop: space.m,
  },
  repliesLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  replyBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    paddingTop: space.ms,
  },
  replyField: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: space.md,
  },
  replyPlaceholder: { fontSize: fontSize.body },
  replyRow: { alignItems: "center", flexDirection: "row", gap: space.ms },
  replySend: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  screen: { flex: 1 },
  scroll: { flex: 1 },
  /* Web's conversation sheet: one material pane, the messages inside it. */
  sheet: {
    borderRadius: radius.sheet,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  /*
   * Sits under the avatar column: the content box starts at the card's own left
   * edge, the 3pt rule and 12pt of padding are inside it, and the 36pt avatar's
   * centre is 18 past that — so 33, less half this line's width.
   */
  spine: { height: 14, marginLeft: space.xl, width: 2 },
});
