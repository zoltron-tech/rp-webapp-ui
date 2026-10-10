import { submitPrompt } from "@nw/api/endpoints/profile";
import type { MessageSenderChoice } from "@nw/chat";
import {
  API_MESSAGE,
  type Message,
  type SubmitPromptInput,
  type SubmitPromptType,
} from "@nw/types";
import { useMemo, useSyncExternalStore } from "react";
import type { LocalStore } from "./db";

/**
 * The outbox: what was written with no network, kept until there is one.
 *
 * Two kinds of thing wait here. A **message** in a conversation, and a
 * **post** — a new prompt or out-of-character post, a comment on a prompt,
 * or a reply in a thread. Neither is failed (nothing was tried) and neither
 * is in flight; they are *waiting*, and waiting has to survive the app being
 * closed, which is why this is a table in the encrypted store and not a
 * `useState` somewhere. The thread draws a waiting message as its own bubble;
 * the feed, the comment list and the thread draw a waiting post in the place
 * it will take; the Outbox page lists all of it across the app. A long press
 * or the page's trash removes an entry, and removing is final.
 *
 * ## Who sends it, and when
 *
 * Senders, same queue, in written order:
 *
 *  - **Messages, over the socket**, from the foreground
 *    (`hooks/use-outbox-drain.ts`) the moment the connection is back. The
 *    socket path carries everything — pictures, the chosen muse, a reply —
 *    and broadcasts the message so the other person sees it at once.
 *  - **Messages, over REST**, from the background refresh (`refresh.ts`)
 *    when the phone found a network while the app was closed. `POST
 *    …/sendMessage` takes a body and nothing else: it sends as the novelist,
 *    with no attachments and no reply. So the background takes only the
 *    messages it can send faithfully (`sendableByRest`) and leaves the rest
 *    for the socket.
 *  - **Posts, over REST**, from either side — `submitPrompt` is the same call
 *    the composer makes online, so a queued post goes out exactly as written.
 *
 * An entry is removed the moment a send is accepted; the real row arrives
 * through the socket's echo or the next fetch. A send the server *refuses*
 * for good (a bad payload, a cross-post the rules forbid) is dropped rather
 * than retried forever; a send that merely could not happen (no network, a
 * 5xx) stops the drain — order matters — and the next attempt starts again
 * from the oldest.
 *
 * ## In memory as well as on disk
 *
 * The rows are mirrored in a module store so a screen can read its part of
 * the queue synchronously from render (`useOutboxMessages`,
 * `useOutboxPosts`), and so the offline strip can say how many are waiting.
 * `loadOutbox` fills it when the store binds; every write goes to the file
 * first and the mirror second.
 */

interface OutboxBase {
  attempts: number;
  /** ISO, when it was written: where it sits among what is already there. */
  createdAt: string;
  id: string;
}

export interface OutboxMessage extends OutboxBase {
  attachments: { url: string }[];
  conversationId: string;
  kind: "message";
  repliedTo: Message | null;
  sender: MessageSenderChoice | null;
  text: string;
}

export interface OutboxPost extends OutboxBase {
  kind: "post";
  /** What it answers — a comment's prompt, a reply's comment — for the page. */
  parent: { author: string; text: string } | null;
  payload: SubmitPromptInput;
  type: SubmitPromptType;
}

export type OutboxEntry = OutboxMessage | OutboxPost;

export type OutboxDraft =
  | Omit<OutboxMessage, keyof OutboxBase>
  | Omit<OutboxPost, keyof OutboxBase>;

export const OUTBOX_ID_PREFIX = "outbox-";

export const isOutboxMessage = (entry: OutboxEntry): entry is OutboxMessage =>
  entry.kind === "message";
export const isOutboxPost = (entry: OutboxEntry): entry is OutboxPost =>
  entry.kind === "post";

let entries: OutboxEntry[] = [];
let loadedFor: string | null = null;
let draining = false;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Reads a row back. Rows written before posts existed carry no `kind`. */
const parseEntry = (raw: unknown): OutboxEntry | null => {
  if (!isObject(raw) || typeof raw.id !== "string") return null;
  if (raw.kind === "post") {
    if (!isObject(raw.payload) || typeof raw.type !== "string") return null;
    return raw as unknown as OutboxPost;
  }
  if (typeof raw.conversationId !== "string" || typeof raw.text !== "string") {
    return null;
  }
  return { ...(raw as unknown as OutboxMessage), kind: "message" };
};

/** Reads the table into memory. Called when the store binds. */
export const loadOutbox = async (store: LocalStore): Promise<void> => {
  const rows = await store.db.getAllAsync<{ attempts: number; json: string }>(
    "SELECT json, attempts FROM outbox ORDER BY created_at ASC",
  );
  const next: OutboxEntry[] = [];
  for (const row of rows) {
    try {
      const entry = parseEntry(JSON.parse(row.json));
      if (entry) next.push({ ...entry, attempts: row.attempts });
    } catch {
      // A row the next write replaces.
    }
  }
  entries = next;
  loadedFor = store.userId;
  notify();
};

export const clearOutboxIndex = (): void => {
  entries = [];
  loadedFor = null;
  notify();
};

const ready = (store: LocalStore) => loadedFor === store.userId;

export const outboxEntries = (): OutboxEntry[] => entries;

/** Writes to the queue. Returns the entry as stored. */
export const enqueueOutbox = async (
  store: LocalStore,
  draft: OutboxDraft,
): Promise<OutboxEntry> => {
  const entry = {
    ...draft,
    attempts: 0,
    createdAt: new Date().toISOString(),
    id: `${OUTBOX_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } as OutboxEntry;
  await store.write(() =>
    store.db.runAsync(
      "INSERT INTO outbox (id, conversation_id, json, created_at, attempts) VALUES (?, ?, ?, ?, 0)",
      entry.id,
      entry.kind === "message" ? entry.conversationId : "",
      JSON.stringify(entry),
      Date.parse(entry.createdAt),
    ),
  );
  if (ready(store)) {
    entries = [...entries, entry];
    notify();
  }
  return entry;
};

/** Removes an entry from the queue. It will not be sent. */
export const discardOutbox = async (
  store: LocalStore,
  id: string,
): Promise<void> => {
  await store.write(() => store.db.runAsync("DELETE FROM outbox WHERE id = ?", id));
  if (ready(store)) {
    entries = entries.filter((entry) => entry.id !== id);
    notify();
  }
};

const recordAttempt = async (store: LocalStore, id: string) => {
  await store
    .write(() =>
      store.db.runAsync("UPDATE outbox SET attempts = attempts + 1 WHERE id = ?", id),
    )
    .catch(() => {});
  if (ready(store)) {
    entries = entries.map((entry) =>
      entry.id === id ? { ...entry, attempts: entry.attempts + 1 } : entry,
    );
    notify();
  }
};

/** What `send` answers: accepted, could not be tried, or refused for good. */
export type SendOutcome = boolean | "drop";

/**
 * Sends what is waiting, oldest first, through `send`.
 *
 * `true` means accepted — the entry is removed. `"drop"` means the server
 * refused it for good — removed too, and nothing else is affected. `false`
 * stops the drain (the next one picks up from the same entry) and counts an
 * attempt. `eligible` lets a sender skip what it cannot carry; a skipped
 * entry neither stops the drain nor counts. One drain at a time, whichever
 * side asks.
 */
export const drainOutbox = async (
  store: LocalStore,
  send: (entry: OutboxEntry) => Promise<SendOutcome>,
  eligible: (entry: OutboxEntry) => boolean = () => true,
): Promise<{ dropped: OutboxEntry[]; sent: OutboxEntry[]; stopped: boolean }> => {
  const sent: OutboxEntry[] = [];
  const dropped: OutboxEntry[] = [];
  if (draining) return { dropped, sent, stopped: false };
  draining = true;
  try {
    if (!ready(store)) await loadOutbox(store);
    // A snapshot: `send` may take a while and the list may change under it.
    for (const entry of [...entries]) {
      if (!eligible(entry)) continue;
      // Discarded while this drain was busy with an earlier entry.
      if (!entries.some((current) => current.id === entry.id)) continue;
      let outcome: SendOutcome = false;
      try {
        outcome = await send(entry);
      } catch {
        outcome = false;
      }
      if (outcome === false) {
        await recordAttempt(store, entry.id);
        return { dropped, sent, stopped: true };
      }
      await discardOutbox(store, entry.id);
      (outcome === "drop" ? dropped : sent).push(entry);
    }
    return { dropped, sent, stopped: false };
  } finally {
    draining = false;
  }
};

/** What the background's REST path can send faithfully. See the module note. */
export const sendableByRest = (entry: OutboxEntry): boolean =>
  entry.kind === "post" ||
  (entry.attachments.length === 0 &&
    (entry.sender === null || entry.sender.type === "NOVELIST"));

/** Refusals that will not change with a retry. */
const REFUSED_FOR_GOOD = new Set<string>([
  API_MESSAGE.BadPayload,
  API_MESSAGE.NotAllowed,
  API_MESSAGE.AccessDenied,
]);

/** Sends a queued post the way the composer would have. Either side uses this. */
export const sendPost = async (
  api: Parameters<typeof submitPrompt>[0],
  entry: OutboxPost,
): Promise<SendOutcome> => {
  const response = await submitPrompt(api, entry.payload, entry.type).catch(
    () => null,
  );
  if (!response) return false;
  if (response.message === API_MESSAGE.Success) return true;
  return REFUSED_FOR_GOOD.has(response.message) ? "drop" : false;
};

const NONE: OutboxEntry[] = [];

/** The whole queue. Re-renders as it changes. */
export const useOutbox = (): OutboxEntry[] =>
  useSyncExternalStore(subscribe, () => entries, () => NONE);

/** The messages waiting for one thread, or for all of them. */
export const useOutboxMessages = (conversationId?: string): OutboxMessage[] => {
  const all = useOutbox();
  return useMemo(
    () =>
      all.filter(
        (entry): entry is OutboxMessage =>
          isOutboxMessage(entry) &&
          (!conversationId || entry.conversationId === conversationId),
      ),
    [all, conversationId],
  );
};

/** The posts, comments and replies waiting. */
export const useOutboxPosts = (): OutboxPost[] => {
  const all = useOutbox();
  return useMemo(() => all.filter(isOutboxPost), [all]);
};
