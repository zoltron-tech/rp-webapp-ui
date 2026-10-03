/**
 * The chat-server wire protocol.
 *
 * Every frame that crosses the socket is described once, here, for the same
 * reason the encryption lives in this package: two clients that disagree about
 * a frame do not fail loudly. A `pong` with the wrong payload shape leaves
 * everyone permanently grey instead of green; a `message` frame missing a field
 * is dropped by the server with a `console.error` nobody reads.
 *
 * What is deliberately *not* here is the socket itself. `WebSocket` is a DOM
 * type, and `packages/config`'s tsconfig has no DOM lib — which is the check
 * working, not an obstacle. Opening and reconnecting a socket is policy
 * (visibility on web, `AppState` on native, ticket refresh on both) and belongs
 * to whichever app is doing it. What travels down the pipe is not.
 *
 * The server side is `chat-server/src/socket/websocket.ts`; these guards mirror
 * `chat-server/src/utils/type-validator/socket-message.ts`.
 */

import type { Message, Reaction } from "@nw/types/conversation";

/**
 * How long the client waits for a server ping before hanging up.
 *
 * The server's own `HEARTBEAT_INTERVAL` is 30s. This is deliberately longer, so
 * a slow ping does not cause a reconnect storm, and deliberately finite, so a
 * socket the OS has quietly killed does not sit there looking connected —
 * which is the failure that shows an empty conversation and no error.
 */
export const HEARTBEAT_TIMEOUT_MS = 40_000;

// ─── Frames ──────────────────────────────────────────────────────────────────

/**
 * Who the sender claims to be.
 *
 * The server overwrites `username` from the authenticated connection before it
 * persists or broadcasts anything, so this half of the payload is a hint, not a
 * credential. The rest is echoed back as-is.
 */
export interface SocketSender {
  id: string;
  username: string;
  name: string;
  image: string | null;
  messageSourceType: string;
}

export interface OutgoingMessagePayload {
  attachments: { url: string }[] | null;
  conversationId: string;
  message: string;
  repliedTo: { id: string; type: "MESSAGE" | "ICE_BREAKER" } | null;
  sender: SocketSender;
  type: string;
}

export interface ReactionPayload extends Reaction {
  conversationId: string;
}

export interface HeartbeatPayload {
  /**
   * The usernames this client wants an online answer about.
   *
   * Named `usernames` on the wire for both directions, which is why the server
   * carries a TODO about it: outbound it is a *question* ("are these people
   * online?"), inbound it is the *answer* (the subset that is). A client that
   * never asks is told about nobody — the server filters strictly against the
   * last list it received, so an empty question means an empty answer, not
   * everyone.
   */
  usernames: string[];
}

export type ServerPing = { type: "ping"; payload: HeartbeatPayload };
export type ServerReaction = { type: "reaction"; payload: ReactionPayload };
export type ServerEdit = { type: "edit"; payload: Message };

// ─── Guards ──────────────────────────────────────────────────────────────────

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

export const isServerPing = (data: unknown): data is ServerPing => {
  const frame = record(data);
  if (frame?.type !== "ping") return false;
  return Array.isArray(record(frame.payload)?.usernames);
};

/**
 * A delivered chat message.
 *
 * Note it is not wrapped in `{ type, payload }` — the server sends the message
 * object at the top level, so this is structural rather than tag-based. That
 * asymmetry is the server's, and copying it is cheaper than a protocol change
 * that would have to ship to every client at once.
 */
export const isServerMessage = (data: unknown): data is Message => {
  const frame = record(data);
  if (!frame) return false;
  return (
    typeof frame.id === "string" &&
    typeof frame.conversationId === "string" &&
    typeof frame.message === "string" &&
    record(frame.sender) !== null
  );
};

export const isServerReaction = (data: unknown): data is ServerReaction => {
  const frame = record(data);
  if (frame?.type !== "reaction") return false;
  const payload = record(frame.payload);
  return (
    payload !== null &&
    typeof payload.messageId === "string" &&
    typeof payload.reaction === "string" &&
    record(payload.sender) !== null
  );
};

export const isServerEdit = (data: unknown): data is ServerEdit => {
  const frame = record(data);
  if (frame?.type !== "edit") return false;
  const payload = record(frame.payload);
  return (
    payload !== null &&
    typeof payload.id === "string" &&
    typeof payload.conversationId === "string" &&
    record(payload.sender) !== null
  );
};

// ─── Builders ────────────────────────────────────────────────────────────────

/**
 * The reply to a server ping.
 *
 * Two jobs in one frame: it resets the server's per-connection `heartbeat` flag
 * (miss two and the server closes the socket) and it replaces the server's idea
 * of which usernames this client is asking about. Both happen on every pong, so
 * the username list has to be complete each time rather than incremental.
 */
export const createHeartbeatPong = (usernames: string[] = []) => ({
  payload: { usernames },
  type: "pong" as const,
});

/**
 * Ask for an immediate ping rather than waiting up to 30s for the next one.
 *
 * Identical to a pong except the server answers straight away. Sent when the
 * set of people on screen changes — otherwise opening a conversation shows
 * everyone as offline until the next heartbeat lands.
 */
export const createHeartbeatQuery = (usernames: string[] = []) => ({
  payload: { usernames },
  type: "query-heartbeats" as const,
});

export const createMessageSocketMessage = (
  payload: OutgoingMessagePayload,
) => ({
  payload,
  type: "message" as const,
});

export const createReactionSocketMessage = (payload: ReactionPayload) => ({
  payload,
  type: "reaction" as const,
});

export const createEditSocketMessage = (payload: {
  messageId: string;
  conversationId: string;
  message: string;
}) => ({
  payload,
  type: "edit" as const,
});

/** Frames arrive as text; a non-JSON frame is ignored rather than thrown on. */
export const parseSocketFrame = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
