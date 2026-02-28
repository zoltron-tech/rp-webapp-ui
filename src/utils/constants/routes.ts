export const ROUTES = {
  explorePrompts: "/rp/explore-prompts",
  FAQs: "/rp/faqs",
  ForgotPassword: "/rp/forgot-password",
  Home: "/rp/home",
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
  newsFeed: "/rp/news-feed",
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
    Muses: {
      Create: "/rp/profile/muses/create",
      Edit: (museId: string) => `/rp/profile/muses/edit/${museId}`,
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
        Members: `/rp/profile/story/edit/${storyId}/members`,
      }),
      Index: "/rp/profile/story",
    },
    View: (username: string) => ({
      Index: `/rp/profile/${username}`,
      Muses: `/rp/profile/${username}/muses`,
      Music: `/rp/profile/${username}/music`,
      Storyboards: `/rp/profile/${username}/storyboards`,
    }),
  },
  Prompt: {
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
  VerifyEmail: "/rp/verify-email",
} as const;
