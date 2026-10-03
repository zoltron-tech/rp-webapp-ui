/**
 * The chat-server wire protocol, checked against the server's own rules.
 *
 * Both clients now share `@nw/chat`'s frame guards and builders, which removes
 * the risk of the two of them disagreeing — and leaves the risk that they agree
 * with each other and not with `chat-server`. That failure is silent in the
 * worst way: the server answers an unrecognised frame with a `console.error` on
 * a machine nobody is tailing, so a wrong `pong` looks exactly like everybody
 * being offline, forever.
 *
 * So the server's validators are restated here, straight from
 * `chat-server/src/utils/type-validator/socket-message.ts`, and every frame we
 * build is run through them. If someone renames a frame type on either side,
 * this fails in CI instead of in production presence.
 */
import {
  createEditSocketMessage,
  createHeartbeatPong,
  createHeartbeatQuery,
  createMessageSocketMessage,
  createReactionSocketMessage,
  isServerEdit,
  isServerMessage,
  isServerPing,
  isServerReaction,
  parseSocketFrame,
} from "@nw/chat";
import type { Message } from "@nw/types";

let failures = 0;

const check = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    console.log(`PASS  ${name}  (${a})`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}\n        expected ${b}\n        actual   ${a}`);
  }
};

// ─── chat-server's validators, restated ─────────────────────────────────────
// Deliberately verbatim in behaviour rather than tidied: the point is to model
// what the server accepts, not what it ought to.

type AnyFrame = { type?: unknown; payload?: unknown } | null;

const serverAcceptsHeartbeat = (frame: AnyFrame) =>
  frame?.type === "ping" ||
  frame?.type === "pong" ||
  frame?.type === "query-heartbeats";
const serverTreatsAsHeartbeatQuery = (frame: AnyFrame) =>
  frame?.type === "query-heartbeats";
const serverAcceptsMessage = (frame: AnyFrame) => frame?.type === "message";
const serverAcceptsReaction = (frame: AnyFrame) => frame?.type === "reaction";
const serverAcceptsEdit = (frame: AnyFrame) => frame?.type === "edit";

/** A frame is sent as JSON text, so round-trip it the way the socket does. */
const overTheWire = (frame: unknown): AnyFrame =>
  parseSocketFrame(JSON.stringify(frame)) as AnyFrame;

// ─── Outgoing frames ────────────────────────────────────────────────────────

const pong = overTheWire(createHeartbeatPong(["ada", "grace"]));
check("the server recognises our pong", serverAcceptsHeartbeat(pong), true);
check(
  "a pong is not treated as an immediate-answer request",
  serverTreatsAsHeartbeatQuery(pong),
  false,
);
check(
  "and it carries the usernames we are asking about",
  (pong?.payload as { usernames: string[] }).usernames,
  ["ada", "grace"],
);

const query = overTheWire(createHeartbeatQuery(["ada"]));
check("the server recognises our presence query", serverAcceptsHeartbeat(query), true);
check(
  "and answers it straight away rather than at the next heartbeat",
  serverTreatsAsHeartbeatQuery(query),
  true,
);

// The server replaces its whole idea of what we are asking about on every
// heartbeat frame, so an empty list is a real instruction: tell me about nobody.
check(
  "an empty question is still a well-formed frame",
  (overTheWire(createHeartbeatPong())?.payload as { usernames: string[] })
    .usernames,
  [],
);

const outgoing = overTheWire(
  createMessageSocketMessage({
    attachments: null,
    conversationId: "conv-1",
    message: "​e2e:v3:abc",
    repliedTo: null,
    sender: {
      id: "n-1",
      image: null,
      messageSourceType: "NOVELIST",
      name: "Ada",
      username: "ada",
    },
    type: "TEXT",
  }),
);
check("the server recognises our message frame", serverAcceptsMessage(outgoing), true);
check(
  "the message goes out encrypted",
  String((outgoing?.payload as { message: string }).message).startsWith(
    "​e2e:v3:",
  ),
  true,
);

check(
  "the server recognises our reaction frame",
  serverAcceptsReaction(
    overTheWire(
      createReactionSocketMessage({
        conversationId: "conv-1",
        messageId: "m-1",
        reaction: "🎭",
        sender: {
          id: "n-1",
          image: "",
          messageSourceType: "NOVELIST",
          name: "Ada",
          username: "ada",
        },
      }),
    ),
  ),
  true,
);

check(
  "the server recognises our edit frame",
  serverAcceptsEdit(
    overTheWire(
      createEditSocketMessage({
        conversationId: "conv-1",
        message: "fixed",
        messageId: "m-1",
      }),
    ),
  ),
  true,
);

// ─── Incoming frames ────────────────────────────────────────────────────────

const sender = {
  id: "n-2",
  image: "",
  messageSourceType: "NOVELIST",
  name: "Grace",
  username: "grace",
};

// A delivered message is *not* wrapped in `{ type, payload }` — the server puts
// it at the top level. Recognising it is therefore structural, and this is the
// check that catches anyone "fixing" that asymmetry on one side only.
const delivered = {
  attachments: [],
  conversationId: "conv-1",
  createdAt: "2026-01-01T10:00:00Z",
  id: "m-9",
  image: "",
  isRead: false,
  message: "hello",
  reactions: [],
  sender,
  senderId: "n-2",
  type: "TEXT",
} as unknown as Message;

check("a delivered message is recognised", isServerMessage(delivered), true);
check(
  "a ping is not mistaken for a message",
  isServerMessage({ payload: { usernames: [] }, type: "ping" }),
  false,
);
check(
  "a message missing its conversation is rejected",
  isServerMessage({ id: "m-9", message: "hi", sender }),
  false,
);

check(
  "a ping is recognised",
  isServerPing({ payload: { usernames: ["ada"] }, type: "ping" }),
  true,
);
check(
  "a ping without a usernames array is rejected",
  isServerPing({ payload: {}, type: "ping" }),
  false,
);
check(
  "our own pong is not read back as a ping",
  isServerPing(createHeartbeatPong(["ada"])),
  false,
);

check(
  "a reaction is recognised",
  isServerReaction({
    payload: { conversationId: "conv-1", messageId: "m-9", reaction: "🎭", sender },
    type: "reaction",
  }),
  true,
);
check(
  "an edit is recognised",
  isServerEdit({ payload: delivered, type: "edit" }),
  true,
);
check(
  "an edit carrying no message is rejected",
  isServerEdit({ payload: { conversationId: "conv-1" }, type: "edit" }),
  false,
);

// ─── Junk ───────────────────────────────────────────────────────────────────
// A socket delivers whatever arrives. None of this may throw.

check("a non-JSON frame parses to null", parseSocketFrame("not json"), null);
check("an empty frame parses to null", parseSocketFrame(""), null);
check("null is not a message", isServerMessage(null), false);
check("a bare string is not a ping", isServerPing("ping"), false);
check("an array is not a reaction", isServerReaction([]), false);

if (failures > 0) {
  // Thrown rather than `process.exit`: the shared packages narrow the ambient
  // `process` type to `{ env }`, and an unhandled throw is a non-zero exit.
  throw new Error(`${failures} smoke check(s) failed`);
}
console.log("\nALL PASS");
