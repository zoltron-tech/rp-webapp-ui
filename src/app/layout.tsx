import StyledComponentsRegistry from "./registry";

import "toastify-js/src/toastify.css";
import "./globals.css";
import "@novelist-world/ui/dist/styles.css";
import type { Metadata, Viewport } from "next";

// Kept ~155 chars so it isn't truncated in search results.
const SITE_DESCRIPTION =
  "Novelist World is a live roleplay and creative writing community. Create Muses, chat in real time, write collaborative stories, and share writing prompts.";

// Longer, keyword-rich copy for social cards (OG/Twitter allow more room).
const SOCIAL_DESCRIPTION =
  "Join Novelist World — the live roleplay and creative writing community. Build Muses and original characters, roleplay over real-time chat, co-write collaborative stories, and discover open writing prompts with fellow writers.";

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://novelist.world/#organization",
      "@type": "Organization",
      alternateName: "NovelistWorld",
      description: SITE_DESCRIPTION,
      logo: "https://novelist.world/android-chrome-384x384.png",
      name: "Novelist World",
      url: "https://novelist.world",
    },
    {
      "@id": "https://novelist.world/#website",
      "@type": "WebSite",
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      name: "Novelist World",
      publisher: { "@id": "https://novelist.world/#organization" },
      url: "https://novelist.world",
    },
  ],
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Novelist World",
  },
  applicationName: "Novelist World",
  authors: [{ name: "Novelist World", url: "https://novelist.world" }],
  category: "social",
  creator: "Novelist World",
  description: SITE_DESCRIPTION,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        sizes: "32x32",
        type: "image/png",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        sizes: "16x16",
        type: "image/png",
        url: "/favicon-16x16.png",
      },
    ],
  },
  keywords: [
    "roleplay",
    "roleplaying",
    "roleplay chat",
    "live roleplay",
    "online roleplay",
    "text roleplay",
    "roleplaying app",
    "roleplaying application",
    "roleplay community",
    "RP",
    "muses",
    "characters",
    "original characters",
    "character creation",
    "creative writing",
    "collaborative writing",
    "collaborative fiction",
    "writing prompts",
    "writing community",
    "storyboards",
    "fanfiction",
    "writers",
    "Novelist World",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL("https://novelist.world"),
  openGraph: {
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        alt: "Novelist World — live roleplay and creative writing community",
        height: 909,
        url: "/og_image.png",
        width: 1731,
      },
    ],
    locale: "en_US",
    siteName: "Novelist World",
    title: "Novelist World — Live Roleplay & Creative Writing Community",
    type: "website",
    url: "/",
  },
  publisher: "Novelist World",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: "Novelist World — Live Roleplay Chat & Writing Community",
    template: "%s | Novelist World",
  },
  twitter: {
    card: "summary_large_image",
    description: SOCIAL_DESCRIPTION,
    images: ["/og_image.png"],
    title: "Novelist World — Live Roleplay & Creative Writing Community",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#212225",
  width: "device-width",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, hard-coded JSON-LD, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
