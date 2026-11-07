import type { Muse } from "@nw/types";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MuseGate, useOwnedMuse } from "@/components/edit-muse/shared";
import { HeadcanonsPanel } from "@/components/headcanons/headcanons-panel";
import { Text } from "@/components/text";
import { toVerseOptions } from "@/lib/headcanons";
import { museName } from "@/lib/muse-appearance";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Web's Edit muse → Headcanons: the same panel the profile shows, on the
 * viewer's own theme, with the one tool the profile leaves out — moving cards
 * up and down. Traits and quick facts belong to this verse; cards can be for
 * one verse or all of them.
 */
export default function EditMuseHeadcanons() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Headcanons muse={muse} />}
    </MuseGate>
  );
}

const Headcanons = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const id = muse.id ?? "";
  const writer =
    muse.pennedBy?.id && muse.pennedBy.username
      ? { id: muse.pennedBy.id, username: muse.pennedBy.username }
      : null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.body,
        { paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={[styles.intro, { color: theme.textGray }]}>
        Traits, quick facts and the little truths canon never told you about{" "}
        {muse.firstName}. Pick who sees each headcanon.
      </Text>
      <HeadcanonsPanel
        museId={id}
        museName={museName(muse)}
        tone="page"
        verses={toVerseOptions(muse.verses)}
        writer={writer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, padding: space.m },
  intro: {
    fontSize: fontSize.label,
    lineHeight: 20,
    paddingHorizontal: space.xs,
  },
});
