export const ROUTES = {
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
  Library: "/rp/library",
  Leaderboard: {
    Novelists: "/rp/leaderboard/novelists",
    Muses: "/rp/leaderboard/muses",
  },
  InstallApp: "/rp/install-app",
  Levels: "/rp/levels",
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
    Edit: "/rp/profile/edit",
    Index: "/rp/profile",
    Referrals: "/rp/profile/referrals",
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
    View: (username: string) => ({
      Friends: `/rp/profile/${username}/friends`,
      Index: `/rp/profile/${username}`,
      Muses: `/rp/profile/${username}/muses`,
      Music: `/rp/profile/${username}/music`,
      Posts: `/rp/profile/${username}/posts`,
      Storyboards: `/rp/profile/${username}/storyboards`,
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
