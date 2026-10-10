import { Ionicons } from "@expo/vector-icons";
import type { CodexRelationship } from "@nw/types";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { FaceAvatar, type StoryFace } from "@/components/story/character-sheet";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import {
  nodeKey,
  type ResolvedTone,
  relationshipEnds,
  resolveTone,
  STRENGTH_LABELS,
  strengthWidth,
} from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The small parts the relationships views share: a tone drawn as the line it
 * is stroked with, the legend, and one relationship as a row.
 */

/** A 26×10 stroke in the tone's colour and dash — web's legend swatch. */
export const ToneSwatch = ({
  tone,
  width = 26,
}: {
  tone: ResolvedTone;
  width?: number;
}) => (
  <Svg height={10} width={width}>
    <Line
      stroke={tone.color}
      strokeDasharray={tone.dash}
      strokeLinecap="round"
      strokeWidth={3}
      x1={2}
      x2={width - 2}
      y1={5}
      y2={5}
    />
  </Svg>
);

/**
 * Every tone the story draws, with how many edges use it. Tapping one hides
 * or shows its edges on the mesh; in a list it is a plain legend.
 */
export const ToneLegend = ({
  counts,
  hidden,
  onToggle,
  palette,
}: {
  counts: Map<string, number>;
  hidden?: ReadonlySet<string>;
  onToggle?: (key: string) => void;
  palette: readonly ResolvedTone[];
}) => {
  const theme = useAppTheme();
  return (
    <ScrollView
      contentContainerStyle={styles.legend}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendScroll}
    >
      {palette.map((tone) => {
        const off = hidden?.has(tone.key) ?? false;
        return (
          <Pressable
            accessibilityLabel={`${tone.label}, ${counts.get(tone.key) ?? 0}${onToggle ? (off ? ", hidden" : ", shown") : ""}`}
            accessibilityRole={onToggle ? "switch" : undefined}
            accessibilityState={onToggle ? { checked: !off } : undefined}
            disabled={!onToggle}
            key={tone.key}
            onPress={() => onToggle?.(tone.key)}
            style={[
              styles.legendItem,
              {
                backgroundColor: theme.material.fill,
                borderColor: off
                  ? theme.material.edge
                  : withAlpha(tone.color, 0.5),
                opacity: off ? 0.45 : 1,
              },
            ]}
          >
            <ToneSwatch tone={tone} />
            <Text style={[styles.legendLabel, { color: theme.text }]}>
              {tone.label}
            </Text>
            <Text style={[styles.legendCount, { color: theme.textGray }]}>
              {counts.get(tone.key) ?? 0}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

/** Three dots, lit up to the relationship's strength. */
export const StrengthDots = ({
  color,
  strength,
}: {
  color: string;
  strength: number;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.dots}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.dot,
            { backgroundColor: step <= strength ? color : theme.material.edge },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * One relationship: both faces, which way it points, the author's words, the
 * tone and its weight. Web's table row, laid out for a phone.
 */
export const RelationshipRow = ({
  faces,
  light,
  onPress,
  palette,
  relationship,
}: {
  faces: readonly StoryFace[];
  light: boolean;
  onPress?: () => void;
  palette: readonly ResolvedTone[];
  relationship: CodexRelationship;
}) => {
  const theme = useAppTheme();
  const ends = relationshipEnds(relationship);
  const from = faces.find(
    (face) => nodeKey(face.id, face.refType) === ends.from,
  );
  const to = faces.find((face) => nodeKey(face.id, face.refType) === ends.to);
  const tone = resolveTone(relationship, palette, light);
  const weight =
    STRENGTH_LABELS[Math.min(2, Math.max(0, relationship.strength - 1))];

  return (
    <Pressable
      accessibilityHint={onPress ? "Opens the relationship" : undefined}
      accessibilityLabel={`${from?.name ?? "Someone"} ${relationship.isDirected ? "to" : "and"} ${to?.name ?? "someone"}: ${relationship.label}, ${tone.label}, ${weight}`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
          borderLeftColor: tone.color,
        },
      ]}
    >
      <View style={styles.pair}>
        {from ? (
          <FaceAvatar face={from} size={30} />
        ) : (
          <View style={styles.ghost} />
        )}
        <Ionicons
          color={theme.textGray}
          name={relationship.isDirected ? "arrow-forward" : "swap-horizontal"}
          size={14}
        />
        {to ? (
          <FaceAvatar face={to} size={30} />
        ) : (
          <View style={styles.ghost} />
        )}
      </View>
      <View style={styles.rowText}>
        <Text
          numberOfLines={1}
          style={[styles.names, { color: theme.textGray }]}
        >
          {from?.name ?? "Someone"} {relationship.isDirected ? "→" : "·"}{" "}
          {to?.name ?? "someone"}
        </Text>
        <Text numberOfLines={2} style={[styles.label, { color: theme.text }]}>
          {relationship.label}
        </Text>
        <View style={styles.meta}>
          <View
            style={[
              styles.toneBar,
              {
                backgroundColor: tone.color,
                height: strengthWidth(relationship.strength) + 1,
              },
            ]}
          />
          <Text style={[styles.toneLabel, { color: tone.color }]}>
            {tone.label}
          </Text>
          <Text style={[styles.weight, { color: theme.textGray }]}>
            · {weight}
          </Text>
          <StrengthDots color={tone.color} strength={relationship.strength} />
        </View>
      </View>
      {onPress ? (
        <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dot: { borderRadius: radius.full, height: 6, width: 6 },
  dots: { flexDirection: "row", gap: 3, marginLeft: "auto" },
  ghost: { height: 30, width: 30 },
  label: { fontSize: fontSize.body, fontWeight: "600" },
  legend: {
    alignItems: "center",
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  // A horizontal list in a column grows to whatever height it is offered;
  // it should be exactly one row of chips.
  legendScroll: { flexGrow: 0 },
  legendCount: { fontSize: fontSize.meta, fontWeight: "600" },
  legendItem: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.ms,
    paddingVertical: 5,
  },
  legendLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    marginTop: 2,
  },
  names: { fontSize: fontSize.caption },
  pair: { alignItems: "center", flexDirection: "row", gap: space.xs },
  row: {
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
    paddingLeft: space.ms,
  },
  rowText: { flex: 1, gap: 1, minWidth: 0 },
  toneBar: { borderRadius: 1, width: 14 },
  toneLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  weight: { fontSize: fontSize.meta },
});
