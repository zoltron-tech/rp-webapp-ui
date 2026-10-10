# Android: build environment and troubleshooting

The long version of the Android notes: what the build machine needs, and what
each failure actually means. The everyday commands are in the
[package README](../README.md).

Verified end to end on this machine, 2026-09-07: built, installed on a physical device, and
running. Expo SDK 54's autolinking finds the workspace packages without help, but three
environment details have to be right first — the SDK location, the JDK, and (on Windows)
path length. All three produce errors that name something other than the actual cause.

## Before anything builds: the SDK location, and the JDK

**`ANDROID_HOME` must be set, or `android/local.properties` must exist.** Without one of
them `pnpm android` fails in about a second:

```
> SDK location not found. Define a valid SDK location with an ANDROID_HOME environment
  variable or by setting the sdk.dir path in your project's local properties file
```

Android Studio writes `local.properties` when it imports a project; `expo prebuild` does
not, and `expo prebuild --clean` deletes it along with the rest of `android/`. **Set
`ANDROID_HOME` as a user environment variable** — it survives regeneration, and `adb` on
`PATH` (`%ANDROID_HOME%\platform-tools`) is worth having anyway. If you do write
`local.properties` by hand, remember it is a Java `.properties` file: the drive colon and
every backslash need escaping, or the path mangles silently.

```
sdk.dir=C\:\Users\<you>\AppData\Local\Android\Sdk
```

**Use JDK 21. JDK 24 cannot configure the native build.**

```sh
JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.12.101-hotspot" pnpm android
```

On 24, any build that has to *run* a CMake configure dies with:

```
Execution failed for task ':app:configureCMakeDebug[arm64-v8a]'.
> WARNING: A restricted method in java.lang.System has been called
```

That warning is the whole error message, and it is not the real one: AGP runs the native
step as a subprocess and surfaces its stderr verbatim, so the JVM's startup banner is what
you see instead of whatever actually went wrong. Running the same `cmake` command by hand —
it is written out in `app/.cxx/Debug/<hash>/<abi>/metadata_generation_command.txt` —
succeeds, which is how you tell the two apart. Under JDK 21 the identical Gradle task
succeeds.

The reason this looks intermittent: a configure only runs when something changes the native
graph. Adding a library with native code (`react-native-svg`) forces one; ordinary JS edits
do not, so dozens of builds in a row can pass on 24 and then one fails.

Android Studio's **bundled JBR is 25**, newer still than Gradle 8.14.3 supports. Point
*Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK* at 21.

> **Two corrections, recorded because they cost time.** This was first diagnosed as a JDK
> problem, then re-diagnosed as *not* the JDK — a Windows path-length failure hiding behind
> the warning banner — because JDK 24 went on to build the project fine. Both halves were
> half right. The path-length problem was real and is fixed by `node-linker=hoisted` below;
> the JDK problem is also real, and only shows itself on the builds that reconfigure CMake.
> The intervening builds passed because they had nothing to configure.

## The other thing that bites on Windows: path length

The workspace installs with **`node-linker=hoisted`** (see the root `.npmrc`), and on
Windows that is not a preference — it is what makes the app build at all.

pnpm's default layout puts every package under
`.pnpm/<name>@<version>_<hash>/node_modules/<name>/`, adding ~70 characters to every path.
React Native's new architecture compiles C++ from inside those directories, and CMake
refuses object paths longer than 250 characters. What you see when that happens says
nothing about paths:

```
ninja: error: manifest 'build.ninja' still dirty after 100 tries
```

The real message is a CMake *warning* further up: "The object file directory ... has 211
characters. The maximum full path to an object file is 250 characters."

Consequences worth knowing:

- **Keep the checkout path short.** `D:\DEV\NW App\rp-webapp-ui` already spends 27
  characters before anything else. Moving the repo deeper can reintroduce the failure even
  with hoisting on.
- **After changing the install layout, run `expo prebuild --clean`.**
  `android/settings.gradle` records the autolinked module paths as they were at generation
  time; a reinstall that moves them leaves Gradle resolving projects that no longer exist
  (`No matching variant of project :react-native-screens ... No variants exist`).

## Opening it in Android Studio

**Open `apps/mobile/android`, not the repository root.** There is no Gradle project at the
workspace root, so Studio has nothing to import there. `android/` is generated and
gitignored: treat it as build output, never edit it by hand, and re-run
`expo prebuild --clean` after changing `app.json` or adding a native dependency.

**Run it.** Either Studio's Run button with an emulator selected, or:

```bash
cd apps/mobile
pnpm android          # first build ~10-20 min; later ones are much faster
```

The emulator needs an image installed through Studio's Device Manager. The NDK (27.1) and
CMake (3.22.1) download themselves on the first build — that already happened here, and the
debug APK builds in ~2 minutes after that (`android/app/build/outputs/apk/debug/`, ~162MB:
four ABIs plus the dev client, which is normal for a debug build).

**On a physical device, USB debugging is not enough.** Many Android skins (MIUI and
OneUI in particular) also gate sideloading behind a second developer-options switch —
*Install via USB*, sometimes with a confirmation prompt on the phone itself. Without it
`adb install` returns:

```
Failure [INSTALL_FAILED_USER_RESTRICTED: Install canceled by user]
```

which is the phone refusing, not the build being wrong.

## Pointing it at a backend

Metro serves the JS; the API is separate. `10.0.2.2` is how the Android emulator reaches
the host machine's `localhost` — plain `localhost` inside the emulator is the emulator.

| Target | `EXPO_PUBLIC_RP_SERVICE_URL` |
|---|---|
| Local backend, emulator | `http://10.0.2.2:8080` |
| Local backend, physical device | `http://<your-LAN-ip>:8080` (same Wi-Fi) |
| Production | `https://api.novelist.world` |

Cleartext HTTP is allowed in debug builds (`android/app/src/debug/AndroidManifest.xml`), so
the local `http://` URLs work without extra configuration. `../../../LOCAL_DEV.md` covers
running the services; the proxy on `:8080` is what fronts both of them.

## When something goes wrong

| Symptom | Cause |
|---|---|
| `Unable to resolve module @nw/...` | Metro cache. `pnpm start --clear` |
| The app launches on the phone and then never loads | Metro is unreachable from the phone. See "The app opens but never loads" below |
| Red screen: "invalid hook call" | Two copies of React. `metro.config.js` sets `disableHierarchicalLookup` to prevent it — check it survived an edit |
| `configureCMakeDebug` fails with a `java.lang.System` warning | JDK 24. Build with `JAVA_HOME` pointing at 21 — see above |
| Build fails after adding a native dependency | `pnpm exec expo prebuild --clean`, then rebuild |
| `ninja: manifest 'build.ninja' still dirty after 100 tries` | Path length. Check `.npmrc` still has `node-linker=hoisted`, and that the checkout is not deeply nested |
| `No matching variant of project :react-native-screens` | `android/` was generated against a different node_modules layout. `expo prebuild --clean` |
| `INSTALL_FAILED_USER_RESTRICTED` | The phone is refusing the sideload. Enable *Install via USB* in developer options |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | The installed app was signed with a different key. `adb uninstall world.novelist.app` first |
| A release build fails in `createBundleReleaseJsAndAssets` with `Process 'command 'cmd'' finished with non-zero exit value 1` | Gradle is hiding the real error. Run `./gradlew app:createBundleReleaseJsAndAssets` on its own to see it |
| ...and that error is `Unable to resolve module ./../../node_modules/expo-router/entry.js` | Metro's server root drifted back to the workspace root. `metro.config.js` pins `server.unstable_serverRoot` to the app directory — check it survived an edit |
| Every API call 401s | `EXPO_PUBLIC_RP_SERVICE_URL` is wrong, or the backend has no native token mode |
| Everyone shows as offline, chat updates slowly | `EXPO_PUBLIC_SOCKET_URL` is unset or unreachable. This fails silently by design — chat falls back to polling. There is a `console.warn` in development only |
| Every message reads "🔒 This message could not be decrypted." | `EXPO_PUBLIC_CHAT_E2E_SECRET` does not match the web build's `VITE_CHAT_E2E_SECRET` byte for byte |
| A release build behaves as though `.env` were empty — no socket, undecryptable chat — while debug is fine | A `process.env` read Babel could not inline, because its key is not a string literal. See `src/lib/env.ts`, and grep the bundle for the value to confirm |
| A screen's avatars never go green | That screen is not calling `useTrackOnline`. chat-server answers only about usernames the client asked for; an unregistered face is reported offline |
| The composer sits under the keyboard | Something reintroduced `KeyboardAvoidingView`. It cannot work with `edgeToEdgeEnabled` — use `useKeyboardOffset` ([src/hooks/use-keyboard-height.ts](../src/hooks/use-keyboard-height.ts)) |

## The app opens but never loads

The launcher opens the app over the USB cable, so it appears whether or not
Metro can be reached. Fetching the JS bundle is a *second*, separate connection,
and that is the one that fails. The symptom is a splash screen that never
resolves, and — depending on where you are looking — an error that says nothing
useful:

```
Network is unreachable
```

The last line `pnpm android` prints says which address the phone was told to use:

```
› Opening exp+novelist-world://expo-development-client/?url=http%3A%2F%2F172.16.1.193%3A8081
```

An address like that one is the *machine's LAN address*, and the phone has to
reach it over Wi-Fi. It cannot when the phone is on mobile data, on a different
network, or on a guest network with AP isolation — and "Network is unreachable"
is precisely the kernel saying it has no route to that subnet.

The default scripts avoid this entirely by serving on `localhost` and tunnelling
over the cable, so start there:

```bash
adb reverse tcp:8081 tcp:8081     # normally automatic; assert it if in doubt
pnpm android                      # serves on localhost, over USB
```

Worth knowing when diagnosing: the tunnel can be tested from the phone itself,
and answers without involving the app at all.

```bash
adb shell curl -sS http://localhost:8081/status   # → packager-status:running
```

If that answers and the app still hangs, the problem is the bundle rather than
the connection, and Metro's own output will say so.

To check the phone's side of the story:

```bash
adb shell ifconfig | grep -A2 wlan0    # no `inet addr` = not on Wi-Fi at all
```

`pnpm android:lan` is the Wi-Fi path, for when you want the cable out. It needs
the phone and the machine on the same network, and inbound TCP 8081 allowed
through the machine's firewall.

## Release builds: the details

### It is signed with the debug key

`android/app/build.gradle` points the `release` build type at `signingConfigs.debug` —
the checked-in `debug.keystore`, the one every Android machine shares. That is what makes
the two commands above work with no setup, and it is fine for putting a build on your own
phone.

It is **not** publishable: the Play Store will not take an APK signed with the debug key,
and anyone at all can sign an update to it. Before shipping, generate a real keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore novelist-release.keystore   -alias novelist -keyalg RSA -keysize 2048 -validity 10000
```

Keep it and its passwords out of the repository — `~/.gradle/gradle.properties` is the
usual home — and point the `release` signing config at them. Note that `android/` is
generated: a hand edit there survives until the next `expo prebuild --clean` and no
longer, so make it permanent with a config plugin in [plugins/](../plugins/), the way
`with-animated-webp` does.

Changing signing keys changes the APK's identity, so the first install after the switch
has to be a clean one:

```bash
adb uninstall world.novelist.app     # otherwise: INSTALL_FAILED_UPDATE_INCOMPATIBLE
```

### Checking it actually came up

A release build that fails has nowhere to show you a red screen — it just dies. The crash
buffer is where the reason is:

```bash
adb logcat -c                                        # clear first
adb shell am start -n world.novelist.app/.MainActivity
adb shell ps -A | grep novelist                      # still listed = still alive
adb logcat -d -b crash -t 50
```

### The app icon

The icon is the web app's PWA icon, kept in one place and derived from it:
`apps/web/public/icons/android-chrome-384x384.png` is the source, and
[assets/icon.png](../assets/icon.png) and [assets/adaptive-icon.png](../assets/adaptive-icon.png)
are made from that.

Two files rather than one, because Android draws an adaptive icon as two layers and masks
the result — a circle, a squircle, whatever the launcher wants — cropping to a safe circle
that is 66% of the canvas. So:

- `icon.png` is the full plate, used by iOS and by launchers too old for adaptive icons.
  The web icon's rounded corners are transparent; they are flattened onto the plate colour
  here, because iOS rejects icons with an alpha channel and old Android draws transparent
  corners ragged.
- `adaptive-icon.png` is the white mark **only**, on transparency, sized to sit inside the
  safe circle. The green comes from `android.adaptiveIcon.backgroundColor` (`#0e5f4d`,
  sampled from the plate) in [app.json](../app.json). Carrying the green plate in the
  foreground as well leaves a faint seam where its antialiased edge blends against the
  identical colour behind it.

After changing either file, regenerate the `mipmap-*` resources, then rebuild:

```bash
pnpm exec expo prebuild -p android    # not --clean: that deletes android/local.properties too
```
