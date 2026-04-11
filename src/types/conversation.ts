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
  role: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  sender: MessageSender;
  type: string;
  image: string;
  message: string;
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
