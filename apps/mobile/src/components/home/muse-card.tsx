import type { Muse } from "@nw/types";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { Text } from "@/components/text";
import {
  firstWorkingImage,
  markImageBroken,
  useBrokenImages,
} from "@/lib/broken-images";
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
 * The rail's to give. Web's 240 × 420 desktop card keeps its 1.75 ratio at
 * any width so the crop frames the same picture. `MUSE_CARD_WIDTH` is the
 * compact size — two and a third to a 375pt screen — and the home rails hand
 * it most of the screen so one character sits in the middle with the next
 * peeking in (see `rail-snap.ts`). Past `WIDE_FROM` the type steps up with
 * it: a name at list size at the foot of a 170pt portrait reads as a caption,
 * and the fandom tag has room to be real type rather than eleven-point.
 */
export const MUSE_CARD_WIDTH = 140;
/** Web's 240 × 420. */
const RATIO = 1.75;
/**
 * From this width the card is drawn with the wide type. Under the rail's
 * share of the screen on the smallest phone (375pt), so the type does not
 * change with the device: the rail's 0.42 share is 157pt there.
 */
const WIDE_FROM = 155;
/** Web's `padding: 2px` frame round the picture. */
const FRAME = 2;

export const museCardHeight = (width: number) => Math.round(width * RATIO);

const MuseCardView = ({
  muse,
  width = MUSE_CARD_WIDTH,
}: {
  muse: Muse;
  width?: number;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const wide = width >= WIDE_FROM;

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
        {
          borderColor: theme.material.edge,
          height: museCardHeight(width),
          opacity: pressed ? 0.85 : 1,
          width,
        },
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
        <View style={[styles.nameBlock, wide && styles.nameBlockWide]}>
          {fandom ? (
            <View
              style={[
                styles.tag,
                wide && styles.tagWide,
                { backgroundColor: fandom.color },
              ]}
            >
              <View style={[styles.tagDot, wide && styles.tagDotWide]} />
              <Text
                // A label on a 140pt card: it grows a step with the reader's
                // text size, not the whole way, or a fandom loses its ending.
                maxFontSizeMultiplier={1.1}
                numberOfLines={1}
                style={[styles.tagLabel, wide && styles.tagLabelWide]}
              >
                {fandom.name}
              </Text>
            </View>
          ) : null}
          <Text
            numberOfLines={2}
            style={[styles.name, wide && styles.nameWide]}
          >
            {museName(muse)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export const MuseCard = memo(MuseCardView);

/** What the rail draws while the first page is still on its way. */
export const MuseCardShimmer = ({
  width = MUSE_CARD_WIDTH,
}: {
  width?: number;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.frame,
        styles.shimmer,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          height: museCardHeight(width),
          width,
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
    overflow: "hidden",
    padding: FRAME,
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
  nameBlockWide: { bottom: 12, gap: 5, left: 12, right: 12 },
  nameWide: { fontSize: 18, lineHeight: 22 },
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
  tagDotWide: { borderRadius: 3, height: 5, width: 5 },
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
  tagLabelWide: { fontSize: fontSize.caption, letterSpacing: 0.6 },
  tagWide: { gap: 5, paddingHorizontal: 8, paddingVertical: space.xs },
});
