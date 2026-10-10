import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

/**
 * A Spotify track, played inside the app.
 *
 * Web plays these through Spotify's IFrame API: it creates a 1×1 embed
 * off-screen and drives it with `togglePlay` / `seek`, so only our own pill is
 * ever visible (`components/profile-song/spotify-iframe-api.ts`). This is the
 * same thing, in the only place a phone can run it — a `WebView` holding the
 * same embed, with the same three calls crossing the bridge instead of a
 * function call.
 *
 * ## Why not the Spotify SDKs
 *
 * There are two, and neither fits:
 *
 *  - **App Remote** (iOS/Android native) is a remote control for the Spotify
 *    *app*: the listener must have Spotify installed and signed in, and it
 *    hands playback to that app rather than playing here.
 *  - **Web Playback SDK** streams in-process, but it is Premium-only and needs
 *    an OAuth access token per listener — an authorisation flow, a client
 *    secret and a token refresh, for one pill on a profile.
 *
 * The IFrame embed needs none of that, and it is what web already ships, so
 * both clients get the same behaviour from the same source: a full track for a
 * listener signed in to Spotify in that web context, a 30-second preview for
 * everyone else. Nothing about that is ours to change from here.
 *
 * ## The parts that are not obvious
 *
 * - **`baseUrl`.** Inline HTML loads as `about:blank`, and a null origin breaks
 *   the embed's `postMessage` handshake. Loading it *as* `open.spotify.com`
 *   gives the script the origin it expects.
 * - **`mediaPlaybackRequiresUserAction={false}`.** The tap happens in React
 *   Native and reaches the page as injected JavaScript, which is not a user
 *   gesture as far as the web view is concerned. Without this the first
 *   `togglePlay` is refused and the button appears dead.
 * - **`allowsInlineMediaPlayback`.** iOS otherwise hands media to the
 *   full-screen native player, which is precisely the chrome web hides.
 * - **1×1 and transparent, not `display: none`.** A view with no box is not
 *   guaranteed to keep running; a pixel is.
 */

const ORIGIN = "https://open.spotify.com";

/** Positions and durations arrive in milliseconds; everything above wants seconds. */
const MS = 1000;

/**
 * A Spotify track id: 22 base-62 characters.
 *
 * The id is written into the page's inline script, and it comes from another
 * novelist's profile, which the API stored as sent. Anything that is not an id
 * never reaches the page — otherwise a crafted "track id" is script running in
 * every listener's web view.
 */
const TRACK_ID = /^[A-Za-z0-9]{22}$/;

/** The only top-level pages this web view may show. */
const SPOTIFY_PAGE =
  /^(about:blank|https:\/\/([a-z0-9-]+\.)*spotify\.com([/?#]|$))/i;

interface EmbedState {
  /** The embed has loaded and will accept commands. */
  ready: boolean;
  playing: boolean;
  /** Seconds. */
  position: number;
  /** Seconds. `0` until the first playback update arrives. */
  duration: number;
  /** The page or the script failed; the caller should offer Spotify itself. */
  failed: boolean;
}

const page = (trackId: string) => `<!doctype html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;background:transparent;overflow:hidden">
    <div id="host"></div>
    <script>
      var send = function (message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      };
      var controller = null;

      window.onSpotifyIframeApiReady = function (api) {
        api.createController(
          document.getElementById('host'),
          { uri: ${JSON.stringify(`spotify:track:${trackId}`)}, width: 1, height: 1 },
          function (embed) {
            controller = embed;
            embed.addListener('ready', function () { send({ type: 'ready' }); });
            embed.addListener('playback_update', function (event) {
              send({
                duration: event.data.duration,
                position: event.data.position,
                playing: !event.data.isPaused,
                type: 'update'
              });
            });
          }
        );
      };

      // Called from the app. Named rather than evaluated inline so a command
      // that arrives before the controller exists is a no-op instead of a
      // thrown error inside the page.
      window.nwSpotify = function (command, value) {
        if (!controller) return;
        if (command === 'toggle') controller.togglePlay();
        if (command === 'pause') controller.pause();
        if (command === 'seek') controller.seek(value);
      };

      window.onerror = function () { send({ type: 'failed' }); };
    </script>
    <script src="${ORIGIN}/embed/iframe-api/v1" async onerror="send({ type: 'failed' })"></script>
  </body>
</html>`;

/**
 * Drives one track and returns the hidden view that plays it.
 *
 * The view has to be rendered by the caller — a web view that is not in the
 * tree is not running — so this hands back an `element` to drop anywhere in the
 * layout. It is a pixel wide and transparent wherever it lands.
 */
export const useSpotifyEmbed = (trackId: string | null | undefined) => {
  // A `null` id renders no web view at all — which is how the profile keeps
  // a whole browser process, and Spotify's script over the network, from
  // starting on every open for a pill most visitors never press.
  // A malformed id renders nothing either, and reports itself as failed so
  // the pill falls back to its "open in Spotify" link.
  const validId = trackId && TRACK_ID.test(trackId) ? trackId : null;
  const rejected = Boolean(trackId) && !validId;
  const webview = useRef<WebView>(null);
  const [state, setState] = useState<EmbedState>({
    duration: 0,
    failed: false,
    playing: false,
    position: 0,
    ready: false,
  });

  const command = useCallback(
    (name: "toggle" | "pause" | "seek", value?: number) => {
      // The trailing `true` keeps iOS from warning about a non-void result.
      webview.current?.injectJavaScript(
        `window.nwSpotify && window.nwSpotify('${name}', ${value ?? 0}); true;`,
      );
    },
    [],
  );

  const toggle = useCallback(() => command("toggle"), [command]);
  // Pause, not toggle: the caller is another player taking over, or the
  // screen leaving, and a toggle on a track already paused would start it.
  const pause = useCallback(() => command("pause"), [command]);
  const seek = useCallback(
    (seconds: number) => command("seek", seconds),
    [command],
  );

  const element = validId ? (
    <View pointerEvents="none" style={styles.host}>
      <WebView
        allowsInlineMediaPlayback
        domStorageEnabled
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        onError={() => setState((prev) => ({ ...prev, failed: true }))}
        onHttpError={() => setState((prev) => ({ ...prev, failed: true }))}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data) as {
              type: "ready" | "update" | "failed";
              playing?: boolean;
              position?: number;
              duration?: number;
            };

            if (message.type === "failed") {
              setState((prev) => ({ ...prev, failed: true }));
              return;
            }
            if (message.type === "ready") {
              setState((prev) => ({ ...prev, ready: true }));
              return;
            }

            setState((prev) => ({
              ...prev,
              duration: (message.duration ?? 0) / MS,
              playing: Boolean(message.playing),
              position: (message.position ?? 0) / MS,
              ready: true,
            }));
          } catch {
            // A message we did not send. Nothing to do with it.
          }
        }}
        // Every top-level navigation is decided here, and anything that is not
        // Spotify is refused. `originWhitelist` stays open on purpose: a URL
        // it rejects is handed to the system browser, not blocked. Frames
        // inside the embed are Spotify's own.
        onShouldStartLoadWithRequest={(request) =>
          request.isTopFrame === false || SPOTIFY_PAGE.test(request.url)
        }
        originWhitelist={["*"]}
        ref={webview}
        // `window.open` navigates this view (and meets the check above)
        // instead of opening a window of its own.
        setSupportMultipleWindows={false}
        source={{ baseUrl: ORIGIN, html: page(validId) }}
        style={styles.web}
      />
    </View>
  ) : null;

  return {
    ...state,
    element,
    failed: state.failed || rejected,
    pause,
    seek,
    toggle,
  };
};

const styles = StyleSheet.create({
  // Out of the flow: the pill it lives in is a row with a gap, and a host
  // that arrives on the first press must not nudge the art when it does.
  host: {
    height: 1,
    left: 0,
    opacity: 0,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    width: 1,
  },
  web: { backgroundColor: "transparent", flex: 1 },
});
