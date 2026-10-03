/**
 * The chat encryption protocol, checked across both backends at once.
 *
 * This is the test that matters most in the workspace. The scheme has two
 * implementations of its primitives — `crypto.subtle` in the browser, `@noble`
 * on the phone — and if they disagree by one byte about HKDF's salt, the IV's
 * position, or how a UTF-8 string becomes bytes, the result is not an error. It
 * is a message one device can read and the other renders as
 * "🔒 could not be decrypted", with nothing in any log to explain it.
 *
 * So: encrypt with each backend, decrypt with the other. Node has both
 * available, which makes the cross-check cheap to run on every `pnpm verify`.
 *
 * `@noble/*` is a devDependency of this app for exactly this reason — the web
 * bundle does not use it.
 */
import { gcm } from "@noble/ciphers/aes";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import {
  type ChatCryptoBackend,
  createChatCrypto,
  DECRYPT_FALLBACK_TEXT,
  E2E_PREFIX,
  isEncryptedText,
  toBase64,
} from "@nw/chat";

let failures = 0;

const check = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    console.log(`PASS  ${name}  (${a})`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}\n        expected ${b}\n        actual   ${a}`);
  }
};

// ─── The two backends, exactly as each app builds them ──────────────────────

const webBackend: ChatCryptoBackend<CryptoKey> = {
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
      {
        hash: "SHA-256",
        info: info as BufferSource,
        name: "HKDF",
        salt: salt as BufferSource,
      },
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

const nativeBackend: ChatCryptoBackend<Uint8Array> = {
  decrypt: async (key, iv, ciphertext) => gcm(key, iv).decrypt(ciphertext),
  deriveKey: async (secret, salt, info) => hkdf(sha256, secret, salt, info, 32),
  encrypt: async (key, iv, plaintext) => gcm(key, iv).encrypt(plaintext),
  randomBytes: (length) => crypto.getRandomValues(new Uint8Array(length)),
};

// ─── One conversation, one shared secret pair ───────────────────────────────

const CONVERSATION = "conv-1234";
const CLIENT_SECRET = "client-half-of-the-key";
const SERVER_SECRET = toBase64(new Uint8Array(32).fill(7));

const build = <K,>(backend: ChatCryptoBackend<K>, serverSecret = SERVER_SECRET) =>
  createChatCrypto<K>({
    backend,
    clientSecret: CLIENT_SECRET,
    encryptEnabled: true,
    fetchServerSecret: async () => serverSecret,
  });

const web = build(webBackend);
const native = build(nativeBackend);

const run = async () => {
  // ── The cross-check ───────────────────────────────────────────────────────
  const plain = "hello — ünïcode, emoji 🎭, and a <b>tag</b>";

  const fromWeb = await web.encryptMessageText(CONVERSATION, plain);
  const fromNative = await native.encryptMessageText(CONVERSATION, plain);

  check("web output is flagged as encrypted", isEncryptedText(fromWeb), true);
  check("native output is flagged too", isEncryptedText(fromNative), true);
  check("the ciphertext is not the plaintext", fromWeb === plain, false);

  check(
    "the phone can read what the browser wrote",
    await native.decryptMessageText(CONVERSATION, fromWeb),
    plain,
  );
  check(
    "the browser can read what the phone wrote",
    await web.decryptMessageText(CONVERSATION, fromNative),
    plain,
  );

  // A fresh IV every time, or AES-GCM stops protecting anything.
  const again = await web.encryptMessageText(CONVERSATION, plain);
  check("two encryptions of the same text differ", fromWeb === again, false);

  // ── Passthrough and failure behaviour ─────────────────────────────────────
  check(
    "unflagged text is returned untouched",
    await native.decryptMessageText(CONVERSATION, "an old plaintext message"),
    "an old plaintext message",
  );
  check(
    "already-encrypted text is not encrypted twice",
    await web.encryptMessageText(CONVERSATION, fromWeb),
    fromWeb,
  );

  const wrongKey = build(nativeBackend, toBase64(new Uint8Array(32).fill(9)));
  check(
    "a wrong key falls back rather than throwing",
    await wrongKey.decryptMessageText(CONVERSATION, fromWeb),
    DECRYPT_FALLBACK_TEXT,
  );

  const noSecret = createChatCrypto<Uint8Array>({
    backend: nativeBackend,
    clientSecret: CLIENT_SECRET,
    encryptEnabled: true,
    fetchServerSecret: async () => null,
  });
  check(
    "no server secret means the fallback, not a crash",
    await noSecret.decryptMessageText(CONVERSATION, fromWeb),
    DECRYPT_FALLBACK_TEXT,
  );
  check(
    "and sending falls back to plaintext rather than failing",
    await noSecret.encryptMessageText(CONVERSATION, plain),
    plain,
  );

  const flagOff = createChatCrypto<Uint8Array>({
    backend: nativeBackend,
    clientSecret: CLIENT_SECRET,
    encryptEnabled: false,
    fetchServerSecret: async () => SERVER_SECRET,
  });
  check(
    "the flag off sends plaintext",
    await flagOff.encryptMessageText(CONVERSATION, plain),
    plain,
  );
  check(
    "but still decrypts history",
    await flagOff.decryptMessageText(CONVERSATION, fromWeb),
    plain,
  );

  // ── The key is per conversation ───────────────────────────────────────────
  check(
    "another conversation cannot open this message",
    await native.decryptMessageText("conv-other", fromWeb),
    DECRYPT_FALLBACK_TEXT,
  );

  // ── Message objects ───────────────────────────────────────────────────────
  const message = {
    conversationId: CONVERSATION,
    message: fromWeb,
  } as unknown as Parameters<typeof native.decryptMessage>[0];

  const decrypted = await native.decryptMessage(message);
  check("a message object is decrypted in place", decrypted.message, plain);
  check(
    "and is no longer marked as holding ciphertext",
    native.hasUndecryptedContent(decrypted),
    false,
  );

  const stuck = await wrongKey.decryptMessage(message);
  check("a message that failed keeps its ciphertext", stuck.e2eCiphertext, fromWeb);
  check(
    "and is marked so it can be retried",
    wrongKey.hasUndecryptedContent(stuck),
    true,
  );

  check("the prefix is the v3 marker", E2E_PREFIX, "​e2e:v3:");

  if (failures > 0) {
    // Thrown rather than `process.exit`: the shared packages narrow the ambient
    // `process` type to `{ env }`, and an unhandled throw is a non-zero exit.
    throw new Error(`${failures} smoke check(s) failed`);
  }
  console.log("\nALL PASS");
};

void run();
