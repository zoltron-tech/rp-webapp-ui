/**
 * Screen hooks: fetching, pagination, mutations and derived state, with no
 * view concerns and no DOM.
 *
 * The rule that makes this package worth having — every hook here has a real
 * consumer in `apps/web` as well as `apps/mobile`. A hook written for one
 * client is a guess about what the other needs; a hook both clients render is
 * a contract, and when the two screens disagree the disagreement is visible
 * here rather than duplicated in two places.
 */
export { ApiProvider, useApi } from "./api-context";
export { ChatCryptoProvider, useChatCrypto } from "./chat/crypto-context";
export {
  INBOX_FILTERS,
  type InboxFilter,
  type InboxKind,
  type InboxSection,
  inboxGroupFaces,
  inboxHue,
  inboxKind,
  inboxSections,
  inboxSpeaker,
  inboxSummary,
  inboxThumbnail,
  isLastMessageMine,
  matchesInboxFilter,
} from "./chat/inbox-kinds";
export {
  type ChatLiveOptions,
  MESSAGES_PAGE_SIZE,
  useConversation,
  useConversationMessages,
  useMarkConversationRead,
  usePrefetchConversationMessages,
  useSendMessage,
} from "./chat/use-conversation";
export {
  MEMBERS_PAGE_SIZE,
  useConversationMembers,
} from "./chat/use-conversation-members";
export {
  CONVERSATIONS_PAGE_SIZE,
  useConversations,
  useUnreadConversations,
} from "./chat/use-conversations";
export { queryKeys } from "./keys";
export {
  LEADERBOARD_MAX_TOTAL,
  LEADERBOARD_PAGE_SIZE,
  useNovelistLeaderboard,
} from "./leaderboard/use-novelist-leaderboard";
export {
  isNotificationRequest,
  matchesNotificationFilter,
  NOTIFICATION_FILTERS,
  type NotificationFilter,
  type NotificationKind,
  type NotificationSection,
  notificationHue,
  notificationKicker,
  notificationKind,
  notificationSections,
  notificationSummary,
} from "./notifications/kinds";
export {
  isStoredNotification,
  useNotificationCounts,
  useNotificationReadState,
} from "./notifications/use-notification-counts";
export {
  NOTIFICATIONS_PAGE_SIZE,
  useNotifications,
} from "./notifications/use-notifications";
export {
  FRIENDS_PAGE_SIZE,
  useNovelistFriends,
  usePrefetchNovelistFriends,
} from "./profile/use-novelist-friends";
export { createQueryClient } from "./query-client";
export {
  type Session,
  type SessionStatus,
  useLogin,
  useLogout,
  useSession,
} from "./session/use-session";
