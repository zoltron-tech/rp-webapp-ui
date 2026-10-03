import { SCRIM_ALPHA } from "@nw/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { createVideoPlayer, type VideoThumbnail } from "expo-video";
import { memo, useEffect, useState } from "react";
import {
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ClipPlayer } from "@/components/chat/clip-player";
import { radius, space, useAppTheme } from "@/theme";

/**
 * A post's attachment — one picture, or one clip — as a feed draws it.
 *
 * ## The picture keeps its shape
 *
 * The outgoing card fitted every image into a fixed 240pt box. A portrait —
 * which is what character art mostly is — sat in the middle of it with a
 * grey gutter down each side; a wide banner sat in the middle with a gutter
 * above and below. Neither gutter was anything the author posted.
 *
 * The box is now the picture's own aspect ratio, clamped: nothing squarer
 * than 4:5 (a tall portrait would otherwise be a whole screen), nothing
 * wider than 16:9 (a banner would otherwise be a stripe). Inside the clamp
 * the picture fills the width and the gutters are gone; outside it, `contain`
 * still shows the whole image rather than cropping it, which for artwork is
 * the right loss.
 *
 * ## The shape is remembered
 *
 * An image has no size until it loads, so the first frame is laid out at a
 * guess and the real ratio arrives with `onLoad`. In a recycling list that
 * guess-then-jump would happen every time a card scrolled back into view,
 * because the cell it lands in is not the one it left. So the measured ratio
 * is kept by URL, module-wide: the second time any card shows the picture it
 * is laid out right on its first frame. (`expo-image` already keeps the
 * decoded bitmap the same way — this is the same idea for the one number the
 * layout needs before the bitmap arrives.)
 *
 * ## The clip waits to be asked
 *
 * `ClipPlayer` owns an `expo-video` player, which is a decoder and a surface.
 * One per visible video card, created afresh each time a cell is re-bound, is
 * the most expensive thing a feed can do for something the reader may never
 * press. So a clip is a still frame with a play glyph until it is tapped, and
 * only then is the player mounted. The armed flag is state, but it belongs to
 * the *URL* — the caller keys this on it — so a recycled cell does not arrive
 * already playing somebody else's clip.
 *
 * ## The still is the clip's own second second
 *
 * A black box with a play glyph says "video" and nothing else. The frame at
 * two seconds — past the fade-in most clips open on, before anything has
 * happened — is what the browser's `<video>` shows web readers near enough,
 * and it is what a reader decides to press on. It comes from `expo-video`
 * itself: a player is created off screen, asked for one frame, and released
 * — no surface, no playback, no second native module. The frame is kept by
 * URL for the process, so a card scrolling back into view, or the same clip
 * in a comment, is a map lookup rather than another decode.
 */

const THUMBNAILS = new Map<string, VideoThumbnail>();
const PENDING = new Map<string, Promise<VideoThumbnail | null>>();

/** Where the still is taken from. */
const THUMBNAIL_AT = 2;

/** Wide enough for a phone at 3×; the decode scales it down for us. */
const THUMBNAIL_WIDTH = 1080;

/**
 * Stills are taken one at a time, and not until the screen has settled.
 *
 * Each is a native player and a decoder, created on the UI thread. Started the
 * moment a card mounted, they landed in the same frames as the feed's own first
 * paint — a cold start opened Home with a couple of clips on it and dropped
 * thirty-odd frames — and two cards meant two decoders at once. The poster has
 * its label and play glyph meanwhile, so waiting costs the reader nothing.
 */
let queue: Promise<unknown> = Promise.resolve();
const afterInteractions = () =>
  new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

/** A clip's still, from the shared cache and queue. Exported for chat tiles. */
export const cachedThumbnail = (url: string): VideoThumbnail | null =>
  THUMBNAILS.get(url) ?? null;

export const thumbnailFor = (url: string): Promise<VideoThumbnail | null> => {
  const cached = THUMBNAILS.get(url);
  if (cached) return Promise.resolve(cached);
  const pending = PENDING.get(url);
  if (pending) return pending;

  const work = (async () => {
    const previous = queue;
    let done = () => {};
    queue = new Promise<void>((resolve) => {
      done = resolve;
    });
    await previous;
    await afterInteractions();
    const player = createVideoPlayer(url);
    try {
      let [frame] = await player.generateThumbnailsAsync(THUMBNAIL_AT, {
        maxWidth: THUMBNAIL_WIDTH,
      });
      // Shorter than two seconds: take whatever is there.
      if (!frame) [frame] = await player.generateThumbnailsAsync(0);
      if (!frame) return null;
      THUMBNAILS.set(url, frame);
      return frame;
    } catch {
      return null;
    } finally {
      player.release();
      PENDING.delete(url);
      done();
    }
  })();

  PENDING.set(url, work);
  return work;
};

const RATIOS = new Map<string, number>();

/** 4:5 through 16:9. */
const MIN_RATIO = 0.8;
const MAX_RATIO = 16 / 9;

/** Before anything is known: 4:3, the least wrong guess for mixed artwork. */
const DEFAULT_RATIO = 4 / 3;

const clampRatio = (ratio: number) =>
  Math.max(MIN_RATIO, Math.min(MAX_RATIO, ratio));

const isVideoUrl = (url: string) => url.toLowerCase().endsWith("mp4");

const FeedImageView = ({ src }: { src: string }) => {
  const theme = useAppTheme();
  const [ratio, setRatio] = useState(() => RATIOS.get(src) ?? DEFAULT_RATIO);

  return (
    <Image
      cachePolicy="memory-disk"
      contentFit="contain"
      onLoad={({ source }) => {
        if (!source?.width || !source?.height) return;
        const next = clampRatio(source.width / source.height);
        RATIOS.set(src, next);
        if (next !== ratio) setRatio(next);
      }}
      recyclingKey={src}
      source={{ uri: src }}
      style={[
        styles.image,
        { aspectRatio: ratio, backgroundColor: theme.glass.field },
      ]}
      transition={0}
    />
  );
};

/** A picture at its own (clamped) shape. Exported for the activity card. */
export const FeedImage = memo(FeedImageView);

const LazyClipView = ({ url }: { url: string }) => {
  const theme = useAppTheme();
  const [armed, setArmed] = useState(false);
  const [frame, setFrame] = useState<VideoThumbnail | null>(
    () => THUMBNAILS.get(url) ?? null,
  );

  useEffect(() => {
    if (frame) return;
    let cancelled = false;
    void thumbnailFor(url).then((result) => {
      if (!cancelled && result) setFrame(result);
    });
    return () => {
      cancelled = true;
    };
  }, [frame, url]);

  if (armed) {
    return (
      <View style={styles.clip}>
        <ClipPlayer autoplay url={url} />
      </View>
    );
  }

  // The poster takes the clip's own shape once a frame says what it is,
  // clamped as a picture is; until then 16:9, which most clips are anyway.
  const ratio = frame ? clampRatio(frame.width / frame.height) : 16 / 9;

  return (
    <Pressable
      accessibilityLabel="Play video"
      accessibilityRole="button"
      onPress={() => setArmed(true)}
      style={({ pressed }) => [
        styles.clip,
        styles.poster,
        { aspectRatio: ratio, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {frame ? (
        <Image
          contentFit="cover"
          pointerEvents="none"
          source={frame}
          style={StyleSheet.absoluteFill}
          transition={150}
        />
      ) : null}
      <View pointerEvents="none" style={styles.scrim} />
      <View style={[styles.playBadge, { borderColor: "rgba(255,255,255,0.5)" }]}>
        <Ionicons color="#ffffff" name="play" size={26} />
      </View>
      {frame ? null : <Text style={styles.posterLabel}>Video</Text>}
    </Pressable>
  );
};

/** A clip as a still until tapped. Exported for the activity card. */
export const FeedClip = memo(LazyClipView);
const LazyClip = FeedClip;

/**
 * Key both on the URL. The state each holds — a measured ratio, an armed
 * player — is a fact about that URL, and a changed key is how a recycled
 * cell is told to start again rather than inherit it.
 */
export const FeedMedia = ({ url }: { url: string }) =>
  isVideoUrl(url) ? (
    <LazyClip key={url} url={url} />
  ) : (
    <FeedImage key={url} src={url} />
  );

/** Chips straight on cover art or video: web's `MEDIA_CHIP`, no blur. */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;

const styles = StyleSheet.create({
  clip: { borderRadius: radius.md, overflow: "hidden", width: "100%" },
  image: { borderRadius: radius.md, width: "100%" },
  playBadge: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    // The glyph is not symmetric; nudged so it reads as centred.
    paddingLeft: 3,
    width: 56,
  },
  poster: {
    alignItems: "center",
    backgroundColor: "#000",
    gap: space.sm,
    justifyContent: "center",
  },
  posterLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  // Keeps the white glyph legible over a bright frame.
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
