import { unregisterBackgroundRefresh } from "./background";
import { unbindStore } from "./bind";
import { closeStore, getStore, readActiveUser, wipeStore } from "./db";
import { deleteAllDatabaseKeys, knownDatabaseUsers } from "./key";
import { wipeMedia, wipeStrayFiles } from "./media";

/**
 * The wipe paths, as LOCAL_DATA_PLAN.md section 4.3 lists them.
 *
 * Every way a session ends has to reach one of these two, or the next person
 * to open the app on this phone inherits the last one's conversations:
 *
 *  1. Sign out (`use-sign-out.ts`), from the menu or "everywhere".
 *  2. The server refusing the refresh token (`setSessionLostHandler`).
 *  3. Account deletion — not on native yet; when it arrives it calls the same
 *     `signOut` and gets this for free.
 *  4. A reinstall finding a Keychain the previous install left behind
 *     (`discardOrphanedSession` in `session-store.ts`) — that one deletes keys
 *     only, since no file survives an uninstall.
 *  5. A different account signing in (`openStore` closes the old handle; the
 *     old file is wiped here so it does not sit in the container until the
 *     next sign-out of *that* account).
 */

/** The open store's file and key, or whatever the active-user marker names. */
export const wipeCurrentStore = async (): Promise<void> => {
  const userId = getStore()?.userId ?? (await readActiveUser());
  unbindStore();
  await unregisterBackgroundRefresh();
  await closeStore();
  if (userId) {
    wipeMedia(userId);
    await wipeStore(userId);
  }
};

/**
 * Every store except `keepUserId`'s.
 *
 * Sign-out already wipes, but a session can end without one — the refresh
 * token dying while the app was closed, a crash mid sign-out — and the next
 * account must not find the last one's file in the container. Runs at the
 * first point the new account's id is known, before its own store opens.
 */
export const wipeOtherStores = async (keepUserId: string): Promise<void> => {
  const users = new Set(await knownDatabaseUsers());
  const active = await readActiveUser();
  if (active) users.add(active);
  users.delete(keepUserId);
  for (const userId of users) {
    wipeMedia(userId);
    await wipeStore(userId);
  }
};

/** Every file and key the register knows about. For account switches and belt-and-braces sign-out. */
/**
 * The orphaned-install path: nothing is bound yet, nothing may survive. Every
 * store the register names, the active-user marker, and the register itself.
 * `wipeAllStores` plus the stray-file sweep, for the case where the register
 * was lost but the files were not.
 */
export const wipeEverything = async (): Promise<void> => {
  await wipeAllStores();
  await deleteAllDatabaseKeys();
  wipeStrayFiles();
};

export const wipeAllStores = async (): Promise<void> => {
  unbindStore();
  await unregisterBackgroundRefresh();
  await closeStore();
  const users = new Set(await knownDatabaseUsers());
  const active = await readActiveUser();
  if (active) users.add(active);
  for (const userId of users) {
    wipeMedia(userId);
    await wipeStore(userId);
  }
};
