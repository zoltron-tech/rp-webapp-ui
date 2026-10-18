import { toHandle } from "./profile-handle";

export const ROUTES = {
  /** The public badge catalogue — everything there is to earn. */
  Badges: "/rp/badges",
  Bookmarks: "/rp/bookmarks",
  Compose: (params: {
    type: string;
    parentId?: string;
    dropdownSelection: string;
  }) => {
    const query = new URLSearchParams({
      dropdownSelection: params.dropdownSelection,
      type: params.type,
    });
    if (params.parentId) query.set("parentId", params.parentId);
    return `/rp/compose?${query.toString()}`;
  },
  Conversation: {
    Details: (conversationId: string) =>
      `/rp/conversations/${conversationId}/details`,
    View: (conversationId: string) => `/rp/conversations/${conversationId}`,
  },
  conversations: "/rp/conversations",
  explore: "/rp/explore",
  explorePrompts: "/rp/explore?tab=prompts",
  FAQs: "/rp/faqs",
  Fellows: "/rp/fellows",
  ForgotPassword: "/rp/forgot-password",
  Home: "/rp/home",
  InstallApp: "/rp/install-app",
  Library: "/rp/library",
  Login: "/rp/login",
  Muse: {
    Index: "/rp/muse",
    View: (slug: string) => `/rp/muse/${slug}`,
  },
  NotFound: "/404",
  Notification: "/rp/notifications",
  Novelist: {
    View: (novelistId: string) => `/rp/novelist/${novelistId}`,
  },
  Novelists: "/rp/novelists",
  newsFeed: "/rp/explore?tab=newsfeed",
  Oauth: {
    Callback: "/rp/oauth/callback",
    Failed: "/rp/oauth/failed",
  },
  Onboarding: "/rp/onboarding",
  outgoingThreads: "/rp/outgoing-threads",
  PrivacyPolicy: "/rp/privacy-policy",
  Profile: {
    Badges: "/rp/profile/badges",
    Edit: "/rp/profile/edit",
    Index: "/rp/profile",
    Muses: {
      About: (museId: string) => `/rp/profile/muses/edit/${museId}/about`,
      AboutCreate: (museId: string) =>
        `/rp/profile/muses/edit/${museId}/about/create`,
      AboutEdit: (museId: string, sectionId: string) =>
        `/rp/profile/muses/edit/${museId}/about/edit/${sectionId}`,
      Create: "/rp/profile/muses/create",
      Edit: (museId: string) => `/rp/profile/muses/edit/${museId}`,
      ExtraAttributes: (museId: string) =>
        `/rp/profile/muses/edit/${museId}/extra-attributes`,
    },
    Referrals: "/rp/profile/referrals",
    /**
     * The path to hand out when a link leaves the app — copied, shared to a
     * system share sheet, posted to Discord.
     *
     * Identical to `View(username).Index` now that `/@username` is the real
     * route rather than a redirect onto one. Kept as its own name because the
     * call sites mean something different by it, and because a share is the
     * one place where a link going nowhere is unrecoverable.
     *
     * It no longer falls back to a long path for awkward names: with the `@`
     * there are no awkward names.
     */
    Share: (username: string) => `/${toHandle(username)}`,
    Story: {
      Create: "/rp/profile/story/create",
      Edit: (storyId: string) => ({
        Event: {
          Create: `/rp/profile/story/edit/${storyId}/event/create`,
          Edit: (eventId: string) =>
            `/rp/profile/story/edit/${storyId}/event/edit/${eventId}`,
        },
        Index: `/rp/profile/story/edit/${storyId}`,
      }),
      Index: "/rp/profile/story",
    },
    /**
     * A novelist's profile and its tabs, at the root of the domain.
     *
     * `/@tokyo`, not `/rp/profile/tokyo`. The old paths still resolve — the
     * route table redirects them — but nothing should generate one.
     */
    View: (username: string) => ({
      Friends: `/${toHandle(username)}/friends`,
      Index: `/${toHandle(username)}`,
      Muses: `/${toHandle(username)}/muses`,
      Music: `/${toHandle(username)}/music`,
      Posts: `/${toHandle(username)}/posts`,
      Storyboards: `/${toHandle(username)}/storyboards`,
    }),
  },
  Prompt: {
    Comment: (promptId: string, params: { dropdownSelection: string }) => {
      const query = new URLSearchParams({
        dropdownSelection: params.dropdownSelection,
      });
      return `/rp/prompt/${promptId}/comment?${query.toString()}`;
    },
    Post: "/rp/post-prompt",
    View: (promptId: string) => `/rp/prompt/${promptId}`,
  },
  ResetPassword: "/rp/reset-password",
  Story: {
    Event: {
      View: (eventId: string) => `/rp/story/event/${eventId}`,
    },
    View: (storyId: string) => `/rp/story/${storyId}`,
  },
  Terms: "/rp/terms",
  Thread: {
    View: (threadId: string) => `/rp/thread/${threadId}`,
  },
  Tiers: "/rp/tiers",
  UserMenu: "/rp/user-menu",
  VerifyEmail: "/rp/verify-email",
  Welcome: "/rp/welcome",
} as const;
