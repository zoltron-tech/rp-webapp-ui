/** Client-safe view of a linked Discord account (mirrors the backend
 *  ConnectionDiscordResponse — no OAuth tokens). */
export interface DiscordConnection {
  id: string;
  discordUserId: string;
  discordUsername: string;
  discordGlobalName?: string | null;
  discordEmail?: string | null;
  avatarUrl: string;
  linkedAt: string;
  /** True = confirmed in the NW Discord server; false = not; null = unknown. */
  isServerMember?: boolean | null;
}

/** Client-safe view of a linked Spotify account (no OAuth tokens). */
export interface SpotifyConnection {
  id: string;
  spotifyUserId: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  profileUrl?: string | null;
  /** Spotify subscription tier, e.g. "premium" / "free". */
  product?: string | null;
  linkedAt: string;
}
