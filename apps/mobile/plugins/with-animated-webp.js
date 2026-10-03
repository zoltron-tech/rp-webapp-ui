const { withGradleProperties } = require("expo/config-plugins");

/**
 * Turns on animated WebP decoding in the Android build.
 *
 * Expo's template sets `expo.webp.animated=false`, and the reason it gives is
 * about iOS rather than Android: iOS has no animated-WebP support, so the
 * default is off everywhere for consistency.
 *
 * That default makes a whole class of profile content invisible here. People
 * paste Discord emoji into their About, and Discord serves those as
 * `…/emojis/<id>.webp?size=80&animated=true`. Without the decoder Fresco
 * cannot read the file at all, so the image does not render small or broken —
 * it renders as nothing, which looks like a bug in the rich-text renderer
 * rather than a missing codec.
 *
 * Costs about 3.4 MB of APK. That is real, and it buys back every animated
 * emoji and sticker in every profile on Android.
 *
 * A plugin rather than an edit to `android/gradle.properties`, because that
 * file is generated: `expo prebuild --clean` rewrites it, and the setting would
 * silently revert on the next person's machine.
 *
 * iOS is untouched and still cannot animate these; there they fall back to
 * however the platform handles the first frame.
 */
module.exports = function withAnimatedWebp(config) {
  return withGradleProperties(config, (gradleConfig) => {
    const properties = gradleConfig.modResults;
    const existing = properties.find(
      (entry) => entry.type === "property" && entry.key === "expo.webp.animated",
    );

    if (existing) {
      existing.value = "true";
    } else {
      properties.push({
        key: "expo.webp.animated",
        type: "property",
        value: "true",
      });
    }

    return gradleConfig;
  });
};
