import { gcm } from "@noble/ciphers/aes";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { getE2EConversationSecret } from "@nw/api/endpoints/e2e";
import { type ChatCryptoBackend, createChatCrypto } from "@nw/chat";
import { getRandomBytes } from "expo-crypto";
import { api } from "@/lib/api";
import { env } from "@/lib/env";

/**
 * Chat encryption on the phone: the shared protocol, driven by `@noble`.
 *
 * There is no `crypto.subtle` in Hermes, so the web half of this cannot cross
 * over. `@noble/hashes` and `@noble/ciphers` are the audited pure-JS
 * implementations of exactly the two primitives the scheme needs — HKDF-SHA256
 * and AES-256-GCM — and nothing else. No native module, so no rebuild when this
 * changes, and no second protocol: everything a mistake could silently break
 * lives in `@nw/chat` (MONOREPO_MIGRATION_PLAN §4.2, open decision 3, settled
 * this way).
 *
 * A note on what `gcm` returns: `encrypt` gives ciphertext with the 16-byte
 * auth tag appended, and `decrypt` expects the same shape. WebCrypto does the
 * same thing, which is what makes the two interoperable without either side
 * having to know about the tag.
 */

const backend: ChatCryptoBackend<Uint8Array> = {
  decrypt: async (key, iv, ciphertext) => gcm(key, iv).decrypt(ciphertext),
  deriveKey: async (secret, salt, info) => hkdf(sha256, secret, salt, info, 32),
  encrypt: async (key, iv, plaintext) => gcm(key, iv).encrypt(plaintext),
  // `expo-crypto` rather than noble's own helper: that one reaches for
  // `crypto.getRandomValues`, which Hermes does not define. An IV that is not
  // random is the failure mode where AES-GCM stops protecting anything, so it
  // is worth taking from the platform's CSPRNG explicitly.
  randomBytes: (length) => getRandomBytes(length),
};

export const chatCrypto = createChatCrypto<Uint8Array>({
  backend,
  clientSecret: env.CHAT_E2E_SECRET,
  // Sending encrypts only when the build says so; decryption is always on, so a
  // flag change never blacks out history.
  encryptEnabled: Boolean(env.CHAT_E2E_ENABLED),
  fetchServerSecret: async (conversationId) =>
    (await getE2EConversationSecret(api, conversationId))?.secret ?? null,
  warn: (message, cause) => {
    if (__DEV__) console.warn(`chat-crypto: ${message}`, cause);
  },
});
