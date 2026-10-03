/**
 * The copy shown at the top of a conversation, and the empty-state prompts.
 *
 * Here rather than in either app because it is a *promise to the user* about
 * how their messages are handled. Two clients quoting different retention
 * periods — or making different claims about encryption — is not a styling
 * inconsistency, it is one of them lying, and the phrasing is varied
 * deliberately, so a divergence would be easy to mistake for one of the
 * intended variants.
 *
 * ## What the encryption line may and may not say
 *
 * Messages are encrypted on the device before they are sent, and what sits in
 * the database and crosses chat-server is ciphertext. That is true and worth
 * telling people.
 *
 * It is **not** end-to-end encryption, and no variant here may imply that it
 * is. `docs/e2e-encryption.md` is explicit: the server can decrypt, on purpose
 * — it holds one half of every conversation key, and the other half is a
 * constant compiled into the client bundle. So "encrypted", "encrypted before
 * it leaves your device" and "stored scrambled" are accurate; "end-to-end",
 * "only you and they can read this" and "we cannot read your messages" are
 * not, and a person deciding what to say in a private conversation may act on
 * the difference.
 */

export interface ChatNotice {
  line1: string;
  line2: string;
}

/**
 * Two facts, said six ways: messages are encrypted, and they last 14 days.
 *
 * Keep the period identical in every variant, and keep the encryption claim
 * within what the doc comment above allows.
 */
export const RETENTION_NOTICES: ChatNotice[] = [
  {
    line1: "🔒 Encrypted before it leaves your device.",
    line2: "And chats quietly disappear after 14 days.",
  },
  {
    line1: "🕊️ Every message is scrambled in storage.",
    line2: "Then it vanishes after 14 days, no trace left.",
  },
  {
    line1: "🌙 Encrypted on the way, and not kept forever.",
    line2: "These messages fade away after 14 days.",
  },
  {
    line1: "💬 Keep it real — it is encrypted either way.",
    line2: "This chat self-destructs in 14 days.",
  },
  {
    line1: "🔥 Live in the moment; this chat does too.",
    line2: "Encrypted in transit, and gone after 14 days.",
  },
  {
    line1: "🌊 Like whispers on the wind — and encrypted.",
    line2: "Your messages drift away after 14 days.",
  },
];

/** The phrase both clients emphasise inside `line2`. */
export const RETENTION_PERIOD = "14 days";

/**
 * One variant, stable for a given conversation.
 *
 * `Math.random()` per render would reshuffle the notice on every keystroke in
 * the composer. Hashing the conversation id instead means it is arbitrary
 * across conversations — which is the point — and fixed within one.
 */
export const pickNotice = <T>(notices: T[], seed: string): T => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return notices[Math.abs(hash) % notices.length] as T;
};

export const retentionNoticeFor = (conversationId: string): ChatNotice =>
  pickNotice(RETENTION_NOTICES, conversationId);

/**
 * What an empty conversation says instead of nothing.
 *
 * An empty thread is the moment a conversation is most likely to never happen:
 * there is no history to react to, and "No messages yet" is a status rather
 * than an invitation. These lines are the invitation, and they are shared for
 * the same reason the retention notices are — the two clients are quoting the
 * product's own voice, and a person who uses both should not find the app
 * saying different things about the same empty screen.
 */
export const HELLO_NOTICES: ChatNotice[] = [
  {
    line1: "No messages here yet.",
    line2: "Be the first to break the ice! 🧊",
  },
  {
    line1: "The conversation starts with you.",
    line2: "Send a little hello and see what happens. ✨",
  },
  {
    line1: "Silence can be golden...",
    line2: "But a warm hello is even better. 🌟",
  },
  {
    line1: "Nothing here yet — it's a blank canvas.",
    line2: "Paint it with your first message. 🎨",
  },
  {
    line1: "Every great story has a first line.",
    line2: "Write yours and say hello. 📖",
  },
  {
    line1: "This chat is waiting for you.",
    line2: "Don't keep it waiting too long! ⏳",
  },
];

export const helloNoticeFor = (conversationId: string): ChatNotice =>
  pickNotice(HELLO_NOTICES, conversationId);

/**
 * What the hello sticker search asks for.
 *
 * Two queries rather than one so the stickers on offer are not identical for
 * everybody, and both are terms Klipy actually returns waving characters for.
 */
export const HELLO_STICKER_QUERIES = ["hello", "wave"] as const;
