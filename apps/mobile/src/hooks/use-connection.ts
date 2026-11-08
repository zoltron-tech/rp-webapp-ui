import {
  createConversationIfNotExist,
  getConversationByUsername,
} from "@nw/api/endpoints/conversations";
import {
  acceptFriendRequest,
  blacklistUser,
  blockUser,
  cancelFriendRequest,
  deleteFriendRequest,
  reportProfile,
  sendFriendRequest,
  unblacklistNovelist,
  unfriendNovelist,
} from "@nw/api/endpoints/profile";
import { queryKeys, useApi } from "@nw/features";
import type { Friend, Novelist } from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * What one novelist can do about another.
 *
 * The connection is a single string on the profile — `FRIEND`,
 * `FRIEND_REQUEST_SENT`, `FRIEND_REQUEST_RECEIVED`, `BLOCKED`, `BLACKLISTED`,
 * or nothing — and every action here is a write that moves it. Web keeps the
 * profile in component state and patches that field by hand after each call;
 * the profile here lives in the query cache, so the patch goes there instead
 * and every screen reading the same key sees it at once.
 *
 * The endpoints are asymmetric in a way that is easy to get wrong, so it is
 * worth writing down: *invoke* sends a request (`targetId`), *react* accepts
 * one (`sourceId`), *delete* rejects one you received (`sourceId`), *cancel*
 * withdraws one you sent (`targetId`), and unfriend is a `DELETE` on a path of
 * its own. `@nw/api` already encodes all of that; nothing here builds a body.
 *
 * ## Two shapes, one table
 *
 * A profile shows one novelist and can afford an observer per action:
 * `useConnectionActions` gives it eight named mutations, each with its own
 * `isPending` for its own row in the menu.
 *
 * A *list* cannot. Eight mutations plus a conversation opener is nine
 * `MutationObserver`s created, subscribed and torn down for every row a
 * `FlatList` recycles, and a friends list recycles rows for a living — that
 * cost is what made scrolling it stutter while the leaderboard, whose rows hook
 * nothing, stayed smooth. `useConnectionAction` is the same table behind a
 * single observer that takes the action as a variable, so a row costs one.
 */

export type Connection =
  | "FRIEND"
  | "FRIEND_REQUEST_SENT"
  | "FRIEND_REQUEST_RECEIVED"
  | "BLOCKED"
  | "BLACKLISTED"
  | null;

/** All these need is who: a `Novelist` or a `Friend` both satisfy it. */
export interface ConnectionTarget {
  id: string;
  username: string;
}

type Api = ReturnType<typeof useApi>;

export type ConnectionActionName =
  | "accept"
  | "blacklist"
  | "block"
  | "cancel"
  | "reject"
  | "report"
  | "send"
  | "unblacklist"
  | "unfriend";

interface ActionSpec {
  call: (
    api: Api,
    id: string,
  ) => Promise<{ message?: string } | null | undefined>;
  /** Where the connection lands. `undefined` leaves it where it was. */
  connection?: Connection;
  /** How their friend count moves, when the action moves it. */
  friendDelta?: number;
}

/**
 * Every connection write in one table, so the two hooks below cannot drift.
 */
const ACTIONS: Record<ConnectionActionName, ActionSpec> = {
  accept: {
    call: acceptFriendRequest,
    connection: "FRIEND",
    // Their count on screen is theirs, and it has just gained you.
    friendDelta: 1,
  },
  blacklist: { call: blacklistUser, connection: "BLACKLISTED" },
  block: { call: blockUser, connection: "BLOCKED" },
  cancel: { call: cancelFriendRequest, connection: null },
  reject: { call: deleteFriendRequest, connection: null },
  report: { call: (api, id) => reportProfile(api, id, "") },
  send: { call: sendFriendRequest, connection: "FRIEND_REQUEST_SENT" },
  // Whatever lay under the blacklist (a friendship, a request) is read back
  // from the server afterwards; `null` is only what shows meanwhile.
  unblacklist: { call: unblacklistNovelist, connection: null },
  unfriend: { call: unfriendNovelist, connection: null, friendDelta: -1 },
};

/**
 * After a blacklist changes, the profile is read again (the connection under
 * it comes back) and the inbox lists too: the DM moves between Inbox and
 * Archived (BLOCK_BLACKLIST_PLAN.md B6).
 */
const refreshAfterBlacklist = (
  queryClient: QueryClient,
  target: ConnectionTarget,
) => {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.profile(target.username),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
};

const succeeded = (result: { message?: string } | null | undefined) =>
  result?.message === API_MESSAGE.Success;

const guard = async (
  call: Promise<{ message?: string } | null | undefined>,
): Promise<void> => {
  const result = await call;
  if (!succeeded(result)) throw new Error("The action could not be saved.");
};

/** The cache shape of every `useNovelistFriends` query. */
type FriendPages = { pages: Friend[][]; pageParams: unknown[] };

/**
 * Writes a new connection into every cached friends list this person appears
 * in.
 *
 * The row used to hold this in `useState`, seeded from its prop. That works
 * exactly as long as the row stays mounted — and a list row does not. A
 * `FlatList` unmounts a cell that scrolls out of its window and a `FlashList`
 * re-binds the cell to somebody else entirely, so "Add" was forgetting it had
 * been tapped the moment you scrolled past it and back.
 *
 * The cache is the one copy that outlives the cell, so the connection lives
 * here and the row is left with no state at all — which is also what makes it
 * safe to recycle.
 *
 * Matched on **id**, not username: it is what the row is keyed by, and a
 * novelist can sit in several cached friends lists at once (yours, and each
 * mutual friend's).
 */
const patchFriendLists = (
  queryClient: QueryClient,
  target: ConnectionTarget,
  connection: Connection,
) => {
  queryClient.setQueriesData<FriendPages>(
    {
      // Friends lists, and the likers list under a post: both page `Friend`
      // rows with a `connection`, and both draw the same button from it.
      predicate: (query) =>
        (query.queryKey[0] === "profile" && query.queryKey[2] === "friends") ||
        (query.queryKey[0] === "reactions" && query.queryKey[2] === "likers") ||
        // The home page's friend suggestions: the same rows, as cards.
        (query.queryKey[0] === "home" && query.queryKey[1] === "suggestions"),
    },
    (previous) => {
      if (!previous?.pages) return previous;
      if (
        !previous.pages.some((page) => page.some((f) => f.id === target.id))
      ) {
        // Untouched pages keep their identity, so a list this person is not in
        // does not re-render at all.
        return previous;
      }

      return {
        ...previous,
        pages: previous.pages.map((page) =>
          page.some((friend) => friend.id === target.id)
            ? page.map((friend) =>
                friend.id === target.id ? { ...friend, connection } : friend,
              )
            : page,
        ),
      };
    },
  );
};

/**
 * Writes a new connection into the cached profile, and into any friends list
 * showing the same person.
 *
 * The cache is the only copy — the screen reads it straight — so this is what
 * makes the buttons change without a refetch. `friendsCount` moves with it
 * where the action changes it, since the number is on screen a finger's width
 * from the button that just changed it.
 */
const usePatchConnection = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (target: ConnectionTarget, connection: Connection, friendDelta = 0) => {
      queryClient.setQueryData<Novelist | null>(
        queryKeys.profile(target.username),
        (current) =>
          current
            ? {
                ...current,
                connection,
                friendsCount: Math.max(current.friendsCount + friendDelta, 0),
              }
            : current,
      );

      patchFriendLists(queryClient, target, connection);

      // Your own friend list changed too, and it is what every other profile's
      // "mutual friends" line is computed from.
      if (friendDelta !== 0) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      }
    },
    [queryClient],
  );
};

/** The conversation with this novelist, looked up or created. */
const openConversation = async (
  api: Api,
  novelist: ConnectionTarget,
): Promise<string | null> => {
  const existing = await getConversationByUsername(api, novelist.username);
  if (existing && !("message" in existing)) return existing.id;

  const created = await createConversationIfNotExist(api, novelist.id);
  if (!created || "message" in created) return null;
  return created.id;
};

/**
 * Eight named mutations against one novelist — the profile's shape.
 *
 * Use it where a single novelist fills the screen. In a list, use
 * `useConnectionAction` instead: see the note at the top of this file.
 */
export const useConnectionActions = (novelist: ConnectionTarget) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const patchConnection = usePatchConnection();

  const patch = useCallback(
    (name: ConnectionActionName) => () => {
      const spec = ACTIONS[name];
      if (spec.connection === undefined) return;
      patchConnection(novelist, spec.connection, spec.friendDelta);
    },
    [novelist, patchConnection],
  );

  const send = useMutation({
    mutationFn: () => guard(ACTIONS.send.call(api, novelist.id)),
    onSuccess: patch("send"),
  });

  const cancel = useMutation({
    mutationFn: () => guard(ACTIONS.cancel.call(api, novelist.id)),
    onSuccess: patch("cancel"),
  });

  const accept = useMutation({
    mutationFn: () => guard(ACTIONS.accept.call(api, novelist.id)),
    onSuccess: patch("accept"),
  });

  const reject = useMutation({
    mutationFn: () => guard(ACTIONS.reject.call(api, novelist.id)),
    onSuccess: patch("reject"),
  });

  const unfriend = useMutation({
    mutationFn: () => guard(ACTIONS.unfriend.call(api, novelist.id)),
    onSuccess: patch("unfriend"),
  });

  const block = useMutation({
    mutationFn: () => guard(ACTIONS.block.call(api, novelist.id)),
    onSuccess: patch("block"),
  });

  const blacklist = useMutation({
    mutationFn: () => guard(ACTIONS.blacklist.call(api, novelist.id)),
    onSuccess: () => {
      patch("blacklist")();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(),
      });
    },
  });

  /** Remove from blacklist (B3, B15). */
  const unblacklist = useMutation({
    mutationFn: () => guard(ACTIONS.unblacklist.call(api, novelist.id)),
    onSuccess: () => {
      patch("unblacklist")();
      refreshAfterBlacklist(queryClient, novelist);
    },
  });

  const report = useMutation({
    mutationFn: () => guard(ACTIONS.report.call(api, novelist.id)),
  });

  return {
    accept,
    blacklist,
    block,
    cancel,
    reject,
    report,
    send,
    unblacklist,
    unfriend,
  };
};

export interface ConnectionActionVariables {
  action: ConnectionActionName | "message";
  novelist: ConnectionTarget;
}

/**
 * Every connection action, and opening a conversation, behind one observer.
 *
 * Built for list rows. Which action ran is a *variable* rather than a hook, so
 * a row that can add, cancel, accept, reject or message costs the same as a row
 * that can do one of those — and `variables.action` is what a row reads to know
 * which of its buttons should be spinning.
 *
 * `message` resolves to a conversation id; every other action resolves to
 * `null` and throws when the server did not say `Success`.
 */
export const useConnectionAction = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const patchConnection = usePatchConnection();

  return useMutation({
    mutationFn: async ({
      action,
      novelist,
    }: ConnectionActionVariables): Promise<string | null> => {
      if (action === "message") return openConversation(api, novelist);
      await guard(ACTIONS[action].call(api, novelist.id));
      return null;
    },
    onSuccess: (_result, { action, novelist }) => {
      if (action === "message") return;
      const spec = ACTIONS[action];
      if (spec.connection === undefined) return;
      patchConnection(novelist, spec.connection, spec.friendDelta);
      if (action === "blacklist" || action === "unblacklist") {
        refreshAfterBlacklist(queryClient, novelist);
      }
    },
  });
};

/**
 * The conversation with this novelist, opened.
 *
 * Web looks it up by username and gives up when there is none. Here it falls
 * back to creating one: "Message" that fails on somebody you have never written
 * to is the same dead end the ice-breaker reply already had to solve, and the
 * create endpoint is idempotent by name.
 */
export const useOpenConversation = () => {
  const api = useApi();

  return useMutation({
    mutationFn: (novelist: ConnectionTarget) => openConversation(api, novelist),
  });
};
