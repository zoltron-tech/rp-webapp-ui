// ─── End-to-end encryption for conversation messages ─────────────────────────
//
// True E2E via per-user keys, kept deliberately minimal:
//
//  - Each user has an ECDH P-256 identity keypair. The private key lives only
//    in this browser's localStorage; the public key is published to the
//    backend. Losing the private key (new device, cleared storage) makes old
//    messages undecryptable until another member re-wraps the conversation
//    key — acceptable because messages are deleted after 14 days anyway.
//  - Each conversation has one random AES-256-GCM key. It is distributed as
//    per-member "envelopes": the key wrapped with an AES key derived from
//    ECDH(wrapper private, member public). The server stores only public keys
//    and envelopes, so nobody outside the conversation — including the
//    server — can decrypt messages.
//  - No key rotation and no re-keying on membership changes, by design
//    (14-day retention). New members get an envelope for the existing key via
//    an opportunistic repair pass run by members who already hold it.
//
// Wire format: E2E_PREFIX + base64(iv ‖ ciphertext). The hidden prefix flags
// encrypted text; anything without it (all pre-rollout messages) passes
// through untouched. "e2e:v1:" messages from the interim conversation-id
// derived scheme are still decryptable.
//
// All key material and plaintext stay in client components — server actions
// only ever relay public keys and wrapped keys.

import {
  getE2EBundleAction,
  getE2EKeyBackupAction,
  publishE2EPublicKeyAction,
  storeE2EEnvelopesAction,
  storeE2EKeyBackupAction,
} from "@/app/rp/conversations/e2e-actions";
import type { Conversation, Message } from "@/types";
import { JWT_COOKIE_NAME } from "@/utils/constants";
import type { E2EConversationBundle, E2EEnvelope } from "@/utils/e2e-types";

/** PBKDF2 rounds for the password-derived backup key. */
const BACKUP_KDF_ITERATIONS = 600_000;

// Built via char code so the invisible character is explicit in source.
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);

/** Hidden flag marking encrypted wire text (current per-user-key format). */
export const E2E_PREFIX = `${ZERO_WIDTH_SPACE}e2e:v2:`;

/** Legacy format: key derived from conversation id + app secret. Decrypt only. */
const E2E_PREFIX_V1 = `${ZERO_WIDTH_SPACE}e2e:v1:`;

/** Shown in place of a flagged message that cannot be decrypted. */
export const DECRYPT_FALLBACK_TEXT = "🔒 This message could not be decrypted.";

const LEGACY_SECRET =
  process.env.NEXT_PUBLIC_CHAT_E2E_SECRET || "novelist-world-chat-e2e-v1";

/** Feature flag: outgoing messages are only encrypted when this is set (any
 *  truthy value). Unset → messages send as plaintext. Key exchange, envelope
 *  repair, and decryption of already-encrypted messages are unaffected — this
 *  gates the encrypt step alone so existing E2E traffic still reads. */
const E2E_ENCRYPT_ENABLED = !!process.env.NEXT_PUBLIC_CHAT_E2E_ENABLED;

const IV_LENGTH = 12;
const ECDH_PARAMS = { name: "ECDH", namedCurve: "P-256" } as const;
/** How long to wait before re-attempting key resolution after a failure. */
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

const encryptWithKey = async (key: CryptoKey, text: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ iv, name: "AES-GCM" }, key, encoder.encode(text)),
  );
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv);
  combined.set(ciphertext, iv.length);
  return toBase64(combined);
};

const decryptWithKey = async (key: CryptoKey, payload: string): Promise<string> => {
  const combined = fromBase64(payload);
  const plaintext = await crypto.subtle.decrypt(
    { iv: combined.slice(0, IV_LENGTH), name: "AES-GCM" },
    key,
    combined.slice(IV_LENGTH),
  );
  return decoder.decode(plaintext);
};

// ─── Identity (per-user ECDH keypair, private key never leaves the browser) ──

type Identity = {
  privateKey: CryptoKey;
  publicKeyString: string;
};

/** Namespaces localStorage by the JWT subject so two accounts sharing a
 *  browser never share a private key. Best effort — falls back to "anon". */
const identityNamespace = (): string => {
  try {
    const cookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${JWT_COOKIE_NAME}=`));
    const token = cookie?.slice(cookie.indexOf("=") + 1);
    const payloadPart = token?.split(".")[1];
    if (!payloadPart) return "anon";
    const payload = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return String(payload.sub ?? payload.username ?? "anon");
  } catch {
    return "anon";
  }
};

const identityStorageKey = () => `nw-e2e-identity:${identityNamespace()}`;
const publishedStorageKey = () => `nw-e2e-published:${identityNamespace()}`;

const identityCache = new Map<string, Promise<Identity>>();

const loadOrCreateIdentity = async (): Promise<Identity> => {
  const stored = localStorage.getItem(identityStorageKey());
  if (stored) {
    const parsed: { publicJwk: JsonWebKey; privateJwk: JsonWebKey } =
      JSON.parse(stored);
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      parsed.privateJwk,
      ECDH_PARAMS,
      false,
      ["deriveBits"],
    );
    return { privateKey, publicKeyString: JSON.stringify(parsed.publicJwk) };
  }

  const pair = await crypto.subtle.generateKey(ECDH_PARAMS, true, [
    "deriveBits",
  ]);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  localStorage.setItem(
    identityStorageKey(),
    JSON.stringify({ privateJwk, publicJwk }),
  );
  return {
    privateKey: pair.privateKey,
    publicKeyString: JSON.stringify(publicJwk),
  };
};

const getIdentity = (): Promise<Identity> => {
  const namespace = identityNamespace();
  let identity = identityCache.get(namespace);
  if (!identity) {
    identity = loadOrCreateIdentity();
    identity.catch(() => identityCache.delete(namespace));
    identityCache.set(namespace, identity);
  }
  return identity;
};

/** Publishes this browser's public key to the backend (once per key). Safe to
 *  call often; used at app start so members can receive envelopes before they
 *  ever open a conversation. */
export const ensureE2EIdentityPublished = async (): Promise<void> => {
  try {
    if (!hasCrypto()) return;
    const identity = await getIdentity();
    if (localStorage.getItem(publishedStorageKey()) === identity.publicKeyString) {
      return;
    }
    const published = await publishE2EPublicKeyAction(identity.publicKeyString);
    if (published) {
      localStorage.setItem(publishedStorageKey(), identity.publicKeyString);
    }
  } catch (error) {
    console.warn("e2e-crypto: failed to publish identity key", error);
  }
};

// ─── Password-wrapped key backup (same identity on every device) ─────────────
//
// The identity private key stays random (full entropy); the user's raw
// password/passphrase only gates a server-stored encrypted copy of it. On any
// device, entering the same secret restores the same identity, so every
// existing envelope keeps working. The secret itself never leaves the client.

/** Raw conversation-key bytes, pinned to a non-shared buffer for WebCrypto. */
type RawKey = Uint8Array<ArrayBuffer>;

export type BackupSyncResult =
  /** Identity from the backup installed (or already active) on this device. */
  | "installed"
  /** No backup existed — this device's identity was wrapped and uploaded. */
  | "created"
  /** Backup could not be opened with the secret and was replaced with this
   *  device's identity re-wrapped under it (password change / lost key). */
  | "replaced"
  /** Backup exists but the secret doesn't open it, and replacing was not
   *  allowed — nothing changed. */
  | "mismatch"
  /** WebCrypto/backend unavailable — nothing changed. */
  | "unavailable";

const deriveBackupKey = async (
  secret: string,
  salt: RawKey,
  iterations: number,
): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { hash: "SHA-256", iterations, name: "PBKDF2", salt },
    baseKey,
    { length: 256, name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
};

/** Replaces this device's identity with one restored from a backup and resets
 *  every cache derived from the old identity. */
const installIdentity = async (identityJson: string): Promise<void> => {
  localStorage.setItem(identityStorageKey(), identityJson);
  identityCache.delete(identityNamespace());
  conversationKeyCache.clear();
  failedResolutionAt.clear();
  await ensureE2EIdentityPublished();
};

/**
 * Syncs this device's identity key with the password-wrapped server backup.
 * Call with the raw password right after login, or with the chat sync
 * passphrase for OAuth accounts.
 *
 * - Backup opens with the secret → install that identity here (all devices
 *   converge on one key).
 * - No backup → wrap this device's identity and upload it.
 * - Backup doesn't open (secret changed) → with `replaceOnMismatch` (login:
 *   the user just proved this secret is current) re-wrap and replace;
 *   without it (manual passphrase entry) report "mismatch" so a typo can't
 *   destroy the existing backup.
 */
export const syncE2EKeyBackup = async (
  secret: string,
  options: { replaceOnMismatch?: boolean } = {},
): Promise<BackupSyncResult> => {
  try {
    if (!hasCrypto() || !secret) return "unavailable";

    const backup = await getE2EKeyBackupAction();

    if (backup) {
      try {
        const backupKey = await deriveBackupKey(
          secret,
          fromBase64(backup.salt),
          backup.kdfIterations,
        );
        const identityJson = await decryptWithKey(
          backupKey,
          backup.wrappedPrivateKey,
        );
        // Validate before trusting: must parse to a stored identity.
        JSON.parse(identityJson);
        if (identityJson !== localStorage.getItem(identityStorageKey())) {
          await installIdentity(identityJson);
        }
        return "installed";
      } catch {
        if (!options.replaceOnMismatch) return "mismatch";
        // Fall through: re-wrap this device's identity under the new secret.
      }
    }

    // Ensure an identity exists locally (creates one on first use), then
    // wrap it under the secret and upload.
    await getIdentity();
    await ensureE2EIdentityPublished();
    const identityJson = localStorage.getItem(identityStorageKey());
    if (!identityJson) return "unavailable";

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const backupKey = await deriveBackupKey(secret, salt, BACKUP_KDF_ITERATIONS);
    const stored = await storeE2EKeyBackupAction({
      kdfIterations: BACKUP_KDF_ITERATIONS,
      salt: toBase64(salt),
      wrappedPrivateKey: await encryptWithKey(backupKey, identityJson),
    });
    if (!stored) return "unavailable";
    return backup ? "replaced" : "created";
  } catch (error) {
    console.warn("e2e-crypto: key backup sync failed", error);
    return "unavailable";
  }
};

// ─── Envelope wrap/unwrap (ECDH → HKDF → AES-GCM) ────────────────────────────

const deriveWrapKey = async (
  privateKey: CryptoKey,
  otherPublicKeyString: string,
  conversationId: string,
): Promise<CryptoKey> => {
  const otherPublicKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(otherPublicKeyString),
    ECDH_PARAMS,
    false,
    [],
  );
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: otherPublicKey },
    privateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      info: encoder.encode("nw-e2e-envelope"),
      name: "HKDF",
      salt: encoder.encode(conversationId),
    },
    hkdfKey,
    { length: 256, name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
};

const wrapConversationKey = async (
  rawKey: RawKey,
  identity: Identity,
  recipientPublicKeyString: string,
  conversationId: string,
): Promise<string> => {
  const wrapKey = await deriveWrapKey(
    identity.privateKey,
    recipientPublicKeyString,
    conversationId,
  );
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const wrapped = new Uint8Array(
    await crypto.subtle.encrypt({ iv, name: "AES-GCM" }, wrapKey, rawKey),
  );
  const combined = new Uint8Array(iv.length + wrapped.length);
  combined.set(iv);
  combined.set(wrapped, iv.length);
  return toBase64(combined);
};

const unwrapConversationKey = async (
  envelope: E2EEnvelope,
  identity: Identity,
  conversationId: string,
): Promise<RawKey | null> => {
  try {
    // ECDH is symmetric: ECDH(our private, wrapper public) equals the
    // ECDH(wrapper private, our public) the envelope was wrapped with.
    const wrapKey = await deriveWrapKey(
      identity.privateKey,
      envelope.wrapperPublicKey,
      conversationId,
    );
    const combined = fromBase64(envelope.wrappedKey);
    const raw = await crypto.subtle.decrypt(
      { iv: combined.slice(0, IV_LENGTH), name: "AES-GCM" },
      wrapKey,
      combined.slice(IV_LENGTH),
    );
    return new Uint8Array(raw);
  } catch {
    return null;
  }
};

// ─── Conversation key resolution ─────────────────────────────────────────────

/** Events the socket layer relays to other members as "e2e-refresh" nudges:
 *  "locked-out" asks online members to wrap the conversation key for us;
 *  "repaired" tells members we just wrapped it for someone (so the locked-out
 *  member re-checks immediately instead of waiting for the next message). */
export type E2ESignal = {
  type: "locked-out" | "repaired";
  conversationId: string;
};

let e2eSignalListener: ((signal: E2ESignal) => void) | null = null;

export const setE2ESignalListener = (
  listener: ((signal: E2ESignal) => void) | null,
): void => {
  e2eSignalListener = listener;
};

const emitE2ESignal = (signal: E2ESignal): void => {
  try {
    e2eSignalListener?.(signal);
  } catch (error) {
    console.warn("e2e-crypto: signal listener failed", error);
  }
};

/** Conversations where a key exists but we cannot unwrap it yet (waiting for
 *  a member to wrap it for us). Used to grant sends a short grace retry. */
const lockedOutAt = new Map<string, number>();

const markLockedOut = (conversationId: string): void => {
  lockedOutAt.set(conversationId, Date.now());
  emitE2ESignal({ conversationId, type: "locked-out" });
};

const importConversationKey = (raw: RawKey): Promise<CryptoKey> =>
  crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);

/** Wraps the key for members whose envelope is missing (joined later or
 *  published their key after the conversation key was created) or stale
 *  (they regenerated their identity key). Fire-and-forget. */
const repairEnvelopes = async (
  conversationId: string,
  rawKey: RawKey,
  identity: Identity,
  bundle: E2EConversationBundle,
): Promise<void> => {
  try {
    const envelopeTargets = new Map(
      bundle.envelopes.map((e) => [e.novelistId, e.recipientPublicKey]),
    );
    const missing: E2EEnvelope[] = [];
    for (const member of bundle.memberPublicKeys) {
      if (envelopeTargets.get(member.novelistId) === member.publicKey) continue;
      missing.push({
        novelistId: member.novelistId,
        recipientPublicKey: member.publicKey,
        wrappedKey: await wrapConversationKey(
          rawKey,
          identity,
          member.publicKey,
          conversationId,
        ),
        wrapperPublicKey: identity.publicKeyString,
      });
    }
    if (missing.length > 0) {
      await storeE2EEnvelopesAction(conversationId, missing);
      // Tell the members we just enveloped to re-check right away.
      emitE2ESignal({ conversationId, type: "repaired" });
    }
  } catch (error) {
    console.warn("e2e-crypto: envelope repair failed", error);
  }
};

const doResolveConversationKey = async (
  conversationId: string,
): Promise<CryptoKey | null> => {
  if (!hasCrypto()) return null;

  const identity = await getIdentity();
  await ensureE2EIdentityPublished();

  let bundle = await getE2EBundleAction(conversationId);
  if (!bundle) return null;

  // The "already published" flag only records what THIS browser sent — the
  // server may hold a different key for us (another device of the same
  // account published theirs, or server state was replaced). Envelopes and
  // repairs target the server-side key, so until ours is current there we can
  // never be enveloped: re-publish past the flag and refetch, so members see
  // our real key and the stale-envelope repair pass can rewrap for it.
  if (
    !bundle.memberPublicKeys.some(
      (member) => member.publicKey === identity.publicKeyString,
    )
  ) {
    const published = await publishE2EPublicKeyAction(identity.publicKeyString);
    if (published) {
      localStorage.setItem(publishedStorageKey(), identity.publicKeyString);
      bundle = await getE2EBundleAction(conversationId);
      if (!bundle) return null;
    }
  }

  if (bundle.myEnvelope) {
    if (bundle.myEnvelope.recipientPublicKey !== identity.publicKeyString) {
      // Wrapped for a key we no longer hold (cleared storage / new device).
      // Signal online members to re-wrap for our current key.
      markLockedOut(conversationId);
      return null;
    }
    const raw = await unwrapConversationKey(
      bundle.myEnvelope,
      identity,
      conversationId,
    );
    if (!raw) {
      markLockedOut(conversationId);
      return null;
    }
    lockedOutAt.delete(conversationId);
    void repairEnvelopes(conversationId, raw, identity, bundle);
    return importConversationKey(raw);
  }

  if (bundle.envelopes.length > 0) {
    // A key exists but nobody has wrapped it for us yet — only a member who
    // holds it can (see repairEnvelopes). Signal them and retry later.
    markLockedOut(conversationId);
    return null;
  }

  // No conversation key yet — we are the first encrypted sender. Create one
  // and wrap it for every member who has published a public key. Bail if our
  // own key isn't in the member list (publish failed): creating a key we
  // couldn't read back would lock ourselves out.
  if (
    !bundle.memberPublicKeys.some(
      (member) => member.publicKey === identity.publicKeyString,
    )
  ) {
    return null;
  }

  const raw = crypto.getRandomValues(new Uint8Array(32));
  const envelopes: E2EEnvelope[] = [];
  for (const member of bundle.memberPublicKeys) {
    envelopes.push({
      novelistId: member.novelistId,
      recipientPublicKey: member.publicKey,
      wrappedKey: await wrapConversationKey(
        raw,
        identity,
        member.publicKey,
        conversationId,
      ),
      wrapperPublicKey: identity.publicKeyString,
    });
  }

  // The server resolves creation races — the returned envelope is always the
  // authoritative one, which may wrap another creator's key rather than ours.
  const myEnvelope = await storeE2EEnvelopesAction(conversationId, envelopes);
  if (!myEnvelope || myEnvelope.recipientPublicKey !== identity.publicKeyString) {
    return null;
  }
  const authoritative = await unwrapConversationKey(
    myEnvelope,
    identity,
    conversationId,
  );
  if (!authoritative) return null;
  lockedOutAt.delete(conversationId);
  return importConversationKey(authoritative);
};

const conversationKeyCache = new Map<string, Promise<CryptoKey | null>>();
const failedResolutionAt = new Map<string, number>();

const resolveConversationKey = (
  conversationId: string,
  ignoreCooldown = false,
): Promise<CryptoKey | null> => {
  const cached = conversationKeyCache.get(conversationId);
  if (cached) return cached;

  // The cooldown only gates passive decrypt attempts (a flood of incoming
  // messages must not hammer the bundle endpoint). Critical moments — sending
  // a message — pass ignoreCooldown to always attempt a full resolution.
  if (!ignoreCooldown) {
    const lastFailure = failedResolutionAt.get(conversationId);
    if (lastFailure && Date.now() - lastFailure < KEY_RETRY_MS) {
      return Promise.resolve(null);
    }
  }

  const promise = doResolveConversationKey(conversationId)
    .catch((error) => {
      console.warn("e2e-crypto: key resolution failed", error);
      return null;
    })
    .then((key) => {
      if (key) {
        failedResolutionAt.delete(conversationId);
      } else {
        // Don't cache failures permanently — retry after a cooldown.
        conversationKeyCache.delete(conversationId);
        failedResolutionAt.set(conversationId, Date.now());
      }
      return key;
    });
  conversationKeyCache.set(conversationId, promise);
  return promise;
};

const lastRefreshAt = new Map<string, number>();
/** Minimum interval between envelope re-checks for one conversation. */
const REFRESH_THROTTLE_MS = 30_000;

/**
 * Re-checks a conversation's envelope state against the server:
 *  - if we hold the key, repairs envelopes for members who joined or
 *    published/rotated their identity key after the key was created
 *  - if another member repaired an envelope for us, picks it up so this
 *    device can start decrypting without waiting for the retry cooldown
 *
 * Cached keys are never dropped: if the re-check fails (backend hiccup), the
 * previously resolved key keeps being used. Throttled per conversation —
 * call freely on conversation open, send, and incoming messages.
 */
export const refreshConversationE2E = async (
  conversationId: string,
  options: { force?: boolean } = {},
): Promise<boolean> => {
  if (!conversationId || !hasCrypto()) return false;

  const last = lastRefreshAt.get(conversationId);
  if (!options.force && last && Date.now() - last < REFRESH_THROTTLE_MS) {
    // Recently refreshed — report the current key state without a re-fetch.
    const cached = conversationKeyCache.get(conversationId);
    return cached ? (await cached) !== null : false;
  }
  lastRefreshAt.set(conversationId, Date.now());

  failedResolutionAt.delete(conversationId);
  const previous = conversationKeyCache.get(conversationId);

  const refreshed = doResolveConversationKey(conversationId)
    .catch((error) => {
      console.warn("e2e-crypto: envelope refresh failed", error);
      return null;
    })
    .then(async (key) => {
      const resolved = key ?? (previous ? await previous.catch(() => null) : null);
      if (!resolved) {
        conversationKeyCache.delete(conversationId);
        failedResolutionAt.set(conversationId, Date.now());
      }
      return resolved;
    });
  conversationKeyCache.set(conversationId, refreshed);
  return (await refreshed) !== null;
};

// ─── Legacy v1 key (conversation-id derived; decrypt-only) ───────────────────

const legacyKeyCache = new Map<string, Promise<CryptoKey>>();

const deriveLegacyKey = async (conversationId: string): Promise<CryptoKey> => {
  const secret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(LEGACY_SECRET),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      info: encoder.encode("nw-chat-message"),
      name: "HKDF",
      salt: encoder.encode(conversationId),
    },
    secret,
    { length: 256, name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
};

const getLegacyKey = (conversationId: string): Promise<CryptoKey> => {
  let key = legacyKeyCache.get(conversationId);
  if (!key) {
    key = deriveLegacyKey(conversationId);
    key.catch(() => legacyKeyCache.delete(conversationId));
    legacyKeyCache.set(conversationId, key);
  }
  return key;
};

// ─── Text-level API ──────────────────────────────────────────────────────────

export const isEncryptedText = (text: unknown): text is string =>
  typeof text === "string" &&
  (text.startsWith(E2E_PREFIX) || text.startsWith(E2E_PREFIX_V1));

/** Encrypts plaintext for the wire with the conversation's shared key. Falls
 *  back to sending plaintext when no key can be resolved (member hasn't been
 *  enveloped yet, WebCrypto missing, backend unreachable) so chat never
 *  breaks — plaintext is always valid thanks to the prefix flag. */
export const encryptMessageText = async (
  conversationId: string,
  text: string,
): Promise<string> => {
  if (!conversationId || !text || isEncryptedText(text)) return text;
  // Feature flag off → send plaintext. Everything else (key resolution,
  // envelope repair, decryption) still runs elsewhere.
  if (!E2E_ENCRYPT_ENABLED) return text;
  try {
    // Sending is the moment that matters — always attempt a full resolution
    // instead of trusting the retry cooldown, so a just-repaired envelope is
    // picked up immediately rather than after the cooldown expires.
    let key = await resolveConversationKey(conversationId, true);
    if (!key && lockedOutAt.has(conversationId)) {
      // A key exists but nobody has wrapped it for us yet. The locked-out
      // signal just nudged online members to repair — give that round trip a
      // moment before falling back to plaintext.
      await new Promise((resolve) => setTimeout(resolve, 2_500));
      key = await resolveConversationKey(conversationId, true);
    }
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

/** Decrypts wire text. Text without an E2E prefix (legacy plaintext) is
 *  returned untouched; a flagged message that fails to decrypt resolves to a
 *  fallback placeholder instead of throwing. */
export const decryptMessageText = async (
  conversationId: string,
  text: string,
): Promise<string> => {
  if (typeof text !== "string") return text;
  try {
    if (text.startsWith(E2E_PREFIX)) {
      const key = await resolveConversationKey(conversationId);
      if (!key) return DECRYPT_FALLBACK_TEXT;
      return await decryptWithKey(key, text.slice(E2E_PREFIX.length));
    }
    if (text.startsWith(E2E_PREFIX_V1)) {
      const key = await getLegacyKey(conversationId);
      return await decryptWithKey(key, text.slice(E2E_PREFIX_V1.length));
    }
    return text;
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
