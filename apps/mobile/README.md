# @nw/mobile

The Novelist World app for iOS and Android. **Expo SDK 54 + expo-router**, sharing
`@nw/api`, `@nw/features`, `@nw/store`, `@nw/theme`, `@nw/types` and `@nw/utils` with
[the web app](../web/README.md) — see [the workspace README](../../README.md).

Phase 2 of `MONOREPO_MIGRATION_PLAN.md`: one real loop — open, sign in, see novelists,
check notifications, look at your profile, sign out. Everything else is a later phase.

## Running it

**A dev build, not Expo Go.** `expo-secure-store` is a native module and the session lives
in it, so Expo Go cannot run this app at all.

```bash
pnpm install                 # from the repository root
cd apps/mobile
cp .env.example .env         # then edit — see below
pnpm exec expo prebuild      # generates android/ (and ios/), both gitignored
pnpm android                 # builds, installs, and starts Metro
pnpm start                   # Metro alone, once the app is installed
```

Both serve Metro on `localhost` and reach the phone through the USB cable
(`adb reverse`), which is why they work on a device that is on mobile data, on a
different Wi-Fi, or behind AP isolation. `pnpm start` gets there with `expo
start --localhost`; `expo run:android` has no such flag, so `pnpm android` goes
through [scripts/run-android.mjs](scripts/run-android.mjs), which sets
`REACT_NATIVE_PACKAGER_HOSTNAME` — the only lever that command exposes, and one
that cannot be set inline in an npm script on Windows.

The alternative — Metro on the machine's LAN address, which the phone fetches
over Wi-Fi — is `pnpm android:lan` and `pnpm start:lan`, and it needs the phone
and the machine on the same network with inbound port 8081 open.

If the app launches on the phone and then sits there without loading, that is
almost always the LAN path failing. See "The app opens but never loads" below.

Configuration is `EXPO_PUBLIC_*` environment variables in `.env`, read through
[src/lib/env.ts](src/lib/env.ts) — the same discipline as the web app's `VITE_` prefix and
the same guarantee: nothing without the prefix reaches the bundle. `.env.example` lists
them.

**Adding one means editing `env.ts` as well, not just `.env`.** "Inlined at build time" is
literal: `babel-preset-expo` substitutes the value wherever it finds a `process.env` read
whose key is a *string literal*, and nowhere else. Assemble the name at runtime — a
template literal, a variable, anything but a literal — and the plugin matches nothing and
leaves the read standing. It then returns undefined in a release build, because a release
bundle has no `process.env` behind it, while the dev bundle does. The variable therefore
works in every test and is empty on the installed app. That is why `env.ts` spells each
name out in full.

## Testing on Android

Verified end to end on this machine, 2026-09-07: built, installed on a physical device, and
running. Expo SDK 54's autolinking finds the workspace packages without help, but three
environment details have to be right first — the SDK location, the JDK, and (on Windows)
path length. All three produce errors that name something other than the actual cause.

### Before anything builds: the SDK location, and the JDK

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

### The other thing that bites on Windows: path length

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

### Opening it in Android Studio

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

### Pointing it at a backend

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

### What works right now, and what will not

**Sign-in needs the user-service change from MONOREPO_MIGRATION_PLAN §11.** It is written
and compiles, but until it is running on whatever backend you point at, `/account/login`
returns no tokens for a native client and the app says exactly that:

> The server did not return a session for this client. Native token mode is not enabled on
> the API yet.

That message is the app working correctly. To get past it, run a local backend built from
the current `rp-webapp-service` working tree, or deploy the change.

Without a backend at all you can still check the landing screen, navigation, the theme in
both light and dark, and that the login form validates — that is the whole of the app's
public surface.

**A test pass worth doing, in order:**

1. App opens on `/novelists` — the landing screen, no session needed.
2. Switch the emulator between light and dark mode. Colours come from `@nw/theme`, the same
   values the web app renders.
3. *Sign in* → the login form. Submit with a wrong password: one message, no detail (the
   API answers the same for "no such account" and "wrong password", deliberately).
4. Sign in properly → lands on the Novelists tab. Scroll: it pages 20 at a time and stops
   at 80 — both rules live in `useNovelistLeaderboard`, shared with web.
5. Notifications tab → same list the web page shows, same pagination.
6. Profile tab → your own novelist, from the session that was already fetched.
7. ≡ → the menu sheet → *Sign out*. It should return to the landing screen, and killing and
   reopening the app should keep you signed out (the keychain is cleared).
8. Sign in again, force-quit, reopen → still signed in, with no login screen. That is the
   keychain and the single-flight refresh doing their job.

### When something goes wrong

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
| The composer sits under the keyboard | Something reintroduced `KeyboardAvoidingView`. It cannot work with `edgeToEdgeEnabled` — use `useKeyboardOffset` ([src/hooks/use-keyboard-height.ts](src/hooks/use-keyboard-height.ts)) |

### The app opens but never loads

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


## Releasing it: a signed APK on a real phone

A release build is a different thing from the debug build above, in the way that matters
most for testing: **the JS is compiled into the APK**. Nothing is fetched from Metro, so
the phone needs no cable, no Wi-Fi and no dev server once it is installed — and every
`EXPO_PUBLIC_*` value is frozen into the bundle at build time, so changing `.env` means
building again.

### Before you build

1. **Point `.env` at the backend you actually want.** `EXPO_PUBLIC_RP_SERVICE_URL` is
   baked in. Release builds also forbid cleartext HTTP — the exception lives in
   `android/app/src/debug/AndroidManifest.xml` and applies to debug only — so a
   `http://10.0.2.2:8080` or LAN address fails in release even though it works in debug.
   Use `https://api.novelist.world` unless you have a local backend behind TLS.
   To see what a build actually froze in, grep the bundle for the value itself:

   ```bash
   grep -c 'nw-chat-server' \
     android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle
   ```

   Zero means the value never reached the bundle — see the note on `env.ts` above.
2. **Enable sideloading on the phone.** USB debugging is not enough on MIUI/HyperOS or
   OneUI: *Install via USB* is a second switch, and MIUI may want a signed-in Mi account
   before it will let you flip it. Without it the install ends in
   `INSTALL_FAILED_USER_RESTRICTED`.
3. **Check the device is there:** `adb devices -l` should list it as `device`, not
   `unauthorized` (accept the RSA prompt on the phone) or `offline`.

### Build and install

```bash
cd apps/mobile/android
./gradlew app:assembleRelease -x lint -x test -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/release/app-release.apk
```

`-PreactNativeArchitectures` is worth passing. Left out, the APK carries native libraries
for all four ABIs; `arm64-v8a` alone covers every Android phone sold in the last several
years and lands at ~47MB. Drop the flag when you need an APK that also runs on an x86
emulator.

Or in one step, which builds, installs and launches:

```bash
cd apps/mobile
pnpm exec expo run:android --variant release --device
```

The output is `android/app/build/outputs/apk/release/app-release.apk`. For the Play Store
it is `./gradlew app:bundleRelease` instead, which produces an `.aab`.

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
longer, so make it permanent with a config plugin in [plugins/](plugins/), the way
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
[assets/icon.png](assets/icon.png) and [assets/adaptive-icon.png](assets/adaptive-icon.png)
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
  sampled from the plate) in [app.json](app.json). Carrying the green plate in the
  foreground as well leaves a faint seam where its antialiased edge blends against the
  identical colour behind it.

After changing either file, regenerate the `mipmap-*` resources, then rebuild:

```bash
pnpm exec expo prebuild -p android    # not --clean: that deletes android/local.properties too
```


## How the session works, and why it differs from web

The web app holds nothing: both tokens are httpOnly cookies the browser attaches itself.
A phone has a cookie jar, but not one the app can inspect, back up, or migrate — so the
tokens live in the platform keychain (`expo-secure-store`) and travel as headers.

That is the *only* difference between the two API clients. Both call `createApiClient`
from `@nw/api`; this one passes `getToken`, turns `withCredentials` off, and identifies
itself with `X-NW-Client: native`, which is what makes user-service return the token pair
in the response body instead of only setting cookies.

Three files, and they are the ones to read first:

| File | What it owns |
|---|---|
| [src/lib/session-store.ts](src/lib/session-store.ts) | The keychain. Also an in-memory copy, so `getToken()` on every request is not an async keychain round trip |
| [src/lib/api.ts](src/lib/api.ts) | The client, and the single-flight refresh. Refresh tokens are single-use — two concurrent rotations read as *reuse* server-side and revoke the whole session family, so this is not optional |
| [src/lib/auth.ts](src/lib/auth.ts) | Sign-in, and keeping what comes back. `@nw/features`' `useLogin` deliberately does not touch storage — it could not run in a browser if it did |

## What is not here yet

Not oversights — each is scheduled, and each is a phase because it is a real piece of work:

- **Social sign-in needs the matching user-service.** [src/lib/oauth.ts](src/lib/oauth.ts)
  runs PKCE with a one-time code: the `novelistworld://oauth` redirect carries a code, never
  tokens, and the app exchanges it at `/account/oauth/native/token` (`NativeOAuthService` in
  user-service). Against an API without that change the sheet ends on the web callback page
  and never returns to the app. The password path works against either.
- **Registration and onboarding** — Phase 9. `/login?mode=register` says so rather than
  showing a form it cannot finish.
- **Composing anything but plain text.** Replies, reactions, attachments and mentions are
  *rendered* but cannot be *sent* — each needs its own picker, and mentions need the editor
  (Phase 10). Incoming reactions and edits are applied live.
- **Group creation, ice breakers, message reporting, editing your own message.**
- **Profile editing and media upload** — Phase 4, the first write path.
- **Push notifications** — Phase 10. The socket keeps chat live while the app is open or
  backgrounded-but-alive; a killed app receives nothing.
- **Rich-text composing.** Rich text *renders* (`@nw/richtext`) everywhere it does on web;
  the 6,798-line `contenteditable` editor has no RN equivalent (`§4.3`).

## Layout

```
app/                    expo-router. File tree is the route tree.
  _layout.tsx           providers: store, react-query, ApiProvider, crypto, socket
  index.tsx             where the app opens — session decides
  novelists.tsx         public landing (no session, no fetching)
  login.tsx             password sign-in + OAuth buttons
  menu.tsx              user menu, presented as a modal
  (tabs)/_layout.tsx    the signed-in shell, its auth gate and the unread badge
  (tabs)/(home)/        novelists list, then profiles/friends/muses inside the tab
  (tabs)/(inbox)/       inbox, conversation, conversation details
  (tabs)/notifications.tsx
  (tabs)/profile.tsx    own profile
src/
  context/socket.tsx    the chat-server socket: tickets, backoff, presence, cache writes
  hooks/                keyboard offset, chat send (socket with a REST fallback)
  lib/                  api client, session storage, auth, oauth, env, chat crypto
  theme/                @nw/theme tokens mapped onto React Native
  components/           Avatar, ListStatus, RichText, badges, profile, chat/
metro.config.js         workspace symlinks + a single React. Read the comments
```

## Chat

Three things are worth knowing before touching it.

**The protocol is shared, the socket is not.** Every frame lives in `@nw/chat`
(`src/socket.ts`) and web re-exports it, because a client that disagrees about a frame fails
*silently* — permanently grey presence, or a message dropped by a `console.error` on a server
nobody is tailing. `apps/web/scripts/socket-protocol-smoke.ts` restates chat-server's own
validators and runs every frame we build through them, on each `pnpm verify`. The *connection
policy* is native-only ([src/context/socket.tsx](src/context/socket.tsx)): `AppState` instead
of visibility, and backoff instead of web's "any click re-checks the connection", because
Android drops sockets during doze with no close frame.

**Presence must be registered.** chat-server does not push a presence list — it answers only
about the usernames the client last asked about. Any screen showing avatars calls
`useTrackOnline(usernames)`; one that forgets shows everybody as offline, which looks exactly
like everybody being offline.

**Send over the socket.** chat-server persists *and broadcasts*; the REST endpoint only
persists, so a REST-sent message reaches the other person on their next poll.
`useSendChatMessage` prefers the socket and falls back to REST when it is down. Two things
have no REST path at all and so are socket-only: **attachments** (`POST .../sendMessage`
takes a message body and nothing else, so a fallback would send the caption without the
pictures) and **reactions** (there is no backend route — chat-server owns the whole flow).
The screens hide those controls while the socket is down rather than offering ones that
silently do nothing.

### Gestures, without a gesture library

Swipe-to-reply on a bubble, swipe actions on an inbox row, and every draggable tray are
`PanResponder` + `Animated` from React Native itself. `react-native-gesture-handler` and
`reanimated` are the usual answer and both are native modules, so adopting them means every
developer and every device rebuilds the dev client before the app runs again — a real cost
for a vertical drag with a velocity threshold. The one thing the JS responder cannot do is
arbitrate between a drag and a scroll in the same direction, which is why every tray confines
its drag to a header strip and lets the content below it scroll normally.

### Typing formatting

There is no toolbar and no `contenteditable`. The composer reads `**bold**`, `*italic*`,
`~~strike~~` and `` `code` `` and converts them to the same HTML web's editor would have
saved, via `@nw/chat/markdown` — because what a message *contains* is a fact the two clients
have to agree on. Plain text is sent plain: wrapping every message in `<div>` would stop
`isMediaOnlyMessage` recognising a bare GIF URL and would change what the inbox preview says.

The field shows it formatted as you type: `**bold**` is bold in the box, with the asterisks
left on screen in grey so it is clear what they are and how to remove them. React Native's
only mechanism for that is `<Text>` children, and the trap is that they cannot be combined
with a `value` prop — Android's `TextInput` asserts `Cannot specify both value and children`
and takes the app down on the first keystroke. So `MarkdownInput` is driven by its children
alone; the draft still lives in state and still flows one way. The tokens must reproduce the
typed string exactly, which is why `tokenizeMarkdown` is lossless: what it returns is not a
description of the text, it *is* the text.

For people who do not type asterisks there is a format row (B / I / S / `) above the field
while it has focus. It wraps the selection, unwraps it on a second tap, and places the caret
where an editor would.

### Native modules the chat needs

`expo-image-picker` (attachments), `expo-file-system` (the presigned S3 upload, via
`uploadAsync` — `fetch` cannot send a `file://` URI as a request body), `expo-clipboard`
(copying a message) and `expo-video` (clips and attached MP4s, played inline and muted the
way web plays them). All four are native, so **`pnpm android` has to rebuild** after pulling
these changes; Metro alone will start and then fail to find the modules.

`react-native-webview` joins them, for one screen: the profile's featured song. A Spotify
track is played by Spotify's own IFrame embed inside a 1×1 hidden web view
(`src/components/spotify-embed.tsx`), driven by the same `togglePlay` / `seek` calls the web
app makes — so a listener gets a full track when signed in to Spotify and a 30-second
preview otherwise, identically on both clients. The alternatives were worse: App Remote
hands playback to the installed Spotify app, and the Web Playback SDK is Premium-only and
needs a per-listener OAuth token. Library uploads need none of this — they are a URL, and
`expo-video`'s player takes an audio URL as happily as a video one.

The clip *picker* needs none of them: Klipy returns an animated `webp`/`gif` preview
alongside the `mp4`, `expo.webp.animated` is already on for Android, and a soundless looping
preview is exactly what the web picker shows before you press play.

In the thread, a clip gets `clip-player.tsx` — a drawn scrubber, clock and mute toggle
rather than `nativeControls`, which is sized for a video that owns the screen and covers the
picture inside a bubble. It autoplays muted and loops; the speaker button is the control
that matters, so it is always visible rather than hidden behind a tap.

Which messages are "media only" — the ones that render bare, with no bubble around them —
is decided by `@nw/chat`: `isMediaOnlyMessage` for a lone image and `isVideoOnlyMessage` for
a lone clip. Web only needs the first, which is why the second was missing and a sent clip
played *and* printed its own `.mp4` URL underneath itself.
