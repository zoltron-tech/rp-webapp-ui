import {
  type ChatCryptoBackend,
  createChatCrypto,
  passthroughChatCrypto,
} from "@nw/chat";
import type { Conversation, Message } from "@nw/types";
import { getE2EConversationSecretAction } from "@/app/rp/conversations/e2e-actions";
import { env } from "@/lib/env";

/**
 * Chat encryption on the web: the shared protocol, driven by WebCrypto.
 *
 * The scheme itself — the hidden prefix, the HKDF salt and info, the IV's place
 * in the payload, what happens when a key cannot be fetched — moved to
 * `@nw/chat` when the native app needed to read the same messages. Two
 * transcriptions of a protocol do not fail loudly; they produce messages one
 * client can open and the other cannot, with nothing in either log to say why.
 *
 * What stays here is the half that is genuinely web: `crypto.subtle`, which
 * does HKDF and AES-GCM natively and is worth using where it exists.
 *
 * The exported names are unchanged, so every existing caller is untouched.
 */

export { DECRYPT_FALLBACK_TEXT, E2E_PREFIX, isEncryptedText } from "@nw/chat";

const hasCrypto = (): boolean =>
  typeof window !== "undefined" && !!globalThis.crypto?.subtle;

const backend: ChatCryptoBackend<CryptoKey> = {
  decrypt: async (key, iv, ciphertext) =>
    new Uint8Array(
      await crypto.subtle.decrypt(
        { iv: iv as BufferSource, name: "AES-GCM" },
        key,
        ciphertext as BufferSource,
      ),
    ),

  deriveKey: async (secret, salt, info) => {
    const material = await crypto.subtle.importKey(
      "raw",
      secret as BufferSource,
      "HKDF",
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      { hash: "SHA-256", info: info as BufferSource, name: "HKDF", salt: salt as BufferSource },
      material,
      { length: 256, name: "AES-GCM" },
      false,
      ["decrypt", "encrypt"],
    );
  },

  encrypt: async (key, iv, plaintext) =>
    new Uint8Array(
      await crypto.subtle.encrypt(
        { iv: iv as BufferSource, name: "AES-GCM" },
        key,
        plaintext as BufferSource,
      ),
    ),

  randomBytes: (length) => crypto.getRandomValues(new Uint8Array(length)),
};

const chatCrypto = createChatCrypto<CryptoKey>({
  backend: hasCrypto() ? backend : null,
  clientSecret: env.CHAT_E2E_SECRET ?? "",
  encryptEnabled: !!env.CHAT_E2E_ENABLED,
  fetchServerSecret: async (conversationId) =>
    (await getE2EConversationSecretAction(conversationId))?.secret ?? null,
  warn: (message, cause) => console.warn(`e2e-crypto: ${message}`, cause),
});

export const encryptMessageText = (
  conversationId: string,
  text: string,
): Promise<string> => chatCrypto.encryptMessageText(conversationId, text);

export const decryptMessageText = (
  conversationId: string,
  text: string,
): Promise<string> => chatCrypto.decryptMessageText(conversationId, text);

export const decryptMessage = (
  message: Message,
  fallbackConversationId = "",
): Promise<Message> =>
  chatCrypto.decryptMessage(message, fallbackConversationId);

export const decryptMessages = (
  messages: Message[],
  fallbackConversationId = "",
): Promise<Message[]> =>
  chatCrypto.decryptMessages(messages, fallbackConversationId);

export const decryptConversation = (
  conversation: Conversation,
): Promise<Conversation> => chatCrypto.decryptConversation(conversation);

export const decryptConversations = (
  conversations: Conversation[],
): Promise<Conversation[]> => chatCrypto.decryptConversations(conversations);

export const hasUndecryptedContent = (message: Message): boolean =>
  chatCrypto.hasUndecryptedContent(message);

/** The configured instance, for callers that want to hand it to a provider. */
export const webChatCrypto = hasCrypto() ? chatCrypto : passthroughChatCrypto;
