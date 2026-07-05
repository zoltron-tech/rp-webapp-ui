import type { MetadataRoute } from "next";

const BASE_URL = "https://novelist.world";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { changeFrequency: "daily", priority: 1, url: `${BASE_URL}/` },
    {
      changeFrequency: "daily",
      priority: 0.8,
      url: `${BASE_URL}/rp/novelists`,
    },
    {
      changeFrequency: "daily",
      priority: 0.8,
      url: `${BASE_URL}/rp/explore`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.5,
      url: `${BASE_URL}/rp/login`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.4,
      url: `${BASE_URL}/rp/tiers`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.3,
      url: `${BASE_URL}/rp/faqs`,
    },
    {
      changeFrequency: "yearly",
      priority: 0.2,
      url: `${BASE_URL}/rp/terms`,
    },
    {
      changeFrequency: "yearly",
      priority: 0.2,
      url: `${BASE_URL}/rp/privacy-policy`,
    },
  ];
}
