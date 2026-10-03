import type { Conversation, Message } from "@nw/types";
import { fromBase64, toBase64, utf8Bytes, utf8Text } from "./base64";

// ─── Chat message encryption ─────────────────────────────────────────────────
//
// Every conversation has one AES-256-GCM message key, derived from two halves:
//
//  - a random 32-byte secret the backend holds per conversation and serves to
//    its members (created lazily on first request), and
//  - CHAT_E2E_SECRET, baked into the client bundle at build time.
//
// HKDF over the pair gives every member the same key with no key exchange, no
// per-device state, and no "waiting for someone to send me the key" window — a
// new member, a new browser, or a phone can read the whole conversation
// immediately.
//
// What this protects: a stolen database dump, where messages are ciphertext and
// the client half is absent. What it does NOT protect against: the server
// itself (it can derive the key, and does so deliberately to show moderators
// reported messages) or anyone who pulls CHAT_E2E_SECRET out of a bundle. It is
// encryption at rest, not end-to-end encryption — do not describe it as
// something the operator's own server cannot read.
//
// Wire format: E2E_PREFIX + base64(iv ‖ ciphertext). The hidden prefix flags
// encrypted text; anything without it (plaintext, and every message written
// before this scheme) passes through untouched.
//
// This module is the protocol and nothing else. The primitives are injected,
// because that is the only part that genuinely differs: the browser has
// WebCrypto and a phone does not. Everything a mistake could silently break —
// the prefix, the HKDF salt and info, the IV's place in the payload — is here,
// once, shared by both clients and mirrored by ChatMessageCryptoService.kt.

/** Zero-width space — invisible if a client ever renders the raw text. */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

/**
 * Marker for text encrypted with the current scheme.
 *
 * Kept in sync with `ChatMessageCryptoService.kt` (portfolio-service) and with
 * the generic `ZWSP + "e2e:"` check in chat-server's
 * `push-notification-manager.ts`. Changing it orphans every stored message.
 */
export const E2E_PREFIX = `${ZERO_WIDTH_SPACE}e2e:v3:`;

/** Shown in place of text we hold ciphertext for but cannot open yet. */
export const DECRYPT_FALLBACK_TEXT = "🔒 This message could not be decrypted.";

const IV_LENGTH = 12;

/** How long a failed key fetch is remembered before the backend is asked again. */
const KEY_RETRY_MS = 30_000;

export const isEncryptedText = (text: unknown): text is string =>
  typeof text === "string" && text.startsWith(E2E_PREFIX);

/**
 * The primitives, supplied by whichever client is running.
 *
 * `deriveKey` returns whatever handle the platform wants to keep — a
 * `CryptoKey` on web, raw bytes on native — and it is handed straight back to
 * `encrypt`/`decrypt`. This module never inspects it.
 */
export interface ChatCryptoBackend<Key = unknown> {
  /** HKDF-SHA256 → a 256-bit AES-GCM key. Salt and info are exact bytes. */
  deriveKey(
    secret: Uint8Array,
    salt: Uint8Array,
    info: Uint8Array,
  ): Promise<Key>;
  encrypt(key: Key, iv: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array>;
  decrypt(
    key: Key,
    iv: Uint8Array,
    ciphertext: Uint8Array,
  ): Promise<Uint8Array>;
  randomBytes(length: number): Uint8Array;
}

export interface ChatCryptoConfig<Key = unknown> {
  backend: ChatCryptoBackend<Key> | null;
  /** `CHAT_E2E_SECRET`. Without it nothing encrypts and nothing decrypts. */
  clientSecret: string;
  /**
   * Whether *sending* encrypts.
   *
   * Decryption is always on, so turning this off never blacks out history.
   */
  encryptEnabled: boolean;
  /** The server half, or null when the caller is not a member. */
  fetchServerSecret(conversationId: string): Promise<string | null>;
  /** Where a swallowed failure goes. Defaults to silence. */
  warn?(message: string, cause?: unknown): void;
}

export interface ChatCrypto {
  encryptMessageText(conversationId: string, text: string): Promise<string>;
  decryptMessageText(conversationId: string, text: string): Promise<string>;
  decryptMessage(
    message: Message,
    fallbackConversationId?: string,
  ): Promise<Message>;
  decryptMessages(
    messages: Message[],
    fallbackConversationId?: string,
  ): Promise<Message[]>;
  decryptConversation(conversation: Conversation): Promise<Conversation>;
  decryptConversations(conversations: Conversation[]): Promise<Conversation[]>;
  hasUndecryptedContent(message: Message): boolean;
  /**
   * Forgets every derived conversation key. Call on sign-out, so the next
   * account on the device does not inherit the last one's keys in memory.
   */
  reset(): void;
}

/**
 * A no-op implementation, for a client with no crypto wired up yet.
 *
 * Returns text untouched rather than throwing: an app that has not supplied a
 * backend should show ciphertext-flagged messages as the fallback and keep
 * working, not crash on the first message it renders.
 */
export const passthroughChatCrypto: ChatCrypto = {
  decryptConversation: async (conversation) => conversation,
  decryptConversations: async (conversations) => conversations,
  decryptMessage: async (message) => message,
  decryptMessages: async (messages) => messages,
  decryptMessageText: async (_conversationId, text) =>
    isEncryptedText(text) ? DECRYPT_FALLBACK_TEXT : text,
  encryptMessageText: async (_conversationId, text) => text,
  hasUndecryptedContent: () => false,
  reset: () => {},
};

export const createChatCrypto = <Key>(
  config: ChatCryptoConfig<Key>,
): ChatCrypto => {
  const { backend, clientSecret, encryptEnabled, fetchServerSecret } = config;
  const warn = config.warn ?? (() => {});

  const keyCache = new Map<string, Promise<Key | null>>();
  const failedAt = new Map<string, number>();

  const usable = () => Boolean(backend && clientSecret);

  const deriveConversationKey = async (
    serverSecret: string,
    conversationId: string,
  ): Promise<Key> => {
    if (!backend) throw new Error("no chat crypto backend");
    // HKDF-SHA256(serverSecret, salt = client secret, info = conversation id).
    // Mirrored byte for byte by ChatMessageCryptoService.kt — the info string
    // carries the scheme version, so bumping one means bumping both.
    return backend.deriveKey(
      fromBase64(serverSecret),
      utf8Bytes(clientSecret),
      utf8Bytes(`nw-e2e-v3:${conversationId}`),
    );
  };

  const fetchConversationKey = async (
    conversationId: string,
  ): Promise<Key | null> => {
    const secret = await fetchServerSecret(conversationId);
    // No secret means the backend refused us (not a member) or is unreachable.
    // Either way there is nothing to derive from — the caller falls back.
    if (!secret) return null;
    return deriveConversationKey(secret, conversationId);
  };

  /**
   * The conversation's message key, cached.
   *
   * Failures are negative-cached for `KEY_RETRY_MS`, so a screenful of
   * undecryptable messages asks the backend once rather than once per message.
   */
  const resolveConversationKey = (
    conversationId: string,
  ): Promise<Key | null> => {
    if (!conversationId || !usable()) return Promise.resolve(null);

    const cached = keyCache.get(conversationId);
    if (cached) return cached;

    const failed = failedAt.get(conversationId);
    if (failed && Date.now() - failed < KEY_RETRY_MS) {
      return Promise.resolve(null);
    }

    const pending = fetchConversationKey(conversationId)
      .then((key) => {
        if (key) {
          failedAt.delete(conversationId);
        } else {
          failedAt.set(conversationId, Date.now());
          keyCache.delete(conversationId);
        }
        return key;
      })
      .catch((error) => {
        warn("could not resolve conversation key", error);
        failedAt.set(conversationId, Date.now());
        keyCache.delete(conversationId);
        return null;
      });

    keyCache.set(conversationId, pending);
    return pending;
  };

  const encryptWithKey = async (key: Key, text: string): Promise<string> => {
    if (!backend) throw new Error("no chat crypto backend");
    const iv = backend.randomBytes(IV_LENGTH);
    const ciphertext = await backend.encrypt(key, iv, utf8Bytes(text));

    const combined = new Uint8Array(iv.length + ciphertext.length);
    combined.set(iv);
    combined.set(ciphertext, iv.length);
    return toBase64(combined);
  };

  const decryptWithKey = async (key: Key, payload: string): Promise<string> => {
    if (!backend) throw new Error("no chat crypto backend");
    const combined = fromBase64(payload);
    const plaintext = await backend.decrypt(
      key,
      combined.slice(0, IV_LENGTH),
      combined.slice(IV_LENGTH),
    );
    return utf8Text(plaintext);
  };

  /**
   * Encrypts plaintext for the wire.
   *
   * Falls back to sending plaintext when no key can be resolved (flag off, no
   * backend, backend unreachable) so chat never breaks — plaintext is always
   * valid, which is what the prefix flag buys.
   */
  const encryptMessageText = async (
    conversationId: string,
    text: string,
  ): Promise<string> => {
    if (!conversationId || !text || isEncryptedText(text)) return text;
    if (!encryptEnabled) return text;

    try {
      const key = await resolveConversationKey(conversationId);
      if (!key) {
        warn("no conversation key, sending plaintext");
        return text;
      }
      return E2E_PREFIX + (await encryptWithKey(key, text));
    } catch (error) {
      warn("encryption failed, sending plaintext", error);
      return text;
    }
  };

  /**
   * Decrypts wire text.
   *
   * Text without the prefix — plaintext, and everything written before this
   * scheme — is returned untouched; flagged text that fails resolves to a
   * placeholder rather than throwing into a list render.
   */
  const decryptMessageText = async (
    conversationId: string,
    text: string,
  ): Promise<string> => {
    if (!isEncryptedText(text)) return text;

    try {
      const key = await resolveConversationKey(conversationId);
      if (!key) return DECRYPT_FALLBACK_TEXT;
      return await decryptWithKey(key, text.slice(E2E_PREFIX.length));
    } catch (error) {
      warn("decryption failed", error);
      return DECRYPT_FALLBACK_TEXT;
    }
  };

  const decryptMessage = async (
    message: Message,
    fallbackConversationId = "",
  ): Promise<Message> => {
    if (!message) return message;

    const conversationId = message.conversationId || fallbackConversationId;
    // A message that previously failed to decrypt carries its original
    // ciphertext — retry from that, not from the fallback placeholder.
    const source = message.e2eCiphertext ?? message.message;
    const text = await decryptMessageText(conversationId, source);

    let repliedTo = message.repliedTo;
    if (repliedTo?.message) {
      const inner = await decryptMessage(repliedTo.message, conversationId);
      if (inner !== repliedTo.message) {
        repliedTo = { ...repliedTo, message: inner };
      }
    }

    if (text === message.message && repliedTo === message.repliedTo) {
      return message;
    }

    const decrypted: Message = { ...message, message: text, repliedTo };
    if (text === DECRYPT_FALLBACK_TEXT) {
      decrypted.e2eCiphertext = source;
    } else {
      decrypted.e2eCiphertext = undefined;
    }
    return decrypted;
  };

  const decryptMessages = (
    messages: Message[],
    fallbackConversationId = "",
  ): Promise<Message[]> =>
    Promise.all(
      messages.map((message) =>
        decryptMessage(message, fallbackConversationId),
      ),
    );

  const decryptConversation = async (
    conversation: Conversation,
  ): Promise<Conversation> => {
    if (!conversation?.lastMessage) return conversation;
    const lastMessage = await decryptMessage(
      conversation.lastMessage,
      conversation.id,
    );
    return lastMessage === conversation.lastMessage
      ? conversation
      : { ...conversation, lastMessage };
  };

  const decryptConversations = (
    conversations: Conversation[],
  ): Promise<Conversation[]> =>
    Promise.all(conversations.map(decryptConversation));

  return {
    decryptConversation,
    decryptConversations,
    decryptMessage,
    decryptMessages,
    decryptMessageText,
    encryptMessageText,
    /** True if the message (or its reply preview) is still waiting for a key. */
    hasUndecryptedContent: (message: Message) =>
      Boolean(
        message.e2eCiphertext || message.repliedTo?.message?.e2eCiphertext,
      ),
    reset: () => {
      keyCache.clear();
      failedAt.clear();
    },
  };
};
