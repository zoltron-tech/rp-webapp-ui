import { ACCENT_MAP, type Accent } from "@nw/types/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { APP_ICON_PREVIEWS } from "@/lib/app-icon-previews";

/**
 * The home-screen icon: one per palette, picked in Edit profile → Appearance.
 *
 * The icons are in the binary (`plugins/with-app-icons.js`); this only says
 * which one is showing. iOS swaps it with `setAlternateIconName` and shows its
 * own "You have changed the icon" alert, which cannot be hidden. Android
 * enables one `<activity-alias>` and disables the rest, which some launchers
 * answer by closing the app — the picker warns before a manual change.
 *
 * "Match theme color" is a setting of this phone, not of the account, so it
 * lives in AsyncStorage. It follows a colour picked on the Appearance screen
 * and nothing else: a palette changed on web would otherwise change the icon
 * the next time the app opened, alert and all, with nobody having asked.
 *
 * Required on demand, so a build made before the module was added still
 * opens — the picker is simply not offered there. See `app-update-prompt.tsx`.
 */

type Native = typeof import("expo-alternate-app-icons");

const native: Native | null = (() => {
  try {
    const module: Native = require("expo-alternate-app-icons");
    return module.supportsAlternateIcons ? module : null;
  } catch {
    return null;
  }
})();

export const appIconsSupported = native !== null;

/**
 * Every icon, in palette order. Jade (0) is the default icon — its tile is the
 * brand green, which is not quite jade's `surface` — rather than an alternate.
 */
export const APP_ICONS = (Object.keys(ACCENT_MAP).map(Number) as Accent[]).map(
  (palette) => ({
    label: palette === 0 ? "Default" : ACCENT_MAP[palette],
    palette,
    preview: APP_ICON_PREVIEWS[palette],
  }),
);

/** The native name: the accent in PascalCase, as the plugin registers it. */
const nativeName = (palette: Accent) => {
  if (palette === 0) return null;
  const name = ACCENT_MAP[palette];
  return name[0].toUpperCase() + name.slice(1);
};

const paletteOf = (name: string | null): Accent => {
  const key = name?.toLowerCase();
  const entry = Object.entries(ACCENT_MAP).find(([, value]) => value === key);
  return entry ? (Number(entry[0]) as Accent) : 0;
};

const MATCH_KEY = "nw.appIcon.matchPalette";

type State = {
  /** The palette whose icon is on the home screen. */
  icon: Accent;
  /** The palette being switched to, while the native call runs. */
  switching: Accent | null;
  match: boolean;
};

let state: State = {
  icon: native ? paletteOf(native.getAppIconName()) : 0,
  match: false,
  switching: null,
};
const listeners = new Set<() => void>();

const update = (next: Partial<State>) => {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
};

void AsyncStorage.getItem(MATCH_KEY)
  .then((value) => {
    if (value !== null) update({ match: value === "true" });
  })
  .catch(() => undefined);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useAppIcon = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

/** Puts `palette`'s icon on the home screen. False when it did not change. */
export const setAppIcon = async (palette: Accent): Promise<boolean> => {
  if (!native) return false;
  if (palette === state.icon && state.switching === null) return true;
  update({ switching: palette });
  try {
    await native.setAlternateAppIcon(nativeName(palette));
    // Read back rather than assumed: Android swallows a failed switch.
    update({ icon: paletteOf(native.getAppIconName()), switching: null });
    return state.icon === palette;
  } catch {
    update({ switching: null });
    return false;
  }
};

export const setMatchPalette = (match: boolean) => {
  update({ match });
  void AsyncStorage.setItem(MATCH_KEY, String(match)).catch(() => undefined);
};

/** Called once a theme colour has saved: follows it when matching is on. */
export const followPalette = (palette: Accent) => {
  if (state.match) void setAppIcon(palette);
};
