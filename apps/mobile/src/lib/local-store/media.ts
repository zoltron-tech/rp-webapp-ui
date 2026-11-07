import { reverseWsrvUrl } from "@nw/utils";
import { Image as ExpoImage } from "expo-image";
import { Directory, File, Paths } from "expo-file-system";
import { readDirectoryAsync } from "expo-file-system/legacy";
import { useSyncExternalStore } from "react";
import { getStore, type LocalStore } from "./db";
import { readMeta } from "./meta";

/**
 * Media on disk: every picture and clip the app has shown or stored, kept as
 * a file so the next time it is shown nothing is fetched.
 *
 * ## Two tiers, one index
 *
 * The bytes live under `Paths.cache/nw-media/<novelistId>/`, one file per
 * URL, named by a hash of the URL. Caches, not Documents: Apple's
 * data-storage guidelines keep re-downloadable data out of what iCloud backs
 * up, and the OS may reclaim it under storage pressure, the whole directory
 * or file by file. `loadMediaIndex` checks the index against the disk, and
 * the `Image` wrapper calls `evictMissingMedia` when a file goes while the app
 * is running. The index — which URL is which file, how
 * big, what kind, when last shown — is the `media` table in the encrypted
 * store, and a copy of it is held in memory so a render can answer "is this
 * cached?" synchronously. `expo-image` keeps its own memory/disk cache on top
 * of this; that one is the OS's to evict, this one is ours.
 *
 * The files themselves are not encrypted. They are in the app's own
 * container (iOS data protection, Android app sandbox, `allowBackup: false`),
 * which is the same place `expo-image`'s cache already put them. What the
 * encrypted store protects is the *index* — which URLs this account has seen —
 * and the message bodies. `expo-image` is told not to keep its own disk copy
 * of `chat` pictures (see `components/image.tsx`), so the fourteen days are
 * the only copy's lifetime; and its caches are cleared outright at sign-out.
 *
 * Videos are never downloaded here: a clip is streamed by the player when it
 * is played, and a background job pulling clips over cellular is not what
 * anybody asked for. Pictures over `MAX_FILE_BYTES` are dropped after the
 * download rather than kept.
 *
 * ## Kinds and retention
 *
 * Every row has a `kind`. `chat` rows — attachments and pictures inside
 * messages — carry `expires_at`, fourteen days from download by default
 * (`CHAT_MEDIA_RETENTION_MS`, overridable per store through the meta key
 * `media.chatRetentionMs`), and are deleted by `purgeMedia` when it passes:
 * the same window the server and the message table keep. `general` rows —
 * avatars, banners, cards, feed pictures — have no expiry and are kept under a
 * byte budget, least recently shown first out.
 *
 * Tags come with a weight. A tag from `prefetchMedia` — the persist hooks
 * know what an attachment is — is *explicit*; a tag from a render is the
 * screen's default and counts for less. An explicit `general` (the inbox
 * listing a sender's face) outranks an explicit `chat` (that face drawn in a
 * bubble), so avatars never expire; an explicit `chat` outranks a render's
 * `general` (the inbox row drawing an attachment preview), so attachments
 * always do. Two renders disagreeing: the first one wins.
 *
 * Tags are keyed by the *origin* URL. The app draws most pictures through a
 * resizing proxy (`wsrvImage`), so one attachment is several URLs — the raw
 * S3 object the persist hook tags, and the thumbnail the inbox row draws. An
 * explicit `chat` tag on the raw URL marks its origin, and every variant of
 * that origin is chat from then on, whichever URL asks first.
 *
 * ## How things get in
 *
 * Two ways. `prefetchMedia` — called by the persist hooks with every URL an
 * entity carries, and by the background refresh — downloads ahead of any
 * screen. `resolveMediaUri` — called by the `Image` wrapper for every picture
 * drawn — answers the local file when there is one and otherwise queues the
 * download and answers the remote URL, so the picture is on screen now and
 * cached for next time. Four downloads run at a time; the rest wait.
 */

export type MediaKind = "chat" | "general";

export const CHAT_MEDIA_RETENTION_MS = 14 * 24 * 60 * 60 * 1000;
const CHAT_RETENTION_META = "media.chatRetentionMs";

/** Ceiling for `general` media on disk; the least recently shown go first. */
const GENERAL_BUDGET_BYTES = 400 * 1024 * 1024;
const PARALLEL_DOWNLOADS = 4;
/** A picture larger than this is not cached; the network serves it. */
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const VIDEO_EXTENSIONS = /\.(mp4|m4v|mov|webm|mkv|avi|3gp|m3u8)$/i;
/** Stamped at most this often per URL, so a scrolling list is not a write per frame. */
const TOUCH_EVERY_MS = 10 * 60 * 1000;

interface Entry {
  bytes: number;
  /** The tag came from a persist hook, not from a render. */
  explicit: boolean;
  expiresAt: number | null;
  kind: MediaKind;
  lastUsedAt: number;
  path: string;
}

// ─── The in-memory index ────────────────────────────────────────────────────

const index = new Map<string, Entry>();
const listeners = new Set<() => void>();
let version = 0;
let indexedFor: string | null = null;

const notify = () => {
  version += 1;
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The directory an earlier build used, under Documents. Removed on sight. */
const removeLegacyMedia = (userId: string) => {
  try {
    const legacy = new Directory(Paths.document, "nw-media", userId);
    if (legacy.exists) legacy.delete();
  } catch {
    // Best effort.
  }
};

/** Reads the table into memory. Called once per store open. */
export const loadMediaIndex = async (store: LocalStore): Promise<void> => {
  removeLegacyMedia(store.userId);
  const rows = await store.db.getAllAsync<{
    bytes: number;
    expires_at: number | null;
    kind: MediaKind;
    last_used_at: number;
    path: string;
    url: string;
  }>("SELECT url, path, bytes, kind, last_used_at, expires_at FROM media");
  const root = mediaRoot(store.userId);
  // Before the index empties: a render in the wait would download everything.
  const onDisk = rows.length > 0 && root.exists ? await filesIn(root) : null;
  index.clear();
  // The OS may have reclaimed the cache directory while the app was away. An
  // index of files that are not there would draw nothing; start over.
  if (rows.length > 0 && !root.exists) {
    await store.write(() => store.db.runAsync("DELETE FROM media"));
    indexedFor = store.userId;
    notify();
    return;
  }
  // Or only some of it: the directory stays and files inside it go. A path is
  // compared whole, because iOS moves the app's container on an update.
  const missing: string[] = [];
  for (const row of rows) {
    if (onDisk && !onDisk.has(row.path)) {
      missing.push(row.url);
      continue;
    }
    if (row.kind === "chat") chatOrigins.add(originOf(row.url));
    index.set(row.url, {
      bytes: row.bytes,
      // Whatever reached the table was settled; a render does not reopen it.
      explicit: true,
      expiresAt: row.expires_at,
      kind: row.kind,
      lastUsedAt: row.last_used_at,
      path: row.path,
    });
  }
  if (missing.length > 0) {
    await store.write(async () => {
      for (const url of missing) {
        await store.db.runAsync("DELETE FROM media WHERE url = ?", url);
      }
    });
  }
  indexedFor = store.userId;
  notify();
};

export const clearMediaIndex = () => {
  index.clear();
  chatOrigins.clear();
  indexedFor = null;
  pending.clear();
  queue.length = 0;
  notify();
};

// ─── Paths ──────────────────────────────────────────────────────────────────

const mediaRoot = (userId: string) =>
  new Directory(Paths.cache, "nw-media", userId);

/**
 * The URI of every file in `root`, or null if it could not be read. Listed off
 * the JS thread: this runs during launch, over thousands of files.
 */
const filesIn = async (root: Directory): Promise<Set<string> | null> => {
  try {
    const names = await readDirectoryAsync(root.uri);
    return new Set(names.map((name) => new File(root, name).uri));
  } catch {
    return null;
  }
};

/** URLs tried and refused this session (too large, not a file), not retried. */
const refused = new Set<string>();

/** Origins (`reverseWsrvUrl`) an explicit `chat` tag has named. */
const chatOrigins = new Set<string>();

const originOf = (url: string): string => reverseWsrvUrl(url) ?? url;

/** The tag as it applies to `url`, given what is known about its origin. */
const effectiveTag = (
  url: string,
  kind: MediaKind,
  explicit: boolean,
): { explicit: boolean; kind: MediaKind } => {
  if (kind === "chat" && explicit) chatOrigins.add(originOf(url));
  if (kind === "general" && explicit) return { explicit, kind };
  if (chatOrigins.has(originOf(url))) return { explicit: true, kind: "chat" };
  return { explicit, kind };
};

/** FNV-1a over the URL, twice with different seeds, as 16 hex characters. */
const hashUrl = (url: string): string => {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < url.length; i += 1) {
    const c = url.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
};

const extensionOf = (url: string): string => {
  const clean = url.split(/[?#]/)[0];
  const ext = Paths.extname(clean).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : "";
};

const isCacheable = (url: string) =>
  /^https?:\/\//.test(url) &&
  !VIDEO_EXTENSIONS.test(url.split(/[?#]/)[0]) &&
  !refused.has(url);

// ─── Reading ────────────────────────────────────────────────────────────────

const store = () => {
  const open = getStore();
  return open && open.userId === indexedFor ? open : null;
};

/**
 * The local file for `url` if there is one, else `url` — and in that case the
 * download is queued, tagged `kind`. Synchronous, so a render can call it.
 */
export const resolveMediaUri = (
  url: string | null | undefined,
  kind: MediaKind = "general",
): string | null | undefined => {
  if (!url || !isCacheable(url)) return url;
  const entry = index.get(url);
  const tag = effectiveTag(url, kind, false);
  if (entry) {
    void touch(url, entry, tag.kind, tag.explicit);
    return entry.path;
  }
  enqueue(url, tag.kind, tag.explicit);
  return url;
};

export const isMediaCached = (url: string) => index.has(url);

/** How often each URL's file has gone missing. See `mediaEvictions`. */
const evictions = new Map<string, number>();

/** Changes when `url` stops resolving to a file, so a drawn source can follow. */
export const mediaEvictions = (url: string | null | undefined): number =>
  (url && evictions.get(url)) || 0;

/**
 * A picture failed to draw from its file: if the file is gone, forgets it and
 * answers true, and `url` resolves to the network again. Answers false for any
 * other failure, which is the picture's own. A file that is there and will not
 * decode stays: downloading it again would only fail the same way, forever.
 */
export const evictMissingMedia = (url: string | null | undefined): boolean => {
  const entry = url ? index.get(url) : undefined;
  if (!url || !entry) return false;
  try {
    if (new File(entry.path).exists) return false;
  } catch {
    // A path that cannot be read is as gone as one that is not there.
  }
  index.delete(url);
  evictions.set(url, mediaEvictions(url) + 1);
  const open = store();
  if (open) {
    void open
      .write(() => open.db.runAsync("DELETE FROM media WHERE url = ?", url))
      .catch(() => {});
  }
  notify();
  return true;
};

/**
 * `resolveMediaUri` as a hook. The snapshot is this URL's path, so only the
 * download of *this* picture re-renders the caller — not every download.
 */
export const useMediaUri = (
  url: string | null | undefined,
  kind: MediaKind = "general",
): string | null | undefined => {
  useSyncExternalStore(
    subscribe,
    () => (url ? (index.get(url)?.path ?? null) : null),
    () => null,
  );
  return resolveMediaUri(url, kind);
};

/** Whether a `next` tag replaces the `current` one. See the module note. */
const outranks = (
  current: { explicit: boolean; kind: MediaKind },
  next: { explicit: boolean; kind: MediaKind },
): boolean => {
  if (current.kind === next.kind) return false;
  if (next.explicit && !current.explicit) return true;
  if (!next.explicit) return false;
  // Both explicit: general (a face) outranks chat (an attachment).
  return next.kind === "general";
};

const touch = async (
  url: string,
  entry: Entry,
  kind: MediaKind,
  explicit: boolean,
) => {
  const now = Date.now();
  const retag = outranks(entry, { explicit, kind });
  if (!retag && now - entry.lastUsedAt < TOUCH_EVERY_MS) return;
  entry.lastUsedAt = now;
  const open = store();
  if (retag) {
    entry.kind = kind;
    entry.explicit = true;
    entry.expiresAt =
      kind === "chat" && open ? now + (await chatRetentionMs(open)) : null;
  }
  if (!open) return;
  void open
    .write(() =>
      open.db.runAsync(
        "UPDATE media SET last_used_at = ?, kind = ?, expires_at = ? WHERE url = ?",
        now,
        entry.kind,
        entry.expiresAt,
        url,
      ),
    )
    .catch(() => {});
};

// ─── Downloading ────────────────────────────────────────────────────────────

const queue: string[] = [];
const pending = new Map<string, { explicit: boolean; kind: MediaKind }>();
let active = 0;

const enqueue = (url: string, kind: MediaKind, explicit: boolean) => {
  if (index.has(url)) return;
  const queued = pending.get(url);
  if (queued) {
    if (outranks(queued, { explicit, kind })) {
      pending.set(url, { explicit, kind });
    }
    return;
  }
  pending.set(url, { explicit, kind });
  queue.push(url);
  void pump();
};

const pump = async () => {
  while (active < PARALLEL_DOWNLOADS && queue.length > 0) {
    const url = queue.shift();
    if (!url) return;
    active += 1;
    void download(url)
      .catch(() => {})
      .finally(() => {
        pending.delete(url);
        active -= 1;
        void pump();
      });
  }
};

const chatRetentionMs = async (open: LocalStore): Promise<number> => {
  const override = Number(
    (await readMeta(open, CHAT_RETENTION_META).catch(() => null)) ?? 0,
  );
  return override > 0 ? override : CHAT_MEDIA_RETENTION_MS;
};

const download = async (url: string): Promise<void> => {
  const open = store();
  if (!open || index.has(url)) return;

  const root = mediaRoot(open.userId);
  if (!root.exists) root.create({ idempotent: true, intermediates: true });
  const target = new File(root, `${hashUrl(url)}${extensionOf(url)}`);
  if (target.exists) target.delete();

  const file = await File.downloadFileAsync(url, target);
  const bytes = file.size;
  if (!bytes || bytes > MAX_FILE_BYTES) {
    file.delete();
    refused.add(url);
    return;
  }

  // The store may have closed or switched while the bytes were in flight.
  const still = store();
  if (!still || still !== open) {
    file.delete();
    return;
  }

  // The tag as it stands now: a stronger one may have arrived while the
  // bytes were in flight.
  const { explicit, kind } = pending.get(url) ?? {
    explicit: false,
    kind: "general" as MediaKind,
  };
  const now = Date.now();
  const expiresAt =
    kind === "chat" ? now + (await chatRetentionMs(still)) : null;
  const entry: Entry = {
    bytes,
    explicit,
    expiresAt,
    kind,
    lastUsedAt: now,
    path: file.uri,
  };
  await still.write(() =>
    still.db.runAsync(
      `INSERT INTO media (url, path, bytes, kind, fetched_at, last_used_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         path = excluded.path, bytes = excluded.bytes, kind = excluded.kind,
         fetched_at = excluded.fetched_at, last_used_at = excluded.last_used_at,
         expires_at = excluded.expires_at`,
      url,
      file.uri,
      bytes,
      kind,
      now,
      now,
      expiresAt,
    ),
  );
  index.set(url, entry);
  notify();
};

/** Queues every URL that is not cached yet. The persist hooks call this. */
export const prefetchMedia = (
  urls: (string | null | undefined)[],
  kind: MediaKind,
): void => {
  if (!store()) return;
  for (const url of urls) {
    if (!url || !isCacheable(url)) continue;
    const tag = effectiveTag(url, kind, true);
    const entry = index.get(url);
    if (entry) void touch(url, entry, tag.kind, tag.explicit);
    else enqueue(url, tag.kind, tag.explicit);
  }
};

/** Waits for the queue to empty, or for `deadline`. The background refresh calls this. */
export const drainMediaQueue = async (deadline: number): Promise<void> => {
  while ((queue.length > 0 || active > 0) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
};

export const mediaQueueLength = () => queue.length + active;

// ─── Purging ────────────────────────────────────────────────────────────────

const removeEntry = async (open: LocalStore, url: string) => {
  const entry = index.get(url);
  if (!entry) return;
  try {
    const file = new File(entry.path);
    if (file.exists) file.delete();
  } catch {
    // The file may already be gone; the row goes regardless.
  }
  await open.db.runAsync("DELETE FROM media WHERE url = ?", url);
  index.delete(url);
};

/**
 * Applies retention: expired chat media goes, then `general` media over the
 * byte budget, least recently shown first. Returns how many files went.
 */
export const purgeMedia = async (open: LocalStore): Promise<number> => {
  if (open.userId !== indexedFor) await loadMediaIndex(open);
  const now = Date.now();
  let removed = 0;

  await open.write(async () => {
    for (const [url, entry] of index) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        await removeEntry(open, url);
        removed += 1;
      }
    }

    const general = [...index.entries()]
      .filter(([, entry]) => entry.kind === "general")
      .sort(([, a], [, b]) => a.lastUsedAt - b.lastUsedAt);
    let total = general.reduce((sum, [, entry]) => sum + entry.bytes, 0);
    for (const [url, entry] of general) {
      if (total <= GENERAL_BUDGET_BYTES) break;
      await removeEntry(open, url);
      total -= entry.bytes;
      removed += 1;
    }
  });

  if (removed > 0) notify();
  return removed;
};

/**
 * Every file of an account, with the directory — and `expo-image`'s own
 * caches, which hold decoded copies of whatever was drawn. Part of the wipe.
 */
export const wipeMedia = (userId: string): void => {
  try {
    const root = mediaRoot(userId);
    if (root.exists) root.delete();
  } catch {
    // Best effort: the index (in the database) is deleted with the file.
  }
  if (indexedFor === userId) clearMediaIndex();
  void ExpoImage.clearMemoryCache().catch(() => {});
  void ExpoImage.clearDiskCache().catch(() => {});
};

/**
 * Every store and media file of every account, whoever they belonged to.
 * For the fresh-install sweep, where no register may be left to name them.
 */
export const wipeStrayFiles = (): void => {
  for (const name of ["nw-media", "nw-store"]) {
    try {
      const directory = new Directory(Paths.cache, name);
      if (directory.exists) directory.delete();
    } catch {
      // Best effort.
    }
  }
  try {
    const legacy = new Directory(Paths.document, "nw-media");
    if (legacy.exists) legacy.delete();
  } catch {
    // Best effort.
  }
  clearMediaIndex();
};

export const mediaStats = async (
  open: LocalStore,
): Promise<{
  bytes: number;
  chat: number;
  general: number;
  queued: number;
}> => {
  const row = await open.db.getFirstAsync<{
    bytes: number | null;
    chat: number;
    general: number;
  }>(
    `SELECT sum(bytes) AS bytes,
            sum(CASE WHEN kind = 'chat' THEN 1 ELSE 0 END) AS chat,
            sum(CASE WHEN kind = 'general' THEN 1 ELSE 0 END) AS general
     FROM media`,
  );
  return {
    bytes: row?.bytes ?? 0,
    chat: row?.chat ?? 0,
    general: row?.general ?? 0,
    queued: mediaQueueLength(),
  };
};
