import { Ionicons } from "@expo/vector-icons";
import { useEventListener } from "expo";
import { useVideoPlayer } from "expo-video";
import { useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { usePlaybackSlot } from "@/lib/playback";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * An audio attachment, played in the bubble — web's `ChatAudioAttachment`.
 *
 * `expo-video` is the player: it decodes audio without a view, it is already
 * in the build, and `expo-av` is deprecated.
 *
 * ## Nothing loads until it is played
 *
 * A player holds a decoder, so one per card in a long thread is a real cost
 * for a file most readers never start. The card is a drawing until the first
 * press, and the duration shows from then. Web has the length up front because
 * a browser's `preload="metadata"` is free.
 */

const TRACK_HEIGHT = 4;

const clock = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

const Card = ({
  busy = false,
  duration = 0,
  label = "Audio attachment",
  onLongPress,
  onSeek,
  onToggle,
  playing = false,
  time = 0,
}: {
  busy?: boolean;
  duration?: number;
  label?: string;
  onLongPress?: () => void;
  /** As a share of the length, 0 to 1. Absent until the length is known. */
  onSeek?: (share: number) => void;
  onToggle: () => void;
  playing?: boolean;
  time?: number;
}) => {
  const theme = useAppTheme();
  const trackWidth = useRef(0);
  const share = duration > 0 ? Math.min(time / duration, 1) : 0;

  const seek = (event: GestureResponderEvent) => {
    if (trackWidth.current <= 0) return;
    const ratio = event.nativeEvent.locationX / trackWidth.current;
    onSeek?.(Math.min(Math.max(ratio, 0), 1));
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.glass.field,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={playing ? "Pause" : "Play"}
        accessibilityRole="button"
        disabled={busy}
        hitSlop={space.xs}
        onLongPress={onLongPress}
        onPress={onToggle}
        style={[styles.play, { backgroundColor: theme.accent.solid }]}
      >
        <Ionicons color="#ffffff" name={playing ? "pause" : "play"} size={18} />
      </Pressable>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.label, { color: theme.text }]}>
          {label}
        </Text>
        <Pressable
          accessibilityLabel="Seek"
          accessibilityRole="adjustable"
          disabled={!onSeek}
          onLayout={(event) => {
            trackWidth.current = event.nativeEvent.layout.width;
          }}
          onLongPress={onLongPress}
          onPress={seek}
          style={styles.seek}
        >
          <View
            pointerEvents="none"
            style={[
              styles.track,
              { backgroundColor: theme.material.edgeTranslucent },
            ]}
          >
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: theme.accent.solid,
                  width: `${share * 100}%`,
                },
              ]}
            />
          </View>
        </Pressable>
        <View style={styles.times}>
          <Text style={[styles.time, { color: theme.textGray }]}>
            {clock(time)}
          </Text>
          <Text style={[styles.time, { color: theme.textGray }]}>
            {duration > 0 ? clock(duration) : "–:––"}
          </Text>
        </View>
      </View>
    </View>
  );
};

/** The card with a player behind it, from the first press on. */
const LiveCard = ({
  label,
  onLongPress,
  url,
}: {
  label?: string;
  onLongPress?: () => void;
  url: string;
}) => {
  const theme = useAppTheme();
  const player = useVideoPlayer(url, (instance) => {
    instance.timeUpdateEventInterval = 0.25;
    instance.play();
  });

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    setTime(currentTime);
    if (player.duration && player.duration !== duration) {
      setDuration(player.duration);
    }
  });
  useEventListener(player, "playingChange", ({ isPlaying }) =>
    setPlaying(isPlaying),
  );
  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "error") setFailed(true);
  });
  // Back to the start, so the next press plays it again.
  useEventListener(player, "playToEnd", () => {
    player.pause();
    player.currentTime = 0;
    setTime(0);
  });

  // Starting this pauses whatever else was playing; leaving the screen
  // pauses this.
  usePlaybackSlot(() => player.pause(), playing);

  if (failed) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Ionicons
          color={theme.textGray}
          name="alert-circle-outline"
          size={20}
        />
        <Text style={[styles.label, { color: theme.textGray }]}>
          No longer available.
        </Text>
      </View>
    );
  }

  return (
    <Card
      duration={duration}
      label={label}
      onLongPress={onLongPress}
      onSeek={
        duration > 0
          ? (share) => {
              player.currentTime = duration * share;
              setTime(duration * share);
            }
          : undefined
      }
      onToggle={() => (playing ? player.pause() : player.play())}
      playing={playing}
      time={time}
    />
  );
};

export const AudioCard = ({
  label,
  onLongPress,
  url,
}: {
  /** What the card calls itself. Defaults to web's "Audio attachment". */
  label?: string;
  onLongPress?: () => void;
  url: string;
}) => {
  const [started, setStarted] = useState(false);
  return started ? (
    <LiveCard label={label} onLongPress={onLongPress} url={url} />
  ) : (
    <Card
      label={label}
      onLongPress={onLongPress}
      onToggle={() => setStarted(true)}
    />
  );
};

const styles = StyleSheet.create({
  body: { flex: 1, gap: 2, minWidth: 0 },
  card: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    maxWidth: "100%",
    minWidth: 240,
    padding: space.sm,
  },
  fill: { borderRadius: TRACK_HEIGHT / 2, height: TRACK_HEIGHT },
  label: { fontSize: fontSize.label, fontWeight: "600" },
  play: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  // Taller than the line drawn in it: a 4pt target cannot be hit.
  seek: { height: 20, justifyContent: "center" },
  time: { fontSize: fontSize.meta },
  times: { flexDirection: "row", justifyContent: "space-between" },
  track: {
    borderRadius: TRACK_HEIGHT / 2,
    height: TRACK_HEIGHT,
    overflow: "hidden",
  },
});
