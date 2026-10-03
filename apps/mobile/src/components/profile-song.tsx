import { SCRIM_ALPHA } from "@nw/theme";
import { Ionicons } from "@expo/vector-icons";
import { mixColors } from "@nw/theme";
import type { ProfileSong } from "@nw/types/music";
import { useEventListener } from "expo";
import { useVideoPlayer } from "expo-video";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GradientSurface } from "@/components/gradient-surface";
import { useSpotifyEmbed } from "@/components/spotify-embed";
import { isHttpsUrlOn } from "@/lib/safe-link";
import { fontSize, radius, space, useAppTheme } from "@/theme";

const SPOTIFY_HOSTS = ["open.spotify.com"] as const;

/**
 * The song a novelist has pinned to their profile.
 *
 * Web draws it as a pill directly above About and merges the two — the song
 * gets square bottom corners, About loses its top border, and they read as one
 * block (`MediaStack`, `AboutContainer $attachedTop`). That pairing is the
 * point: the song is part of how someone introduces themselves, not a widget
 * parked next to the introduction.
 *
 * ## Two sources, one player
 *
 * A LIBRARY song is an uploaded file with a URL, and `expo-video`'s player
 * takes an audio URL as happily as a video one — it is already in the build for
 * chat clips.
 *
 * A SPOTIFY song plays through Spotify's own IFrame embed, hidden in a web view
 * (`useSpotifyEmbed`) — the same embed and the same three commands web drives
 * it with. The two paths differ only in who owns the audio; everything the pill
 * shows (play state, position, duration, the scrubber) comes back the same
 * shape from either, so there is one set of controls rather than two.
 *
 * If the embed cannot load at all — no network, or Spotify's script refusing —
 * the button becomes "open in Spotify" rather than a control that does nothing.
 */

/** Web's `Art`: a 40px circle. */
const ART = 40;

/** The three equalizer bars, at rest and at full height. */
const BAR_MIN = 0.3;
const BAR_HEIGHT = 12;

const formatClock = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/**
 * Three bars that rise and fall while something is playing.
 *
 * Web animates them in CSS. Here they are one looping `Animated.Value` each,
 * offset by a beat so the group never moves as a block — and they are scale
 * transforms, so the loop runs on the native driver and costs no JS frames
 * while the rest of the profile scrolls.
 */
const Equalizer = ({ color }: { color: string }) => {
  const bars = useRef([
    new Animated.Value(BAR_MIN),
    new Animated.Value(BAR_MIN),
    new Animated.Value(BAR_MIN),
  ]).current;

  useEffect(() => {
    const loops = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(bar, {
            duration: 320,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            duration: 320,
            toValue: BAR_MIN,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    for (const loop of loops) loop.start();
    return () => {
      for (const loop of loops) loop.stop();
    };
  }, [bars]);

  return (
    <View style={styles.equalizer}>
      {bars.map((bar, index) => (
        <Animated.View
          // Three fixed bars; there is no identity to key on but the position.
          key={index}
          style={[
            styles.bar,
            { backgroundColor: color, transform: [{ scaleY: bar }] },
          ]}
        />
      ))}
    </View>
  );
};

export const ProfileSongPill = ({
  attachedBottom,
  song,
}: {
  /** Squares the bottom corners so About can sit flush under it. */
  attachedBottom?: boolean;
  song: ProfileSong;
}) => {
  const theme = useAppTheme();

  const isSpotify = song.source === "SPOTIFY";
  const hasFile = !isSpotify && Boolean(song.url);

  /*
   * Nothing plays until the first tap, and nothing is *loaded* until then
   * either. The first version created the file player and the Spotify web
   * view as the pill mounted — a decoder buffering a track, or a browser
   * process fetching Spotify's embed, on every profile open, for a control
   * most visitors scroll past. The engine starts when the play button is
   * pressed; that press is remembered and honoured once the engine is ready.
   */
  const [engineOn, setEngineOn] = useState(false);
  const [wantPlay, setWantPlay] = useState(false);

  // Null for a Spotify track: there is nothing local to play, and handing the
  // player a track id would have it retry a URL it can never load.
  const player = useVideoPlayer(
    hasFile && engineOn ? song.url : null,
    (instance) => {
      instance.timeUpdateEventInterval = 0.5;
    },
  );

  const spotify = useSpotifyEmbed(
    isSpotify && engineOn ? song.spotifyTrackId : null,
  );

  const [filePlaying, setFilePlaying] = useState(false);
  const [fileTime, setFileTime] = useState(0);
  const [fileDuration, setFileDuration] = useState(0);
  const trackWidth = useRef(0);

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    setFileTime(currentTime);
    if (player.duration && player.duration !== fileDuration) {
      setFileDuration(player.duration);
    }
  });

  useEventListener(player, "playingChange", ({ isPlaying }) =>
    setFilePlaying(isPlaying),
  );

  /*
   * One set of readings, whichever engine produced them.
   *
   * Everything below this line is written against these four values, so the
   * controls cannot drift between a library track and a Spotify one — which is
   * the whole reason the embed was worth building rather than sending people
   * out to another app.
   */
  const spotifyBroken = isSpotify && spotify.failed;
  const playable = hasFile || (isSpotify && !spotifyBroken);
  const playing = isSpotify ? spotify.playing : filePlaying;
  const time = isSpotify ? spotify.position : fileTime;
  const duration = isSpotify ? spotify.duration : fileDuration;

  // Spotify's embed accepts nothing until it says it is ready; the file player
  // is ready as soon as it has a URL. Neither is until the engine is on.
  const armed = engineOn && (isSpotify ? spotify.ready : hasFile);

  // The remembered first press, paid once the engine can take it.
  useEffect(() => {
    if (!wantPlay || !armed) return;
    setWantPlay(false);
    if (isSpotify) spotify.toggle();
    else player.play();
  }, [armed, isSpotify, player, spotify, wantPlay]);

  const toggle = () => {
    if (spotifyBroken) {
      // Set by the song's owner, so only ever a Spotify page.
      if (isHttpsUrlOn(song.externalUrl, SPOTIFY_HOSTS)) {
        void WebBrowser.openBrowserAsync(song.externalUrl);
      }
      return;
    }
    if (!engineOn) {
      setEngineOn(true);
      setWantPlay(true);
      return;
    }
    if (isSpotify) {
      spotify.toggle();
      return;
    }
    if (playing) player.pause();
    else player.play();
  };

  const seekTo = (seconds: number) => {
    if (isSpotify) {
      spotify.seek(seconds);
      return;
    }
    player.currentTime = seconds;
    setFileTime(seconds);
  };

  const progress = duration > 0 ? Math.min(time / duration, 1) : 0;

  // Web's pill: an accent wash over the card surface, brightest at the top
  // left. Vertical here, because `GradientSurface` runs top to bottom and a
  // diagonal would need a second gradient node for one degree of prettiness.
  const from = mixColors(theme.accent.surface, 0.16, theme.material.fill);
  const to = theme.material.fill;

  return (
    <GradientSurface
      from={from}
      style={[
        styles.pill,
        {
          borderBottomLeftRadius: attachedBottom ? 0 : radius.md + 2,
          borderBottomRightRadius: attachedBottom ? 0 : radius.md + 2,
          borderBottomWidth: attachedBottom ? 0 : StyleSheet.hairlineWidth,
          borderColor: mixColors(
            theme.accent.surface,
            0.22,
            theme.material.edge,
          ),
        },
      ]}
      to={to}
    >
      {/* The player itself: one transparent pixel, which is what it takes to
          keep a web view running. */}
      {spotify.element}

      <View
        style={[styles.art, { backgroundColor: theme.material.fillPressed }]}
      >
        {song.imageUrl ? (
          <Image source={{ uri: song.imageUrl }} style={styles.artImage} />
        ) : (
          <Ionicons color={theme.textGray} name="musical-notes" size={18} />
        )}
        {playing ? <Equalizer color="#ffffff" /> : null}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {song.title}
        </Text>

        {song.artist ? (
          <Text
            numberOfLines={1}
            style={[styles.artist, { color: theme.textGray }]}
          >
            {song.artist}
          </Text>
        ) : null}

        {playable ? (
          <Pressable
            accessibilityLabel="Seek"
            accessibilityRole="adjustable"
            hitSlop={space.sm}
            // Tap to seek rather than drag: the bar is 3pt of a 40pt pill in
            // the middle of a scrolling page, and a pan responder there would
            // fight the scroll for every touch that started on it.
            onLayout={(event) => {
              trackWidth.current = event.nativeEvent.layout.width;
            }}
            onPress={(event) => {
              if (!duration || trackWidth.current <= 0) return;
              const ratio = event.nativeEvent.locationX / trackWidth.current;
              seekTo(Math.max(0, Math.min(1, ratio)) * duration);
            }}
            style={[styles.track, { backgroundColor: theme.material.edge }]}
          >
            <View
              style={[
                styles.trackFill,
                {
                  backgroundColor: theme.accent.solid,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </Pressable>
        ) : (
          <Text style={[styles.artist, { color: theme.textGray }]}>
            {spotifyBroken ? "Open in Spotify" : "Unavailable"}
          </Text>
        )}
      </View>

      {playable && duration > 0 ? (
        <Text style={[styles.clock, { color: theme.textGray }]}>
          {formatClock(time)}
        </Text>
      ) : null}

      {playable || (spotifyBroken && song.externalUrl) ? (
        <Pressable
          accessibilityLabel={
            spotifyBroken
              ? `Open ${song.title} in Spotify`
              : playing
                ? `Pause ${song.title}`
                : `Play ${song.title}`
          }
          accessibilityRole="button"
          // Pressable while the embed is still loading would queue a command
          // the page cannot answer, and the button would look broken. Before
          // the first press there is nothing loading, so it is live.
          disabled={playable && engineOn && !armed}
          hitSlop={space.xs}
          onPress={toggle}
          style={({ pressed }) => [
            styles.play,
            {
              backgroundColor:
                playable && engineOn && !armed
                  ? theme.accent.surfaceActive
                  : theme.accent.solid,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {playable && engineOn && !armed ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons
              color="#ffffff"
              name={spotifyBroken ? "open-outline" : playing ? "pause" : "play"}
              size={spotifyBroken ? 16 : 18}
            />
          )}
        </Pressable>
      ) : null}
    </GradientSurface>
  );
};

/** Chips straight on artwork: web's `MEDIA_CHIP`, no blur. */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;

const styles = StyleSheet.create({
  art: {
    alignItems: "center",
    borderRadius: radius.full,
    height: ART,
    justifyContent: "center",
    overflow: "hidden",
    width: ART,
  },
  artImage: { height: "100%", position: "absolute", width: "100%" },
  artist: { fontSize: fontSize.caption },
  bar: { borderRadius: 1, height: BAR_HEIGHT, width: 2.5 },
  clock: { fontSize: 10, fontVariant: ["tabular-nums"] },
  equalizer: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    flexDirection: "row",
    gap: 2,
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
  info: { flex: 1, gap: 2 },
  pill: {
    alignItems: "center",
    borderTopLeftRadius: radius.md + 2,
    borderTopRightRadius: radius.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm - 2,
    paddingRight: space.sm + 2,
  },
  play: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  title: { fontSize: fontSize.label, fontWeight: "700" },
  track: { borderRadius: radius.full, height: 3, marginTop: 4, width: "100%" },
  trackFill: { borderRadius: radius.full, height: "100%" },
});
