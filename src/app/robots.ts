import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    host: "https://novelist.world",
    rules: [
      {
        allow: "/",
        disallow: [
          "/api/",
          "/rp/compose",
          "/rp/conversations",
          "/rp/forgot-password",
          "/rp/install-app",
          "/rp/notifications",
          "/rp/oauth",
          "/rp/onboarding",
          "/rp/outgoing-threads",
          "/rp/profile/edit",
          "/rp/profile/muses/create",
          "/rp/profile/muses/edit",
          "/rp/profile/music/create",
          "/rp/profile/story/create",
          "/rp/profile/story/edit",
          "/rp/reset-password",
          "/rp/user-menu",
          "/rp/verify-email",
          "/rp/welcome",
        ],
        userAgent: "*",
      },
    ],
    sitemap: "https://novelist.world/sitemap.xml",
  };
}
