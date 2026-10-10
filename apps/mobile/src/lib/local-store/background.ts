import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { loadSession, readAccessToken } from "@/lib/session-store";
import { closeStore, getStore, openStore, readActiveUser } from "./db";
import { loadMediaIndex } from "./media";
import { writeMeta } from "./meta";
import { refreshStore } from "./refresh";

/**
 * The background refresh (LOCAL_DATA_PLAN.md 4.5).
 *
 * One task — both platforms give an app one worker and Expo one identifier —
 * registered while somebody is signed in, unregistered at sign-out. The
 * system decides when it runs: WorkManager on Android, no sooner than
 * `MINIMUM_INTERVAL_MINUTES`; `BGTaskScheduler` on iOS, which treats the
 * interval as a hint, never runs after a force quit, and never on a
 * simulator. The app must be right with zero runs, and is: the foreground
 * hydrates and refetches on its own.
 *
 * ## What a run is
 *
 * The bundle is loaded headless and `TASK` executes with no React tree. It
 * reads the keychain (or every request 401s), opens the store for the account
 * the marker names, runs `refreshStore` against a deadline, closes the file
 * and returns. The foreground, if it is running at the same time, shares the
 * open handle through `openStore`'s cache and hydrates on its next focus.
 *
 * ## The one thing it must not do
 *
 * Wipe. A refresh token the server refuses during a run goes through the
 * `api` module's session-lost handler, which in the foreground deletes the
 * file. `isBackgroundRefreshRunning` is what that handler checks first: during
 * a headless run it clears memory and leaves the file for the foreground to
 * judge. When the app is alive and the task is borrowing its handle, the
 * guard stays down — the foreground is there to judge, and must.
 *
 * `defineTask` must run at module scope from the entry — `index.js` imports
 * this module for that reason alone.
 */

export const TASK = "nw-refresh";
const MINIMUM_INTERVAL_MINUTES = 60;
/** Well inside what iOS grants a processing task before it starts expiring it. */
const RUN_BUDGET_MS = 20_000;

let running = false;
export const isBackgroundRefreshRunning = () => running;

TaskManager.defineTask(TASK, async () => {
  let expired = false;
  const expiration = BackgroundTask.addExpirationListener(() => {
    expired = true;
  });
  try {
    await loadSession();
    if (!readAccessToken()) return BackgroundTask.BackgroundTaskResult.Success;

    const userId = await readActiveUser();
    if (!userId) return BackgroundTask.BackgroundTaskResult.Success;

    // Reuse the foreground's handle when the app is alive; open our own otherwise.
    const foreground = getStore()?.userId === userId;
    running = !foreground;
    const store = foreground ? getStore() : await openStore(userId);
    if (!store) return BackgroundTask.BackgroundTaskResult.Failed;
    if (!foreground) await loadMediaIndex(store).catch(() => {});

    const outcome = await refreshStore(store, {
      deadline: Date.now() + RUN_BUDGET_MS,
      expired: () => expired,
    });
    await writeMeta(store, "background.at", String(Date.now())).catch(() => {});
    await writeMeta(
      store,
      "background.result",
      `ran ${outcome.ran.length}, failed ${outcome.failed.length}, skipped ${outcome.skipped.length}`,
    ).catch(() => {});

    if (!foreground) await closeStore();
    return outcome.failed.length === 0
      ? BackgroundTask.BackgroundTaskResult.Success
      : BackgroundTask.BackgroundTaskResult.Failed;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  } finally {
    running = false;
    expiration.remove();
  }
});

/** Registers the task if the platform allows background work. Safe to call repeatedly. */
export const registerBackgroundRefresh = async (): Promise<boolean> => {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return false;
    await BackgroundTask.registerTaskAsync(TASK, {
      minimumInterval: MINIMUM_INTERVAL_MINUTES,
    });
    return true;
  } catch (cause) {
    if (__DEV__) console.warn("local-store: background register", cause);
    return false;
  }
};

export const unregisterBackgroundRefresh = async (): Promise<void> => {
  try {
    if (await TaskManager.isTaskRegisteredAsync(TASK)) {
      await BackgroundTask.unregisterTaskAsync(TASK);
    }
  } catch {
    // Nothing registered, or the platform refused: either way nothing runs.
  }
};

export const backgroundRefreshStatus = async (): Promise<{
  available: boolean;
  registered: boolean;
}> => {
  const [status, registered] = await Promise.all([
    BackgroundTask.getStatusAsync().catch(() => BackgroundTask.BackgroundTaskStatus.Restricted),
    TaskManager.isTaskRegisteredAsync(TASK).catch(() => false),
  ]);
  return {
    available: status === BackgroundTask.BackgroundTaskStatus.Available,
    registered,
  };
};

/** Development only: asks the platform to run the worker now. */
export const triggerBackgroundRefreshForTesting = () =>
  BackgroundTask.triggerTaskWorkerForTestingAsync();
