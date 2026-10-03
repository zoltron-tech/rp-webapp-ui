import { type ChatCrypto, passthroughChatCrypto } from "@nw/chat";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
} from "react";

/**
 * The configured chat crypto, handed in by the app.
 *
 * Same seam as `ApiProvider`: the hooks here need to decrypt, and how you
 * decrypt is the one part that differs between a browser and a phone. Injecting
 * it keeps this package free of both `crypto.subtle` and a native module, and
 * keeps the protocol itself in exactly one place (`@nw/chat`).
 *
 * The default is a pass-through, so a client that has not wired crypto up shows
 * the "could not be decrypted" placeholder and keeps working rather than
 * throwing inside a list render.
 */
const ChatCryptoContext = createContext<ChatCrypto>(passthroughChatCrypto);

export const ChatCryptoProvider = ({
  children,
  crypto,
}: {
  children: ReactNode;
  crypto: ChatCrypto;
}) => createElement(ChatCryptoContext.Provider, { value: crypto }, children);

export const useChatCrypto = (): ChatCrypto => useContext(ChatCryptoContext);
