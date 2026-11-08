import type { NWImage } from "./novelist";
import type { IceBreaker } from "./prompt";

export interface Conversation {
  id: string;
  name: string;
  image: string;
  lastMessage: Message;
  isGroup: boolean;
  /** A preview: the first few, for an avatar stack. Not the whole list. */
  members: ConversationParticipant[];
  /** How many are in it. Absent on responses from a service that predates it. */
  memberCount?: number | null;
  createdAt: string;
  modifiedAt: string;
  /**
   * When the caller's mute on this conversation ends: `9999-12-31` for
   * "until unmuted", null or absent when it is not muted.
   */
  mutedUntil?: string | null;
  /**
   * A direct conversation whose other party has disabled their account. It
   * stays in the inbox under the placeholder and its history is readable,
   * but nothing can be sent: show the unavailable note instead of a composer.
   */
  isUnavailable?: boolean;
  /**
   * Where it sits for the caller: their inbox or their archive
   * (BLOCK_BLACKLIST_PLAN.md B6). Each member's own. Absent from a service
   * that predates it, which is read as the inbox.
   */
  bucket?: InboxBucket;
  /**
   * A direct conversation with someone the caller blacklisted: why it is
   * archived and muted, for the notice above the composer. Never on a group.
   */
  isBlacklisted?: boolean;
}

/**
 * The two lists a conversation can be in, per member: the inbox, and the
 * archive — where blacklisting someone puts the DM with them, muted, and
 * where anyone can move a conversation by hand.
 */
export type InboxBucket = "INBOX" | "ARCHIVED";

/** The archive's words, the same on web and phone. */
export const INBOX_ARCHIVE_COPY = {
  archive: "Archive",
  /** The send refusal for a DM hidden by a block, either way (409 `blocked`). */
  blocked: "Messages can't be sent in this conversation.",
  blacklistedNotice: (username: string) =>
    `Archived — you've blacklisted @${username}`,
  emptyArchive: "Nothing archived. Quiet shelves.",
  filter: "Archived",
  moveToInbox: "Move to inbox",
  rowMeta: "Archived",
  rowMetaMuted: "Archived · muted",
} as const;

/**
 * What moved in the inbox since a moment — `GET /chat/conversations/changes`.
 * `left` is every conversation the caller was in and is not any more, and
 * every DM hidden from them by a block (K3): drop it either way. Each entry
 * of `conversations` carries its `bucket`, inbox or archive.
 */
export interface ConversationChanges {
  conversations: Conversation[];
  left: string[];
}

export interface ConversationParticipant {
  conversationId: string;
  novelistId: string;
  firstName: string;
  lastName: string;
  userName: string;
  image: string;
  avatar?: NWImage | null;
  role: string;
  isVerified: boolean;
  joinedAt: string;
  /** The member has disabled their account: a placeholder row, no username or image. */
  isDisabled?: boolean;
}

export type RepliedToType = "MESSAGE" | "ICE_BREAKER";

/** Reference to the item a new message is replying to, sent to the server. */
export interface RepliedToReference {
  id: string;
  type: RepliedToType;
}

/** Resolved item a message is replying to, embedded by the server. */
export interface RepliedTo {
  type: RepliedToType;
  message?: Message;
  iceBreaker?: IceBreaker;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  sender: MessageSender;
  type: string;
  image: string;
  message: string;
  repliedTo?: RepliedTo;
  isRead: boolean;
  reactions: Reaction[];
  attachments: Attachment[];
  createdAt: string;
  /** Client-only: original wire ciphertext kept when decryption failed (no
   *  conversation key yet), so the message can be retried once the key
   *  arrives. Never sent by the server. */
  e2eCiphertext?: string;
}

export interface Reaction {
  messageId: string;
  sender: MessageSender;
  reaction: string;
}

export interface MessageSender {
  id: string;
  username: string;
  name: string;
  image: string;
  messageSourceType: string;
  /**
   * A disabled novelist's stand-in (ACCOUNT_DISABLE_PLAN.md §3.3): the real
   * id, the placeholder label as the name, no image or link. Draw it with
   * `PlaceholderAvatar` and never route to it.
   */
  isPlaceholder?: boolean;
}

export interface Attachment {
  id: string;
  url: string;
}

export type Emoji = {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
  emoticons: string[];
};
