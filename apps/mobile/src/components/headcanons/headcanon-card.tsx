import { Ionicons } from "@expo/vector-icons";
import type { Headcanon, MuseFacts } from "@nw/types/headcanon";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { glassCard } from "@/components/muse/panel";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import type { CatalogLookups } from "@/lib/headcanons";
import { plainText } from "@/lib/story";
import { border, fontSize, radius, space } from "@/theme";
import { ChipRow, type HcColors, type HcTone, Pill } from "./parts";

/**
 * One headcanon in a list: title, a three-line excerpt, category and the
 * heart count. Spoilers stay veiled here — reading one is a deliberate second
 * tap, in the detail tray. Web's `HeadcanonCard`.
 */
export const HeadcanonCard = ({
  accent,
  colors,
  headcanon,
  lookups,
  onOpen,
  showVisibility,
  tone,
}: {
  accent?: string;
  colors: HcColors;
  headcanon: Headcanon;
  lookups: CatalogLookups;
  onOpen: (headcanon: Headcanon) => void;
  /** The owner sees who a card is for; visitors only see a lock on theirs. */
  showVisibility?: boolean;
  tone: HcTone;
}) => {
  const excerpt = plainText(headcanon.body);
  // An untitled card is titled by its first words — unless those words are
  // the spoiler.
  const title =
    headcanon.title ||
    (headcanon.spoiler
      ? "Untitled spoiler"
      : excerpt.length > 60
        ? `${excerpt.slice(0, 60)}…`
        : excerpt);

  const visibilityIcon =
    headcanon.visibility === "FRIENDS"
      ? "people-outline"
      : headcanon.visibility === "ONLY_ME"
        ? "lock-closed-outline"
        : null;

  return (
    <Pressable
      accessibilityLabel={`Open headcanon: ${title}`}
      accessibilityRole="button"
      onPress={() => onOpen(headcanon)}
      style={({ pressed }) => [
        styles.card,
        tone === "card"
          ? glassCard(accent)
          : { backgroundColor: colors.fill, borderColor: colors.edge },
        headcanon.pinned
          ? { borderColor: withAlpha(colors.accent, 0.7) }
          : null,
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={styles.top}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <View style={styles.icons}>
          {visibilityIcon &&
          (showVisibility || headcanon.visibility === "FRIENDS") ? (
            <Ionicons color={colors.muted} name={visibilityIcon} size={13} />
          ) : null}
          {headcanon.pinned ? (
            <Ionicons color={colors.accent} name="pin" size={14} />
          ) : null}
        </View>
      </View>

      {headcanon.title ? (
        headcanon.spoiler ? (
          <View style={[styles.veil, { backgroundColor: colors.fill }]}>
            <Ionicons color={colors.muted} name="eye-off-outline" size={13} />
            <Text style={[styles.veilLabel, { color: colors.muted }]}>
              Spoiler
            </Text>
          </View>
        ) : (
          <Text
            numberOfLines={3}
            style={[styles.excerpt, { color: colors.muted }]}
          >
            {excerpt}
          </Text>
        )
      ) : null}

      <View style={styles.foot}>
        <ChipRow style={styles.tags}>
          <Pill
            colors={colors}
            label={lookups.categoryLabel(headcanon.category)}
            soft
          />
          {headcanon.alternateUniverse ? (
            <Pill colors={colors} label="AU" />
          ) : null}
          {!headcanon.title && headcanon.spoiler ? (
            <Pill colors={colors} label="Spoiler" />
          ) : null}
        </ChipRow>
        {headcanon.heartCount > 0 ? (
          <View
            accessibilityLabel={`${headcanon.heartCount} hearts`}
            style={styles.hearts}
          >
            <Ionicons color={colors.muted} name="heart-outline" size={12} />
            <Text style={[styles.heartCount, { color: colors.muted }]}>
              {headcanon.heartCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

/**
 * The quick facts as read: each list as a row of short pills, strengths and
 * flaws side by side, and the this-or-that answers as one row of the sides
 * picked. Empty lists are left out. Web's `QuickFacts`.
 */
export const QuickFacts = ({
  colors,
  facts,
  lookups,
}: {
  colors: HcColors;
  facts: MuseFacts;
  lookups: CatalogLookups;
}) => {
  const lists = facts.blocks.filter(
    (b) => b.block !== "THIS_OR_THAT" && b.items.length > 0,
  );
  const strengths = lists.find((b) => b.block === "STRENGTHS");
  const flaws = lists.find((b) => b.block === "FLAWS");
  const picks = facts.thisOrThat
    .map((p) => {
      const pair = lookups.pair(p.pairKey);
      return pair ? (p.pick === "A" ? pair.a : pair.b) : null;
    })
    .filter((label): label is string => Boolean(label));
  const picksOn = facts.blocks.some((b) => b.block === "THIS_OR_THAT");

  const group = (block: { block: string; items: string[] }, flex = false) => (
    <View key={block.block} style={[styles.factGroup, flex && styles.flex]}>
      <Text style={[styles.factName, { color: colors.muted }]}>
        {lookups.blockLabel(block.block)}
      </Text>
      <ChipRow style={styles.factTags}>
        {block.items.map((item) => (
          <Pill colors={colors} key={item} label={item} />
        ))}
      </ChipRow>
    </View>
  );

  const rendered: ReactNode[] = [];
  let pairedDone = false;
  for (const block of facts.blocks) {
    if (block.block === "THIS_OR_THAT") {
      if (picksOn && picks.length > 0) {
        rendered.push(
          <View key="THIS_OR_THAT" style={styles.factGroup}>
            <Text style={[styles.factName, { color: colors.muted }]}>
              {lookups.blockLabel("THIS_OR_THAT")}
            </Text>
            <ChipRow style={styles.factTags}>
              {picks.map((label) => (
                <Pill colors={colors} key={label} label={label} soft />
              ))}
            </ChipRow>
          </View>,
        );
      }
      continue;
    }
    if (block.items.length === 0) continue;
    if (block.block === "STRENGTHS" || block.block === "FLAWS") {
      if (pairedDone) continue;
      pairedDone = true;
      if (strengths && flaws) {
        rendered.push(
          <View key="STRENGTHS_FLAWS" style={styles.columns}>
            {group(strengths, true)}
            {group(flaws, true)}
          </View>,
        );
        continue;
      }
    }
    rendered.push(group(block));
  }

  if (rendered.length === 0) return null;
  return <>{rendered}</>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  columns: { flexDirection: "row", gap: space.m },
  excerpt: { fontSize: fontSize.label, lineHeight: 19 },
  factGroup: { gap: space.s },
  factName: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  factTags: { gap: space.s },
  flex: { flex: 1, minWidth: 0 },
  foot: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "space-between",
  },
  heartCount: { fontSize: fontSize.caption, fontWeight: "600" },
  hearts: { alignItems: "center", flexDirection: "row", gap: 3 },
  icons: { alignItems: "center", flexDirection: "row", gap: space.s },
  tags: { flex: 1, gap: space.s },
  title: { flex: 1, fontSize: fontSize.body, fontWeight: "700" },
  top: { alignItems: "flex-start", flexDirection: "row", gap: space.sm },
  veil: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.s,
    justifyContent: "center",
    paddingVertical: space.m,
  },
  veilLabel: { fontSize: fontSize.caption, fontWeight: "700" },
});
