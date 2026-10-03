import { SCRIM_ALPHA } from "@nw/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  type AttachmentKind,
  extractUrls,
  getAttachmentKind,
  getFileNameFromUrl,
  isDirectImageUrl,
  isDirectVideoUrl,
} from "@nw/chat";
import type { Attachment, Message } from "@nw/types";
import { wsrvImage } from "@nw/utils/image";
import { Image } from "expo-image";
import type { VideoThumbnail } from "expo-video";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { ClipPlayer } from "@/components/chat/clip-player";
import { cachedThumbnail, thumbnailFor } from "@/components/feed/feed-media";
import {
  prefetchForViewer,
  setViewerPlaceholder,
} from "@/components/muse/media-viewer";
import { openExternalLink } from "@/lib/safe-link";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The media in a message: GIFs, images, and everything that is not one.
 *
 * A GIF sent from the picker is not an attachment and not an `<img>` — the CDN
 * URL *is* the message body, e.g.
 * `https://static.klipy.com/ii/…/wLP3Qu3EJIv6dN.webp`. Without this the phone
 * showed forty characters of blue text where the browser showed a picture,
 * which is the bug being fixed here.
 *
 * Which URLs count as media is decided by `@nw/chat` rather than here, so the
 * two clients cannot drift on it.
 *
 * ## Attachments are an album, not a pile
 *
 * Pictures and clips the sender attached are drawn as one mosaic that fills the
 * bubble edge to edge, laid out for how many there are — one at its own shape,
 * two side by side, three as a large picture and two beside it, four as a
 * square, five as two over three, six as the large three over a row of three,
 * and past six the last tile says how many more. It is the shape every
 * messenger with albums settled on, for the reason they did: a row of equal
 * squares makes six pictures read as a contact sheet, and one large tile makes
 * them read as a moment with more of it to see.
 *
 * Every tile opens the viewer on that picture, and the viewer swipes through
 * the message's attachments — see `conversation.tsx`.
 *
 * ## Why tiles are thumbnails
 *
 * The first version drew each attachment from its original upload. Six phone
 * photos in one message were six 12-megapixel decodes inside a scrolling list,
 * and a fling through that thread missed four frames in ten. A tile is at most
 * a third of a 320pt bubble, so it is fetched through the image proxy at a size
 * a tile can use, and the viewer fetches the full one when it is opened.
 *
 * A clip in a bubble is its still with a play badge, not a player. A mounted
 * `expo-video` player is a decoder and a surface per message, created as the
 * row scrolls in; the viewer plays the clip when it is asked to.
 */

/** Web caps at 300px; a phone column is narrower, so stickers cap lower. */
const MAX_MEDIA_HEIGHT = 180;

/** The frame of bubble colour left around a mosaic. */
export const MOSAIC_FRAME = 3;

/** The seam between tiles: enough to separate pictures, not enough to split them. */
const GAP = 2;

/** Wider than this and a single picture dominates the thread. */
const MAX_MOSAIC_WIDTH = 320;

/** A tile's copy: enough for the largest tile at 3×, a fraction of the upload. */
const THUMB = { fit: "inside" as const, h: 720, q: 72, w: 720 };

/**
 * The shapes a single picture is allowed: nothing taller than 4:5, and nothing
 * wider than 16:9. Outside that it is cropped to the edge of the range — a
 * phone-shaped portrait clip at its own shape was most of a screen of thread.
 */
const clampRatio = (ratio: number) => Math.max(0.8, Math.min(1.8, ratio));

/**
 * What each picture turned out to be, by URL, for the process.
 *
 * A picture has no size until it loads, and a row that changes height after it
 * has been laid out moves everything above it in an inverted list. The second
 * time a row is drawn — scrolled back to, or the thread reopened — it is laid
 * out right the first time.
 */
const RATIOS = new Map<string, number>();
const NATURAL_SIZES = new Map<string, { h: number; w: number }>();

/**
 * What the picker showed for a GIF, sticker or clip it sent, by the sent URL.
 *
 * The grid's tile is a small preview that is already decoded; the message is
 * the full file, which is a download. Without this a sent sticker was an
 * empty square — first in the "Sending" bubble, then again in the real one —
 * until the full file arrived. With it the bubble paints the preview at once
 * and the full file replaces it, in a box that already has the right shape.
 */
const PREVIEWS = new Map<string, string>();
const PREVIEW_RATIOS = new Map<string, number>();

export const rememberPreview = (url: string, preview: string) => {
  if (!preview || preview === url || PREVIEWS.has(url)) return;
  PREVIEWS.set(url, preview);
  if (isDirectVideoUrl(preview)) return;
  void Image.loadAsync(preview)
    .then((ref) => {
      if (ref.width && ref.height) {
        PREVIEW_RATIOS.set(url, ref.width / ref.height);
      }
      ref.release();
    })
    .catch(() => {});
};

export interface MediaItem {
  kind: "image" | "video";
  url: string;
}

/** The attachments a mosaic draws: pictures and clips, in the sender's order. */
export const mediaItemsOf = (
  attachments: Attachment[] | null | undefined,
): MediaItem[] =>
  (attachments ?? []).flatMap((attachment): MediaItem[] => {
    const kind = getAttachmentKind(attachment.url);
    return kind === "image" || kind === "video"
      ? [{ kind, url: attachment.url }]
      : [];
  });

const thumbUri = (url: string) => wsrvImage(url, THUMB);

/**
 * The mosaic's width: the bubble's 80% cap, less the frame, and never wider
 * than a picture should be in a thread. Fixed rather than measured, so every
 * tile is sized on the first frame and nothing waits for a layout pass.
 */
const useMosaicWidth = () => {
  const { width } = useWindowDimensions();
  return Math.floor(
    Math.min((width - space.md * 2) * 0.8 - MOSAIC_FRAME * 2, MAX_MOSAIC_WIDTH),
  );
};

/**
 * One image, at its natural size, capped.
 *
 * Web gets this for free — `width: auto; max-height: 300px; max-width: 100%`
 * lets the browser use the image's intrinsic dimensions and shrink only if it
 * has to. React Native has no intrinsic size, so the same rule is computed:
 * take the real pixels from `onLoad`, and scale down by whichever of the two
 * caps bites hardest. Never scale *up* — a 32px emoji stays a 32px emoji rather
 * than being stretched across the bubble.
 *
 * The width cap is measured rather than assumed, because a bubble is 80% of the
 * column and this component does not know the column.
 *
 * No background colour behind it, for the reason the About renderer has none:
 * chat stickers are usually transparent, and a tinted box turns that
 * transparency into a grey card the sender never put there.
 */
const MediaImage = ({ uri }: { uri: string }) => {
  const theme = useAppTheme();
  const [natural, setNatural] = useState(() => NATURAL_SIZES.get(uri) ?? null);
  const [available, setAvailable] = useState(0);
  const [failed, setFailed] = useState(false);

  // Objects made once per URL: a placeholder that is a new object on every
  // render is a new request to expo-image, which blanked the picture each time
  // the row re-rendered — every send re-renders the bubble above it.
  const preview = PREVIEWS.get(uri);
  const source = useMemo(() => ({ uri }), [uri]);
  const placeholder = useMemo(
    () => (preview ? { uri: preview } : undefined),
    [preview],
  );

  if (failed) {
    return (
      <View
        style={[
          styles.fallback,
          {
            backgroundColor: theme.material.fillPressed,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name="image-outline" size={20} />
        <Text style={[styles.fallbackLabel, { color: theme.textGray }]}>
          Image unavailable
        </Text>
      </View>
    );
  }

  const box = (() => {
    // Sent from this phone's picker: the preview's shape, at the cap — picker
    // files are all larger than the cap, so this is where it will settle.
    const ratio = PREVIEW_RATIOS.get(uri);
    if (!natural && ratio) {
      const height = Math.min(
        MAX_MEDIA_HEIGHT,
        available ? available / ratio : MAX_MEDIA_HEIGHT,
      );
      return { height, width: height * ratio };
    }
    // Before the image loads there is nothing to size against. A square at the
    // height cap is the least surprising placeholder: chat media is mostly
    // square or portrait stickers, so it settles with the smallest jump.
    if (!natural || !available) {
      return { height: MAX_MEDIA_HEIGHT, width: MAX_MEDIA_HEIGHT };
    }
    const scale = Math.min(
      1,
      MAX_MEDIA_HEIGHT / natural.h,
      available / natural.w,
    );
    return { height: natural.h * scale, width: natural.w * scale };
  })();

  return (
    <View
      onLayout={({ nativeEvent }) => setAvailable(nativeEvent.layout.width)}
      style={styles.imageRow}
    >
      <Image
        autoplay
        cachePolicy="memory-disk"
        contentFit="contain"
        onError={() => setFailed(true)}
        onLoad={({ source }) => {
          if (!source?.width || !source?.height) return;
          const size = { h: source.height, w: source.width };
          NATURAL_SIZES.set(uri, size);
          if (natural?.w !== size.w || natural?.h !== size.h) setNatural(size);
        }}
        placeholder={placeholder}
        placeholderContentFit="contain"
        recyclingKey={uri}
        source={source}
        style={[styles.image, box]}
        transition={0}
      />
    </View>
  );
};

/**
 * A clip sent as the message, drawn as its still until it is asked to play.
 *
 * It was a player per bubble: an `expo-video` decoder and surface created for
 * every clip as its row scrolled in, in threads where people trade clips back
 * and forth. The still is the picker's preview when this phone sent it (held,
 * not animating), otherwise a frame from the feed's shared queue. A tap swaps
 * in the player, already playing — the tap was the request.
 */
const ClipStill = ({
  onLongPress,
  url,
}: {
  onLongPress?: () => void;
  url: string;
}) => {
  const theme = useAppTheme();
  const [playing, setPlaying] = useState(false);
  const preview = PREVIEWS.get(url);
  const stillPreview = preview && !isDirectVideoUrl(preview) ? preview : null;
  const [frame, setFrame] = useState<VideoThumbnail | null>(() =>
    stillPreview ? null : cachedThumbnail(url),
  );

  useEffect(() => {
    if (playing || stillPreview || frame) return;
    let cancelled = false;
    void thumbnailFor(url).then((result) => {
      if (!cancelled && result) setFrame(result);
    });
    return () => {
      cancelled = true;
    };
  }, [frame, playing, stillPreview, url]);

  if (playing) {
    return <ClipPlayer autoplay onLongPress={onLongPress} url={url} />;
  }

  return (
    <Pressable
      accessibilityLabel="Play clip"
      accessibilityRole="button"
      delayLongPress={280}
      onLongPress={onLongPress}
      onPress={() => setPlaying(true)}
      style={({ pressed }) => [
        styles.clipStill,
        {
          backgroundColor: theme.material.fillPressed,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {stillPreview ? (
        <Image
          autoplay={false}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: stillPreview }}
          style={StyleSheet.absoluteFill}
          transition={0}
        />
      ) : frame ? (
        <Image
          contentFit="cover"
          source={frame}
          style={StyleSheet.absoluteFill}
          transition={150}
        />
      ) : null}
      <View pointerEvents="none" style={styles.tileCentre}>
        <View style={styles.playDisc}>
          <Ionicons color="#ffffff" name="play" size={24} />
        </View>
      </View>
    </Pressable>
  );
};

/** A link that is not media: opened in the browser, never previewed. */
const LinkChip = ({ url }: { url: string }) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={() => openExternalLink(url)}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.glass.field,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.accent.text} name="link-outline" size={14} />
      <Text
        numberOfLines={1}
        style={[styles.chipLabel, { color: theme.accent.text }]}
      >
        {getFileNameFromUrl(url)}
      </Text>
    </Pressable>
  );
};

/**
 * A file or an audio clip.
 *
 * Rendered as a card that opens the system handler rather than an inline
 * player. Audio needs a transport UI of its own — a scrub bar, a duration, a
 * play head — and a card that plainly hands off is better than a player that
 * looks like it works and does not.
 */
const MediaCard = ({ kind, url }: { kind: AttachmentKind; url: string }) => {
  const theme = useAppTheme();
  const icon =
    kind === "video"
      ? "play-circle-outline"
      : kind === "audio"
        ? "musical-notes-outline"
        : "document-outline";

  return (
    <Pressable
      onPress={() => openExternalLink(url)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.glass.field,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <Ionicons color={theme.accent.text} name={icon} size={22} />
      <View style={styles.cardText}>
        <Text
          numberOfLines={1}
          style={[styles.cardName, { color: theme.text }]}
        >
          {getFileNameFromUrl(url)}
        </Text>
        <Text style={[styles.cardKind, { color: theme.textGray }]}>
          {kind === "video"
            ? "Video · opens externally"
            : kind === "audio"
              ? "Audio · opens externally"
              : "File · opens externally"}
        </Text>
      </View>
      <Ionicons color={theme.textGray} name="open-outline" size={16} />
    </Pressable>
  );
};

/**
 * Any tag at all — the message came from the rich editor.
 *
 * Narrower rules do not work here. Web's `HTML_CONTENT_RE` lists formatting
 * tags and deliberately omits `img` and `a`, which is fine there because its
 * two renderers are mutually exclusive. On this side `RichText` already draws
 * `<img>` and `<a>` from the markup, so if these URLs were *also* scanned out
 * of the tag's `src` the picture would appear twice — once from the parser and
 * once from here.
 */
const MARKUP_RE = /<[a-z][^>]*>/i;

/** Did this message come from the rich editor rather than a plain input? */
export const hasMarkup = (text: string): boolean => MARKUP_RE.test(text);

/** Media found inside the message text — GIFs, images, links. */
export const MessageTextMedia = ({
  onLongPress,
  text,
}: {
  /** The message's long press, for media that is itself a button. */
  onLongPress?: () => void;
  text: string;
}) => {
  // Markup is `RichText`'s job, in full. Only bare URLs typed into a plain
  // message are this component's.
  if (!text || hasMarkup(text)) return null;

  const urls = extractUrls(text);
  if (urls.length === 0) return null;

  return (
    <View style={styles.stack}>
      {urls.map((url) => {
        const kind = getAttachmentKind(url);
        if (isDirectImageUrl(url)) return <MediaImage key={url} uri={url} />;
        /*
         * A lone video URL *is* the message — a clip from the picker, or an
         * mp4 someone pasted on its own — so it plays here. A video linked
         * among words is a file being referred to, and gets the card.
         */
        if (isDirectVideoUrl(url) && urls.length === 1) {
          return <ClipStill key={url} onLongPress={onLongPress} url={url} />;
        }
        if (kind === "video" || kind === "audio") {
          return <MediaCard key={url} kind={kind} url={url} />;
        }
        return <LinkChip key={url} url={url} />;
      })}
    </View>
  );
};

/**
 * The first picture or clip a message carries, and how many it carries.
 *
 * Attachments first, then a bare media URL that is the message body — a GIF,
 * sticker or clip from the picker. Rich-text markup is not searched: an `<img>`
 * inside an edited message is part of its words, not what the message is.
 */
export const messageMediaOf = (
  message: Message | null | undefined,
): { count: number; first: MediaItem; fromText: boolean } | null => {
  if (!message) return null;
  const attached = mediaItemsOf(message.attachments);
  if (attached[0]) {
    return { count: attached.length, first: attached[0], fromText: false };
  }
  const text = message.message ?? "";
  if (!text || hasMarkup(text)) return null;
  const urls = extractUrls(text).filter(
    (url) => isDirectImageUrl(url) || isDirectVideoUrl(url),
  );
  const url = urls[0];
  if (!url) return null;
  return {
    count: urls.length,
    first: { kind: isDirectVideoUrl(url) ? "video" : "image", url },
    fromText: true,
  };
};

/**
 * A message, as a small square of what it shows — for the places that talk
 * *about* a message: the long-press sheet, the reply banner.
 *
 * A GIF or sticker animates, and sits uncropped on no background (stickers are
 * transparent); an attached photo is the proxied tile copy the album already
 * fetched, cropped to fill; a clip is its still with a play mark. An album
 * says how many are in it. Nothing is drawn for a message without media.
 */
export const MessageThumb = ({
  message,
  size,
}: {
  message: Message;
  size: number;
}) => {
  const theme = useAppTheme();
  const media = useMemo(() => messageMediaOf(message), [message]);
  const url = media?.first.url ?? "";
  const video = media?.first.kind === "video";

  // A clip's still: the picker's preview if this phone sent it, else a frame.
  const preview = url ? PREVIEWS.get(url) : undefined;
  const stillPreview = preview && !isDirectVideoUrl(preview) ? preview : null;
  const [frame, setFrame] = useState<VideoThumbnail | null>(() =>
    video && !stillPreview && url ? cachedThumbnail(url) : null,
  );
  useEffect(() => {
    if (!video || stillPreview || frame || !url) return;
    let cancelled = false;
    void thumbnailFor(url).then((result) => {
      if (!cancelled && result) setFrame(result);
    });
    return () => {
      cancelled = true;
    };
  }, [frame, stillPreview, url, video]);

  const source = useMemo(() => {
    if (!media) return null;
    if (video) return stillPreview ? { uri: stillPreview } : frame;
    return { uri: media.fromText ? url : thumbUri(url) };
  }, [frame, media, stillPreview, url, video]);

  if (!media) return null;
  const bare = media.fromText && !video;

  return (
    <View
      style={[
        styles.messageThumb,
        {
          backgroundColor: bare ? "transparent" : theme.glass.field,
          height: size,
          width: size,
        },
      ]}
    >
      {source ? (
        <Image
          autoplay={!video}
          cachePolicy="memory-disk"
          contentFit={bare ? "contain" : "cover"}
          recyclingKey={url}
          source={source}
          style={StyleSheet.absoluteFill}
          transition={0}
        />
      ) : null}
      {video ? (
        <View pointerEvents="none" style={styles.tileCentre}>
          <View style={styles.thumbPlay}>
            <Ionicons color="#ffffff" name="play" size={size < 44 ? 9 : 12} />
          </View>
        </View>
      ) : null}
      {media.count > 1 ? (
        <View pointerEvents="none" style={styles.thumbCount}>
          <Text style={styles.countLabel}>{media.count}</Text>
        </View>
      ) : null}
    </View>
  );
};

/** Attached files that are not pictures or clips: a card each. */
export const MessageAttachments = ({
  attachments,
}: {
  attachments: Attachment[];
}) => {
  const files = attachments.filter((attachment) => {
    const kind = getAttachmentKind(attachment.url);
    return kind !== "image" && kind !== "video";
  });
  if (!files.length) return null;

  return (
    <View style={styles.stack}>
      {files.map((attachment) => (
        <MediaCard
          key={attachment.id || attachment.url}
          kind={getAttachmentKind(attachment.url)}
          url={attachment.url}
        />
      ))}
    </View>
  );
};

interface TileProps {
  height: number;
  /** Position among the message's pictures and clips — what the viewer opens on. */
  index: number;
  item: MediaItem;
  /** Past the last visible tile: how many more there are. */
  more: number;
  onLongPress?: () => void;
  onOpen?: (index: number) => void;
  /** Reports the picture's own shape; only a lone tile asks. */
  onRatio?: (ratio: number) => void;
  /** Still on its way to the server. */
  pending?: boolean;
  width: number;
}

const TileView = ({
  height,
  index,
  item,
  more,
  onLongPress,
  onOpen,
  onRatio,
  pending,
  width,
}: TileProps) => {
  const theme = useAppTheme();
  const video = item.kind === "video";
  const uri = video ? null : thumbUri(item.url);
  const small = width < 120;

  const [frame, setFrame] = useState<VideoThumbnail | null>(() =>
    video ? cachedThumbnail(item.url) : null,
  );
  const [failed, setFailed] = useState(false);

  // The still for a clip: shared with the feed's, queued and cached there.
  useEffect(() => {
    if (!video || frame) return;
    let cancelled = false;
    void thumbnailFor(item.url).then((result) => {
      if (cancelled || !result) return;
      setFrame(result);
      onRatio?.(result.width / result.height);
    });
    return () => {
      cancelled = true;
    };
  }, [frame, item.url, onRatio, video]);

  // What the viewer paints while its own copy loads.
  useEffect(() => {
    if (uri) setViewerPlaceholder(item.url, uri);
  }, [item.url, uri]);

  return (
    <Pressable
      accessibilityHint={video ? "Plays the clip" : "Opens the picture"}
      accessibilityLabel={video ? "Video" : "Picture"}
      accessibilityRole="imagebutton"
      delayLongPress={280}
      disabled={!onOpen}
      onLongPress={onLongPress}
      onPress={() => onOpen?.(index)}
      onPressIn={() => {
        if (!video) prefetchForViewer(item.url);
      }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: theme.glass.field,
          height,
          opacity: pressed ? 0.82 : 1,
          width,
        },
      ]}
    >
      {failed ? (
        <View style={styles.tileCentre}>
          <Ionicons
            color={theme.textGray}
            name={video ? "film-outline" : "image-outline"}
            size={22}
          />
        </View>
      ) : video ? (
        frame ? (
          <Image
            contentFit="cover"
            source={frame}
            style={StyleSheet.absoluteFill}
            transition={150}
          />
        ) : null
      ) : (
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          onError={() => setFailed(true)}
          onLoad={({ source }) => {
            if (source?.width && source?.height) {
              onRatio?.(source.width / source.height);
            }
          }}
          recyclingKey={item.url}
          source={{ uri: uri ?? item.url }}
          style={StyleSheet.absoluteFill}
          transition={150}
        />
      )}

      {video ? (
        <View pointerEvents="none" style={styles.tileCentre}>
          <View style={[styles.playDisc, small && styles.playDiscSmall]}>
            <Ionicons color="#ffffff" name="play" size={small ? 15 : 24} />
          </View>
        </View>
      ) : null}

      {more > 0 ? (
        <View pointerEvents="none" style={[styles.tileCentre, styles.scrim]}>
          <Text style={styles.moreLabel}>+{more}</Text>
        </View>
      ) : null}

      {pending ? (
        <View pointerEvents="none" style={[styles.tileCentre, styles.scrim]}>
          <ActivityIndicator color="#ffffff" size="small" />
        </View>
      ) : null}
    </Pressable>
  );
};

const Tile = memo(TileView);

/**
 * A message's pictures and clips, as one album.
 *
 * `footer` is laid over the bottom corner — the time and ticks of a message
 * with no words under its pictures, which has nowhere else to put them.
 */
export const AttachmentMosaic = ({
  footer,
  items,
  onLongPress,
  onOpen,
  pending,
}: {
  footer?: ReactNode;
  items: MediaItem[];
  onLongPress?: () => void;
  onOpen?: (index: number) => void;
  pending?: boolean;
}) => {
  const width = useMosaicWidth();
  const count = items.length;
  const first = items[0];
  const firstUrl = first?.url ?? "";

  // A lone picture keeps its own shape, remembered by URL once it is known.
  const [ratio, setRatio] = useState<number | null>(() => {
    if (!first || count !== 1) return null;
    const known = RATIOS.get(first.url);
    if (known) return known;
    const frame = first.kind === "video" ? cachedThumbnail(first.url) : null;
    return frame ? clampRatio(frame.width / frame.height) : null;
  });

  const onSingleRatio = useCallback(
    (raw: number) => {
      const next = clampRatio(raw);
      RATIOS.set(firstUrl, next);
      setRatio((current) =>
        current !== null && Math.abs(current - next) < 0.01 ? current : next,
      );
    },
    [firstUrl],
  );

  if (!first) return null;

  const tile = (index: number, w: number, h: number, more = 0) => {
    const item = items[index];
    if (!item) return null;
    return (
      <Tile
        height={Math.round(h)}
        index={index}
        item={item}
        key={`${index}-${item.url}`}
        more={more}
        onLongPress={onLongPress}
        onOpen={onOpen}
        onRatio={count === 1 ? onSingleRatio : undefined}
        pending={pending}
        width={Math.round(w)}
      />
    );
  };

  const half = (width - GAP) / 2;
  const third = (width - GAP * 2) / 3;

  /** One large tile and two stacked beside it. */
  const hero = (height: number) => {
    const big = Math.round((width - GAP) * 0.62);
    const side = width - GAP - big;
    const stacked = (height - GAP) / 2;
    return (
      <View style={styles.row}>
        {tile(0, big, height)}
        <View style={styles.column}>
          {tile(1, side, stacked)}
          {tile(2, side, stacked)}
        </View>
      </View>
    );
  };

  let body: ReactNode;
  if (count === 1) {
    const shape = ratio ?? (first.kind === "video" ? 16 / 9 : 1);
    body = tile(0, width, width / clampRatio(shape));
  } else if (count === 2) {
    body = (
      <View style={styles.row}>
        {tile(0, half, half * 1.25)}
        {tile(1, half, half * 1.25)}
      </View>
    );
  } else if (count === 3) {
    body = hero(width * 0.9);
  } else if (count === 4) {
    body = (
      <>
        <View style={styles.row}>
          {tile(0, half, half)}
          {tile(1, half, half)}
        </View>
        <View style={styles.row}>
          {tile(2, half, half)}
          {tile(3, half, half)}
        </View>
      </>
    );
  } else if (count === 5) {
    body = (
      <>
        <View style={styles.row}>
          {tile(0, half, half * 0.9)}
          {tile(1, half, half * 0.9)}
        </View>
        <View style={styles.row}>
          {tile(2, third, third)}
          {tile(3, third, third)}
          {tile(4, third, third)}
        </View>
      </>
    );
  } else {
    body = (
      <>
        {hero(width * 0.72)}
        <View style={styles.row}>
          {tile(3, third, third)}
          {tile(4, third, third)}
          {tile(5, third, third, count - 6)}
        </View>
      </>
    );
  }

  const clips = items.filter((item) => item.kind === "video").length;
  const label =
    count === 1
      ? first.kind === "video"
        ? "Video"
        : null
      : clips === 0
        ? `${count} photos`
        : clips === count
          ? `${count} videos`
          : `${count} items`;

  return (
    <View style={[styles.mosaic, { width }]}>
      {body}

      {label ? (
        <View pointerEvents="none" style={styles.countChip}>
          <Ionicons
            color="#ffffff"
            name={clips > 0 && clips === count ? "videocam" : "images"}
            size={11}
          />
          <Text style={styles.countLabel}>{label}</Text>
        </View>
      ) : null}

      {footer}
    </View>
  );
};

/** Chips straight on media: web's `MEDIA_CHIP`, no blur. */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  cardKind: { fontSize: 10 },
  cardName: { fontSize: fontSize.caption, fontWeight: "600" },
  cardText: { flex: 1, gap: 1 },
  chip: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  chipLabel: { flexShrink: 1, fontSize: fontSize.caption, fontWeight: "600" },
  // The player's own frame, so the swap to it on a tap does not reshape the row.
  clipStill: {
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: "hidden",
    width: "100%",
  },
  column: { gap: GAP },
  countChip: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 4,
    left: space.xs + 2,
    paddingHorizontal: space.xs + 3,
    paddingVertical: 2,
    position: "absolute",
    top: space.xs + 2,
  },
  countLabel: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  fallback: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  fallbackLabel: { fontSize: fontSize.caption },
  image: { borderRadius: radius.md },
  imageRow: { width: "100%" },
  messageThumb: { borderRadius: radius.sm, overflow: "hidden" },
  moreLabel: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  // Inside the bubble's frame, so its corners follow the bubble's own.
  mosaic: {
    borderRadius: radius.lg - MOSAIC_FRAME,
    gap: GAP,
    overflow: "hidden",
  },
  playDisc: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 26,
    borderWidth: 1.5,
    height: 52,
    justifyContent: "center",
    paddingLeft: 3,
    width: 52,
  },
  playDiscSmall: { borderRadius: 17, height: 34, width: 34 },
  row: { flexDirection: "row", gap: GAP },
  scrim: { backgroundColor: "rgba(0,0,0,0.45)" },
  stack: { gap: space.xs },
  thumbCount: {
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    bottom: 2,
    minWidth: 16,
    paddingHorizontal: 4,
    position: "absolute",
    right: 2,
  },
  thumbPlay: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    height: 22,
    justifyContent: "center",
    paddingLeft: 2,
    width: 22,
  },
  tile: { overflow: "hidden" },
  tileCentre: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
