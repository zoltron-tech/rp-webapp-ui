import { Ionicons } from "@expo/vector-icons";
import {
  ALIGNMENTS,
  IMAGE_WIDTH_MAX,
  IMAGE_WIDTH_MIN,
  IMAGE_WRAPS,
  type ImageWrap,
  type RichImageBlock,
} from "@nw/richtext";
import { Image } from "expo-image";
import { memo, useRef } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { AlignGlyph } from "./toolbar";
import { IconButton } from "@/components/icon-button";

/**
 * A picture in the document, and the controls web puts in a floating bar
 * above it.
 *
 * Web selects an image by clicking it and draws a resize bar over the top:
 * a width slider, three alignments, three wraps and a delete. Every one of
 * those is here; what differs is where they go. A floating bar needs
 * somewhere to float — above the image, positioned against the editor — and
 * on a phone "above the image" is the keyboard as often as not. So the
 * controls sit *under* the selected picture, in the flow of the document,
 * where they push the text below them down rather than covering anything.
 *
 * ## The slider
 *
 * Web's is a native range input, 10–100 in ones. This one is drawn: a track,
 * a thumb, and a `PanResponder` that owns the touch from the moment it lands
 * so the document's scroll view does not take a horizontal drag for a
 * vertical one. The buttons at either end step by ten — the size most people
 * actually want is "a bit smaller" or "a bit bigger", and a thumb is a coarse
 * tool for a one-step change.
 *
 * ## Done
 *
 * A tick at the end of the bar closes the controls and puts the caret on the
 * line after the picture, keyboard up — without it the only way back to
 * writing was to tap the picture again and then find a line to tap.
 *
 * ## Wrap
 *
 * "Text right" and "Text left" (`inline-left`, `inline-right`) float the
 * prose around the picture on web. The editor shows it: a wrapped picture is
 * drawn `float` — the frame alone, filling the column the editor gives it —
 * beside the line that follows, and its controls (`ImageControls`) go under
 * the pair, full width, rather than squeezed into the picture's column.
 */

/** Web's `ALIGNMENT_BUTTONS` for images: three, no justify. */
const IMAGE_ALIGNS = ALIGNMENTS.filter((entry) => entry.id !== "justify");

const STEP = 10;
const THUMB = 18;
const SLIDER_HEIGHT = 30;

const clamp = (value: number) =>
  Math.max(IMAGE_WIDTH_MIN, Math.min(IMAGE_WIDTH_MAX, Math.round(value)));

const WidthSlider = ({
  onChange,
  value,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const theme = useAppTheme();
  const trackWidth = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Where the drag began, in track pixels. Moves are measured from it with
  // the gesture's `dx` rather than read from `locationX`, which on Android
  // is relative to whichever view is under the finger at that moment — and
  // a finger sliding along a track leaves it constantly.
  const origin = useRef(0);

  const fromX = (x: number) => {
    const usable = Math.max(1, trackWidth.current - THUMB);
    const ratio = Math.max(0, Math.min(1, (x - THUMB / 2) / usable));
    onChangeRef.current(
      clamp(IMAGE_WIDTH_MIN + ratio * (IMAGE_WIDTH_MAX - IMAGE_WIDTH_MIN)),
    );
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        origin.current = event.nativeEvent.locationX;
        fromX(origin.current);
      },
      onPanResponderMove: (_event, gesture) =>
        fromX(origin.current + gesture.dx),
      // The scroll view asks for the touch as soon as it moves; saying no is
      // what keeps a drag along the slider from scrolling the document.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  const ratio = (value - IMAGE_WIDTH_MIN) / (IMAGE_WIDTH_MAX - IMAGE_WIDTH_MIN);

  return (
    <View
      accessibilityLabel="Image width"
      accessibilityRole="adjustable"
      accessibilityValue={{
        max: IMAGE_WIDTH_MAX,
        min: IMAGE_WIDTH_MIN,
        now: value,
      }}
      onLayout={(event) => {
        trackWidth.current = event.nativeEvent.layout.width;
      }}
      style={styles.slider}
      {...pan.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: theme.material.edge }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.accent.solid, width: `${ratio * 100}%` },
          ]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: theme.accent.solid,
            left: `${ratio * 100}%`,
            marginLeft: -ratio * THUMB,
          },
        ]}
      />
    </View>
  );
};

export interface ImageBlockProps {
  image: RichImageBlock;
  index: number;
  selected: boolean;
  /** True while the composer is still uploading what this points at. */
  uploading: boolean;
  onSelect: (index: number | null) => void;
  onChange: (
    index: number,
    patch: Partial<Omit<RichImageBlock, "type" | "src">>,
  ) => void;
  onRemove: (index: number) => void;
  /** Close the controls and go back to typing after the picture. */
  onDone?: (index: number) => void;
  /**
   * Drawn beside text: the frame only, filling its column. The editor lays
   * out the column and draws `ImageControls` itself, under the whole row.
   */
  float?: boolean;
}

export type ImageControlsProps = Omit<
  ImageBlockProps,
  "float" | "selected" | "uploading"
>;

/** The bar under a selected picture: width, alignment, wrap, delete, done. */
export const ImageControls = ({
  image,
  index,
  onChange,
  onDone,
  onRemove,
  onSelect,
}: ImageControlsProps) => {
  const theme = useAppTheme();

  const width = clamp(image.widthPercent ?? 100);
  const align = image.align ?? "left";
  const wrap = (image.wrap ?? "full") as ImageWrap;

  const chip =
    (active?: boolean) =>
    ({ pressed }: { pressed: boolean }) => [
      styles.chip,
      {
        backgroundColor: active
          ? theme.accent.surfaceActive
          : pressed
            ? theme.material.fillPressed
            : "transparent",
      },
    ];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      {/* Width: web's delete · slider · percent, with a step at each end */}
      <View style={styles.group}>
        <Pressable
          accessibilityLabel="Remove image"
          hitSlop={space.xs}
          onPress={() => onRemove(index)}
          style={chip()}
        >
          <Ionicons color={theme.error} name="trash-outline" size={16} />
        </Pressable>
        <Pressable
          accessibilityLabel="Smaller"
          hitSlop={space.xs}
          onPress={() => onChange(index, { widthPercent: clamp(width - STEP) })}
          style={chip()}
        >
          <Ionicons color={theme.text} name="remove" size={16} />
        </Pressable>
        <WidthSlider
          onChange={(next) => onChange(index, { widthPercent: next })}
          value={width}
        />
        <Pressable
          accessibilityLabel="Larger"
          hitSlop={space.xs}
          onPress={() => onChange(index, { widthPercent: clamp(width + STEP) })}
          style={chip()}
        >
          <Ionicons color={theme.text} name="add" size={16} />
        </Pressable>
        <Text style={[styles.percent, { color: theme.textGray }]}>
          {width}%
        </Text>
        <IconButton
          accessibilityLabel="Done, back to typing"
          hitSlop={space.xs}
          icon="checkmark"
          onPress={() => (onDone ? onDone(index) : onSelect(null))}
          size={30}
          style={styles.done}
          tone="primary"
        />
      </View>

      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />

      {/* Alignment and wrap */}
      <View style={styles.group}>
        {IMAGE_ALIGNS.map((entry) => {
          const active = align === entry.id;
          return (
            <Pressable
              accessibilityLabel={entry.label}
              accessibilityState={{ selected: active }}
              key={entry.id}
              onPress={() =>
                onChange(index, {
                  align: entry.id === "left" ? undefined : entry.id,
                })
              }
              style={chip(active)}
            >
              <AlignGlyph
                align={entry.id}
                color={active ? theme.accent.textStrong : theme.text}
              />
            </Pressable>
          );
        })}

        <View style={styles.spacer} />

        {IMAGE_WRAPS.map((entry) => {
          const active = wrap === entry.id;
          return (
            <Pressable
              accessibilityState={{ selected: active }}
              key={entry.id}
              onPress={() => onChange(index, { wrap: entry.id })}
              style={chip(active)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? theme.accent.textStrong : theme.text },
                ]}
              >
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const ImageBlockView = ({
  float = false,
  image,
  index,
  onChange,
  onDone,
  onRemove,
  onSelect,
  selected,
  uploading,
}: ImageBlockProps) => {
  const theme = useAppTheme();

  const width = clamp(image.widthPercent ?? 100);
  const align = image.align ?? "left";

  const frame = (
    <Pressable
      accessibilityLabel={selected ? "Deselect image" : "Edit image"}
      accessibilityRole="imagebutton"
      onPress={() => onSelect(selected ? null : index)}
      style={[
        styles.row,
        {
          alignItems: float
            ? "stretch"
            : align === "center"
              ? "center"
              : align === "right"
                ? "flex-end"
                : "flex-start",
        },
      ]}
    >
      <View
        style={[
          styles.frame,
          {
            borderColor: selected ? theme.accent.solid : "transparent",
            width: float ? "100%" : `${width}%`,
          },
        ]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          source={{ uri: image.src }}
          style={[styles.image, { backgroundColor: theme.glass.field }]}
          transition={0}
        />
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  if (float) return frame;

  return (
    <View style={styles.root}>
      {frame}
      {selected ? (
        <ImageControls
          image={image}
          index={index}
          onChange={onChange}
          onDone={onDone}
          onRemove={onRemove}
          onSelect={onSelect}
        />
      ) : null}
    </View>
  );
};

export const ImageBlock = memo(ImageBlockView);

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.xs,
    marginTop: space.xs,
    padding: space.xs,
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 30,
    minWidth: 30,
    paddingHorizontal: space.s,
  },
  chipLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  done: { marginLeft: space.xxs },
  fill: { borderRadius: 2, height: "100%" },
  frame: {
    borderRadius: radius.sm,
    borderWidth: 2,
    overflow: "hidden",
  },
  group: { alignItems: "center", flexDirection: "row", gap: space.xxs },
  image: { aspectRatio: 16 / 9, width: "100%" },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  percent: {
    fontSize: fontSize.caption,
    fontVariant: ["tabular-nums"],
    minWidth: 40,
    textAlign: "center",
  },
  root: { marginVertical: space.xs },
  row: { width: "100%" },
  rule: { height: StyleSheet.hairlineWidth },
  slider: { flex: 1, height: SLIDER_HEIGHT, justifyContent: "center" },
  spacer: { flex: 1 },
  thumb: {
    borderRadius: THUMB / 2,
    height: THUMB,
    position: "absolute",
    top: (SLIDER_HEIGHT - THUMB) / 2,
    width: THUMB,
  },
  track: { borderRadius: 2, height: 4, overflow: "hidden" },
});
