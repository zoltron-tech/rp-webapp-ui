import type { ReactNode } from "react";
import {
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Bone, SkeletonPulse } from "@/components/skeleton";
import { radius, space, useAppTheme } from "@/theme";

/**
 * Ghosts for the sheets and the secondary screens — the song picker, the fandom
 * picker, a group's friend picker, the devices list, and a story's codex,
 * timeline and map.
 *
 * Same rule as `list-skeletons.tsx`: each is drawn in the geometry of what it
 * stands in for, measured from that file's stylesheet, so the answer lands
 * where the ghost was.
 */

/** Varied line widths, so a column of ghosts does not read as a barcode. */
const WIDTHS: DimensionValue[] = ["62%", "48%", "70%", "55%", "40%", "66%"];
const widthAt = (index: number) => WIDTHS[index % WIDTHS.length];

const Frame = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: theme.material.fillTranslucent,
          borderColor: theme.material.edgeTranslucent,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/** `song-sheet.tsx`'s `Row`: 40pt artwork, title, subtitle. */
export const SongRowSkeleton = ({ index = 0 }: { index?: number }) => (
  <SkeletonPulse label="Loading songs">
    <Frame style={styles.song}>
      <Bone height={40} radius={radius.sm} width={40} />
      <View style={styles.text}>
        <Bone height={14} width={widthAt(index)} />
        <Bone height={10} width="35%" />
      </View>
    </Frame>
  </SkeletonPulse>
);

/** `fandom-sheet.tsx`: a colour dot and a name on a hairline-ruled row. */
export const FandomRowSkeleton = ({ index = 0 }: { index?: number }) => {
  const theme = useAppTheme();
  return (
    <SkeletonPulse label="Loading fandoms">
      <View
        style={[styles.fandom, { borderBottomColor: theme.material.edgeTranslucent }]}
      >
        <Bone circle height={10} on="page" />
        <Bone height={14} on="page" width={widthAt(index)} />
      </View>
    </SkeletonPulse>
  );
};

/** `create-group-sheet.tsx`'s friend row: a 40pt face, name and handle. */
export const FriendPickRowSkeleton = ({ index = 0 }: { index?: number }) => (
  <SkeletonPulse label="Loading friends">
    <Frame style={styles.friend}>
      <Bone circle height={40} />
      <View style={styles.text}>
        <Bone height={14} width={widthAt(index)} />
        <Bone height={10} width="30%" />
      </View>
      <Bone circle height={22} />
    </Frame>
  </SkeletonPulse>
);

/** One `SettingsGroup` of `rows` `SettingsRow`s — tile, label, subtitle, accessory. */
const SettingsGroupSkeleton = ({ rows }: { rows: number }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.group}>
      <Bone height={10} on="page" width={140} />
      <Frame style={styles.groupCard}>
        {Array.from({ length: rows }, (_, index) => (
          <View key={index}>
            {index > 0 ? (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.material.edgeTranslucent },
                ]}
              />
            ) : null}
            <View style={styles.settingsRow}>
              <Bone height={34} radius={9.5} width={34} />
              <View style={styles.text}>
                <Bone height={14} width={widthAt(index)} />
                <Bone height={10} width="75%" />
              </View>
              <Bone height={30} radius={radius.full} width={82} />
            </View>
          </View>
        ))}
      </Frame>
    </View>
  );
};

/** `app/edit-profile/devices.tsx`: the devices group and the account-wide one. */
export const DevicesSkeleton = () => (
  <SkeletonPulse label="Loading devices" style={styles.page}>
    <SettingsGroupSkeleton rows={3} />
    <SettingsGroupSkeleton rows={2} />
  </SkeletonPulse>
);

/**
 * `app/story/[storyId]/codex.tsx`: the tab pills, the cast as face chips, and
 * the entry cards a category tab draws.
 */
export const CodexSkeleton = () => (
  <SkeletonPulse label="Loading the codex" style={styles.codex}>
    <View style={styles.tabs}>
      {[118, 96, 84].map((width) => (
        <Bone
          height={34}
          key={width}
          on="page"
          radius={radius.full}
          width={width}
        />
      ))}
    </View>
    <View style={styles.codexBody}>
      <Bone height={10} on="page" width={90} />
      <View style={styles.chips}>
        {[112, 92, 124].map((width) => (
          <Bone
            height={34}
            key={width}
            on="page"
            radius={radius.full}
            width={width}
          />
        ))}
      </View>
      {[0, 1, 2].map((index) => (
        <Frame key={index} style={styles.entry}>
          <View style={styles.entryHead}>
            <Bone height={36} radius={9} width={36} />
            <Bone height={16} width={widthAt(index)} />
          </View>
          <Bone height={12} />
          <Bone height={12} width="85%" />
        </Frame>
      ))}
    </View>
  </SkeletonPulse>
);

/**
 * `app/story/[storyId]/timeline.tsx`: the hint, the board with two branching
 * bars on a spine, and the shelf of unplaced chapters beneath.
 */
export const TimelineSkeleton = () => {
  const theme = useAppTheme();
  return (
    <SkeletonPulse label="Loading the timelines" style={styles.timeline}>
      <View style={styles.hint}>
        <Bone height={10} on="page" />
        <Bone height={10} on="page" width="70%" />
      </View>
      <Frame style={styles.board}>
        <View
          style={[styles.spine, { backgroundColor: theme.material.edgeTranslucent }]}
        />
        <Bone
          height={42}
          radius={radius.md}
          style={[styles.bar, styles.barAbove]}
          width="42%"
        />
        <Bone
          height={42}
          radius={radius.md}
          style={[styles.bar, styles.barBelow]}
          width="36%"
        />
      </Frame>
      <View style={styles.shelf}>
        <Bone height={10} on="page" width={120} />
        <View style={styles.chips}>
          {[132, 104, 150].map((width) => (
            <Bone
              height={32}
              key={width}
              on="page"
              radius={radius.full}
              width={width}
            />
          ))}
        </View>
      </View>
    </SkeletonPulse>
  );
};

/** `app/story/[storyId]/map.tsx`: the stage, and the hint line under it. */
export const MapSkeleton = () => {
  const theme = useAppTheme();
  return (
    <SkeletonPulse label="Loading the map" style={styles.map}>
      {/* A plain view, not a `Bone`: the stage fills what is left of the
          screen, and a bone's fixed height would hold it at zero. */}
      <View style={[styles.stage, { backgroundColor: theme.material.fillTranslucent }]} />
      <Bone height={10} on="page" style={styles.mapHint} width={180} />
    </SkeletonPulse>
  );
};

const styles = StyleSheet.create({
  bar: { position: "absolute" },
  barAbove: { left: "12%", top: 40 },
  barBelow: { left: "46%", top: 150 },
  board: {
    borderRadius: radius.md + 4,
    height: 240,
    marginHorizontal: space.sm + 4,
    overflow: "hidden",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  codex: { flex: 1 },
  codexBody: { gap: space.md, paddingHorizontal: space.sm + 4 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  entry: { borderRadius: radius.md + 4, gap: space.sm, padding: space.md },
  entryHead: { alignItems: "center", flexDirection: "row", gap: space.sm + 4 },
  fandom: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    paddingHorizontal: space.xs,
    paddingVertical: space.sm + 4,
  },
  frame: { borderWidth: StyleSheet.hairlineWidth },
  friend: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm + 2,
    padding: space.sm,
  },
  group: { gap: space.sm },
  groupCard: { borderRadius: radius.md + 4, overflow: "hidden" },
  hint: { gap: 6, paddingHorizontal: space.md, paddingVertical: space.sm + 4 },
  map: { flex: 1 },
  mapHint: { alignSelf: "center", marginVertical: space.sm + 2 },
  page: { gap: space.lg },
  settingsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 4,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 4,
  },
  shelf: {
    gap: space.sm,
    paddingHorizontal: space.sm + 4,
    paddingTop: space.lg,
  },
  song: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.sm + 2,
    padding: space.sm,
  },
  spine: {
    height: 2,
    left: 0,
    position: "absolute",
    right: 0,
    top: 119,
  },
  stage: {
    borderRadius: radius.md + 4,
    flex: 1,
    marginHorizontal: space.sm + 4,
    marginTop: space.sm,
  },
  tabs: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm + 4,
    paddingVertical: space.sm + 2,
  },
  text: { flex: 1, gap: 6, minWidth: 0 },
  timeline: { flex: 1 },
});
