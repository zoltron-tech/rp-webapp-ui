import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomBytes } from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/**
 * The key that encrypts a novelist's local database.
 *
 * One key per account, 32 random bytes from the platform CSPRNG, held in the
 * keychain / Keystore under `nw.dbKey.<novelistId>` and nowhere else. It is
 * never logged, never sent, never written into the database it protects.
 *
 * ## Why `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`
 *
 * The background task opens the database while the phone is locked in a
 * pocket. SecureStore's default, `WHEN_UNLOCKED`, refuses reads in exactly that
 * state, so the task would fail every time it mattered. `AFTER_FIRST_UNLOCK`
 * is readable once the phone has been unlocked once since boot — which is
 * also when iOS lets the app read its own files (the container's default
 * protection class is `CompleteUntilFirstUserAuthentication`). `THIS_DEVICE_ONLY`
 * keeps the key out of iCloud and encrypted backups, so the database file
 * (which `allowBackup: false` keeps out of Android backups and which iOS
 * would back up) is unreadable anywhere but this phone.
 *
 * ## The register of keys
 *
 * SecureStore cannot list its items, and the orphaned-install check in
 * `session-store.ts` needs to delete *every* key a previous install left in
 * the keychain — iOS keeps keychain items after the app is gone, and nothing
 * else of the app survives to say which ids they were. So the register of ids
 * lives in the keychain too, as one small item, where the next install can
 * read it, delete each key it names, and then delete the register. After that
 * first launch the keychain holds nothing of ours: the same clean slate an
 * Android uninstall gives for free. The register also serves sign-out and
 * account switch, where the id is known anyway.
 */

const KEY_PREFIX = "nw.dbKey.";
/** The register, in the keychain beside the keys it names. */
const REGISTER = "nw.dbKeys";
/** Where an earlier build kept the register; read once, then removed. */
const LEGACY_REGISTER = "nw.localStore.keys";

const keyName = (userId: string) => `${KEY_PREFIX}${userId}`;

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const parseIds = (raw: string | null): string[] => {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
};

const readRegister = async (): Promise<string[]> => {
  const ids = new Set(parseIds(await SecureStore.getItemAsync(REGISTER).catch(() => null)));
  // An earlier build's register, folded in and removed.
  const legacy = parseIds(await AsyncStorage.getItem(LEGACY_REGISTER).catch(() => null));
  if (legacy.length > 0) {
    for (const id of legacy) ids.add(id);
    await writeRegister([...ids]);
    await AsyncStorage.removeItem(LEGACY_REGISTER).catch(() => {});
  }
  return [...ids];
};

const writeRegister = async (ids: string[]) => {
  try {
    if (ids.length === 0) {
      await SecureStore.deleteItemAsync(REGISTER);
      return;
    }
    await SecureStore.setItemAsync(REGISTER, JSON.stringify(ids), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch {
    // The register is a convenience for cleanup; the key itself is what
    // matters, and it has already been written.
  }
};

/**
 * The key for this account, as 64 hex characters, created on first use.
 *
 * Hex rather than base64 because SQLCipher takes a raw key as `x'…'` and skips
 * its own key derivation, which is both faster to open and the right thing
 * when the key is already random.
 */
export const getOrCreateDatabaseKey = async (userId: string): Promise<string> => {
  const name = keyName(userId);
  const existing = await SecureStore.getItemAsync(name);
  if (existing) return existing;

  const key = toHex(getRandomBytes(32));
  await SecureStore.setItemAsync(name, key, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });

  const register = await readRegister();
  if (!register.includes(userId)) await writeRegister([...register, userId]);

  return key;
};

export const deleteDatabaseKey = async (userId: string): Promise<void> => {
  await SecureStore.deleteItemAsync(keyName(userId)).catch(() => {});
  const register = await readRegister();
  await writeRegister(register.filter((id) => id !== userId));
};

/** Every key the register knows about. Used by the orphaned-install check. */
export const deleteAllDatabaseKeys = async (): Promise<void> => {
  const register = await readRegister();
  await Promise.all(
    register.map((id) => SecureStore.deleteItemAsync(keyName(id)).catch(() => {})),
  );
  await writeRegister([]);
};

export const knownDatabaseUsers = readRegister;
