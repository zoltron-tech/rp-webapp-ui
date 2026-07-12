# How chat encryption works (plain-English explainer)

This describes the end-to-end (E2E) encryption used for direct/group chat messages
in Novelist World. It's written for someone who isn't deep in the crypto code.

Core files:
- `src/utils/e2e-crypto.ts` — all the encryption/decryption logic (client-side)
- `src/utils/e2e-types.ts` — shared data shapes for talking to the backend
- `src/app/rp/conversations/e2e-actions.ts` — server actions that call the backend key-distribution API

## The big idea

Messages are encrypted **on your device** before they're sent, and decrypted
**on the recipient's device** after they arrive. The server (and its database)
only ever sees scrambled ciphertext — it stores keys but can never use them to
read a message. This is "true" E2E, not just "encrypted in transit" — even
someone with full access to the Novelist World database couldn't read your chats.

## Two kinds of keys

1. **Your identity key pair** — every user generates one ECDH key pair
   (a public key and a private key) the first time they use chat. The private
   key **never leaves your browser** — it's stored in `localStorage`. The
   public key gets uploaded to the backend so other people can use it.

2. **A conversation key** — every conversation (1:1 or group) has one shared
   secret key (AES-256) used to actually encrypt/decrypt the messages in that
   conversation. This key is created once, by whoever sends the first
   encrypted message in that conversation.

The clever part is how the conversation key gets safely shared with everyone
in the conversation without the server ever seeing it in the clear:

## "Envelopes" — sharing the conversation key safely

For each member of a conversation, the conversation key is individually
**wrapped** (encrypted) using a secret that only that member and the wrapper
can compute together (via ECDH + HKDF — a standard "two people can derive the
same shared secret from their public/private keys" trick). This wrapped copy
is called an **envelope**.

- The server stores everyone's public keys and everyone's envelopes.
- The server can see *that* Alice has an envelope, but not what's inside it —
  only Alice's private key (which never left her browser) can open it.
- If you're the first person to send an encrypted message in a conversation,
  your browser creates the conversation key and wraps ("envelopes") it for
  every current member.
- If someone joins later, or publishes their public key after the
  conversation key already existed, they won't have an envelope yet. Any
  member who *does* hold the key will notice this gap and create an envelope
  for the missing person automatically — this is called a "repair pass" (see
  `repairEnvelopes` in the code). Until that happens, that member sees a
  🔒 placeholder instead of the real message.

## Sending a message

1. You type a message and hit send.
2. It appears instantly in your chat (optimistic UI) — before encryption even
   happens, so the UI feels snappy.
3. Right before the message actually goes over the socket, the app:
   - Looks up (or creates) the conversation's shared key.
   - If your envelope isn't ready yet, it politely asks other online members
     to hurry up and create one for you (a small "nudge" over the socket),
     waits ~2.5 seconds, and tries again.
   - Encrypts the text with AES-256-GCM and sends the ciphertext instead of
     plain text.
4. If a key genuinely can't be resolved (e.g., you're the very first sender
   and something failed), the app falls back to sending **plain text** rather
   than blocking you from chatting. A special invisible marker (a hidden
   character) is used to distinguish "this text is encrypted" from "this is
   plain text" — so old messages sent before encryption was added still
   display correctly.

## Receiving a message

1. A message arrives over the WebSocket.
2. The app checks the invisible marker to see if it's encrypted.
3. If encrypted, it decrypts using the conversation key (resolved/cached the
   same way as sending).
4. If the key isn't available yet (you just joined, or haven't been
   enveloped yet), you see: **"🔒 This message could not be decrypted."**
   The original ciphertext is kept in memory so that as soon as your envelope
   arrives, the app automatically retries and swaps in the real text — you
   don't need to refresh.

## Keeping devices repaired without manual action

Whenever you open a conversation, send a message, or a new message/nudge
arrives over the socket, the app quietly re-checks: "do I have the key? does
anyone I know need me to wrap it for them?" This is throttled (not on every
keystroke) so it doesn't spam the backend, but it means:

- A newcomer to a group chat usually gets access within seconds of any
  existing member being online.
- Nobody has to manually "share a key" — it's automatic in the background.

## Using chat on more than one device

Your identity private key normally only lives in one browser's
`localStorage`. To read the same encrypted chats on a second device (or after
clearing browser storage), Novelist World keeps an encrypted **backup** of
your identity key on the server:

- The backup is encrypted with a key derived from your **password**
  (via PBKDF2, 600,000 rounds — a slow, brute-force-resistant hashing
  scheme). The server stores the encrypted blob but can't open it without
  knowing your password.
- When you log in with a password, the app automatically tries to restore
  your identity from this backup (or creates one if it doesn't exist yet).
  This means logging into chat from a new device "just works" using your
  normal password.
- If you signed up via Discord (OAuth) and have no password, there's a
  dedicated "Secure chat sync" passphrase you set once in
  Profile → Account settings. Enter the same passphrase on any device to
  unlock the same chat history there.
- A typo when entering that passphrase will **not** silently overwrite your
  existing backup (it just says "doesn't match") — only right after a real
  password login (where the password was just proven correct) does the app
  allow it to replace the backup, e.g. after a password reset.

## What this does *not* protect against

Being upfront about the current limitations:

- No key rotation. If someone leaves a group, they technically could still
  decrypt messages sent while they were a member (irrelevant in practice
  since messages are auto-deleted after 14 days).
- Attachments (images/files) are **not** encrypted, only text.
- If you report a message, moderators see the decrypted content (needed to
  review reports).
- If nobody who holds the conversation key is ever online to "repair" a new
  member's envelope, that member is stuck seeing 🔒 until someone is.
- The server does see your raw password at login (used to derive the backup
  key) — so this protects your chat data from a database leak, not from a
  fully compromised/malicious server at the moment you log in.
- If the conversation key truly cannot be resolved, the app quietly falls
  back to sending plain text rather than blocking the send, so chat never
  breaks — but it means encryption coverage isn't 100% guaranteed in every
  edge case.
