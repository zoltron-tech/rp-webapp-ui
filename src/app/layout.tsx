import StyledComponentsRegistry from "./registry";

import "toastify-js/src/toastify.css";
import "./globals.css";
import "@novelist-world/ui/dist/styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "A platform for writers to create and share their stories.",
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
  keywords: ["novelist", "writing", "stories", "community"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://novelist.world"),
  openGraph: {
    description: "A platform for writers to create and share their stories.",
    images: [
      {
        height: 909,
        url: "/og_image.png",
        width: 1731,
      },
    ],
    siteName: "Novelist World",
    title: "Novelist World",
    type: "website",
    url: "/",
  },
  title: "Novelist World",
  twitter: {
    card: "summary_large_image",
    description: "A platform for writers to create and share their stories.",
    images: ["/og_image.png"],
    title: "Novelist World",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
