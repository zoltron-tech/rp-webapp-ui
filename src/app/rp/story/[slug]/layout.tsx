import type { Metadata } from "next";
import type { ReactNode } from "react";
import { toPlainText } from "@/utils/rich-text";
import { getStoryboardAction } from "../actions";

type StoryLayoutProps = {
  children: ReactNode;
  params: { slug: string };
};

/**
 * Server-side Open Graph / Twitter metadata for a shared Storyboard link.
 *
 * The page itself is a client component, so crawlers (Discord, Facebook,
 * WhatsApp, iMessage, X…) — which don't run JS — would otherwise only see the
 * app-wide Novelist World card from the root layout. This layout runs on the
 * server and rewrites the link preview to the story's own title and cover.
 *
 * Returning `{}` falls back to those root defaults, which is the desired
 * behaviour for missing / private / errored stories (a private story has no
 * JWT on a crawler request, so the backend hides it and we leak nothing).
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const storyboard = await getStoryboardAction(params.slug);

  if (!storyboard || "message" in storyboard) return {};

  const title = storyboard.name;
  // Both fields are absolute CDN URLs (the same ones Discord embeds use).
  const cover = storyboard.image ?? storyboard.avatar?.src ?? null;
  const description =
    toPlainText(storyboard.description).slice(0, 200) ||
    `Read "${title}" — a story on Novelist World.`;

  return {
    description,
    openGraph: {
      description,
      images: cover ? [{ alt: title, url: cover }] : undefined,
      title,
      type: "article",
    },
    title: { absolute: title },
    twitter: {
      card: "summary_large_image",
      description,
      images: cover ? [cover] : undefined,
      title,
    },
  };
}

export default function StoryLayout({ children }: StoryLayoutProps) {
  return <>{children}</>;
}
