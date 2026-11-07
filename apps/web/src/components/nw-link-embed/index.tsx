"use client";

import { headcanonIdInUrl } from "@nw/types/headcanon";
import type { NovelistWorldLink } from "@nw/utils/nw-links";
import type { FC } from "react";
import { ChapterEmbed } from "../chapter-embed";
import { HeadcanonEmbed } from "../headcanon-embed";
import { MuseEmbed } from "../muse-embed";
import { NovelistEmbed } from "../novelist-embed";
import { PromptEmbed } from "../prompt-embed";
import { StoryEmbed } from "../story-embed";
import { ThreadEmbed } from "../thread-embed";

/**
 * A Novelist World link, drawn as the thing it points at.
 *
 * The one switch over link kinds, so the rich-text renderer and the chat
 * bubble do not each have to know which card goes with which URL. A new kind
 * is a new case here and a new entry in `@nw/utils/nw-links`.
 */
export const NovelistWorldLinkEmbed: FC<{ link: NovelistWorldLink }> = ({
  link,
}) => {
  switch (link.kind) {
    case "muse": {
      // A headcanon's link is its muse page opened at the card
      // (`?headcanon=<id>`), so older clients still unfurl the character.
      const headcanonId = headcanonIdInUrl(link.url);
      if (headcanonId) {
        return <HeadcanonEmbed headcanonId={headcanonId} href={link.url} />;
      }
      return <MuseEmbed href={link.url} museId={link.id} />;
    }
    case "prompt":
      return <PromptEmbed href={link.url} promptId={link.id} />;
    case "thread":
      return <ThreadEmbed commentId={link.id} href={link.url} />;
    case "novelist":
      return <NovelistEmbed href={link.url} username={link.id} />;
    case "story":
      return <StoryEmbed href={link.url} storyId={link.id} />;
    case "chapter":
      return <ChapterEmbed eventId={link.id} href={link.url} />;
    default:
      return null;
  }
};
