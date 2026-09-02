import { Hono } from "hono";
import {
  buildDiscordChapterEmbed,
  buildDiscordEmbed,
  buildDiscordMuseEmbed,
  buildDiscordProfileEmbed,
  buildDiscordStoryEmbed,
  type DiscordMessage,
} from "../src/lib/discord";

/**
 * The five Discord share routes.
 *
 * **These must stay server-side.** They hold `DISCORD_BOT_TOKEN`, which cannot
 * ship to a browser under any circumstances. They ran as Vercel Functions under
 * Next too, so this is a change of shape (route handler → Hono route), not of
 * where the code runs.
 *
 * The five handlers were near-identical copies differing only in channel id,
 * payload shape, and embed builder. They are registered from one table here so
 * the differences are the only thing on screen — the behaviour, including every
 * status code, is unchanged.
 *
 * See REACT_MIGRATION_STEPS.md C3.
 */

interface DiscordMessageResponse {
  id: string;
  channel_id: string;
}

type ShareRoute = {
  /** Env var naming the target channel. */
  channelEnv: string;
  /** Body fields that must both be present, in `[content, url]` order. */
  requires: [string, string];
  /** Builds the embed from `body[content]`, `body[url]`, `body.novelistUsername`. */
  build: (
    content: never,
    url: string,
    novelistUsername?: string,
  ) => DiscordMessage;
  /** Prefix for the server-side error log, preserved verbatim from each handler. */
  logLabel: string;
};

const ROUTES: Record<string, ShareRoute> = {
  share: {
    build: buildDiscordEmbed as ShareRoute["build"],
    channelEnv: "DISCORD_PROMPT_SHARE_CHANNEL_ID",
    logLabel: "Discord share failed:",
    requires: ["prompt", "promptUrl"],
  },
  "share-chapter": {
    build: buildDiscordChapterEmbed as ShareRoute["build"],
    channelEnv: "DISCORD_STORIES_CHANNEL_ID",
    logLabel: "Discord share failed:",
    requires: ["chapter", "chapterUrl"],
  },
  "share-muse": {
    build: buildDiscordMuseEmbed as ShareRoute["build"],
    channelEnv: "DISCORD_MUSE_SHARE_CHANNEL_ID",
    logLabel: "Discord share failed:",
    requires: ["muse", "museUrl"],
  },
  "share-profile": {
    build: buildDiscordProfileEmbed as ShareRoute["build"],
    channelEnv: "DISCORD_PROFILE_SHARE_CHANNEL_ID",
    logLabel: "Discord profile share failed:",
    requires: ["profile", "profileUrl"],
  },
  "share-story": {
    build: buildDiscordStoryEmbed as ShareRoute["build"],
    channelEnv: "DISCORD_STORIES_CHANNEL_ID",
    logLabel: "Discord share failed:",
    requires: ["story", "storyUrl"],
  },
};

export const discord = new Hono();

for (const [path, route] of Object.entries(ROUTES)) {
  discord.post(`/${path}`, async (c) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env[route.channelEnv];
    const guildId = process.env.DISCORD_GUILD_ID;

    // A missing channel id disables sharing for that entity only — the same
    // 503 the route handlers returned.
    if (!token || !channelId || !guildId) {
      return c.json({ error: "Discord sharing not configured" }, 503);
    }

    const body = (await c.req.json()) as Record<string, unknown>;
    const [contentKey, urlKey] = route.requires;

    if (!body[urlKey] || !body[contentKey]) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const message = route.build(
      body[contentKey] as never,
      body[urlKey] as string,
      body.novelistUsername as string | undefined,
    );

    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        body: JSON.stringify(message),
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(route.logLabel, err);
      return c.json({ error: "Failed to share to Discord" }, 502);
    }

    const data = (await res.json()) as DiscordMessageResponse;
    const messageUrl = `https://discord.com/channels/${guildId}/${data.channel_id}/${data.id}`;

    return c.json({ messageUrl, success: true });
  });
}
