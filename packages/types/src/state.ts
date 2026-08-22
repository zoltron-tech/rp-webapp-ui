import type {
  Comment,
  Conversation,
  Muse,
  Novelist,
  NovelistWorldNotification,
  Prompt,
  PromptThreadComment,
  User,
} from ".";
import type { Activity } from "./activity";
import type { AccentValue } from "./theme";

export type AuthState =
  | "LOGGED_IN"
  | "LOGGED_OUT"
  | "LOADING"
  | "UNINITIALIZED";

export interface MusicPlayerState {
  playingSongId: string | null;
  playingSongUrl: string | null;
  playingSongName: string | null;
  progress: number;
  currentTime: number;
  duration: number;
}

export interface StoreState {
  novelists: Novelist[];
  muses: Muse[];
  theme: "light" | "dark";
  authState: AuthState;
  user: User | null;
  novelist: Novelist | null;
  pageLoading: boolean;
  accent: AccentValue;
  searchBarExpanded: Boolean;
  notifications: NovelistWorldNotification[] | null;
  musicPlayer: MusicPlayerState;
  unreadConversationIds: string[] | null;
  unreadReplyCount: number | null;
  /** Total number of groups the current novelist belongs to. */
  groupCount: number | null;
  helloStickers: { stickerUrl: string; previewUrl: string }[] | null;
  /** Prompt cached by the prompt-card before navigating to the comment page. */
  activePrompt: Prompt | null;
  /** Conversation cached by ConversationCard before navigating to the detail page. */
  activeConversation: Conversation | null;
  /** First page of conversations cached after login and refreshed on socket messages. */
  cachedConversations: Conversation[] | null;
  /** Direction of the last conversation navigation for slide animations. */
  conversationNavDirection: "forward" | "back" | null;
  /** ID of the most recently read conversation — used to sync the list card state. */
  lastReadConversationId: string | null;
  /** Cached friend suggestions for /rp/home — fetched once per session. */
  friendSuggestions: Novelist[] | null;
  /** Comments per prompt, keyed by promptId — populated on first load, shared across pages. */
  cachedPromptComments: Record<string, Comment[]> | null;
  /** First page of explore prompts — prefetched on login, shared by /rp/home and /rp/explore. */
  cachedExplorePrompts: Prompt[] | null;
  /** First page of OOC posts (news feed) — prefetched on login, shared by /rp/home and /rp/explore. */
  cachedOOCPosts: Prompt[] | null;
  /** First page of friend activities — prefetched on login, shared by /rp/home and /rp/explore. */
  cachedHomeActivities: Activity[] | null;
  /** First page of outgoing thread interactions — cached per session. */
  cachedOutgoingThreads: PromptThreadComment[] | null;
  /** When true, the shared layout hides LeftNav/RightSidebar — e.g. the
   *  storyboard event page's book reading mode needs the full width. */
  hideAppSidebars: boolean;
  /** When true, shows the install-NW-as-app prompt before routing to onboarding. */
  showInstallAppPrompt: boolean;
  /** When true, shows the Join-Discord prompt over the welcome page after onboarding. */
  showJoinDiscordPrompt: boolean;
  /** True for the brief window between finishing onboarding and viewing the welcome page. */
  justOnboarded: boolean;
  /**
   * Leaderboard rank of the currently logged-in novelist — null while loading,
   * undefined when the fetch failed or no rank exists (hides the badge instead
   * of shimmering forever). Refreshed on login and profile/edit-profile open.
   */
  novelistRank: number | null | undefined;
}
