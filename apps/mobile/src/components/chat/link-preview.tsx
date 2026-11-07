import { Ionicons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "@/components/image";
import { Text } from "@/components/text";
import {
  type LinkProvider,
  linkProvider,
  linkTitle,
  shortUrl,
  siteOf,
  useLinkMeta,
  youTubeId,
  youTubeThumbnail,
} from "@/lib/link-preview";
import { openExternalLink } from "@/lib/safe-link";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A link in a message, as a card — web's `LinkPreview`.
 *
 * YouTube leads with its thumbnail. Everything else is a fixed-height row, so a
 * lookup answering does not change the bubble's height: this sits in a list
 * anchored to its newest message, and a row that grew would move every message
 * under the reader's thumb.
 *
 * Tenor is a GIF: its picture is the message. Until there is a picture it is
 * drawn like any other link rather than as nothing.
 *
 * Opens through `openExternalLink`, which names the host before leaving the app.
 */

const CARD_WIDTH = 240;
const THUMB = 64;

const GLYPH: Record<LinkProvider, keyof typeof Ionicons.glyphMap> = {
  facebook: "logo-facebook",
  generic: "link-outline",
  instagram: "logo-instagram",
  tenor: "image-outline",
  x: "logo-twitter",
  youtube: "logo-youtube",
};

const LinkPreviewView = ({
  onLongPress,
  url,
}: {
  /** The message's long press: a card fills the bubble it is in. */
  onLongPress?: () => void;
  url: string;
}) => {
  const theme = useAppTheme();
  const provider = linkProvider(url);
  const videoId = provider === "youtube" ? youTubeId(url) : null;
  const meta = useLinkMeta(url, !videoId);
  // A site's picture can be gone, or plain http: the glyph stands in.
  const [badImage, setBadImage] = useState(false);
  const [gifRatio, setGifRatio] = useState(1);

  const title = linkTitle(url, provider, meta);
  const image = badImage ? null : meta?.image;
  const open = () => openExternalLink(url);
  const surface = (pressed: boolean) => [
    styles.card,
    {
      backgroundColor: pressed ? theme.material.fillPressed : theme.glass.field,
      borderColor: theme.material.edge,
    },
  ];

  if (provider === "tenor" && image) {
    return (
      <Pressable
        accessibilityLabel="GIF"
        accessibilityRole="link"
        onLongPress={onLongPress}
        onPress={open}
      >
        <Image
          onError={() => setBadImage(true)}
          onLoad={({ source }) => {
            if (source?.width && source?.height) {
              setGifRatio(source.width / source.height);
            }
          }}
          source={{ uri: image }}
          style={[styles.gif, { aspectRatio: gifRatio }]}
        />
      </Pressable>
    );
  }

  if (videoId) {
    return (
      <Pressable
        accessibilityLabel={`${title}, ${siteOf(url)}`}
        accessibilityRole="link"
        onLongPress={onLongPress}
        onPress={open}
        style={({ pressed }) => surface(pressed)}
      >
        <View style={styles.video}>
          <Image
            contentFit="cover"
            source={{ uri: youTubeThumbnail(videoId) }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.play}>
            <Ionicons color="#ffffff" name="play" size={20} />
          </View>
        </View>
        <View style={styles.videoText}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.site, { color: theme.textGray }]}>
            {siteOf(url)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel={`${title}, ${siteOf(url)}`}
      accessibilityRole="link"
      onLongPress={onLongPress}
      onPress={open}
      style={({ pressed }) => [surface(pressed), styles.row]}
    >
      <View
        style={[styles.thumb, { backgroundColor: theme.material.fillPressed }]}
      >
        {image ? (
          <Image
            contentFit="cover"
            onError={() => setBadImage(true)}
            source={{ uri: image }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Ionicons
            color={theme.accent.text}
            name={GLYPH[provider]}
            size={24}
          />
        )}
      </View>
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {meta?.description ? (
          <Text
            numberOfLines={1}
            style={[styles.description, { color: theme.textGray }]}
          >
            {meta.description}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[styles.site, { color: theme.accent.text }]}
        >
          {meta?.site_name ||
            (title === siteOf(url) ? shortUrl(url) : siteOf(url))}
        </Text>
      </View>
    </Pressable>
  );
};

export const LinkPreview = memo(LinkPreviewView);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    maxWidth: "100%",
    overflow: "hidden",
    width: CARD_WIDTH,
  },
  description: { fontSize: fontSize.caption },
  gif: { borderRadius: radius.md, maxWidth: "100%", width: CARD_WIDTH },
  play: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  site: { fontSize: fontSize.caption },
  text: { flex: 1, gap: 1, minWidth: 0 },
  thumb: {
    alignItems: "center",
    borderRadius: radius.sm,
    height: THUMB,
    justifyContent: "center",
    overflow: "hidden",
    width: THUMB,
  },
  title: { fontSize: fontSize.label, fontWeight: "700" },
  video: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    width: "100%",
  },
  videoText: { gap: 1, padding: space.sm },
});
