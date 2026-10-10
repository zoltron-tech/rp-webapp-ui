import type { ImageCropFilter } from "@nw/types";
import { CROP_SCALE_MAX_PCT } from "@nw/utils";
import { useState } from "react";
import {
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { Image } from "@/components/image";

/**
 * An image drawn through its stored crop — web's `NWImageLayer` and profile
 * `Banner`, in layout rather than CSS.
 *
 * ## The model, verbatim
 *
 * A stored crop is three numbers the crop dialog wrote: `width` is the zoom
 * as `scale × 100`, and `x`/`y` are 0–100. Web renders them as
 * `background-size: width% auto` and `background-position: x% y%`, which
 * means: the image is as wide as `width%` of the box, its height follows
 * from its own aspect ratio, and it is placed so that `x%` of the *spare*
 * width (box minus image, which may be negative) lies to its left — the same
 * for `y`. That is what this computes, once it knows two things CSS gets for
 * free: the box's size (`onLayout`) and the image's aspect ratio (`onLoad`,
 * remembered by URL so the second draw needs no load to be right).
 *
 * Until both are known nothing is drawn — a frame of the wrong crop is worse
 * than a frame of nothing. With no usable crop it is a plain `cover`, which
 * is web's fallback too.
 *
 * ## What it must be fed
 *
 * A source whose aspect ratio is the original's. The numbers are percentages
 * of the un-cropped picture, so a proxy size that *crops* (`fit: cover` to a
 * square) changes what they refer to. Bounding sizes (`fit: inside`) are safe.
 */

const RATIOS = new Map<string, number>();

export const CroppedImage = ({
  blurRadius,
  crop,
  maxScalePct,
  onError,
  playing,
  style,
  uri,
}: {
  blurRadius?: number;
  crop?: ImageCropFilter | null;
  /**
   * The largest zoom honoured, as the crop stores it (`scale × 100`). Defaults
   * to `hasUsableCrop`'s; story covers zoom further than avatars.
   */
  maxScalePct?: number;
  /** The picture failed to load — for a caller with another source to try. */
  onError?: () => void;
  /** Whether an animated picture runs — see `Image`. Undefined: always. */
  playing?: boolean;
  /** The box. Give it a size, or let its parent — it is measured either way. */
  style?: StyleProp<ViewStyle>;
  uri: string;
}) => {
  const [box, setBox] = useState<{ height: number; width: number } | null>(
    null,
  );
  const [ratio, setRatio] = useState<number | null>(
    () => RATIOS.get(uri) ?? null,
  );

  const usable =
    !!crop &&
    crop.width > 0 &&
    crop.width <= (maxScalePct ?? CROP_SCALE_MAX_PCT);

  const onLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    if (!box || box.width !== width || box.height !== height) {
      setBox({ height, width });
    }
  };

  const onLoad = ({
    source,
  }: {
    source?: { width?: number; height?: number } | null;
  }) => {
    if (!source?.width || !source?.height) return;
    const next = source.width / source.height;
    RATIOS.set(uri, next);
    if (next !== ratio) setRatio(next);
  };

  if (!usable) {
    return (
      <View onLayout={onLayout} style={[styles.box, style]}>
        <Image
          blurRadius={blurRadius}
          cachePolicy="memory-disk"
          contentFit="cover"
          onError={onError}
          onLoad={onLoad}
          playing={playing}
          recyclingKey={uri}
          source={{ uri }}
          style={styles.fill}
          transition={0}
        />
      </View>
    );
  }

  let placed: {
    height: number;
    left: number;
    top: number;
    width: number;
  } | null = null;
  if (box && ratio) {
    const width = (box.width * crop.width) / 100;
    const height = width / ratio;
    placed = {
      height,
      left: ((box.width - width) * crop.x) / 100,
      top: ((box.height - height) * crop.y) / 100,
      width,
    };
  }

  return (
    <View onLayout={onLayout} style={[styles.box, style]}>
      <Image
        // iOS resamples a picture to the view it loaded into, and this one
        // loads into the 1pt `hidden` box. A still is resampled again when the
        // view grows; an animated one keeps the frames it made for 1pt and is
        // stretched from there, which draws as a smear. The source is already
        // bounded by the proxy, so there is nothing left for this to save.
        allowDownscaling={false}
        blurRadius={blurRadius}
        cachePolicy="memory-disk"
        contentFit="fill"
        onError={onError}
        onLoad={onLoad}
        playing={playing}
        recyclingKey={uri}
        source={{ uri }}
        // Off screen until it can be placed: it still has to mount to load,
        // and loading is how the ratio arrives.
        style={placed ? [styles.placed, placed] : styles.hidden}
        transition={0}
      />
    </View>
  );
};

const styles = {
  box: { overflow: "hidden" as const },
  fill: { height: "100%" as const, width: "100%" as const },
  hidden: { height: 1, opacity: 0, position: "absolute" as const, width: 1 },
  placed: { position: "absolute" as const },
};
