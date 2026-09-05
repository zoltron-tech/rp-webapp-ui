# How chat encryption works (plain-English explainer)

This describes the encryption used for direct/group chat messages in Novelist
World. It's written for someone who isn't deep in the crypto code.

Core files:
- `src/utils/e2e-crypto.ts` — all the encryption/decryption logic (client-side)
- `packages/types/src/e2e.ts` — the shape of the one call to the backend
- `src/app/rp/conversations/e2e-actions.ts` — that call
- `service/ChatMessageCryptoService.kt` (portfolio-service) — the server's
  matching decryption, used only for reported messages

## The big idea

Messages are encrypted **in the browser** before they're sent and decrypted in
the browser after they arrive. What is stored in the `messages` table, and what
travels through chat-server, is ciphertext.

Read the next section carefully before describing this to users: **this is not
end-to-end encryption.** The server can decrypt, deliberately.

## Two halves of one key

Every conversation has a single AES-256-GCM key. Nobody stores that key
anywhere — it is derived, on demand, from two pieces:

1. **The server half** — 32 random bytes the backend generates the first time
   anyone asks for that conversation's key, stored in `e2e_conversation_secrets`
   and handed out over `GET /chat/e2e/conversation/{id}/key` to **members only**.
2. **The client half** — `CHAT_E2E_SECRET`, one value baked into the UI bundle
   at build time and shared by every user.

The two go through HKDF-SHA256 (server half as the input key, client half as the
salt, the conversation id as the info string) to produce the key. Same two
halves in, same key out, every time — so every member of a conversation derives
an identical key without any key exchange between them.

## Why it's built this way

Because it removes all the moving parts. There is no per-user keypair, nothing
kept in `localStorage`, no per-member copies of the key to distribute, nothing
to repair when someone joins late, and no passphrase to remember. A new member,
a new browser, or a fresh incognito window reads the whole conversation the
moment it loads — it just asks the backend for the server half.

Chat-server, which relays messages and sends push notifications, is given
neither half. That's why a push preview for an encrypted message says
"Sent a message" instead of leaking ciphertext.

## Sending a message

1. The composer hands the plaintext to `encryptMessageText(conversationId, text)`.
2. That fetches (and caches) the conversation key, encrypts with AES-256-GCM
   under a fresh random 12-byte IV, and returns
   `HIDDEN_PREFIX + base64(iv ‖ ciphertext)`.
3. The result goes over the WebSocket and into the database.

The hidden prefix is a zero-width space followed by `e2e:v3:` — invisible if it
ever renders, and the flag that tells a reader "this is ciphertext". Text
without it is plaintext and passes through untouched, which is what makes the
feature flag and every pre-encryption message safe.

**Encryption fails open.** If the key can't be fetched — flag off, backend
unreachable, no WebCrypto — the message is sent as plaintext rather than not
sent at all. Chat never breaks because of encryption.

## Receiving a message

Incoming messages are decrypted centrally in `socket.provider.tsx`, so every
consumer of `lastIncomingMessage` sees plaintext. Fetched history, `lastMessage`
previews in the inbox and the chat menu, and forwarded messages go through the
same `decryptMessage` / `decryptConversations` helpers.

If a message can't be decrypted right now, the UI shows
"🔒 This message could not be decrypted." and keeps the original ciphertext on
the message object (`e2eCiphertext`). A failed key fetch is retried after 30
seconds, and the next incoming message re-runs decryption over the visible
history — so a transient failure heals itself without a reload.

## The feature flag

`VITE_CHAT_E2E_ENABLED` (unset/empty = off) controls **encrypting only**.
Decryption always runs. Turning the flag off makes new messages plaintext while
everything already encrypted stays readable.

`CHAT_E2E_SECRET` is not a flag — it's half the key. If it is unset, nothing
encrypts. If it is *changed*, every message encrypted under the old value
becomes permanently unreadable, so treat it as fixed once deployed.

## Reported messages

A reported message is stored with the report. Because chat messages are
encrypted and are deleted after 14 days, `ReportService` decrypts the message at
report time and saves the plaintext into `reports.reported_content` — otherwise
a moderator reviewing the report later would find ciphertext, or nothing.

This is why portfolio-service is configured with `CHAT_E2E_CLIENT_SECRET`, which
must hold the same value as the UI's `CHAT_E2E_SECRET`.

## What this does *not* protect against

- **The server.** It holds one half of the key in its database and the other in
  its configuration. It can read any message. That is a deliberate choice, made
  so reported messages can be moderated.
- **Anyone who reads the JS bundle.** The client half ships to every browser;
  extracting it is trivial. It is not a secret from users, only from someone who
  has the database and nothing else.
- **A compromised or malicious server.** It could serve modified JS, or simply
  log plaintext.
- **Attachments.** Images, files and media are not encrypted.
- **Metadata.** Who talks to whom, when, and how often is all in plaintext.

What it *does* protect is a stolen database dump or a leaked backup: the message
rows are ciphertext, and the client half is not in there.

## Notes for future work

- No key rotation and no re-key when membership changes. A removed member who
  kept a copy of the server half could still decrypt old ciphertext they saved.
  Acceptable given the 14-day retention.
- The prefix version (`e2e:v3:`) is what makes a future scheme change possible:
  bump it, keep the old decrypt path for the retention window, then delete it.
  The `v1` and `v2` schemes were removed this way.
- The prefix appears in three places and must stay in sync:
  `src/utils/e2e-crypto.ts`, `ChatMessageCryptoService.kt`, and the generic
  `e2e:` check in chat-server's `push-notification-manager.ts`.
