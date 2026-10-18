const fs = require("node:fs");
const path = require("node:path");
const { withDangerousMod } = require("expo/config-plugins");

/**
 * Raises every CocoaPods target to the app's minimum iOS version.
 *
 * Xcode 27 (EAS `"image": "latest"` since mid-October 2026) refuses any
 * target below iOS 15 outright — not the old warning:
 *
 *   error: The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to
 *   9.0, but the range of supported deployment target versions is 15.0 to
 *   27.1.x. (in target 'SDWebImage-SDWebImage' from project 'Pods')
 *
 * Some pods still declare old targets in their podspecs — SDWebImage (9.0),
 * react-native-svg's filters (12.4), AsyncStorage's resource bundle (13.4) —
 * and the app's own minimum does not reach the targets CocoaPods generates
 * for them. So, in the Podfile's `post_install`, any pod target below
 * `MIN_IOS` is lifted to it. Targets already at or above it are untouched.
 *
 * A plugin rather than an edit to `ios/Podfile`, because that file is
 * generated on EAS. See `with-windows-ninja.js`.
 */
const MIN_IOS = "15.1";
const MARKER = "# nw: pod deployment target";

const BLOCK = `
    ${MARKER} (plugins/with-pod-deployment-target.js)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || Gem::Version.new(current) < Gem::Version.new('${MIN_IOS}')
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_IOS}'
        end
      end
    end
`;

module.exports = function withPodDeploymentTarget(config) {
  return withDangerousMod(config, [
    "ios",
    (modConfig) => {
      const podfile = path.join(
        modConfig.modRequest.platformProjectRoot,
        "Podfile",
      );
      const contents = fs.readFileSync(podfile, "utf8");
      if (contents.includes(MARKER)) return modConfig;

      const anchor = /(\n\s*post_install do \|installer\|[^\n]*)/;
      if (!anchor.test(contents)) {
        throw new Error(
          "with-pod-deployment-target: no post_install block in ios/Podfile",
        );
      }
      fs.writeFileSync(
        podfile,
        contents.replace(anchor, (match) => `${match}${BLOCK}`),
      );
      return modConfig;
    },
  ]);
};
