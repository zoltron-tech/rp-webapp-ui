import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Platform, StyleSheet } from "react-native";

/**
 * Whether a clip's poster is a paused player rather than a decoded frame.
 *
 * iOS only, and only because the frame cannot be had there:
 * `generateThumbnailsAsync` aborts the app (see `thumbnailFor` in
 * `feed/feed-media`). Android keeps the cached frame, which costs one decode
 * per clip for the life of the process; this costs a player per poster on
 * screen, so it is the fallback and not the design.
 */
export const LIVE_STILLS = Platform.OS === "ios";

/** Where the still is taken from: past the fade-in most clips open on. */
const STILL_AT = 2;

/**
 * A clip's still, as a muted player that never plays.
 *
 * Fills its parent and takes no touches — the poster around it is the button.
 * `onRatio` reports the clip's own shape once it is known, for the callers
 * that size themselves by it.
 */
export const LiveStill = ({
  onRatio,
  url,
}: {
  onRatio?: (ratio: number) => void;
  url: string;
}) => {
  const player = useVideoPlayer(url, (instance) => {
    instance.muted = true;
  });

  useEventListener(player, "sourceLoad", ({ availableVideoTracks, duration }) => {
    // Short clips: the middle, rather than a seek past the end.
    if (duration > 0) player.currentTime = Math.min(STILL_AT, duration / 2);
    const size = availableVideoTracks[0]?.size;
    if (size?.width && size?.height) onRatio?.(size.width / size.height);
  });

  return (
    <VideoView
      contentFit="cover"
      nativeControls={false}
      player={player}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />
  );
};
