// ─── Heartbeat timeout ────────────────────────────────────────────────────────
// Slightly longer than the server's HEARTBEAT_INTERVAL (30 s) so we close
// ourselves before the server does if pings stop arriving.
export const HEARTBEAT_TIMEOUT_MS = 40_000;

// ─── Type guards ──────────────────────────────────────────────────────────────

type ServerPing = {
  type: "ping";
  payload: { usernames: string[] };
};

export const isServerPing = (data: unknown): data is ServerPing => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.type !== "ping") return false;
  const p = d.payload as Record<string, unknown> | undefined;
  return Array.isArray(p?.usernames);
};

// ─── Incoming message type guard ─────────────────────────────────────────────

import type { Message } from "@/types";

/** Narrows an unknown WS payload to a server-delivered chat Message. */
export const isServerMessage = (data: unknown): data is Message => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    typeof d.conversationId === "string" &&
    typeof d.message === "string" &&
    typeof d.sender === "object" &&
    d.sender !== null
  );
};

// ─── Payload builders ─────────────────────────────────────────────────────────

/** Pong response sent back to the server to reset its heartbeat flag. */
export const createHeartbeatPong = (usernames: string[] = []) => ({
  payload: { usernames },
  type: "pong",
});
