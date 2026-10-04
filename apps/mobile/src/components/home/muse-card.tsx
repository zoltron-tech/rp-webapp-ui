import type { Muse } from "@nw/types";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import {
  firstWorkingImage,
  markImageBroken,
  useBrokenImages,
} from "@/lib/broken-images";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { asHex, withAlpha } from "@/lib/color";
import { museName } from "@/lib/muse-appearance";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `MusePreviewCard`, at the size its home page draws it on a phone.
 *
 * A portrait: the card background (or the main image) filling the whole card
 * with the pan and zoom the author set, a gradient rising from the foot so the
 * name reads over anything, the fandom as a small coloured tag above it. When
 * the muse has an accent the frame is a two-point gradient of it, as on web;
 * otherwise the theme's border.
 *
 * ## The size
 *
 * Web's rail card at phone width: 140 × 245, the 240 × 420 desktop card
 * keeping its 1.75 ratio so the crop frames the same picture. A 375pt screen
 * shows two and a third of them, which is what says "this scrolls", and the
 * fandom tag has room to be eleven-point type.
 */
export const MUSE_CARD_WIDTH = 140;
export const MUSE_CARD_HEIGHT = 245;
/** Web's `padding: 2px` frame round the picture. */
const FRAME = 2;

const MuseCardView = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const router = useRouter();

  const accent = muse.useAccent ? asHex(muse.accent) : undefined;
  // The card background, then the main image, skipping any that failed: a
  // dead card URL left this tile black while the character's image was fine.
  useBrokenImages();
  const cardSrc = muse.cardBackground?.src || null;
  // The fallback at card size, not the list's 300px square crop of the main
  // image — the same source the character page falls back to.
  const cover = firstWorkingImage([
    cardSrc,
    wsrvImage(muse.image, IMAGE_SIZES.CARD_BG),
  ]);
  // `useExtraImages` is absent on list payloads; a crop with a width is a
  // crop the author set — web's rule too. It only fits the card background.
  const rawCrop = muse.cardBackground?.crop;
  const crop =
    cover === cardSrc && rawCrop && (rawCrop.width ?? 0) > 0 ? rawCrop : null;
  const fandom =
    muse.fandom && muse.fandom.id !== "FANDOMLESS" ? muse.fandom : null;

  return (
    <Pressable
      accessibilityLabel={`${museName(muse)}, character`}
      accessibilityRole="button"
      disabled={!muse.id}
      onPress={() => {
        if (!muse.id) return;
        router.push({
          params: { museId: muse.id },
          pathname: "/muse/[museId]",
        });
      }}
      style={({ pressed }) => [
        styles.frame,
        { borderColor: theme.material.edge, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {accent ? (
        <LinearGradient
          colors={[accent, withAlpha("#ffffff", 0.5)]}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[styles.card, { backgroundColor: theme.material.fill }]}>
        {cover ? (
          <CroppedImage
            crop={crop}
            onError={() => markImageBroken(cover)}
            style={styles.fill}
            uri={cover}
          />
        ) : (
          // No picture to show: drawn art in the character's colour, so the
          // tile reads as a character without art rather than a failed load.
          <FallbackArt
            accent={accent}
            kind="character"
            seed={museName(muse)}
            style={styles.fill}
          />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0)", "rgba(0,0,0,0.72)"]}
          locations={[0, 0.3, 1]}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.nameBlock}>
          {fandom ? (
            <View style={[styles.tag, { backgroundColor: fandom.color }]}>
              <View style={styles.tagDot} />
              <Text
                // A label on a 140pt card: it grows a step with the reader's
                // text size, not the whole way, or a fandom loses its ending.
                maxFontSizeMultiplier={1.1}
                numberOfLines={1}
                style={styles.tagLabel}
              >
                {fandom.name}
              </Text>
            </View>
          ) : null}
          <Text numberOfLines={2} style={styles.name}>
            {museName(muse)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export const MuseCard = memo(MuseCardView);

/** What the rail draws while the first page is still on its way. */
export const MuseCardShimmer = () => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.frame,
        styles.shimmer,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.cardSm,
    flex: 1,
    overflow: "hidden",
  },
  fill: { height: "100%", width: "100%" },
  frame: {
    borderRadius: radius.cardSm + FRAME,
    borderWidth: border.edge,
    height: MUSE_CARD_HEIGHT,
    overflow: "hidden",
    padding: FRAME,
    width: MUSE_CARD_WIDTH,
  },
  name: {
    color: "#ffffff",
    fontSize: fontSize.label,
    fontWeight: "700",
    lineHeight: 16,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  nameBlock: {
    bottom: 8,
    gap: 3,
    left: 6,
    position: "absolute",
    right: 6,
  },
  shimmer: { opacity: 0.6 },
  tag: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: 3,
    maxWidth: "100%",
    paddingHorizontal: 5,
    paddingVertical: space.xxs,
  },
  tagDot: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  tagLabel: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontWeight: "700",
    // Tight for uppercase, but 11px type on a 140pt card has no room for
    // more: at 0.7 "Supernatural" lost its last two letters.
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
