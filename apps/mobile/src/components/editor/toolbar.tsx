import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_FONT } from "@nw/fonts";
import {
  BULLET_GLYPHS,
  FONT_SIZES,
  ORDERED_LIST_STYLES,
  type RichAlign,
  type RichMark,
} from "@nw/richtext";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { nativeFace } from "@/lib/editor-fonts";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { memo } from "react";

/**
 * The formatting bar — web's toolbar, rearranged for a thumb.
 *
 * Every control web's toolbar has is here, in web's order, except the font
 * family (see `block-input.tsx` for why a font you cannot see is not offered).
 * What changed is the shape: web puts the bar *above* the editor and scrolls
 * it sideways with arrow buttons; this sits *below* the text, directly above
 * the keyboard, where every other phone editor puts it and where a thumb rests.
 * It scrolls sideways too, but by touch.
 *
 * Every dropdown became a sheet: size, highlight, bullet style, numbering
 * style, quotation marks. The two list buttons do double duty as on web — tap
 * to toggle the list, and once the line *is* a list a second chip beside the
 * button shows the style and opens the picker.
 *
 * Pictures and GIFs are not here. They are attachments to the *post* rather
 * than formatting of the *text*, and the composer keeps them beside the song
 * button in its own top row, where web keeps them too.
 */

export interface ToolbarState {
  marks: RichMark[];
  /** The family under the caret or selection; undefined for the default. */
  fontFamily: string | undefined;
  highlight: string | null;
  align: RichAlign;
  fontSize: number | undefined;
  list: { ordered: boolean; style?: string } | null;
  /** False when the caret is on an image or nowhere: text buttons dim. */
  hasText: boolean;
}

export interface ToolbarActions {
  onMark: (mark: RichMark) => void;
  onFont: () => void;
  onSize: () => void;
  onHighlight: () => void;
  onAlign: () => void;
  onList: (ordered: boolean) => void;
  onListStyle: (ordered: boolean) => void;
  onQuotes: () => void;
}

// Ionicons has no text-alignment icons; its closest "menu" glyphs are all
// full-width bars and look alike, so the state read as broken. Four bars of
// unequal length, hung on the alignment they stand for, is the glyph every
// editor draws — and it says exactly which alignment is on.
const ALIGN_BARS = [16, 10, 14, 8] as const;

const ALIGN_ITEMS: Record<RichAlign, "flex-start" | "center" | "flex-end"> = {
  center: "center",
  justify: "flex-start",
  left: "flex-start",
  right: "flex-end",
};

export const AlignGlyph = ({
  align,
  color,
}: {
  align: RichAlign;
  color: string;
}) => (
  <View style={[styles.bars, { alignItems: ALIGN_ITEMS[align] }]}>
    {ALIGN_BARS.map((width, index) => (
      <View
        key={index}
        style={[
          styles.bar,
          { backgroundColor: color, width: align === "justify" ? 16 : width },
        ]}
      />
    ))}
  </View>
);

const Button = ({
  active,
  children,
  disabled,
  label,
  onPress,
  tint,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  tint?: string;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      hitSlop={space.xs}
      // `onPress`, not `onPressIn`. The first version fired on press-in to
      // mimic web's `onMouseDown`, and every horizontal drag across the bar
      // began with a press-in on whichever button the thumb landed on — the
      // bar could not be scrolled without pressing something. A release-time
      // press is cancelled by the scroll view the moment the drag starts, and
      // `keyboardShouldPersistTaps="always"` on that view is what keeps the
      // field's focus through the tap.
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: active
            ? theme.accent.surfaceActive
            : pressed
              ? theme.glass.fillPressed
              : "transparent",
          borderColor: active ? theme.accent.surfaceHover : "transparent",
          opacity: disabled ? 0.4 : 1,
        },
        tint ? { borderColor: tint } : null,
      ]}
    >
      {children}
    </Pressable>
  );
};

const EditorToolbarView = ({
  actions,
  state,
}: {
  actions: ToolbarActions;
  state: ToolbarState;
}) => {
  const theme = useAppTheme();
  const ink = (active: boolean) =>
    active ? theme.accent.textStrong : theme.text;

  const size = FONT_SIZES.find((entry) => entry.px === state.fontSize);
  const sizeLabel =
    size?.label === "Heading"
      ? "H1"
      : size?.label === "Subheading"
        ? "H2"
        : "Aa";

  // The trigger is drawn in the family it would open on, as web's is.
  const fontFace = nativeFace(state.fontFamily ?? DEFAULT_FONT, false, false);

  const bulletStyle = state.list && !state.list.ordered ? state.list : null;
  const orderedStyle = state.list?.ordered ? state.list : null;


  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.glass.opaque,
          borderTopColor: theme.glass.edge,
        },
      ]}
    >
      {/*
        The scrolling part, and a fade over its right edge. The bar is wider
        than a phone and nothing about a row of buttons says so; the fade is
        what says "more this way" without a scrollbar under the keyboard.
      */}
      <View style={styles.scroller}>
        <ScrollView
          contentContainerStyle={styles.row}
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
        >
          <Button
            active={state.fontFamily !== undefined}
            disabled={!state.hasText}
            label="Font"
            onPress={actions.onFont}
          >
            <Text
              style={[
                styles.fontLabel,
                fontFace ? { fontFamily: fontFace.fontFamily } : null,
                { color: ink(state.fontFamily !== undefined) },
              ]}
            >
              Ab
            </Text>
          </Button>

          <Button
            active={state.fontSize !== undefined}
            disabled={!state.hasText}
            label="Text size"
            onPress={actions.onSize}
          >
            <Text
              style={[
                styles.sizeLabel,
                { color: ink(state.fontSize !== undefined) },
              ]}
            >
              {sizeLabel}
            </Text>
          </Button>

          <Divider />

          <Button
            active={state.marks.includes("bold")}
            disabled={!state.hasText}
            label="Bold"
            onPress={() => actions.onMark("bold")}
          >
            <Text
              style={[
                styles.glyph,
                styles.bold,
                { color: ink(state.marks.includes("bold")) },
              ]}
            >
              B
            </Text>
          </Button>
          <Button
            active={state.marks.includes("italic")}
            disabled={!state.hasText}
            label="Italic"
            onPress={() => actions.onMark("italic")}
          >
            <Text
              style={[
                styles.glyph,
                styles.italic,
                { color: ink(state.marks.includes("italic")) },
              ]}
            >
              I
            </Text>
          </Button>
          <Button
            active={state.marks.includes("underline")}
            disabled={!state.hasText}
            label="Underline"
            onPress={() => actions.onMark("underline")}
          >
            <Text
              style={[
                styles.glyph,
                styles.underline,
                { color: ink(state.marks.includes("underline")) },
              ]}
            >
              U
            </Text>
          </Button>
          <Button
            active={Boolean(state.highlight)}
            disabled={!state.hasText}
            label="Highlight"
            onPress={actions.onHighlight}
            tint={state.highlight ?? undefined}
          >
            <Ionicons
              color={state.highlight ?? theme.text}
              name="color-fill-outline"
              size={18}
            />
          </Button>

          <Divider />

          <Button
            active={state.align !== "left"}
            disabled={!state.hasText}
            label="Alignment"
            onPress={actions.onAlign}
          >
            <AlignGlyph
              align={state.align}
              color={ink(state.align !== "left")}
            />
          </Button>

          <Divider />

          <View style={styles.pair}>
            <Button
              active={Boolean(bulletStyle)}
              disabled={!state.hasText}
              label="Bulleted list"
              onPress={() => actions.onList(false)}
            >
              <Ionicons
                color={ink(Boolean(bulletStyle))}
                name="list"
                size={18}
              />
            </Button>
            {bulletStyle ? (
              <Button
                label="Bullet style"
                onPress={() => actions.onListStyle(false)}
              >
                <Text style={[styles.styleChip, { color: theme.accent.text }]}>
                  {BULLET_GLYPHS[bulletStyle.style ?? "bullet"] ?? "•"}
                  <Ionicons
                    color={theme.textGray}
                    name="chevron-down"
                    size={10}
                  />
                </Text>
              </Button>
            ) : null}
          </View>

          <View style={styles.pair}>
            <Button
              active={Boolean(orderedStyle)}
              disabled={!state.hasText}
              label="Numbered list"
              onPress={() => actions.onList(true)}
            >
              <Text
                style={[styles.glyph, { color: ink(Boolean(orderedStyle)) }]}
              >
                1.
              </Text>
            </Button>
            {orderedStyle ? (
              <Button
                label="Numbering style"
                onPress={() => actions.onListStyle(true)}
              >
                <Text style={[styles.styleChip, { color: theme.accent.text }]}>
                  {ORDERED_LIST_STYLES.find(
                    (entry) =>
                      entry.value === (orderedStyle.style ?? "decimal"),
                  )?.label ?? "1"}
                  <Ionicons
                    color={theme.textGray}
                    name="chevron-down"
                    size={10}
                  />
                </Text>
              </Button>
            ) : null}
          </View>

          <Divider />

          <Button
            disabled={!state.hasText}
            label="Insert quotation mark"
            onPress={actions.onQuotes}
          >
            <Text style={[styles.glyph, { color: theme.text }]}>❝</Text>
          </Button>
        </ScrollView>
        <LinearGradient
          colors={[`${theme.glass.opaque}00`, theme.glass.opaque]}
          end={{ x: 1, y: 0 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.fade}
        />
      </View>

      {/*
        Keyboard down, pinned outside the scroll. Android's back gesture does
        this too, but from a composer that also closes the sheet on a second
        press — a button that only ever hides the keys is the safer one.
      */}
      <Pressable
        accessibilityLabel="Hide keyboard"
        accessibilityRole="button"
        hitSlop={space.xs}
        onPress={() => Keyboard.dismiss()}
        style={({ pressed }) => [
          styles.dismiss,
          {
            backgroundColor: pressed
              ? theme.glass.fillPressed
              : "transparent",
            borderLeftColor: theme.glass.edge,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name="chevron-down" size={20} />
      </Pressable>
    </View>
  );
};

/** A rule between groups. At module scope: declared inside the bar it was a
 *  new component type every render, and its views were remounted each time. */
const Divider = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.divider, { backgroundColor: theme.glass.edge }]} />
  );
};

/**
 * Memoised: its two props are a memoised state object and a stable set of
 * actions, so it re-renders when the format at the caret changes and not for
 * every character typed.
 */
export const EditorToolbar = memo(EditorToolbarView);

const styles = StyleSheet.create({
  bar: { borderRadius: 1, height: 2 },
  bars: { gap: space.xxs, justifyContent: "center", width: 16 },
  bold: { fontWeight: "800" },
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    // 38 rather than 34: the bar sits above the keyboard where thumbs are
    // already, and four points is the difference between a hit and a miss
    // on a moving row.
    height: 38,
    justifyContent: "center",
    minWidth: 38,
    paddingHorizontal: space.xs + 1,
  },
  dismiss: {
    alignItems: "center",
    alignSelf: "stretch",
    borderLeftWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    width: 44,
  },
  divider: {
    alignSelf: "center",
    height: 22,
    marginHorizontal: space.xs,
    width: StyleSheet.hairlineWidth,
  },
  fade: {
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 28,
  },
  fontLabel: { fontSize: fontSize.body + 1 },
  glyph: { fontSize: fontSize.body, fontWeight: "600" },
  italic: { fontStyle: "italic" },
  pair: { alignItems: "center", flexDirection: "row", gap: space.xxs },
  root: {
    alignItems: "stretch",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    paddingLeft: space.sm,
    paddingRight: space.lg,
    paddingVertical: space.s,
  },
  scroller: { flex: 1 },
  sizeLabel: { fontSize: fontSize.label, fontWeight: "700" },
  styleChip: { fontSize: fontSize.label, fontWeight: "700" },
  underline: { textDecorationLine: "underline" },
});
