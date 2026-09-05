// ─── Chat message encryption ─────────────────────────────────────────────────
//
// Every conversation has one AES-256-GCM message key, derived from two halves:
//
//  - a random 32-byte secret the backend holds per conversation and serves to
//    its members (created lazily on first request), and
//  - CHAT_E2E_SECRET, baked into this bundle at build time.
//
// HKDF over the pair gives every member the same key with no key exchange, no
// per-device state, and no "waiting for someone to send me the key" window —
// a new member or a new browser can read the whole conversation immediately.
//
// What this protects: a stolen database dump, where messages are ciphertext and
// the client half is absent. What it does NOT protect against: the server
// itself (it can derive the key, and does so deliberately to show moderators
// reported messages) or anyone who pulls CHAT_E2E_SECRET out of this bundle.
// It is encryption at rest, not end-to-end encryption — do not describe it as
// something users' own server cannot read.
//
// Wire format: E2E_PREFIX + base64(iv ‖ ciphertext). The hidden prefix flags
// encrypted text; anything without it (plaintext, and every message written
// before this scheme) passes through untouched.

import type { Conversation, Message } from "@nw/types";
import { getE2EConversationSecretAction } from "@/app/rp/conversations/e2e-actions";
import { env } from "@/lib/env";

/** Zero-width space — invisible if a client ever renders the raw text. */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

/** Marker for text encrypted with the current scheme. Kept in sync with
 *  ChatMessageCryptoService.kt (portfolio-service) and with the generic
 *  `ZWSP + "e2e:"` check in chat-server's push-notification-manager.ts. */
export const E2E_PREFIX = `${ZERO_WIDTH_SPACE}e2e:v3:`;

/** Shown in place of text we hold ciphertext for but cannot open yet. */
export const DECRYPT_FALLBACK_TEXT = "🔒 This message could not be decrypted.";

/** The client half of every conversation key. Without it nothing encrypts. */
const CLIENT_SECRET = env.CHAT_E2E_SECRET ?? "";

/** Feature flag. Off → send plaintext; decryption always stays on so turning
 *  it off never blacks out history. */
const E2E_ENCRYPT_ENABLED = !!env.CHAT_E2E_ENABLED;

const IV_LENGTH = 12;

/** How long a failed key fetch is remembered before we try the backend again. */
const KEY_RETRY_MS = 30_000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const hasCrypto = (): boolean =>
  typeof window !== "undefined" && !!globalThis.crypto?.subtle;

// ─── Base64 helpers ──────────────────────────────────────────────────────────

const toBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const fromBase64 = (base64: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const encryptWithKey = async (
  key: CryptoKey,
  text: string,
): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { iv, name: "AES-GCM" },
      key,
      encoder.encode(text),
    ),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv);
  combined.set(ciphertext, iv.length);
  return toBase64(combined);
};

const decryptWithKey = async (
  key: CryptoKey,
  payload: string,
): Promise<string> => {
  const combined = fromBase64(payload);
  const plaintext = await crypto.subtle.decrypt(
    { iv: combined.slice(0, IV_LENGTH), name: "AES-GCM" },
    key,
    combined.slice(IV_LENGTH),
  );
  return decoder.decode(plaintext);
};

// ─── Conversation key derivation ─────────────────────────────────────────────

/** HKDF-SHA256(serverSecret, salt = client secret, info = conversation id).
 *  Mirrored byte for byte by ChatMessageCryptoService.kt. */
const deriveConversationKey = async (
  serverSecret: string,
  conversationId: string,
): Promise<CryptoKey> => {
  const material = await crypto.subtle.importKey(
    "raw",
    fromBase64(serverSecret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      info: encoder.encode(`nw-e2e-v3:${conversationId}`),
      name: "HKDF",
      salt: encoder.encode(CLIENT_SECRET),
    },
    material,
    { length: 256, name: "AES-GCM" },
    false,
    ["decrypt", "encrypt"],
  );
};

const keyCache = new Map<string, Promise<CryptoKey | null>>();
const failedAt = new Map<string, number>();

const fetchConversationKey = async (
  conversationId: string,
): Promise<CryptoKey | null> => {
  const secret = await getE2EConversationSecretAction(conversationId);
  // No secret means the backend refused us (not a member) or is unreachable.
  // Either way there is nothing to derive from — the caller falls back.
  if (!secret?.secret) return null;
  return deriveConversationKey(secret.secret, conversationId);
};

/** Resolves (and caches) the conversation's message key. Returns null when the
 *  key cannot be obtained; failures are negative-cached for KEY_RETRY_MS so a
 *  screenful of undecryptable messages does not hammer the backend. */
const resolveConversationKey = (
  conversationId: string,
): Promise<CryptoKey | null> => {
  if (!conversationId || !hasCrypto() || !CLIENT_SECRET) {
    return Promise.resolve(null);
  }

  const cached = keyCache.get(conversationId);
  if (cached) return cached;

  const failed = failedAt.get(conversationId);
  if (failed && Date.now() - failed < KEY_RETRY_MS)
    return Promise.resolve(null);

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
      console.warn("e2e-crypto: could not resolve conversation key", error);
      failedAt.set(conversationId, Date.now());
      keyCache.delete(conversationId);
      return null;
    });

  keyCache.set(conversationId, pending);
  return pending;
};

// ─── Text-level API ──────────────────────────────────────────────────────────

export const isEncryptedText = (text: unknown): text is string =>
  typeof text === "string" && text.startsWith(E2E_PREFIX);

/** Encrypts plaintext for the wire. Falls back to sending plaintext when no key
 *  can be resolved (flag off, WebCrypto missing, backend unreachable) so chat
 *  never breaks — plaintext is always valid thanks to the prefix flag. */
export const encryptMessageText = async (
  conversationId: string,
  text: string,
): Promise<string> => {
  if (!conversationId || !text || isEncryptedText(text)) return text;
  if (!E2E_ENCRYPT_ENABLED) return text;
  try {
    const key = await resolveConversationKey(conversationId);
    if (!key) {
      console.warn("e2e-crypto: no conversation key, sending plaintext");
      return text;
    }
    return E2E_PREFIX + (await encryptWithKey(key, text));
  } catch (error) {
    console.warn("e2e-crypto: encryption failed, sending plaintext", error);
    return text;
  }
};

/** Decrypts wire text. Text without the prefix (plaintext, or anything written
 *  before this scheme) is returned untouched; flagged text that fails to
 *  decrypt resolves to a fallback placeholder instead of throwing. */
export const decryptMessageText = async (
  conversationId: string,
  text: string,
): Promise<string> => {
  if (typeof text !== "string" || !text.startsWith(E2E_PREFIX)) return text;
  try {
    const key = await resolveConversationKey(conversationId);
    if (!key) return DECRYPT_FALLBACK_TEXT;
    return await decryptWithKey(key, text.slice(E2E_PREFIX.length));
  } catch (error) {
    console.warn("e2e-crypto: decryption failed", error);
    return DECRYPT_FALLBACK_TEXT;
  }
};

// ─── Object-level helpers ────────────────────────────────────────────────────

/** Returns a copy of the message with its text (and any replied-to message)
 *  decrypted. Untouched messages are returned as-is. */
export const decryptMessage = async (
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
    delete decrypted.e2eCiphertext;
  }
  return decrypted;
};

/** True if the message (or its reply preview) is still waiting for a key. */
export const hasUndecryptedContent = (message: Message): boolean =>
  !!message.e2eCiphertext || !!message.repliedTo?.message?.e2eCiphertext;

export const decryptMessages = (
  messages: Message[],
  fallbackConversationId = "",
): Promise<Message[]> =>
  Promise.all(messages.map((m) => decryptMessage(m, fallbackConversationId)));

/** Decrypts the lastMessage preview embedded in a conversation. */
export const decryptConversation = async (
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

export const decryptConversations = (
  conversations: Conversation[],
): Promise<Conversation[]> =>
  Promise.all(conversations.map(decryptConversation));
