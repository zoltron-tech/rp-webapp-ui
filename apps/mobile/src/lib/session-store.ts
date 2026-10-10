import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * Where the session lives on a phone.
 *
 * The web app keeps nothing: both tokens are httpOnly cookies the browser
 * attaches by itself, and script cannot read them. Native has no cookie jar
 * worth relying on — iOS and Android both have one, but it is invisible to the
 * app, cleared by events the app never hears about, and impossible to migrate —
 * so the tokens are held here instead, in the platform keychain, and travel as
 * headers.
 *
 * That is the entire difference between the two clients, and it is why
 * `@nw/api` takes `getToken` as a function rather than reading a cookie itself.
 *
 * ⚠ **The backend must be told to send them.** `/account/login` and friends set
 * cookies and return `{ message, user, sessionId }` — no tokens in the body.
 * `X-NW-Client: native` asks for the token pair in the response instead; see
 * MONOREPO_MIGRATION_PLAN §4.1. Until that ships, `readSession` finds nothing
 * and every authenticated call is a 401.
 */

/**
 * What else a fresh install has to clear. The local store registers itself
 * here (`local-store/wipe.ts`) rather than being imported: this module is
 * loaded by the background task's entry, and importing the store from it
 * would be a cycle.
 */
let onFreshInstall: (() => Promise<void>) | null = null;

export const setFreshInstallHandler = (handler: () => Promise<void>) => {
  onFreshInstall = handler;
};

const ACCESS_KEY = "nw.accessToken";
const REFRESH_KEY = "nw.refreshToken";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
}

/**
 * A copy in memory, so the hot path is not an async keychain read.
 *
 * `getToken` is called on every request and `@nw/api` allows it to be async,
 * but a keychain round trip per request is real latency on a mid-range Android
 * device. SecureStore stays the source of truth across launches; this is the
 * value for the current one.
 */
let cached: StoredSession | null = null;

/** Written on first launch. AsyncStorage is deleted with the app; the keychain is not. */
const INSTALL_MARKER = "nw.installed";

/**
 * Drops a session left behind by a previous install.
 *
 * iOS keeps Keychain items after the app is deleted, so a reinstall — or a
 * phone handed to someone else after the app was removed — would open signed
 * in to the old account without anyone typing a password. AsyncStorage *is*
 * removed with the app, so a missing marker means these tokens belong to an
 * install that no longer exists.
 *
 * The marker is written before the delete: if writing it fails, deleting
 * anyway would sign the person out on every launch.
 */
const discardOrphanedSession = async (): Promise<void> => {
  try {
    if (await AsyncStorage.getItem(INSTALL_MARKER)) return;
    await AsyncStorage.setItem(INSTALL_MARKER, "1");
  } catch {
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    // The local store's keys outlive the app the same way (iOS keeps the
    // keychain), and on a device where only the marker was lost the files
    // are still there too. Everything of the previous install goes: files,
    // media, keys, the register that named them, the active-user marker.
    onFreshInstall?.(),
  ]).catch(() => {});
};

export const loadSession = async (): Promise<StoredSession | null> => {
  await discardOrphanedSession();

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);

  cached = accessToken && refreshToken ? { accessToken, refreshToken } : null;
  return cached;
};

/**
 * Readable once the phone has been unlocked since boot, locked screen
 * included — the background refresh runs against a locked phone and needs
 * them — and never leaving this device: a refresh token restored onto another
 * phone from a backup would be a session nobody signed in to there. SecureStore's
 * default is `WHEN_UNLOCKED`, which the keychain refuses to read in the
 * background and which iCloud carries across devices.
 *
 * An item's accessibility cannot be changed by writing over it, so the old
 * item is removed first; the session is written, not updated, on every save.
 */
const TOKEN_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const writeToken = async (name: string, value: string) => {
  await SecureStore.deleteItemAsync(name).catch(() => {});
  await SecureStore.setItemAsync(name, value, TOKEN_OPTIONS);
};

export const saveSession = async (session: StoredSession): Promise<void> => {
  cached = session;
  await Promise.all([
    writeToken(ACCESS_KEY, session.accessToken),
    writeToken(REFRESH_KEY, session.refreshToken),
  ]);
};

export const clearSession = async (): Promise<void> => {
  cached = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
};

/** Synchronous, for the request path. Null until `loadSession` has run once. */
export const readAccessToken = (): string | null => cached?.accessToken ?? null;

export const readRefreshToken = (): string | null =>
  cached?.refreshToken ?? null;
