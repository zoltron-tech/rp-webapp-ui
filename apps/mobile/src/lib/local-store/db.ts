import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import {
  deleteDatabaseAsync,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { deleteDatabaseKey, getOrCreateDatabaseKey } from "./key";
import { migrate, SCHEMA_VERSION } from "./migrations";

/**
 * The encrypted database under the app — one file per account.
 *
 * `nw-<novelistId>.db`, opened with the account's key from the keychain (see
 * `key.ts`), journaled in WAL so a reader never waits on the background
 * task's write. Everything in LOCAL_DATA_PLAN.md section 4 reads and writes
 * through the handle this module hands out; nothing else opens the file.
 *
 * ## One file per account, not one table column
 *
 * A `user_id` column would protect against showing one account's rows to
 * another only as long as every query remembered to filter by it. A file name
 * cannot be forgotten: a different account opens a different file, and signing
 * out deletes the file. The key is per account for the same reason.
 *
 * ## It refuses to run unencrypted
 *
 * `PRAGMA cipher_version` answers only when SQLCipher is compiled in. A build
 * without it (the plugin flag lost in a prebuild, Expo Go) would open a plain
 * SQLite file and quietly write decrypted messages to it. So the open fails
 * instead, loudly, and the app runs without a local store — a re-fetch per
 * screen is the cost; plaintext chat on disk is not an option.
 *
 * ## One connection, always
 *
 * SQLCipher keys a *connection*, not a file. `withExclusiveTransactionAsync`
 * and `useNewConnection` open a second connection that has not been keyed and
 * fail with "file is not a database"; nothing in this store may use them.
 * `withTransactionAsync` runs on the keyed connection and is what every write
 * goes through.
 *
 * ## Where the file lives
 *
 * `Library/Caches/nw-store/` on iOS, `cache/nw-store/` on Android — not the
 * SQLite default (`Documents/SQLite`). Apple's data-storage guidelines put
 * anything re-creatable from the network outside Documents, which iCloud
 * backs up, and this file is exactly that: a cache. The cost is that the OS
 * may purge it under storage pressure; the app then opens an empty one and
 * fetches as if it had never had it.
 *
 * ## Who opens it
 *
 * The foreground, once the session has resolved to a novelist (`_layout.tsx`),
 * and the background task, from the id this module remembers in AsyncStorage —
 * the task has no session hook and the id is not a secret. Both go through
 * `openStore`, which is idempotent for the same id and switches files for a
 * different one.
 */

const ACTIVE_USER = "nw.localStore.activeUser";

export interface LocalStore {
  db: SQLiteDatabase;
  userId: string;
  /**
   * Runs `work` inside a transaction, after every write queued before it.
   *
   * There is one connection, and `withTransactionAsync` is nothing more than
   * `BEGIN` … `COMMIT` on it: two callers overlapping get "cannot start a
   * transaction within a transaction" and the loser's `ROLLBACK` then fails
   * with "no transaction is active" — which is what happened the first time a
   * profile fetch and the LRU bump landed together. So every write goes
   * through this queue, one transaction at a time, in arrival order.
   */
  write: <T>(work: () => Promise<T>) => Promise<T>;
}

let current: LocalStore | null = null;
let opening: Promise<LocalStore | null> | null = null;

const fileName = (userId: string) => `nw-${userId}.db`;

/**
 * Removes the file an earlier build kept under `Documents/SQLite`, with the
 * journal files `deleteDatabaseAsync` leaves beside it.
 */
const removeLegacyDatabase = (userId: string) =>
  removeDatabaseFiles(new Directory(Paths.document, "SQLite"), userId);

/**
 * The database and its journals. `deleteDatabaseAsync` removes the main file
 * and leaves `-wal` / `-shm` beside it; those hold encrypted pages, but a wipe
 * that leaves any of this account's bytes behind is not a wipe.
 */
const removeDatabaseFiles = (directory: Directory, userId: string) => {
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    try {
      const file = new File(directory, `${fileName(userId)}${suffix}`);
      if (file.exists) file.delete();
    } catch {
      // Best effort: nothing opens that path any more.
    }
  }
};

/** The cache directory for the store, created on first use. */
const storeDirectory = (): string => {
  const directory = new Directory(Paths.cache, "nw-store");
  if (!directory.exists) directory.create({ idempotent: true, intermediates: true });
  return directory.uri;
};

const assertEncrypted = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ cipher_version?: string }>(
    "PRAGMA cipher_version",
  );
  if (!row?.cipher_version) {
    throw new Error("local-store: SQLCipher is not compiled into this build");
  }
};

/** 32 random bytes as hex, and nothing else, goes into the `PRAGMA key` text. */
const KEY_SHAPE = /^[0-9a-f]{64}$/;

const open = async (userId: string): Promise<LocalStore> => {
  const key = await getOrCreateDatabaseKey(userId);
  if (!KEY_SHAPE.test(key)) {
    // Not something this module wrote. Whatever it is, it is not going into
    // a SQL statement; the file it would open is unreadable without it anyway.
    throw new Error("local-store: key is not the expected shape");
  }
  const db = await openDatabaseAsync(fileName(userId), undefined, storeDirectory());
  // A file an earlier build left in Documents (the SQLite default): gone, so
  // nothing of this account sits where backups look.
  removeLegacyDatabase(userId);
  try {
    // Raw key, so SQLCipher skips its KDF — the key is already random.
    await db.execAsync(`PRAGMA key = "x'${key}'"`);
    await assertEncrypted(db);
    // The first real statement is what fails on a wrong key; one cheap read
    // here turns that into an open-time error rather than a mid-screen one.
    await db.getFirstAsync("SELECT count(*) FROM sqlite_master");
    await db.execAsync("PRAGMA journal_mode = WAL");
    await migrate(db);
  } catch (cause) {
    await db.closeAsync().catch(() => {});
    throw cause;
  }
  let tail: Promise<unknown> = Promise.resolve();
  const write = <T>(work: () => Promise<T>): Promise<T> => {
    const transact = async (): Promise<T> => {
      let result!: T;
      await db.withTransactionAsync(async () => {
        result = await work();
      });
      return result;
    };
    const run = tail.then(transact, transact);
    tail = run.catch(() => undefined);
    return run;
  };

  return { db, userId, write };
};

/**
 * The store for `userId`, opening it if needed.
 *
 * Returns `null` rather than throwing when the file cannot be opened — a
 * missing cipher, a corrupt file, a keychain that will not answer. Callers
 * treat `null` as "no local tier" and fetch as they always did; the error is
 * reported once, in development, and not retried in a loop.
 */
export const openStore = async (userId: string): Promise<LocalStore | null> => {
  if (current?.userId === userId) return current;
  if (opening) await opening.catch(() => null);
  if (current?.userId === userId) return current;

  opening = (async () => {
    if (current) await closeStore();
    try {
      current = await open(userId);
    } catch (cause) {
      // A file that will not open — the OS reclaimed part of the cache, the
      // keychain answered with something else, a crash mid-migration — is a
      // cache that is no longer a cache. Start it over, once; a key that is
      // not ours goes with it, because the file it fits is gone.
      if (__DEV__) console.warn("local-store: open failed, starting over", cause);
      try {
        await deleteDatabaseAsync(fileName(userId), storeDirectory()).catch(() => {});
        removeDatabaseFiles(new Directory(storeDirectory()), userId);
        await deleteDatabaseKey(userId);
        current = await open(userId);
      } catch (again) {
        if (__DEV__) console.warn("local-store: open failed twice", again);
        current = null;
      }
    } finally {
      opening = null;
    }
    if (current) await AsyncStorage.setItem(ACTIVE_USER, userId).catch(() => {});
    return current;
  })();

  return opening;
};

/** The open store, or `null` before `openStore` has succeeded. Synchronous for render paths. */
export const getStore = (): LocalStore | null => current;

export const closeStore = async (): Promise<void> => {
  const store = current;
  current = null;
  if (!store) return;
  await store.db.closeAsync().catch(() => {});
};

/** The id the background task opens for. Null when nobody is signed in. */
export const readActiveUser = (): Promise<string | null> =>
  AsyncStorage.getItem(ACTIVE_USER).catch(() => null);

/**
 * Removes the file, its journals, and the key.
 *
 * File first: a crash between the two leaves a key with nothing to open,
 * which is inert, rather than an encrypted file whose key is gone — also
 * inert, but a file that looks like data sitting in the container.
 */
export const wipeStore = async (userId: string): Promise<void> => {
  if (current?.userId === userId) await closeStore();
  await deleteDatabaseAsync(fileName(userId), storeDirectory()).catch(() => {});
  removeDatabaseFiles(new Directory(storeDirectory()), userId);
  removeLegacyDatabase(userId);
  await deleteDatabaseKey(userId);
  const active = await readActiveUser();
  if (active === userId) {
    await AsyncStorage.removeItem(ACTIVE_USER).catch(() => {});
  }
};

export { SCHEMA_VERSION };
