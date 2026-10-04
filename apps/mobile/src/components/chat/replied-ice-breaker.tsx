import { Ionicons } from "@expo/vector-icons";
import { type MarkdownMark, tokenizeMarkdown } from "@nw/chat";
import { mixColors } from "@nw/theme";
import type { IceBreaker } from "@nw/types";
import { useMemo } from "react";
import { StyleSheet, type TextStyle, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { GradientSurface } from "@/components/gradient-surface";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "This answers an ice breaker" — the tab above a reply.
 *
 * A message can reply to two different things: an earlier message, or an ice
 * breaker. `repliedTo.type` says which, and only one of `repliedTo.message` and
 * `repliedTo.iceBreaker` is filled in. This client read the message half and
 * ignored the other, so answering a prompt produced a bubble with no
 * explanation in a conversation that had nothing else in it — the one place the
 * quote is load-bearing, since there is no earlier message to infer it from.
 *
 * ## Why it does not look like the other quote
 *
 * A quoted *message* is a muted panel with a coloured spine: it points back up
 * the thread you can already see. An ice breaker is not in the thread and never
 * will be, so web draws it as its own filled pill in the prompt's colour, with
 * the author's face and a "Ice breaker" tag (`RepliedToIceBreakerQuote`). Two
 * different things, drawn two different ways, deliberately.
 *
 * ## Its markers are still text
 *
 * Ice breakers are stored as plain text — `**bold**` reaches here as those nine
 * characters, unlike a chat message, which is HTML by the time it is stored.
 * Web parses them for this preview so the tab does not show literal asterisks;
 * `tokenizeMarkdown` does the same job here, with the delimiter runs dropped
 * rather than dimmed (the composer dims them because they are still editable —
 * here they are not).
 */

/** Web slices the preview at 100 characters before rendering it. */
const PREVIEW_LENGTH = 100;

/** How far the fill darkens toward the foot. Web: `color-mix(… 55%, black)`. */
const DARKEN_TO = 0.55;

const MARK_STYLES: Record<MarkdownMark, TextStyle> = {
  bold: { fontWeight: "700" },
  code: {},
  italic: { fontStyle: "italic" },
  strike: { textDecorationLine: "line-through" },
};

export const RepliedIceBreaker = ({
  iceBreaker,
}: {
  iceBreaker: IceBreaker;
}) => {
  const theme = useAppTheme();

  const runs = useMemo(() => {
    const plain = iceBreaker.message
      // Ice breakers are plain text, but a message that came from somewhere
      // else — or from a future editor — should not print its own tags.
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, PREVIEW_LENGTH);

    return tokenizeMarkdown(plain).filter((token) => !token.delimiter);
  }, [iceBreaker.message]);

  const from = iceBreaker.color ?? theme.accent.surface;
  const to = iceBreaker.color
    ? mixColors(iceBreaker.color, DARKEN_TO, "#000000")
    : theme.accent.surfaceActive;

  return (
    <GradientSurface
      // Not pressable: unlike a quoted message there is nowhere to jump to —
      // the prompt lives on the inbox rail, not in this conversation.
      from={from}
      style={styles.pill}
      to={to}
    >
      <View style={styles.face}>
        <Avatar
          name={iceBreaker.source.name}
          size={22}
          uri={iceBreaker.source.image}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.tag}>
          <Ionicons color="rgba(255,255,255,0.85)" name="sparkles" size={8} />
          <Text style={styles.tagLabel}>Ice breaker</Text>
        </View>

        <Text numberOfLines={1} style={styles.text}>
          {runs.map((token, index) => (
            <Text
              // Index keys: these runs have no identity of their own and the
              // list is rebuilt whenever the message changes.
              key={`${index}-${token.text}`}
              style={token.marks.map((mark) => MARK_STYLES[mark])}
            >
              {token.text}
            </Text>
          ))}
        </Text>
      </View>
    </GradientSurface>
  );
};

const styles = StyleSheet.create({
  body: { flexShrink: 1, gap: 1 },
  face: {
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  pill: {
    alignItems: "center",
    // Web's pill shape, which is what separates it at a glance from the
    // square-cornered panel a quoted message gets.
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.xs,
    paddingRight: space.ms,
    paddingVertical: space.xs - 1,
  },
  tag: { alignItems: "center", flexDirection: "row", gap: space.xxs },
  tagLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  text: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: "500",
  },
});
