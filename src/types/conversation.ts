import { Tagged } from "./common";

export interface Conversation extends Tagged {
  _tag: "Conversation";
  messageId: string;
  username: string;
  image: string;
  senderUsername: string;
  message: string;
  createdAt: number;
}

export interface Message extends Tagged {
  _tag: "Message";
  sender: string;
  receiver: string;
  message: string;
  date: string;
  id: string;
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
