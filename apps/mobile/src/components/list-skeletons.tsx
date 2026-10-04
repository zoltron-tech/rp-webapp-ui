import { Fragment, type ReactNode } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { ROW_HEIGHT } from "@/components/novelist-row";
import { Bone, SkeletonPulse } from "@/components/skeleton";
import { border, radius, space, useAppTheme } from "@/theme";

/**
 * Ghost rows for the lists — each in the geometry of the row it stands in for.
 *
 * The feed cards live in `skeleton.tsx` with the pulse itself; these are the
 * rest: a notification, an outgoing thread, a novelist, a character, a badge.
 * Every measurement here is lifted from the row's own stylesheet (the file
 * named above each), so a list's first page lands exactly where its ghosts
 * were. Change a row's padding or face size there, change it here too.
 */

/** A stack of `count` ghosts with the list's own gap between them. */
export const SkeletonRows = ({
  count,
  gap = space.sm,
  render,
  style,
}: {
  count: number;
  gap?: number;
  render: (index: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={[{ gap }, style]}>
    {Array.from({ length: count }, (_, index) => (
      <Fragment key={index}>{render(index)}</Fragment>
    ))}
  </View>
);

/**
 * A whole screen of ghosts, for a route still waiting on the session before its
 * list can even ask for anything. Padded like the lists it stands in for.
 */
export const ListPageSkeleton = (props: {
  count: number;
  gap?: number;
  render: (index: number) => ReactNode;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.page}>
      <SkeletonRows {...props} />
    </View>
  );
};

/** A row's card surface and hairline, with the row's own shape on top. */
const Frame = ({
  children,
  style,
}: {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
}) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.frame,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/** `notification-row.tsx`: a 44pt face, two lines of text, when. */
export const NotificationRowSkeleton = () => (
  <SkeletonPulse label="Loading a notification">
    <Frame style={styles.notification}>
      <Bone circle height={40} />
      <View style={styles.body}>
        <Bone height={13} width="85%" />
        <Bone height={13} width="55%" />
        <Bone height={10} width={64} />
      </View>
    </Frame>
  </SkeletonPulse>
);

/** `outgoing-thread-card.tsx`: head, rule, the quoted words, the footer line. */
export const OutgoingThreadCardSkeleton = () => {
  const theme = useAppTheme();
  return (
    <SkeletonPulse label="Loading a thread">
      <Frame style={styles.thread}>
        <View style={styles.threadHead}>
          <Bone circle height={44} />
          <View style={styles.body}>
            <Bone height={14} width="50%" />
            <Bone height={10} width="70%" />
          </View>
          <Bone height={22} radius={radius.full} width={60} />
        </View>
        <View
          style={[styles.rule, { backgroundColor: theme.material.edge }]}
        />
        <View style={[styles.quote, { borderColor: theme.material.edge }]}>
          <Bone height={12} />
          <Bone height={12} width="90%" />
          <Bone height={12} width="60%" />
        </View>
        <View style={styles.threadFoot}>
          <Bone circle height={14} />
          <Bone height={10} width="40%" />
        </View>
      </Frame>
    </SkeletonPulse>
  );
};

/** `novelist-row.tsx`: fixed `ROW_HEIGHT`, 56pt face, name/handle/meta, a pill. */
export const NovelistRowSkeleton = () => (
  <SkeletonPulse label="Loading a novelist">
    <Frame style={styles.novelist}>
      <Bone circle height={56} />
      <View style={styles.body}>
        <Bone height={15} width="55%" />
        <Bone height={10} width="35%" />
        <Bone height={10} width="60%" />
      </View>
      <Bone height={34} radius={radius.full} width={72} />
    </Frame>
  </SkeletonPulse>
);

/** `muse-list-row.tsx`: the ringed 56pt face, a name, the fandom chips. */
export const MuseListRowSkeleton = () => (
  <SkeletonPulse label="Loading a character">
    <Frame style={styles.muse}>
      <Bone circle height={64} />
      <View style={[styles.body, styles.museBody]}>
        <Bone height={14} width="55%" />
        <View style={styles.chips}>
          <Bone height={16} radius={radius.full} width={96} />
          <Bone height={16} radius={radius.full} width={44} />
        </View>
      </View>
    </Frame>
  </SkeletonPulse>
);

/** `badge-shelf.tsx`: two tiles a row, each a crest, a title and a line or two. */
export const BadgeShelfSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <SkeletonPulse label="Loading badges" style={styles.shelf}>
    {Array.from({ length: rows }, (_, row) => (
      <View key={row} style={styles.shelfRow}>
        {[0, 1].map((tile) => (
          <Frame key={tile} style={styles.badge}>
            <Bone circle height={76} />
            <Bone height={12} width="70%" />
            <Bone height={10} width="90%" />
            <Bone height={10} width="65%" />
            <Bone height={8} width="40%" />
          </Frame>
        ))}
      </View>
    ))}
  </SkeletonPulse>
);

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    borderRadius: radius.md,
    flex: 1,
    gap: space.s,
    padding: space.m,
  },
  body: { flex: 1, gap: space.s, minWidth: 0 },
  chips: { flexDirection: "row", gap: 5 },
  frame: { borderWidth: border.edge },
  muse: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    flexDirection: "row",
    gap: space.m,
    paddingLeft: space.md,
    paddingRight: space.ms,
    paddingVertical: space.ms,
  },
  museBody: { gap: space.sm },
  notification: {
    borderRadius: radius.card,
    flexDirection: "row",
    gap: space.m,
    marginBottom: space.sm,
    marginHorizontal: space.md,
    paddingHorizontal: space.m,
    paddingVertical: space.m,
  },
  novelist: {
    alignItems: "center",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: space.m,
    height: ROW_HEIGHT,
    paddingHorizontal: space.md - 2,
  },
  page: { flex: 1, padding: space.md },
  quote: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.s,
    padding: space.ms,
  },
  rule: { height: StyleSheet.hairlineWidth, width: "100%" },
  shelf: { gap: space.ms },
  shelfRow: { flexDirection: "row", gap: space.ms },
  thread: { borderRadius: radius.md, gap: space.sm, padding: space.ms },
  threadFoot: { alignItems: "center", flexDirection: "row", gap: space.s },
  threadHead: { alignItems: "center", flexDirection: "row", gap: space.ms },
});
