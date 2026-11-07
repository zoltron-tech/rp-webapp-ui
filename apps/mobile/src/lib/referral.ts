import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Who invited this person, held until they have an account.
 *
 * The native counterpart to web's invite cookie: set when the app is opened
 * from an invite, read by both ways of signing up, and cleared by a sign-up
 * that used it. In storage rather than in a route param so it survives the
 * three screens of registration and the app being closed in between.
 *
 * Only something that could be a username is kept: the same pattern web holds
 * its cookie to.
 */
const KEY = "nw.referralUser";
const USERNAME = /^[a-zA-Z0-9_.-]{1,50}$/;

export const rememberReferral = async (username: string): Promise<void> => {
  const value = username.trim();
  if (!USERNAME.test(value)) return;
  await AsyncStorage.setItem(KEY, value).catch(() => undefined);
};

export const readReferral = async (): Promise<string | null> =>
  AsyncStorage.getItem(KEY).catch(() => null);

export const clearReferral = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY).catch(() => undefined);
};
