import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useFoldReveal } from "@/animation/effects";
import { Text } from "@/components/text";
import { RichText, richTextBlockCount } from "@/components/rich-text";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Rich text that folds when it is long — web's `AboutRichText`.
 *
 * ## Measured, not guessed
 *
 * Whether a document needs folding is decided from its rendered height, as
 * web decides it from `scrollHeight`: the same words are four lines on a
 * tablet and nine on a phone, and a character count cannot know which. The
 * content is laid out at its natural height inside a box capped at
 * `collapsedHeight`; `onLayout` on the content reports the natural height,
 * and anything past the cap plus a line of slack is "overflowing" — which is
 * when, and only when, the fade and the toggle appear. A document that fits
 * never shows either, so a short About looks exactly as it did.
 *
 * ## Folding is also a layout budget
 *
 * `maxBlocks` draws only the first so-many blocks while folded, so a
 * two-thousand-word prompt behind a fold costs six lines of text shaping
 * rather than a screen of it. A document cut this way is overflowing by
 * definition, whatever its measured height.
 *
 * ## The text is the toggle too
 *
 * As on web (`handleContentClick`), a tap anywhere on a long document folds or
 * unfolds it, not only on "Read more...". Links, mentions, images and embedded
 * cards are touchables of their own inside `RichText`, so they take their
 * taps first and never fold anything. The button stays, and is what a screen
 * reader is offered: the text itself is not made one big button.
 *
 * ## It travels
 *
 * Opening and shutting animate the fold's height, as web transitions its
 * `max-height` — see `useFoldReveal`, which also keeps a recycled feed cell
 * from playing someone else's post as a fold.
 *
 * ## Owned or lent state
 *
 * On its own it remembers whether it is open. A recycling list cannot let it
 * — the cell would carry one post's "open" to the next — so `expanded` and
 * `onToggle` hand the state to whoever owns the list, and the component
 * becomes a pure view of it.
 */

/** Web's `COLLAPSED_HEIGHT`, at this app's line height: about five lines. */
export const DEFAULT_COLLAPSED_HEIGHT = 120;

/** A line of slack, as web allows four pixels: a hair over is not "long". */
const SLACK = 24;

/** Web's `FadeOverlay`: 3rem. */
const FADE = 48;

const alpha0 = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}00` : "transparent";

export const CollapsibleRichText = ({
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  expanded,
  fadeColor,
  html,
  maxBlocks,
  onToggle,
}: {
  collapsedHeight?: number;
  /** Lent state; omit to let the component keep its own. */
  expanded?: boolean;
  /** The surface behind the text, which the fade dissolves into. */
  fadeColor: string;
  html: string | null | undefined;
  /** Blocks drawn while folded. Omit to lay the whole document out. */
  maxBlocks?: number;
  onToggle?: () => void;
}) => {
  const theme = useAppTheme();
  const [own, setOwn] = useState(false);
  const [natural, setNatural] = useState<number | null>(null);
  /**
   * The height measured while the whole of a cut document is drawn. Cleared
   * whenever it is cut again, so an opening always waits for this document's
   * own measurement and never grows to the last post a recycled cell held.
   */
  const [whole, setWhole] = useState<number | null>(null);

  const open = expanded ?? own;

  const truncated =
    maxBlocks !== undefined && richTextBlockCount(html) > maxBlocks;
  const overflowing =
    truncated || (natural !== null && natural > collapsedHeight + SLACK);

  const fold = useFoldReveal({
    collapsedHeight,
    natural: truncated ? whole : natural,
    open,
    resetKey: html,
  });
  // Drawn in part only while resting shut.
  const cut = !fold.full && truncated;

  useEffect(() => {
    if (cut) setWhole(null);
  }, [cut]);

  const toggle = () => {
    fold.arm();
    if (onToggle) onToggle();
    else setOwn((value) => !value);
  };

  return (
    <View>
      <Pressable accessible={false} disabled={!overflowing} onPress={toggle}>
        <Animated.View style={fold.clipStyle}>
          <View
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height;
              // Only the whole document says how tall the document is.
              if (cut) return;
              setNatural(height);
              if (truncated) setWhole(height);
            }}
          >
            <RichText html={html} maxBlocks={cut ? maxBlocks : undefined} />
          </View>

          {overflowing && fold.showFade ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.fade, { opacity: fold.fadeOpacity }]}
            >
              <LinearGradient
                colors={[alpha0(fadeColor), fadeColor]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      </Pressable>

      {overflowing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          hitSlop={space.xs}
          onPress={toggle}
          style={({ pressed }) => [
            styles.toggle,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.toggleLabel, { color: theme.accent.text }]}>
            {open ? "Show less..." : "Read more..."}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fade: { bottom: 0, height: FADE, left: 0, position: "absolute", right: 0 },
  toggle: { alignSelf: "flex-start", marginTop: space.xs, minHeight: 28 },
  toggleLabel: { fontSize: fontSize.label, fontWeight: "600" },
});
