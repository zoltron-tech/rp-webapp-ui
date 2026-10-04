/**
 * The chat-server wire protocol, which now lives in `@nw/chat`.
 *
 * This file used to *be* the protocol. It is a re-export because the native app
 * speaks to the same `chat-server`, and two hand-maintained copies of a frame
 * shape is the failure this workspace keeps designing against: a client that
 * disagrees about `pong` is not an error, it is everyone showing as offline
 * forever.
 *
 * Kept as a module rather than deleted so the existing `@/utils/socket-helpers`
 * imports across the conversations UI stay put — the names below are exactly
 * the ones this file exported before.
 */

export {
  createEditSocketMessage,
  createHeartbeatPong,
  createHeartbeatQuery,
  createReactionSocketMessage,
  HEARTBEAT_TIMEOUT_MS,
  isServerEdit,
  isServerMessage,
  isServerNotification,
  isServerPing,
  isServerReaction,
  type ReactionPayload as ReactionSocketPayload,
  type ServerEdit as ServerEditMessage,
  type ServerReaction as ServerReactionMessage,
} from "@nw/chat";
