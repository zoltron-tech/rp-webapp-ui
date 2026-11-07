/**
 * Every query key in one place.
 *
 * Keys are the cache's only identity, so scattering string literals across
 * screens is how two hooks end up sharing a cache entry they did not mean to —
 * or failing to share one they did. Invalidation reads from here too:
 * `queryClient.invalidateQueries({ queryKey: queryKeys.notifications() })`
 * catches every page of the list.
 */
export const queryKeys = {
  authUser: () => ["session", "user"] as const,
  /** Every chapter you have saved your place in. Web's `/rp/bookmarks`. */
  bookmarks: () => ["bookmarks"] as const,
  /** The sound cues of one chapter. */
  chapterSoundscape: (eventId: string) =>
    ["story-chapter", eventId, "sound"] as const,
  /** Your saved place in one chapter. */
  chapterBookmark: (eventId: string) =>
    ["bookmarks", "chapter", eventId] as const,
  conversation: (conversationId: string) =>
    ["conversations", conversationId] as const,
  conversationMembers: (conversationId: string) =>
    ["conversations", conversationId, "members"] as const,
  conversationMessages: (conversationId: string) =>
    ["conversations", conversationId, "messages"] as const,
  conversations: () => ["conversations"] as const,
  /**
   * The explore feed's in-character prompts, paged.
   *
   * Under an "explore" root rather than "prompts" so the discovery feeds are
   * one prefix to invalidate and one prefix for the disk tier to whitelist —
   * and so nothing that invalidates a single prompt refetches the feed.
   */
  explorePrompts: () => ["explore", "prompts"] as const,
  /**
   * The home page's rails, under one "home" root so a pull to refresh can
   * invalidate every one of them by prefix. The feed's prompts and posts are
   * *not* here — they are `explorePrompts` and `oocPosts`, the same entries
   * Explore reads, so one fetch serves both screens.
   */
  friendSuggestions: () => ["home", "suggestions"] as const,
  /*
   * Deliberately not under "conversations".
   *
   * That prefix is invalidated on every delivered message, and the group count
   * only moves when someone creates or leaves a group. Nesting it there would
   * make an open inbox refetch the number on every incoming message, for an
   * answer that is almost always the same one.
   */
  groupCount: () => ["groups", "count"] as const,
  /** Your friends' activity, paged — web's `cachedHomeActivities`. */
  homeActivities: () => ["home", "activities"] as const,
  /** Characters by your friends, or by strangers. */
  homeMuses: (type: "friends" | "unknown") => ["home", "muses", type] as const,
  /**
   * Web's "Dive into the Stories" rail. Its own entry rather than the
   * library's: the rail pages by sixteen, the library by twelve, and one key
   * over two page sizes would hand each screen the other's pages.
   */
  homeStories: () => ["home", "stories"] as const,
  /** Web's library page: `/story/random`, paged. */
  library: () => ["library", "stories"] as const,
  /**
   * One character, by id, and the four lists that hang off its profile.
   *
   * Nested under the muse so leaving or deleting one invalidates everything
   * about it with a single `queryKeys.muse(id)` prefix. Prompts are keyed here
   * rather than under "explore" because `/prompt/by/:museId` is a different
   * list from the discovery feed, and nothing that pages the feed should
   * refetch a character's starters.
   */
  muse: (museId: string) => ["muse", museId] as const,
  museAboutSections: (museId: string) => ["muse", museId, "about"] as const,
  museConnections: (museId: string) => ["muse", museId, "connections"] as const,
  museMedia: (museId: string) => ["muse", museId, "media"] as const,
  musePrompts: (museId: string) => ["muse", museId, "prompts"] as const,
  /**
   * The signed-in novelist's full badge catalogue — earned and locked.
   *
   * No id in the key: `GET /badge` answers for the caller and there is no
   * variant for anyone else, so a key that took one would be promising
   * something the endpoint cannot do.
   */
  myBadges: () => ["badges", "me"] as const,
  /** Not under `notifications`: refreshing the badge must not refetch every page of the list. */
  notificationCounts: () => ["notification-counts"] as const,
  notificationMutes: () => ["notification-mutes"] as const,
  // "feed": the pages changed shape when the list moved to a cursor, and
  // the mobile app restores this cache from disk — under the old key it would
  // hand the new code pages it cannot read.
  notifications: () => ["notifications", "feed"] as const,
  /** One novelist's activity feed, paged. */
  novelistActivity: (username: string) =>
    ["profile", username, "activity"] as const,
  novelistFriends: (username: string) =>
    ["profile", username, "friends"] as const,
  novelistLeaderboard: () => ["leaderboard", "novelists"] as const,
  novelistMuses: (username: string) => ["profile", username, "muses"] as const,
  /** Your own songs: the endpoint answers for the caller. */
  ownMusic: () => ["own-music"] as const,
  /**
   * A novelist's own out-of-character posts, paged.
   *
   * Keyed by **id**, not handle: `/prompt/posts/by/:id` is, and a key that
   * disagreed with its request would be two cache entries for one list.
   */
  novelistPosts: (novelistId: string) =>
    ["novelist", novelistId, "posts"] as const,
  /** The prompts written by that novelist's muses, paged. Also keyed by id. */
  novelistPrompts: (novelistId: string) =>
    ["novelist", novelistId, "prompts"] as const,
  /** Every storyboard a novelist created or co-writes. Web's `/story/by/:handle`. */
  novelistStories: (username: string) =>
    ["profile", username, "stories"] as const,
  /** The explore feed's out-of-character posts, paged. Web's `/prompt/posts`. */
  oocPosts: () => ["explore", "posts"] as const,
  /**
   * The threads this novelist has replied into, newest first.
   *
   * Its own root rather than under "prompts": the list is about *your*
   * outgoing replies, and nothing that invalidates a prompt should refetch it.
   */
  outgoingThreads: () => ["outgoing-threads"] as const,
  /** Threads with new replies, across every page of that list. */
  outgoingUnreadCount: () => ["outgoing-threads", "unread"] as const,
  profile: (username: string) => ["profile", username] as const,
  /** One prompt by id — the prompt page, reached from an activity. */
  prompt: (promptId: string) => ["prompt", promptId] as const,
  /**
   * The comments hanging off one prompt, unpaged — which is what the endpoint
   * answers.
   *
   * Its own root rather than under "explore": the same list is read from every
   * feed a prompt appears in, and keying it by the *feed* would be one cache
   * entry per place the card is drawn.
   */
  promptComments: (promptId: string) =>
    ["prompt", promptId, "comments"] as const,
  /**
   * The novelists who reacted to one target, paged. Web's
   * `getReactionLikersAction`, behind the same `/react/:id/likers`.
   *
   * Its own root: a reaction target can be a prompt, a comment, a muse or a
   * story, and none of those roots should refetch a likers list.
   */
  reactionLikers: (targetId: string) =>
    ["reactions", targetId, "likers"] as const,
  session: () => ["session"] as const,
  /**
   * One storyboard, and everything read off it.
   *
   * Nested under the story so a single `queryKeys.story(id)` prefix refreshes
   * the whole world bible at once. A chapter is keyed by its own id rather
   * than under the story: the reader opens on a chapter id and only learns
   * which story it belongs to from the answer.
   */
  story: (storyId: string) => ["story", storyId] as const,
  storyChapter: (eventId: string) => ["story-chapter", eventId] as const,
  storyChapterThreads: (eventId: string) =>
    ["story-chapter", eventId, "threads"] as const,
  storyCharacters: (storyId: string) =>
    ["story", storyId, "characters"] as const,
  storyCodex: (storyId: string) => ["story", storyId, "codex"] as const,
  storyMaps: (storyId: string) => ["story", storyId, "maps"] as const,
  storyNotes: (storyId: string) => ["story", storyId, "notes"] as const,
  storyTimeline: (storyId: string) => ["story", storyId, "timeline"] as const,
  /**
   * One thread — the comment at its root, with the prompt it hangs off.
   *
   * Keyed by the comment id, which is what both clients route by: the outgoing
   * card links to `parentId`, and that is the comment this fetches.
   */
  thread: (commentId: string) => ["thread", commentId] as const,
  /**
   * That thread's replies, paged.
   *
   * Nested under the thread so closing or deleting one invalidates both with a
   * single `queryKeys.thread(id)` prefix, rather than needing two calls that
   * can be forgotten separately.
   */
  threadReplies: (commentId: string) =>
    ["thread", commentId, "replies"] as const,
  unreadConversations: () => ["conversations", "unread"] as const,
} as const;
