import { parseRichText } from "@nw/richtext";
import type { StoryBoardEventThread } from "@nw/types";
import { Image } from "expo-image";
import { memo, type ReactNode, useMemo, useState } from "react";
import { StyleSheet, Text, type TextStyle, View } from "react-native";
import { asColor, withAlpha } from "@/lib/color";
import { nativeFace } from "@/lib/editor-fonts";
import {
  type DialogDesign,
  type DialogEmbed,
  speakerAvatarUrl,
} from "@/lib/story";
import { fontSize, radius, space, useAppTheme } from "@/theme";

type Speaker = NonNullable<StoryBoardEventThread["museDialogAttrs"]>[string];

/**
 * One character's line inside a passage, in the design its author fixed.
 *
 * Web's six read-only designs, from `dialog-designs/`:
 *
 * - **card** — avatar, a card ruled and washed in the accent, the line in
 *   italics between ❝ ❞, the speaker's name under it.
 * - **bubble** — a messenger row: small avatar, name above a speech bubble.
 * - **quote** — just the quoted line, with "— Name" unless it is `quote-plain`.
 *
 * The `-colored` variants take the speaker's own accent when it has one and
 * fall back to the app's otherwise. `right` orientation mirrors card and
 * bubble; quotes look the same either way.
 */
export const DialogLine = memo(function DialogLine({
  design,
  dialog,
  speaker,
}: {
  design: DialogDesign;
  dialog: DialogEmbed;
  speaker?: Speaker;
}) {
  const theme = useAppTheme();
  const name = speaker?.name || dialog.storedName;
  const source = speaker?.sourceType ?? dialog.source;
  const own = asColor(speaker?.accent);
  const colored = design === "card-colored" || design === "bubble-colored";
  const accent = colored && own ? own : theme.accent.solid;
  const accentInk = colored && own ? own : theme.accent.text;
  const right = dialog.orientation === "right";
  const avatar = speakerAvatarUrl(dialog.speakerId, source);

  if (design === "quote" || design === "quote-plain") {
    const attributed = design === "quote" && name && name !== "Anonymous";
    return (
      <View style={styles.quote}>
        <Text style={[styles.line, styles.italic, { color: theme.text }]}>
          <Text style={[styles.mark, { color: theme.accent.text }]}>❝ </Text>
          <LineRuns font={dialog.font} html={dialog.html} italic />
          <Text style={[styles.mark, { color: theme.accent.text }]}> ❞</Text>
          {attributed ? (
            <Text style={[styles.attribution, { color: theme.textGray }]}>
              {`  — ${name}`}
            </Text>
          ) : null}
        </Text>
      </View>
    );
  }

  if (design === "bubble" || design === "bubble-colored") {
    return (
      <View style={[styles.bubbleRow, right && styles.reverse]}>
        <SpeakerAvatar color={accent} name={name} size={26} uri={avatar} />
        <View style={[styles.bubbleContent, right && styles.alignEnd]}>
          <Text style={[styles.bubbleSender, { color: theme.textGray }]}>
            {name}
          </Text>
          <View
            style={[
              styles.bubble,
              right ? styles.bubbleRight : styles.bubbleLeft,
              { backgroundColor: theme.material.fillPressed },
            ]}
          >
            {colored && own ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: withAlpha(own, 0.35) },
                ]}
              />
            ) : null}
            <Text style={[styles.line, { color: theme.text }]}>
              <LineRuns font={dialog.font} html={dialog.html} />
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        right
          ? { borderRightColor: accent, borderRightWidth: 3 }
          : { borderLeftColor: accent, borderLeftWidth: 3 },
        right && styles.reverse,
        { backgroundColor: withAlpha(accent, 0.08) },
      ]}
    >
      <SpeakerAvatar color={accent} name={name} size={40} uri={avatar} />
      <View style={[styles.cardBody, right && styles.alignEnd]}>
        <Text
          style={[
            styles.line,
            styles.italic,
            { color: theme.text, textAlign: right ? "right" : "left" },
          ]}
        >
          <Text style={[styles.mark, { color: accentInk }]}>❝ </Text>
          <LineRuns font={dialog.font} html={dialog.html} italic />
          <Text style={[styles.mark, { color: accentInk }]}> ❞</Text>
        </Text>
        <Text style={[styles.cardSender, { color: accentInk }]}>{name}</Text>
      </View>
    </View>
  );
});

/**
 * The spoken line's own formatting, as nested runs inside the caller's text.
 * Bold, italic, underline, strike and colour survive; the line's chosen face
 * applies to every run that did not pick one of its own.
 */
const LineRuns = ({
  font,
  html,
  italic = false,
}: {
  font: string | null;
  html: string;
  italic?: boolean;
}) => {
  const nodes = useMemo(() => parseRichText(html), [html]);
  const out: ReactNode[] = [];

  nodes.forEach((node, blockIndex) => {
    if (blockIndex > 0) out.push("\n");
    if (node.type === "image") return;
    node.children.forEach((inline, index) => {
      const key = `${blockIndex}-${index}`;
      if (inline.type === "break") {
        out.push("\n");
        return;
      }
      if (inline.type === "mention") {
        out.push(
          <Text key={key} style={styles.bold}>
            @{inline.name}
          </Text>,
        );
        return;
      }
      const bold = inline.marks.includes("bold");
      const slanted = italic || inline.marks.includes("italic");
      const face = nativeFace(
        inline.fontFamily ?? font ?? undefined,
        bold,
        slanted,
      );
      const underline = inline.marks.includes("underline");
      const strike = inline.marks.includes("strike");
      const style: TextStyle[] = [];
      if (face) style.push({ fontFamily: face.fontFamily });
      if (bold && !face?.baked) style.push(styles.bold);
      if (face?.baked) style.push({ fontStyle: "normal" });
      if (underline || strike) {
        style.push({
          textDecorationLine:
            underline && strike
              ? "underline line-through"
              : underline
                ? "underline"
                : "line-through",
        });
      }
      const color = asColor(inline.color);
      if (color) style.push({ color });
      out.push(
        <Text key={key} style={style}>
          {inline.text}
        </Text>,
      );
    });
  });

  return <>{out}</>;
};

const SpeakerAvatar = ({
  color,
  name,
  size,
  uri,
}: {
  color: string;
  name: string;
  size: number;
  uri: string | null;
}) => {
  const [failed, setFailed] = useState(false);
  const box = { borderRadius: size / 2, height: size, width: size };

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, box, { backgroundColor: color }]}>
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {(name || "?").charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      cachePolicy="memory-disk"
      contentFit="cover"
      onError={() => setFailed(true)}
      recyclingKey={uri}
      source={{ uri }}
      style={box}
      transition={0}
    />
  );
};

const styles = StyleSheet.create({
  alignEnd: { alignItems: "flex-end" },
  attribution: { fontSize: fontSize.label, fontStyle: "normal" },
  bold: { fontWeight: "700" },
  bubble: {
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleContent: { flexShrink: 1, gap: 3, maxWidth: "80%" },
  bubbleLeft: { borderBottomLeftRadius: 4 },
  bubbleRight: { borderBottomRightRadius: 4 },
  bubbleRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: space.sm,
    marginVertical: 6,
  },
  bubbleSender: { fontSize: fontSize.caption, marginHorizontal: 10 },
  card: {
    alignItems: "flex-start",
    borderRadius: radius.md + 4,
    flexDirection: "row",
    gap: 10,
    marginVertical: space.sm,
    padding: 10,
  },
  cardBody: { flex: 1, gap: 2, minWidth: 0 },
  cardSender: { fontSize: fontSize.label, fontWeight: "600" },
  fallback: { alignItems: "center", justifyContent: "center" },
  initial: { color: "#fff", fontWeight: "700" },
  italic: { fontStyle: "italic" },
  line: { fontSize: fontSize.body, lineHeight: 24 },
  mark: { fontStyle: "normal", opacity: 0.7 },
  quote: { marginVertical: space.sm, paddingHorizontal: space.md },
  reverse: { flexDirection: "row-reverse" },
});
