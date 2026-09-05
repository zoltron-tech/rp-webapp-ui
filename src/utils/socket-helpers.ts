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

import type { Message } from "@nw/types";
import type { Reaction } from "@nw/types/conversation";

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

// ─── Incoming reaction type guard ────────────────────────────────────────────

export type ReactionSocketPayload = Reaction & {
  conversationId: string;
};

export type ServerReactionMessage = {
  type: "reaction";
  payload: ReactionSocketPayload;
};

/** Narrows an unknown WS payload to a real-time reaction event. */
export const isServerReaction = (
  data: unknown,
): data is ServerReactionMessage => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.type !== "reaction") return false;
  const p = d.payload as Record<string, unknown> | undefined;
  return (
    !!p &&
    typeof p.messageId === "string" &&
    typeof p.reaction === "string" &&
    typeof p.sender === "object" &&
    p.sender !== null
  );
};

/** Builds the outgoing reaction socket frame to propagate to other clients. */
export const createReactionSocketMessage = (
  payload: ReactionSocketPayload,
): ServerReactionMessage => ({
  payload,
  type: "reaction",
});

// ─── Incoming edited-message type guard ──────────────────────────────────────

export type ServerEditMessage = {
  type: "edit";
  payload: Message;
};

/** Narrows an unknown WS payload to a real-time message-edit event. */
export const isServerEdit = (data: unknown): data is ServerEditMessage => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.type !== "edit") return false;
  const p = d.payload as Record<string, unknown> | undefined;
  return (
    !!p &&
    typeof p.id === "string" &&
    typeof p.conversationId === "string" &&
    typeof p.sender === "object" &&
    p.sender !== null
  );
};

/** Builds the outgoing edit socket frame sent to the chat-server. */
export const createEditSocketMessage = (payload: {
  messageId: string;
  conversationId: string;
  message: string;
}) => ({
  payload,
  type: "edit" as const,
});

// ─── Payload builders ─────────────────────────────────────────────────────────

/** Pong response sent back to the server to reset its heartbeat flag. */
export const createHeartbeatPong = (usernames: string[] = []) => ({
  payload: { usernames },
  type: "pong",
});
