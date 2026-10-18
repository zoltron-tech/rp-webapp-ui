/**
 * The local tier: an encrypted SQLite file per account, under the query cache.
 *
 * See LOCAL_DATA_PLAN.md. This module is the only door; `db.ts` opens and
 * wipes the file, `key.ts` keeps its key, `migrations.ts` owns the schema,
 * `meta.ts` the bookkeeping. Entity modules (`novelists.ts`, `chat.ts`, …)
 * arrive with the phases that need them.
 */
export {
  backgroundRefreshStatus,
  isBackgroundRefreshRunning,
  registerBackgroundRefresh,
  triggerBackgroundRefreshForTesting,
  unregisterBackgroundRefresh,
} from "./background";
export { bindStore, unbindStore } from "./bind";
export {
  deleteMessages,
  mostRecentConversationIds,
  purgeOldMessages,
  RETENTION_MS,
} from "./chat";
export {
  closeStore,
  getStore,
  type LocalStore,
  openStore,
  readActiveUser,
  SCHEMA_VERSION,
  wipeStore,
} from "./db";
export { FEED_KEEP_PAGES, FEED_MAX_AGE_MS } from "./feeds";
export { hydrateStore, seedQuery } from "./hydrate";
export { hydrateThreadPage, markThreadOpened } from "./interactions";
export { deleteAllDatabaseKeys, knownDatabaseUsers } from "./key";
export {
  CHAT_MEDIA_RETENTION_MS,
  isMediaCached,
  type MediaKind,
  mediaStats,
  prefetchMedia,
  purgeMedia,
  resolveMediaUri,
  useMediaUri,
} from "./media";
export {
  lastSyncedAt,
  readAllMeta,
  readMeta,
  recordSync,
  writeMeta,
} from "./meta";
export { markNovelistOpened } from "./novelists";
export {
  discardOutbox,
  drainOutbox,
  enqueueOutbox,
  isOutboxMessage,
  isOutboxPost,
  OUTBOX_ID_PREFIX,
  type OutboxEntry,
  type OutboxMessage,
  type OutboxPost,
  outboxEntries,
  sendableByRest,
  sendPost,
  useOutbox,
  useOutboxMessages,
  useOutboxPosts,
} from "./outbox";
export { refreshStore } from "./refresh";
export {
  wipeAllStores,
  wipeCurrentStore,
  wipeEverything,
  wipeOtherStores,
} from "./wipe";
