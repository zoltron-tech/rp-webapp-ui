const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Lets the native build survive Windows' 260-character path limit.
 *
 * CMake names an object file after the full path of its source, and a library
 * whose C++ lives outside its own Android project gets the whole thing —
 * drive, repo, `node_modules` and all — appended to the build directory:
 *
 *   ninja: error: Stat(reactnativekeyboardcontroller_autolinked_build/…/
 *   RNKCKeyboardBackgroundViewShadowNode.cpp.o): Filename longer than 260
 *   characters
 *
 * The hoisted `node_modules` (see the root `.npmrc`) keeps most libraries
 * under the limit; `react-native-keyboard-controller` is over it on its own.
 * Windows itself has no such limit once long paths are enabled — the Ninja
 * that ships with the Android SDK's CMake (1.10) is what refuses, because it
 * is not built long-path aware. Ninja 1.12 and later are.
 *
 * So: when a newer Ninja is found, the build is pointed at it. It is looked
 * for in `-Pnw.ninja=…`, then `NW_NINJA`, then
 * `%LOCALAPPDATA%\nw-tools\ninja\ninja.exe`, and nothing changes when none
 * of those exist — macOS, Linux and CI build exactly as before.
 *
 * A plugin rather than an edit to `android/app/build.gradle`, because that
 * file is generated. See `with-animated-webp.js`.
 */
const MARKER = "// nw: long-path-aware ninja";

const BLOCK = `
        ${MARKER} (plugins/with-windows-ninja.js)
        def nwNinja = findProperty('nw.ninja') ?: System.getenv('NW_NINJA') ?:
            (System.getenv('LOCALAPPDATA') ? "\${System.getenv('LOCALAPPDATA')}/nw-tools/ninja/ninja.exe" : null)
        if (nwNinja && new File(nwNinja).exists()) {
            externalNativeBuild {
                cmake {
                    arguments "-DCMAKE_MAKE_PROGRAM=\${nwNinja.replace('\\\\', '/')}",
                        "-DCMAKE_OBJECT_PATH_MAX=1024"
                }
            }
        }
`;

module.exports = function withWindowsNinja(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    const contents = gradleConfig.modResults.contents;
    if (contents.includes(MARKER)) return gradleConfig;

    const anchor = /(\n\s*defaultConfig\s*\{[^\n]*)/;
    if (!anchor.test(contents)) {
      throw new Error(
        "with-windows-ninja: no defaultConfig block in app/build.gradle",
      );
    }
    gradleConfig.modResults.contents = contents.replace(
      anchor,
      (match) => `${match}${BLOCK}`,
    );
    return gradleConfig;
  });
};
