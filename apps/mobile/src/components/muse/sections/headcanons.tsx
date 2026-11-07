import type { Muse } from "@nw/types";
import { StyleSheet, View } from "react-native";
import { HeadcanonsPanel } from "@/components/headcanons/headcanons-panel";
import { MiniHeader } from "@/components/muse/mini-header";
import { Divider, MusePanel, Shimmer } from "@/components/muse/panel";
import { toVerseOptions } from "@/lib/headcanons";
import { type MuseLook, museName } from "@/lib/muse-appearance";
import { space } from "@/theme";

/**
 * Web's `HeadcanonsSection`: traits, quick facts and headcanon cards on the
 * character's panel, under the same pinned header as Info and Story. Visitors
 * read it; the owner edits it right here, with the same trays as the Edit
 * character screen.
 */
export const MuseHeadcanonsSection = ({
  active,
  look,
  motion,
  muse,
  openHeadcanonId,
}: {
  /** Whether this section has been opened; the fetch waits for it. */
  active: boolean;
  look: MuseLook;
  /** Whether the empty-state drawing may move. */
  motion: boolean;
  muse: Muse | null;
  /** A shared headcanon link opens straight onto its card. */
  openHeadcanonId?: string | null;
}) => {
  const { accent } = look;
  const writer =
    muse?.pennedBy?.id && muse.pennedBy.username
      ? { id: muse.pennedBy.id, username: muse.pennedBy.username }
      : null;

  return (
    <MusePanel
      accent={accent}
      header={
        <>
          <MiniHeader look={look} muse={muse} />
          <Divider accent={accent} />
        </>
      }
      hideBackground={look.hideExpandedBackground}
    >
      {!muse?.id ? (
        <View style={styles.shimmer}>
          <Shimmer height={40} />
          <Shimmer height={80} />
          <Shimmer height={96} />
        </View>
      ) : (
        <HeadcanonsPanel
          accent={accent}
          active={active}
          key={muse.id}
          motion={motion}
          museId={muse.id}
          museName={museName(muse)}
          openHeadcanonId={openHeadcanonId}
          tone="card"
          verses={toVerseOptions(muse.verses)}
          writer={writer}
        />
      )}
    </MusePanel>
  );
};

const styles = StyleSheet.create({
  shimmer: { gap: space.sm, paddingTop: space.xs },
});
