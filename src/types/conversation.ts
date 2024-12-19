import { Tagged } from "./common";

export interface Conversation extends Tagged {
  _tag: "Conversation";
  id: string;
  name: string;
  image: string;
  lastMessage: Message;
  isGroup: boolean;
  members: ConversationParticipant[];
  createdAt: string;
  modifiedAt: string;
}

export interface ConversationParticipant extends Tagged {
  _tag: "Conversation";
  conversationId: string;
  novelistId: string;
  firstName: string;
  lastName: string;
  userName: string;
  image: string;
  role: string;
  modifiedAt: string;
}

export interface Message extends Tagged {
  _tag: "Message";
  id: string;
  senderId: string;
  conversationId: string;
  senderUsername: string;
  type: string;
  image: string;
  message: string;
  isRead: string;
  attachments: Attachment[];
  createdAt: string;
}

export interface Attachment extends Tagged {
  _tag: "Attachment";
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
