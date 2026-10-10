/**
 * Everything both chat clients must agree on, and nothing either one owns.
 *
 * Three things live here, for one reason: each of them fails *silently* when
 * two clients disagree, rather than raising anything anybody would see.
 *
 *  - **Encryption** — the prefix, the HKDF salt and info, the IV's place in the
 *    payload, the fallback. The primitives are injected, because WebCrypto is
 *    the one part a phone genuinely does not have. Disagree here and a message
 *    is readable on one device and a padlock on the other.
 *  - **Socket frames** — what chat-server sends and expects. Disagree here and
 *    presence is permanently grey, or a message is dropped by a `console.error`
 *    on a server nobody is tailing.
 *  - **Participants** — who a conversation is *with*. Disagree here and a
 *    direct chat is labelled with your own name half the time.
 *  - **Markdown** — what the native composer's `**bold**` turns into before it
 *    is sent. Disagree here and a message written on a phone reads as four
 *    literal asterisks in the browser.
 *  - **Reactions** — the keys a reaction is stored as. Disagree here and one
 *    client prints the word `laugh` where the other draws a face.
 *  - **Ice breakers** — the length cap, the colours, and how the endpoint's
 *    epoch-seconds timestamp is read. Disagree here and a message is rejected,
 *    a bubble is colourless, or a date lands in 1970.
 *
 * What is not here: opening a socket, reconnect policy, and anything that needs
 * a DOM or a native module.
 */

export { fromBase64, toBase64, utf8Bytes, utf8Text } from "./base64";
export {
  type ChatCrypto,
  type ChatCryptoBackend,
  type ChatCryptoConfig,
  createChatCrypto,
  DECRYPT_FALLBACK_TEXT,
  E2E_PREFIX,
  isEncryptedText,
  passthroughChatCrypto,
} from "./crypto";
export {
  ICE_BREAKER_COLORS,
  ICE_BREAKER_MAX_LENGTH,
  iceBreakerSources,
  isOwnIceBreaker,
  parseIceBreakerTimestamp,
} from "./ice-breakers";
export {
  hasMarkdown,
  type MarkdownMark,
  type MarkdownToken,
  markdownToHtml,
  tokenizeMarkdown,
} from "./markdown";
export {
  type AttachmentKind,
  AUDIO_EXTENSIONS,
  extractUrls,
  getAttachmentKind,
  getFileExtension,
  getFileNameFromUrl,
  IMAGE_EXTENSIONS,
  isDirectImageUrl,
  isDirectVideoUrl,
  isKlipyClip,
  isMediaOnlyMessage,
  isVideoOnlyMessage,
  messageTextOf,
  URL_REGEX,
  VIDEO_EXTENSIONS,
  withoutUrls,
} from "./media";
export {
  type ChatNotice,
  HELLO_NOTICES,
  HELLO_STICKER_QUERIES,
  helloNoticeFor,
  pickNotice,
  RETENTION_NOTICES,
  RETENTION_PERIOD,
  retentionNoticeFor,
} from "./notices";
export {
  type ConversationTarget,
  conversationUsernames,
  isGroupAdmin,
  isSupportNovelist,
  type MessageSenderChoice,
  otherParticipant,
  resolveConversationTarget,
  SUPPORT_USERNAME,
  senderOptions,
} from "./participants";
export {
  type ConversationPreview,
  conversationPreview,
  conversationPreviewText,
  messagePreview,
  messagePreviewText,
} from "./preview";
export {
  isSameReaction,
  REACTION_OPTIONS,
  type ReactionOption,
  reactionGlyph,
  reactionLabel,
  reactionOption,
} from "./reactions";
export {
  createEditSocketMessage,
  createHeartbeatPong,
  createHeartbeatQuery,
  createMessageSocketMessage,
  createReactionSocketMessage,
  HEARTBEAT_TIMEOUT_MS,
  type HeartbeatPayload,
  isServerEdit,
  isServerMessage,
  isServerNotification,
  isServerPing,
  isServerReaction,
  type OutgoingMessagePayload,
  parseSocketFrame,
  type ReactionPayload,
  type ServerEdit,
  type ServerPing,
  type ServerReaction,
  type SocketSender,
} from "./socket";
