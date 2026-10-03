import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { PANEL } from "@/components/muse/panel";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import {
  firstWorkingImage,
  markImageBroken,
  useBrokenImages,
} from "@/lib/broken-images";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { type MuseLook, museName } from "@/lib/muse-appearance";
import { radius, space } from "@/theme";

/**
 * The character card — web's `CardWrapper` / `CardImageSection`.
 *
 * The portrait itself. The 9:16 frame it fills is `MuseStage`'s, shared with
 * every other section, so the card and the panels are one shape.
 *
 * ## The crop is the author's
 *
 * The card background carries the pan and zoom set in the crop dialog, and
 * `CroppedImage` reproduces web's `background-size`/`background-position`
 * model in layout — so the framing is the one the author chose, not a centre
 * crop that happens to be close. Without a stored crop it is `cover`, as web
 * falls back to.
 *
 * ## The owner's two buttons
 *
 * Web's `CardBgEditBtn` and `CardBgRemoveBtn`, in the card's corner: the
 * camera adjusts the picture there is or picks one when there is none, and the
 * × takes a custom card image away so the main image shows again. The crop
 * editor is `ImageCropEditor` at 9:16, the same model the card is drawn from.
 */
export const MuseCardSection = ({
  edit,
  isOwnMuse,
  loading,
  look,
  muse,
}: {
  edit: MuseEdit;
  isOwnMuse: boolean;
  loading: boolean;
  look: MuseLook;
  muse: Muse | null;
}) => {
  const [removing, setRemoving] = useState(false);

  const flow = useImageCropFlow({
    onSave: edit.setCardBackground,
    prefix: muse?.id,
  });

  const confirmRemove = () => {
    Alert.alert(
      "Remove card image?",
      "Remove the custom card background? The main character image will be used instead.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setRemoving(true);
            const ok = await edit.removeCardBackground();
            setRemoving(false);
            if (!ok) Alert.alert("Not removed", "Try again in a moment.");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );
  };

  const hasCustom = Boolean(muse?.useExtraImages && muse.cardBackground?.src);

  // The card image, or the character's main image when that one fails.
  useBrokenImages();
  const fallbackUri = wsrvImage(muse?.image, IMAGE_SIZES.CARD_BG);
  const cardUri = firstWorkingImage([look.card.uri, fallbackUri]);
  const cardCrop = cardUri === look.card.uri ? look.card.crop : null;

  return (
    <View style={styles.card}>
      {loading ? (
        <View style={[styles.fill, { backgroundColor: PANEL.shimmer }]} />
      ) : !cardUri ? (
        // No picture at all: say so, rather than a blank panel that reads as
        // an image that failed to load.
        <View style={styles.fill}>
          <FallbackArt
            accent={look.accent}
            kind="character"
            seed={museName(muse)}
            style={StyleSheet.absoluteFill}
          />
          {isOwnMuse ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Add a card image with the camera button.
              </Text>
            </View>
          ) : null}
        </View>
      ) : cardCrop ? (
        <CroppedImage
          crop={cardCrop}
          onError={() => markImageBroken(cardUri)}
          style={styles.fill}
          uri={cardUri}
        />
      ) : (
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          onError={() => markImageBroken(cardUri)}
          recyclingKey={cardUri}
          source={{ uri: cardUri }}
          style={styles.fill}
          transition={150}
        />
      )}

      {isOwnMuse && muse ? (
        <View style={styles.controls}>
          {hasCustom ? (
            <Pressable
              accessibilityLabel="Remove card image"
              accessibilityRole="button"
              disabled={removing}
              hitSlop={space.xs}
              onPress={confirmRemove}
              style={({ pressed }) => [
                styles.control,
                styles.remove,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              {removing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons color="#ffffff" name="close" size={16} />
              )}
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel={
              hasCustom ? "Adjust card image" : "Add card image"
            }
            accessibilityRole="button"
            disabled={flow.saving}
            hitSlop={space.xs}
            onPress={() => flow.open(hasCustom ? muse.cardBackground : null)}
            style={({ pressed }) => [
              styles.control,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons color="#ffffff" name="camera-outline" size={16} />
          </Pressable>
        </View>
      ) : null}

      <ImageCropEditor
        aspect={9 / 16}
        autoFit={flow.autoFit}
        busy={flow.saving}
        initial={flow.initial}
        onClose={flow.close}
        onConfirm={(crop) => void flow.confirm(crop)}
        onReplace={() => void flow.replace()}
        title="Adjust card image"
        uploading={flow.uploading}
        uri={flow.uri}
        visible={flow.visible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // A hint along the top edge, clear of the camera button at the foot.
  empty: {
    alignItems: "center",
    left: space.md,
    position: "absolute",
    right: space.md,
    top: space.md,
  },
  emptyText: {
    color: PANEL.secondary,
    fontSize: 13,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: radius.md,
    flex: 1,
    overflow: "hidden",
  },
  control: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  controls: {
    bottom: space.sm,
    flexDirection: "row",
    gap: space.sm,
    position: "absolute",
    right: space.sm,
  },
  fill: { height: "100%", width: "100%" },
  remove: { backgroundColor: "rgba(180,30,30,0.7)" },
});
