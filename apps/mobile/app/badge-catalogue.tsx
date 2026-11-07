import { BADGE_CATALOGUE_BY_RARITY, type CatalogueBadge, RARITY_LABEL } from "@nw/badges/catalogue";
import { memo, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeCrest } from "@/components/badges";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Every badge in Novelist World and what earns it — web's `/rp/badges`.
 *
 * Deliberately not personalised: this is "what is there to collect". A
 * novelist's own progress lives on the profile's badges page, which also knows
 * what they hold. Its header is declared on the route in `app/_layout.tsx`.
 */

const CREST = 64;
/** Fewer than web's six: the fade only has to run out on one width here. */
const GHOSTS = [0, 1, 2];

const keyExtractor = (badge: CatalogueBadge) => badge.code;

const CatalogueCard = memo(function CatalogueCard({
  badge,
}: {
  badge: CatalogueBadge;
}) {
  const theme = useAppTheme();
  const rare = badge.rarity !== "COMMON";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View style={styles.main}>
        {/* Still until tapped: a page of crests all moving at once starved the
            JS thread for twenty seconds, as it did on the shelf. */}
        <BadgeCrest
          animated={false}
          code={badge.code}
          replayOnPress
          size={CREST}
        />
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              {badge.title}
            </Text>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: rare
                    ? theme.accent.tint
                    : theme.material.fillPressed,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: rare ? theme.accent.text : theme.textGray },
                ]}
              >
                {RARITY_LABEL[badge.rarity]}
              </Text>
            </View>
          </View>
          <Text style={[styles.description, { color: theme.textGray }]}>
            {badge.description}
          </Text>
        </View>
      </View>
      <View style={[styles.howTo, { borderColor: theme.material.edge }]}>
        <Text style={[styles.howToLabel, { color: theme.accent.text }]}>
          How to earn it
        </Text>
        <Text style={[styles.howToText, { color: theme.text }]}>
          {badge.requirement}
        </Text>
      </View>
    </View>
  );
});

export default function BadgeCatalogueScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: CatalogueBadge }) => <CatalogueCard badge={item} />,
    [],
  );

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + space.xl },
      ]}
      data={BADGE_CATALOGUE_BY_RARITY}
      initialNumToRender={6}
      keyExtractor={keyExtractor}
      ListFooterComponent={
        <View style={styles.more}>
          <Text style={[styles.moreLabel, { color: theme.textGray }]}>
            More badges on the way
          </Text>
          {GHOSTS.map((ghost) => (
            <View
              key={ghost}
              style={[
                styles.card,
                styles.ghost,
                {
                  borderColor: theme.material.edge,
                  opacity: 1 - ghost * 0.3,
                },
              ]}
            >
              <View
                style={[styles.ghostArt, { borderColor: theme.material.edge }]}
              >
                <Text style={[styles.ghostMark, { color: theme.textGray }]}>
                  ?
                </Text>
              </View>
            </View>
          ))}
        </View>
      }
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Badges of Novelist World
          </Text>
          <Text style={[styles.heroBody, { color: theme.textGray }]}>
            Every badge there is to earn, and what earns it. Badges you hold
            show on your profile and anywhere else novelists see your name.
          </Text>
          <Text style={[styles.count, { color: theme.textGray }]}>
            {`The collection · ${BADGE_CATALOGUE_BY_RARITY.length} badges`}
          </Text>
        </View>
      }
      maxToRenderPerBatch={4}
      renderItem={renderItem}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  chipLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  content: { gap: space.m, padding: space.md },
  count: { fontSize: fontSize.caption, fontWeight: "700" },
  description: { fontSize: fontSize.label, lineHeight: 19 },
  ghost: { alignItems: "center", borderStyle: "dashed", flexDirection: "row" },
  ghostArt: {
    alignItems: "center",
    borderRadius: CREST / 2,
    borderStyle: "dashed",
    borderWidth: border.edge,
    height: CREST,
    justifyContent: "center",
    width: CREST,
  },
  ghostMark: { fontSize: fontSize.title, fontWeight: "700" },
  hero: { gap: space.sm },
  heroBody: { fontSize: fontSize.body, lineHeight: 21 },
  heroTitle: { fontSize: fontSize.title, fontWeight: "700" },
  howTo: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: 2,
    padding: space.sm,
  },
  howToLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  howToText: { fontSize: fontSize.label, lineHeight: 19 },
  main: { alignItems: "center", flexDirection: "row", gap: space.m },
  more: { gap: space.m, marginTop: space.md },
  moreLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  text: { flex: 1, gap: 2, minWidth: 0 },
  title: { flexShrink: 1, fontSize: fontSize.body, fontWeight: "700" },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
});
