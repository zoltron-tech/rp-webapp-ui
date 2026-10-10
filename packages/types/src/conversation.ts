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
}

/**
 * What moved in the inbox since a moment — `GET /chat/conversations/changes`.
 * `left` is every conversation the caller was in and is not any more.
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
