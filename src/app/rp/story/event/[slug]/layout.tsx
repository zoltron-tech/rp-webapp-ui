import type { Metadata } from "next";
import type { ReactNode } from "react";
import { toPlainText } from "@/utils/rich-text";
import { getStoryboardAction, getStoryboardEventAction } from "../../actions";

type ChapterLayoutProps = {
  children: ReactNode;
  params: { slug: string };
};

/**
 * Server-side Open Graph / Twitter metadata for a shared Storyboard chapter
 * link. Same rationale as the story layout: the page is a client component, so
 * without this a shared chapter link would fall back to the generic app card.
 *
 * The chapter's own cover is used when it has one, otherwise the parent story's
 * cover; the parent story name is appended to the title for context. Returning
 * `{}` falls back to the root Novelist World defaults (missing / private /
 * error).
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const event = await getStoryboardEventAction(params.slug);

  if (!event || "message" in event) return {};

  // Parent story gives us its name and a cover fallback. Best-effort — the
  // chapter card still works if this fails.
  const story = event.storyBoardId
    ? await getStoryboardAction(event.storyBoardId)
    : null;
  const parent = story && !("message" in story) ? story : null;

  const title = parent ? `${event.name} — ${parent.name}` : event.name;
  // All absolute CDN URLs (the same ones Discord embeds use).
  const cover =
    event.image ??
    event.avatar?.src ??
    parent?.image ??
    parent?.avatar?.src ??
    null;
  const description =
    toPlainText(event.description).slice(0, 200) ||
    `Read "${event.name}" on Novelist World.`;

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

export default function ChapterLayout({ children }: ChapterLayoutProps) {
  return <>{children}</>;
}
