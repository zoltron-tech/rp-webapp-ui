# How the app works

Notes on the parts that are not obvious from the code: the session, and chat.
Setup and build commands are in the [package README](../README.md).

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
| [src/lib/session-store.ts](../src/lib/session-store.ts) | The keychain. Also an in-memory copy, so `getToken()` on every request is not an async keychain round trip |
| [src/lib/api.ts](../src/lib/api.ts) | The client, and the single-flight refresh. Refresh tokens are single-use — two concurrent rotations read as *reuse* server-side and revoke the whole session family, so this is not optional |
| [src/lib/auth.ts](../src/lib/auth.ts) | Sign-in, and keeping what comes back. `@nw/features`' `useLogin` deliberately does not touch storage — it could not run in a browser if it did |

## Chat

Three things are worth knowing before touching it.

**The protocol is shared, the socket is not.** Every frame lives in `@nw/chat`
(`src/socket.ts`) and web re-exports it, because a client that disagrees about a frame fails
*silently* — permanently grey presence, or a message dropped by a `console.error` on a server
nobody is tailing. `apps/web/scripts/socket-protocol-smoke.ts` restates chat-server's own
validators and runs every frame we build through them, on each `pnpm verify`. The *connection
policy* is native-only ([src/context/socket.tsx](../src/context/socket.tsx)): `AppState` instead
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
