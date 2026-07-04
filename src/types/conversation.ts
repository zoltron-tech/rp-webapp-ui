import type { NWImage } from "./novelist";
import type { IceBreaker } from "./prompt";

export interface Conversation {
  id: string;
  name: string;
  image: string;
  lastMessage: Message;
  isGroup: boolean;
  members: ConversationParticipant[];
  createdAt: string;
  modifiedAt: string;
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
