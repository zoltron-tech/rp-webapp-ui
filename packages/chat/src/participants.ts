/**
 * The account behind "Contact support".
 *
 * A username rather than a route, because support is an ordinary conversation
 * with an ordinary novelist — the clients resolve it through the same
 * `byUsername` endpoint they use for anyone else, and the thread that opens is
 * a normal chat. Shared so the two cannot end up messaging different accounts,
 * which would fail silently: one client's support requests would simply arrive
 * somewhere nobody is reading.
 */
export const SUPPORT_USERNAME = "novelistworld";

/**
 * Whether a novelist is the support account.
 *
 * Support is not somebody to befriend, and it is not playing: wherever a
 * novelist row, card or likers list offers **Add**, it offers nothing for
 * this account, and wherever a profile shows badges, it shows none. Messaging
 * it stays — that is what the account is for.
 */
export const isSupportNovelist = (username: string | null | undefined) =>
  username === SUPPORT_USERNAME;

import {
  type Conversation,
  type ConversationParticipant,
  type Novelist,
  PLACEHOLDER_LABELS,
} from "@nw/types";

/**
 * Who a conversation is *with*, from the point of view of the person reading.
 *
 * A group carries its own name and image. A direct conversation does not: the
 * server sends the pair, and each of the two people has to be shown the other
 * one. Reading `conversation.name` for a direct chat therefore gets it wrong
 * half the time — the half where you are looking at your own name.
 *
 * The fallback chain matters as much as the rule. `members` can be empty on a
 * conversation that came from a list endpoint, so the last message's sender is
 * used next; that is only correct when the last message is not your own, which
 * is why it is last rather than first.
 */
export interface ConversationTarget {
  name: string;
  image: string | null;
  username: string;
  /** Present only for a direct conversation with a resolvable counterpart. */
  participant: ConversationParticipant | null;
}

/**
 * How a member is named: first and last name, or the username when both are
 * empty. A missing last name is left out rather than printed — `lastName` is
 * null for many members, and for a member who disabled their account, whose
 * row carries only the placeholder label as `firstName`.
 */
export const participantName = (participant: ConversationParticipant): string =>
  [participant.firstName, participant.lastName].filter(Boolean).join(" ").trim() ||
  participant.userName ||
  "";

const fullName = participantName;

export const otherParticipant = (
  conversation: Conversation | null | undefined,
  myUsername: string | undefined | null,
): ConversationParticipant | null => {
  if (!conversation || conversation.isGroup) return null;
  return (
    conversation.members?.find(
      (member) => member.userName && member.userName !== myUsername,
    ) ?? null
  );
};

export const resolveConversationTarget = (
  conversation: Conversation | null | undefined,
  myUsername: string | undefined | null,
): ConversationTarget => {
  if (!conversation) {
    return { image: null, name: "", participant: null, username: "" };
  }

  if (conversation.isGroup) {
    return {
      image: conversation.image || null,
      name: conversation.name,
      participant: null,
      username: "",
    };
  }

  // The other side disabled their account (ACCOUNT_DISABLE_PLAN.md D9): the
  // placeholder, with no handle to link to — and never the last sender's
  // username, which may be the reader's own.
  if (conversation.isUnavailable) {
    return {
      image: null,
      name: conversation.name || PLACEHOLDER_LABELS.NOVELIST,
      participant: null,
      username: "",
    };
  }

  const other = otherParticipant(conversation, myUsername);
  const sender = conversation.lastMessage?.sender;
  // A direct conversation's own `image` is set by some list responses and not
  // others, so it is preferred but never relied on.
  return {
    image: conversation.image || other?.image || sender?.image || null,
    name: other ? fullName(other) : conversation.name || sender?.name || "",
    participant: other,
    username: other?.userName || sender?.username || "",
  };
};

/** Every username in a conversation except your own, for presence tracking. */
export const conversationUsernames = (
  conversation: Conversation | null | undefined,
  myUsername: string | undefined | null,
): string[] =>
  (conversation?.members ?? [])
    .map((member) => member.userName)
    .filter((username): username is string =>
      Boolean(username && username !== myUsername),
    );

/** ADMIN and OWNER may rename a group and manage its membership. */
export const isGroupAdmin = (
  members: ConversationParticipant[],
  myUsername: string | undefined | null,
): boolean => {
  const me = members.find((member) => member.userName === myUsername);
  const role = me?.role?.toUpperCase() ?? "";
  return role === "ADMIN" || role === "OWNER";
};

// ─── Who a message is sent as ────────────────────────────────────────────────

/**
 * The identity a message goes out under.
 *
 * A novelist can speak as themselves or as any muse they have penned, and the
 * choice travels on the message: `sender.messageSourceType` is `"NOVELIST"` or
 * `"MUSE"`, and `sender.id` is that muse's id. This is the in-character posting
 * the product is built around, so a client that always sends as the novelist is
 * not missing a convenience — it cannot say the thing the user meant to say.
 *
 * The server overwrites `username` from the authenticated connection, so
 * choosing a muse never changes *who* is accountable for the message.
 */
export interface MessageSenderChoice {
  id: string;
  type: "NOVELIST" | "MUSE";
  name: string;
  image: string | null;
}

/**
 * The novelist first, then their muses.
 *
 * Order matters and is web's: the novelist is the default and stays pinned at
 * the top, so the list never re-orders under a thumb that is already moving.
 */
export const senderOptions = (
  novelist: Novelist | null | undefined,
): MessageSenderChoice[] => {
  if (!novelist) return [];

  return [
    {
      id: novelist.id,
      image: novelist.avatar?.src ?? novelist.image ?? null,
      name:
        `${novelist.firstName} ${novelist.lastName ?? ""}`.trim() ||
        novelist.username,
      type: "NOVELIST",
    },
    ...(novelist.muses ?? [])
      // A muse with no id cannot be addressed by the server; it is a draft.
      .filter((muse) => Boolean(muse.id))
      .map((muse) => ({
        id: muse.id as string,
        image: muse.avatar?.src ?? muse.image ?? null,
        name: `${muse.firstName} ${muse.lastName ?? ""}`.trim(),
        type: "MUSE" as const,
      })),
  ];
};
