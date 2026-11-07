const { withAndroidManifest } = require("expo/config-plugins");
const withAlternateAppIcons = require("expo-alternate-app-icons/app.plugin").default;
const icons = require("../assets/app-icons/icons.json");

/**
 * The palette app icons (Edit profile → Appearance → App icon).
 *
 * The icons themselves are `assets/app-icons/`, rendered by
 * `scripts/generate-app-icons.mjs`, which also writes the `icons.json` read
 * here. This only hands them to `expo-alternate-app-icons` in its shape:
 *
 *  - iOS gets each 1024² PNG as an alternate icon set.
 *  - Android gets an `<activity-alias>` per icon, each an adaptive icon of
 *    the palette's lit tile (background) and shadowed mark (foreground), with
 *    the flat white mark as the monochrome layer so Android 13's themed icons
 *    still work.
 *
 * One correction to the library: it copies `android.intentFilters` (the
 * verified story / reset-password / verify-email / login links) onto every
 * alias as well as leaving them on `MainActivity`. With the alias enabled,
 * two components in one app then match the same link, and Android answers a
 * tapped link with a chooser offering "Novelist World" twice. `MainActivity`
 * is never disabled, so the links stay there alone and the aliases keep only
 * their launcher filter. Each alias also takes its icon as `roundIcon`, which
 * launchers built to prefer round icons read first, and which it would
 * otherwise inherit from the application (the default green).
 *
 * A plugin rather than entries in `app.json` because the icon list is
 * generated. See `with-windows-ninja.js`.
 */
/** The flat white mark: a themed icon is tinted by the launcher, so no depth. */
const MONOCHROME = "./assets/adaptive-icon.png";

const isLauncher = (filter) =>
  filter.action?.some(
    (action) => action.$["android:name"] === "android.intent.action.MAIN",
  ) &&
  filter.category?.some(
    (category) =>
      category.$["android:name"] === "android.intent.category.LAUNCHER",
  );

module.exports = function withAppIcons(config) {
  // Mods run newest first, so this one — added before the library's — runs
  // after it, on the aliases it has just written.
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    for (const alias of application?.["activity-alias"] ?? []) {
      alias["intent-filter"] = (alias["intent-filter"] ?? []).filter(isLauncher);
      const icon = alias.$["android:icon"];
      if (icon) alias.$["android:roundIcon"] = icon;
    }
    return config;
  });

  return withAlternateAppIcons(
    config,
    icons.map((icon) => ({
      android: {
        backgroundColor: icon.android.color,
        backgroundImage: icon.android.background,
        foregroundImage: icon.android.foreground,
        monochromeImage: MONOCHROME,
      },
      ios: icon.ios,
      name: icon.name,
    })),
  );
};
