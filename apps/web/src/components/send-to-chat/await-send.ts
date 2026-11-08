import { isServerMessage, isServerSendError } from "@nw/chat";
import { API_MESSAGE } from "@nw/types";

/**
 * Sends one `message` frame and waits for chat-server's answer about it.
 *
 * chat-server answers a send in one of two ways, both per conversation: the
 * stored message comes back to the sender's sockets, or a `send-error` frame
 * names the conversation and the backend's reason (`blocked`, `unavailable`).
 * Neither carries a client id, so the answer is matched by conversation (and,
 * for the echo, by sender) — enough for a share/forward row, which sends one
 * message to one conversation. With no answer before the timeout the send is
 * taken as delivered, which is all the socket alone could ever say.
 */

export type SendOutcome = { ok: true } | { ok: false; message: string };

const SEND_ANSWER_TIMEOUT_MS = 8000;

const refusalMessage = (reason?: string): string => {
  if (reason === API_MESSAGE.Blocked) return "You can't send messages to this chat.";
  if (reason === API_MESSAGE.Unavailable)
    return "This novelist isn't available right now.";
  return "Your message could not be sent.";
};

export const sendAndAwaitAnswer = (
  socket: WebSocket,
  payload: { conversationId: string },
  username: string | undefined,
): Promise<SendOutcome> =>
  new Promise((resolve) => {
    const { conversationId } = payload;
    let settled = false;
    const finish = (outcome: SendOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.removeEventListener("message", onFrame);
      resolve(outcome);
    };
    const onFrame = (event: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data as string);
      } catch {
        return;
      }
      if (isServerSendError(data)) {
        if (data.payload.conversationId === conversationId) {
          finish({ message: refusalMessage(data.payload.reason), ok: false });
        }
        return;
      }
      if (
        isServerMessage(data) &&
        data.conversationId === conversationId &&
        (!username || data.sender?.username === username)
      ) {
        finish({ ok: true });
      }
    };
    const timer = setTimeout(
      () => finish({ ok: true }),
      SEND_ANSWER_TIMEOUT_MS,
    );
    socket.addEventListener("message", onFrame);
    try {
      socket.send(JSON.stringify({ payload, type: "message" }));
    } catch {
      finish({ message: "Your message could not be sent.", ok: false });
    }
  });
