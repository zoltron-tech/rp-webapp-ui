import type { Badge } from "@nw/types/badge";
import { toFormattedDate } from "@nw/utils";
import { FlatList, StyleSheet, View } from "react-native";
import { BadgeCrest, hasVisibleBadges } from "@/components/badges";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Somebody else's badges, as a tray.
 *
 * ## Why this is not the badges screen
 *
 * The shelf at `(tabs)/(profile)/badges` shows the whole catalogue — earned and
 * locked, twelve tiles, with what each one takes. That screen cannot be opened
 * for anybody else: `GET /badge` answers for the *caller*, so pointing another
 * novelist's row at it would show your shelf under their name.
 *
 * What a profile *does* carry is `novelist.badges` — the ones that novelist has
 * actually earned, already fetched, already on screen as the row this opens
 * from. So the answer for somebody else is the list of what they have, and it
 * needs no request at all.
 *
 * A tray rather than a pushed screen, per `AGENTS.md`: it is a detail about the
 * thing under it rather than a place, and it comes back to the profile by
 * swiping down.
 *
 * ## Scrollable, because twelve of these do not fit
 *
 * Each row is a 44pt crest with a title and a description — around 70pt. Six
 * fill the tray's allowance on the 375×667 baseline, so the list scrolls inside
 * it and the sheet takes a fixed share of the screen rather than growing with
 * the count.
 */
export const BadgeSheet = ({
  badges,
  onClose,
  ownerName,
  visible,
}: {
  badges: Badge[] | undefined;
  onClose: () => void;
  /** Whose they are, for the heading. */
  ownerName?: string | null;
  visible: boolean;
}) => {
  const theme = useAppTheme();

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.62}
      onClose={onClose}
      subtitle={
        hasVisibleBadges(badges) ? `${(badges ?? []).length} earned` : undefined
      }
      title={ownerName ? `${ownerName}'s badges` : "Badges"}
      visible={visible}
    >
      <FlatList
        contentContainerStyle={styles.content}
        data={badges ?? []}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textGray }]}>
            No badges earned yet.
          </Text>
        }
        renderItem={({ item }) => <BadgeSheetRow badge={item} />}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
};

/**
 * One earned badge: the crest, what it is called, and what it means.
 *
 * 44pt clears `DETAIL_THRESHOLD`, so these are the real artwork rather than the
 * coloured discs a list size falls back to — and they animate, because a tray
 * with six of them in it is the second place on this app where somebody is
 * actually looking at the drawings.
 */
const BadgeSheetRow = ({ badge }: { badge: Badge }) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.material.fillTranslucent,
          borderColor: theme.material.edgeTranslucent,
        },
      ]}
    >
      <BadgeCrest code={badge.code} replayOnPress size={44} />

      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {badge.title}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.body, { color: theme.textGray }]}
        >
          {badge.description}
        </Text>

        {badge.awardedAt ? (
          <Text style={[styles.awarded, { color: theme.accent.text }]}>
            Earned {toFormattedDate(badge.awardedAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  awarded: { fontSize: fontSize.meta, fontWeight: "700" },
  body: { fontSize: fontSize.caption, lineHeight: 16 },
  content: { gap: space.sm, paddingBottom: space.sm },
  empty: {
    fontSize: fontSize.label,
    paddingVertical: space.lg,
    textAlign: "center",
  },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    padding: space.ms,
  },
  text: { flex: 1, gap: space.xxs },
  title: { fontSize: fontSize.body, fontWeight: "700" },
});
