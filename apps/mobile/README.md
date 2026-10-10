# @nw/mobile

The Novelist World app for iOS and Android. **Expo SDK 54 + expo-router**, sharing
`@nw/api`, `@nw/chat`, `@nw/features`, `@nw/store`, `@nw/theme`, `@nw/types` and
`@nw/utils` with [the web app](../web/README.md). See
[the workspace README](../../README.md) for the monorepo.

- [Quick start](#quick-start)
- [Two kinds of build](#two-kinds-of-build)
- [Configuration (`.env`)](#configuration-env)
- [Development builds](#development-builds)
- [Release builds](#release-builds)
- [Command reference](#command-reference)
- [When something goes wrong](#when-something-goes-wrong)
- [Where things are](#where-things-are)

More detail lives in [docs/](docs/):

| Doc | What it covers |
| --- | --- |
| [docs/README.md](docs/README.md) | First-time device setup for iOS and Android, step by step |
| [docs/android.md](docs/android.md) | Android build environment (SDK, JDK, Windows path length), every known failure, signing, the app icon |
| [docs/architecture.md](docs/architecture.md) | How the session and chat work |

## Quick start

```bash
pnpm install                 # from the repository root (rp-webapp-ui)
cd apps/mobile
cp .env.example .env         # then fill it in — see "Configuration"
```

Then pick a platform under [Development builds](#development-builds).

**Expo Go cannot run this app.** It uses native modules (the keychain, the
keyboard controller, video) that Expo Go does not ship.

## Two kinds of build

| | Development build | Release build |
| --- | --- | --- |
| JavaScript | Loaded from Metro on your PC | Compiled into the app |
| Needs your PC running | Yes | No |
| Picks up a code change | Instantly | Only by building again |
| Use it for | Writing code | Testing through the day, sharing, the stores |

Both use the same app id (`world.novelist.app`), so **installing one replaces the
other** on a phone.

## Configuration (`.env`)

Every setting is an `EXPO_PUBLIC_*` variable, **baked into the JavaScript at build
time**. [.env.example](.env.example) lists them with comments.

| Variable | Without it |
| --- | --- |
| `EXPO_PUBLIC_RP_SERVICE_URL` | Falls back to `https://api.novelist.world` |
| `EXPO_PUBLIC_SOCKET_URL` | No live chat: messages arrive by polling, everyone shows offline |
| `EXPO_PUBLIC_CHAT_E2E_SECRET` | Every message reads "could not be decrypted". Must equal the web build's `VITE_CHAT_E2E_SECRET` |
| `EXPO_PUBLIC_CHAT_E2E_ENABLED` | Chat encryption is off |
| `EXPO_PUBLIC_RP_BUCKET_NAME` | Images download at full size |
| `EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME` | Falls back to `novelistworld` (must match `scheme` in `app.json`) |
| `EXPO_PUBLIC_DISCORD_INVITE_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_WEB_URL` | Those links are missing, or point at production |

Three rules that have each cost a day:

1. **`.env` is gitignored, so cloud builds never see it.** EAS builds read their
   values from the Expo project instead — see
   [EAS environment variables](#eas-environment-variables). A cloud build made
   without them logs in fine (the API URL has a fallback) and then has no chat.
2. **A local build reads `.env` from disk** when it bundles. Change `.env`, build
   again.
3. **A new variable must be added to [src/lib/env.ts](src/lib/env.ts) by its full
   name.** Babel only replaces `process.env.EXPO_PUBLIC_NAME` when the name is
   written out literally; a name assembled at runtime works in development and is
   empty in release.

Release builds refuse plain `http://`. Point them at an `https://` backend.

## Development builds

The native shell is installed once; after that only Metro needs to run. Rebuild
the shell only when native code changes: a new native module, an `app.json`
plugin, an SDK upgrade.

### Android (built on this machine)

Needs the Android SDK, **JDK 21** and a phone with USB debugging on (plus
*Install via USB* on Xiaomi/MIUI). Details: [docs/android.md](docs/android.md).

```bash
adb devices -l               # the phone should read "device"
pnpm exec expo prebuild      # first time only: generates android/
pnpm android                 # build, install, start Metro
```

Every day after that:

```bash
pnpm start                   # Metro over the USB cable
```

The bundle travels down the cable (`adb reverse`), so it works on any network.

### iOS (built in the cloud, no Mac needed)

Needs an Apple Developer membership, an Expo account, and the iPhone registered
with `eas device:create`. First-time steps: [docs/README.md](docs/README.md).

```bash
eas build --profile development --platform ios
```

Scan the QR code from the finished build to install, then turn on Developer Mode
(Settings > Privacy & Security). Every day after that:

```bash
pnpm start:lan               # Metro over Wi-Fi: phone and PC on the same network
```

## Release builds

A release build runs with the PC switched off.

### Android: build locally, install over USB

A minute or two once the machine has built it before; much longer the first
time. Uses `.env` from disk.

```bash
cd apps/mobile/android
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/release/app-release.apk
```

- The APK is `android/app/build/outputs/apk/release/app-release.apk`. Copy it to
  any Android phone to share it.
- `-PreactNativeArchitectures=arm64-v8a` builds for real phones only: about
  45MB instead of about 125MB. Drop it for an emulator.
- `adb install -r` keeps the app's data. If it answers
  `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, the installed copy was signed with another
  key: `adb uninstall world.novelist.app`, then install again.
- A Gradle build stops a running Metro. Restart it afterwards.
- This APK is signed with the **debug key**: fine for your own phones, not
  accepted by the Play Store. See
  [docs/android.md](docs/android.md#it-is-signed-with-the-debug-key).

One command that builds, installs and opens it:

```bash
pnpm exec expo run:android --variant release --device
```

### Android: build in the cloud

For an APK you can hand to someone as a link, without a build machine:

```bash
eas build --profile preview --platform android
```

### iOS: build in the cloud

```bash
eas build --profile preview --platform ios
```

Fifteen to forty minutes on the free tier. Open the build's link (or scan its QR
code) on the iPhone to install. It installs only on iPhones registered with
`eas device:create`; register a new one, then build again.

### EAS environment variables

Cloud builds take `EXPO_PUBLIC_*` from the Expo project, not from `.env`.
[eas.json](eas.json) ties each profile to an environment of the same name:

| Profile | Environment | Produces |
| --- | --- | --- |
| `development` | `development` | Dev client (needs Metro) |
| `preview` | `preview` | Release build for your own devices |
| `production` | `production` | Store build |

Set the values once, in either place:

- **Website:** expo.dev > the project > *Environment variables*. Add each
  variable from `.env`, tick the environments it applies to, and choose
  *Plain text* or *Sensitive* (not *Secret*: these values end up inside the app).
- **Command line:**

  ```bash
  eas env:push --environment preview --path .env
  eas env:list --environment preview
  ```

Values only reach builds made **after** they are set.

### For the stores

```bash
eas build --profile production --platform ios        # then: eas submit -p ios
eas build --profile production --platform android    # then: eas submit -p android
```

Not done yet: Android needs a real signing key first, and the `production`
environment needs its variables.

### Checking a release build

A release build has no red error screen. If it closes on launch:

```bash
adb logcat -c
adb shell am start -n world.novelist.app/.MainActivity
adb logcat -d -b crash -t 50
```

To see whether a value made it into a local Android build:

```bash
grep -c "nw-chat-server" \
  android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle
```

Zero means it did not.

## Command reference

From `apps/mobile` unless a path is shown.

| Command | Does |
| --- | --- |
| `pnpm start` | Metro over USB (Android) |
| `pnpm start:lan` | Metro over Wi-Fi (iPhone, or Android without the cable) |
| `pnpm start --clear` | Metro with its cache emptied |
| `pnpm android` | Build + install the Android dev build, start Metro |
| `pnpm exec expo prebuild` | Regenerate `android/` after an `app.json` or native change |
| `pnpm type-check` | TypeScript |
| `./gradlew app:assembleRelease` (in `android/`) | Android release APK |
| `./gradlew app:assembleDebug` (in `android/`) | Android dev APK, without starting Metro |
| `adb install -r <apk>` | Install an APK, keeping app data |
| `adb devices -l` | List attached phones |
| `eas build --profile development --platform ios` | iOS dev build |
| `eas build --profile preview --platform ios` | iOS release build for registered iPhones |
| `eas build --profile preview --platform android` | Android release APK, in the cloud |
| `eas device:create` | Register an iPhone |
| `eas env:list --environment preview` | What a `preview` build will be given |

## When something goes wrong

| Symptom | Cause |
| --- | --- |
| Release build: logged in, but no live chat and messages will not decrypt | The build had no `EXPO_PUBLIC_*` values. Cloud build: set [EAS environment variables](#eas-environment-variables) and rebuild. Local build: check `.env` |
| App opens, then sits on the splash screen | The dev build cannot reach Metro. Android: `pnpm start` with the cable in. iPhone: `pnpm start:lan`, same Wi-Fi, allow *Local Network* |
| A code change does not show up | A release build is installed: it ignores Metro. Install the dev build again |
| `INSTALL_FAILED_USER_RESTRICTED` | The phone refused the install. Turn on *Install via USB* in developer options |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Signed with a different key. `adb uninstall world.novelist.app` first |
| `Unable to resolve module @nw/...` | Metro cache. `pnpm start --clear` |
| Android build fails with a `java.lang.System` warning | Wrong JDK. Use 21 |
| iPhone: "No development servers found" | Different Wi-Fi, firewall blocking 8081, or Metro started without `:lan` |
| iPhone: the build will not install | The phone is not registered (`eas device:create`), or Developer Mode is off |

The full Android list, with the reasons, is in
[docs/android.md](docs/android.md#when-something-goes-wrong).

## Where things are

```
app/                    expo-router: the file tree is the route tree
  _layout.tsx           providers and the root stack
  (tabs)/               the signed-in shell: home, explore, inbox,
                        interactions, notifications, profile
  login.tsx, register/  signing in and up
  menu.tsx              the user menu
  edit-profile/, edit-muse/, library.tsx, story/
src/
  components/           everything drawn, by feature
  screens/              screens shared by more than one route
  context/              the chat socket, tab bar, overlays
  hooks/                data and device hooks
  lib/                  api client, session, env, uploads
  theme/                @nw/theme tokens mapped onto React Native
plugins/                Expo config plugins (changes to android/ that must survive prebuild)
eas.json                cloud build profiles
```

`android/` (and `ios/`) are generated by `expo prebuild` and gitignored: do not
edit them by hand.
