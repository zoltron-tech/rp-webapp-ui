import { Ionicons } from "@expo/vector-icons";
import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useRef, useState } from "react";
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { usePlaybackSlot } from "@/lib/playback";
import { fontSize, MEDIA_CHIP, radius, space, useAppTheme } from "@/theme";

/**
 * A clip, with controls worth having.
 *
 * The first version leaned on `nativeControls`, which is the right default for
 * a full-screen player and the wrong one inside a chat bubble: the platform
 * chrome is sized for a video that owns the screen, so on a 200pt-wide bubble
 * it covers the picture it is meant to control, and it looks like neither
 * platform anywhere.
 *
 * These are drawn instead — a scrubber, a clock and a mute toggle, at the size
 * the bubble actually is. Three decisions are worth writing down.
 *
 * **It does not start on its own.** Opening a thread with four clips in it used
 * to start four videos, which is noise and battery for something nobody asked
 * to watch. Playback waits for a tap. It still starts muted when it does —
 * autoplay is only ever acceptable silent, and the speaker button is how a clip
 * with dialogue becomes watchable.
 *
 * **The controls sit under the video, always.** They used to overlay it and
 * fade, which meant the picture was covered whenever you needed them and the
 * scrubber was invisible whenever you did not. A bar of its own costs one row
 * and is worth it: nothing is ever hidden behind chrome, and the position of a
 * clip is readable without touching it.
 *
 * **Seeking is a drag on the whole bar, not on the dot.** A 10pt thumb is not a
 * touch target. The track owns the gesture across its full height, which is
 * padded well past the 3pt line you can see.
 */

/**
 * Full screen follows the device: a portrait clip stays portrait, a landscape
 * one is watched sideways, and turning the phone back leaves full screen.
 */
const FULLSCREEN = {
  autoExitOnRotate: true,
  enable: true,
  orientation: "default",
} as const;

/*
 * The one clip allowed to be playing — and none once the screen is left — is
 * `lib/playback`'s rule, shared with the profile song and the gallery viewer:
 * a clip in a chat bubble and a song on the profile behind it are still two
 * players on one phone.
 */

/** The seek track's visible thickness. Its touch area is far taller. */
const TRACK_HEIGHT = 3;

/** `0:07`, and `1:04:07` only when a clip is actually that long. */
const formatClock = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const s = whole % 60;
  const m = Math.floor(whole / 60) % 60;
  const h = Math.floor(whole / 3600);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
};

export const ClipPlayer = ({
  /**
   * Start playing (muted) as soon as the player is ready.
   *
   * Off by default — a thread of clips must not all start at once. On for a
   * player that was mounted *because* the reader pressed a play badge on a
   * still: their press was the request, and a second one on a black frame
   * is a tax.
   */
  autoplay = false,
  /** Square-ish tile inside a grid of several attachments. */
  grid,
  /**
   * A long press on the picture. The picture is a button (play/pause), so it
   * takes the touch — without this, the message a clip belongs to could not
   * be long-pressed for its actions anywhere on the clip.
   */
  onLongPress,
  url,
}: {
  autoplay?: boolean;
  grid?: boolean;
  onLongPress?: () => void;
  url: string;
}) => {
  const theme = useAppTheme();

  const player = useVideoPlayer(url, (instance) => {
    instance.loop = true;
    instance.muted = true;
    // The default is one second, which makes the scrubber step rather than
    // move. Four updates a second is smooth enough to read as continuous and
    // cheap enough not to matter.
    instance.timeUpdateEventInterval = 0.25;
    // No `play()` unless asked. A thread of clips would otherwise all start
    // at once on open.
    if (autoplay) instance.play();
  });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  // iOS only: the system controls, for as long as the clip is full screen.
  const [fullscreen, setFullscreen] = useState(false);

  // Read inside the pan handlers, which are created once and cannot close over
  // state that changes.
  const trackWidth = useRef(0);
  const durationRef = useRef(0);

  // The native view, for the one thing only it can do: go full screen.
  const view = useRef<VideoView>(null);
  durationRef.current = duration;

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    // Ignored while a finger is on the bar: the player is still reporting the
    // position it is seeking *away* from, and letting that through makes the
    // thumb jump back under the finger dragging it.
    if (scrubbing) return;
    setTime(currentTime);
    if (player.duration && player.duration !== durationRef.current) {
      setDuration(player.duration);
    }
  });

  useEventListener(player, "playingChange", ({ isPlaying }) =>
    setPlaying(isPlaying),
  );

  // Starting this clip pauses whatever else was playing; leaving the screen
  // pauses this one.
  usePlaybackSlot(() => player.pause(), playing);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const total = durationRef.current;
      if (!total) return;
      const next = Math.max(0, Math.min(1, ratio)) * total;
      player.currentTime = next;
      setTime(next);
    },
    [player],
  );

  /*
   * The responder is built once and its handlers therefore capture the first
   * render's closures. These refs are how it reaches the current ones — the
   * standard shape for a `PanResponder` that has to call into state.
   */
  const seekRef = useRef(seekToRatio);
  seekRef.current = seekToRatio;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        setScrubbing(true);
        // `locationX` is the touch's position inside the track, which is
        // exactly the number the ratio needs — no page coordinates and no
        // measuring where the bar sits on screen.
        seekRef.current(
          event.nativeEvent.locationX / (trackWidth.current || 1),
        );
      },
      onPanResponderMove: (event) => {
        seekRef.current(
          event.nativeEvent.locationX / (trackWidth.current || 1),
        );
      },
      onPanResponderRelease: () => setScrubbing(false),
      onPanResponderTerminate: () => setScrubbing(false),
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  const progress = duration > 0 ? Math.min(1, time / duration) : 0;

  const togglePlay = () => {
    if (player.playing) player.pause();
    else player.play();
  };

  const toggleMute = () => {
    const next = !player.muted;
    player.muted = next;
    setMuted(next);
  };

  /**
   * Full screen is the platform's own presentation — its controls, its
   * rotation, its back gesture — which is right there: it is the one place a
   * clip owns the screen, and the size these drawn controls were made for
   * no longer applies. Playing and audible on the way in, because nobody
   * goes full screen to watch a muted, paused frame.
   */
  const enterFullscreen = () => {
    if (player.muted) {
      player.muted = false;
      setMuted(false);
    }
    if (!player.playing) player.play();
    if (Platform.OS !== "ios") {
      void view.current?.enterFullscreen();
      return;
    }
    // iOS presents the system player exactly as this view is configured, and
    // this view has no controls: full screen was a picture with no way to
    // pause it or leave. So the system's are switched on for the stay, and
    // the presentation waits a frame for the prop to reach the native view.
    setFullscreen(true);
    requestAnimationFrame(() => void view.current?.enterFullscreen());
  };

  return (
    <View
      style={[
        grid ? styles.gridBox : styles.box,
        { backgroundColor: theme.material.fillPressed },
      ]}
    >
      <Pressable
        accessibilityLabel={playing ? "Pause clip" : "Play clip"}
        accessibilityRole="button"
        delayLongPress={280}
        onLongPress={onLongPress}
        onPress={togglePlay}
        style={grid ? styles.surface : styles.frame}
      >
        <VideoView
          contentFit={grid ? "cover" : "contain"}
          fullscreenOptions={FULLSCREEN}
          // Never the platform's own: they are sized for a full screen and
          // cover the picture at the size a bubble actually is.
          nativeControls={fullscreen}
          onFullscreenExit={() => {
            setFullscreen(false);
            // Back in the bubble, quiet again — the same state it opened in.
            player.muted = true;
            setMuted(true);
          }}
          player={player}
          ref={view}
          style={styles.surface}
        />

        {/* A paused clip says so in the middle, where a thumbnail's play badge
            goes and where the eye already is. */}
        {!playing ? (
          <View style={styles.centreBadge}>
            <Ionicons color="#ffffff" name="play" size={grid ? 16 : 22} />
          </View>
        ) : null}
      </Pressable>

      {grid ? null : (
        <View
          style={[
            styles.controls,
            {
              backgroundColor: theme.glass.field,
              borderTopColor: theme.material.edge,
            },
          ]}
        >
          <Pressable
            accessibilityLabel={playing ? "Pause" : "Play"}
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={togglePlay}
          >
            <Ionicons
              color={theme.text}
              name={playing ? "pause" : "play"}
              size={15}
            />
          </Pressable>

          <Text style={[styles.clock, { color: theme.textGray }]}>
            {formatClock(time)}
          </Text>

          {/* The whole padded strip is the target; the visible line is 3pt. */}
          <View
            {...pan.panHandlers}
            onLayout={({ nativeEvent }) => {
              trackWidth.current = nativeEvent.layout.width;
            }}
            style={styles.trackTouch}
          >
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  {
                    backgroundColor: theme.accent.solid,
                    width: `${progress * 100}%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.thumb,
                  {
                    backgroundColor: theme.accent.solid,
                    left: `${progress * 100}%`,
                    // The dot grows under the finger, which is the only
                    // feedback a drag on a 3pt line can give.
                    transform: [{ scale: scrubbing ? 1.4 : 1 }],
                  },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.clock, { color: theme.textGray }]}>
            {duration > 0 ? formatClock(duration) : "--:--"}
          </Text>

          <Pressable
            accessibilityLabel={muted ? "Unmute" : "Mute"}
            accessibilityRole="button"
            accessibilityState={{ selected: !muted }}
            hitSlop={space.sm}
            onPress={toggleMute}
          >
            <Ionicons
              color={muted ? theme.textGray : theme.accent.text}
              name={muted ? "volume-mute" : "volume-high"}
              size={16}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Full screen"
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={enterFullscreen}
          >
            <Ionicons color={theme.text} name="expand-outline" size={16} />
          </Pressable>
        </View>
      )}

      {/* A grid tile has no control strip; the corner is where full screen goes. */}
      {grid ? (
        <Pressable
          accessibilityLabel="Full screen"
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={enterFullscreen}
          style={styles.cornerBadge}
        >
          <Ionicons color="#ffffff" name="expand-outline" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
};

/** The square a clip takes in a grid of several attachments. */
export const CLIP_GRID_SIZE = 110;

/** Chips straight on media: web's `MEDIA_CHIP`, no blur. */

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    overflow: "hidden",
    width: "100%",
  },
  centreBadge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -22 }],
    width: 44,
  },
  clock: {
    fontSize: fontSize.meta,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  // A row of its own beneath the picture, not a scrim over it. Overlaid
  // controls hide the frame exactly when they are needed and leave the position
  // unreadable when they are not.
  controls: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  cornerBadge: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: space.xs,
    top: space.xs,
    width: 26,
  },
  frame: { aspectRatio: 16 / 9, width: "100%" },
  gridBox: {
    borderRadius: radius.md,
    height: CLIP_GRID_SIZE,
    overflow: "hidden",
    width: CLIP_GRID_SIZE,
  },
  surface: { height: "100%", width: "100%" },
  thumb: {
    borderRadius: radius.sm,
    height: 10,
    marginLeft: -5,
    position: "absolute",
    top: -3.5,
    width: 10,
  },
  track: {
    backgroundColor: "rgba(128,128,128,0.35)",
    borderRadius: TRACK_HEIGHT,
    height: TRACK_HEIGHT,
    justifyContent: "center",
    width: "100%",
  },
  trackFill: { borderRadius: TRACK_HEIGHT, height: TRACK_HEIGHT },
  trackTouch: { flex: 1, justifyContent: "center", paddingVertical: space.sm },
});
