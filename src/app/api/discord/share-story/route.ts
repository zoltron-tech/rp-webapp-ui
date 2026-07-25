import { NextRequest, NextResponse } from "next/server";
import {
  buildDiscordStoryEmbed,
  type ShareStoryPayload,
} from "@/lib/discord";

interface DiscordMessageResponse {
  id: string;
  channel_id: string;
}

export async function POST(req: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_STORIES_CHANNEL_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !channelId || !guildId) {
    return NextResponse.json(
      { error: "Discord sharing not configured" },
      { status: 503 },
    );
  }

  const body = (await req.json()) as ShareStoryPayload;

  if (!body.storyUrl || !body.story) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const message = buildDiscordStoryEmbed(body.story, body.storyUrl, body.novelistUsername);

  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Discord story share failed:", err);
    return NextResponse.json(
      { error: "Failed to share to Discord" },
      { status: 502 },
    );
  }

  const data = (await res.json()) as DiscordMessageResponse;
  const messageUrl = `https://discord.com/channels/${guildId}/${data.channel_id}/${data.id}`;

  return NextResponse.json({ success: true, messageUrl });
}
