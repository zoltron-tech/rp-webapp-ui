import { headcanonIdInUrl } from "@nw/types/headcanon";
import type { NovelistWorldLink } from "@nw/utils/nw-links";
import { memo } from "react";
import { ChapterLinkCard } from "./chapter-card";
import { HeadcanonLinkCard } from "./headcanon-card";
import { MuseLinkCard } from "./muse-card";
import { NovelistLinkCard } from "./novelist-card";
import { PromptLinkCard } from "./prompt-card";
import { StoryLinkCard } from "./story-card";
import { ThreadLinkCard } from "./thread-card";

/**
 * A Novelist World link, drawn as the thing it points at.
 *
 * The one switch over link kinds, so rich text and the chat bubble do not
 * each have to know which card goes with which URL — web's
 * `NovelistWorldLinkEmbed`. A new kind is a new case here and a new entry
 * in `@nw/utils/nw-links`.
 */
export const LinkEmbed = memo(function LinkEmbed({
  link,
}: {
  link: NovelistWorldLink;
}) {
  switch (link.kind) {
    case "muse": {
      // A headcanon's link is its character's, opened at the card.
      const headcanonId = headcanonIdInUrl(link.url);
      return headcanonId ? (
        <HeadcanonLinkCard headcanonId={headcanonId} museId={link.id} />
      ) : (
        <MuseLinkCard id={link.id} url={link.url} />
      );
    }
    case "prompt":
      return <PromptLinkCard id={link.id} url={link.url} />;
    case "thread":
      return <ThreadLinkCard id={link.id} url={link.url} />;
    case "novelist":
      return <NovelistLinkCard id={link.id} url={link.url} />;
    case "story":
      return <StoryLinkCard id={link.id} url={link.url} />;
    case "chapter":
      return <ChapterLinkCard id={link.id} url={link.url} />;
    default:
      return null;
  }
});
