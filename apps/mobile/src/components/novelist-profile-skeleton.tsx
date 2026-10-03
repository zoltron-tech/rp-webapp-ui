import { queryKeys } from "@nw/features";
import type { NWImage } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { IMAGE_SIZES } from "@nw/utils/image";
import type { QueryClient } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { Bone, SkeletonPulse } from "@/components/skeleton";
import { findCached } from "@/lib/cache-seed";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A novelist's profile before it has loaded — `novelist-profile.tsx`'s own
 * geometry, with whatever is already known drawn for real.
 *
 * ## Why not a placeholder profile
 *
 * The profile page is built from the full novelist: counts, characters,
 * friends, their note, their song. The rows that link to a profile — a friend,
 * a liker, a leaderboard entry, a suggestion — carry a name, a face and
 * sometimes a banner, and nothing else. Passing one of those to the page as if
 * it were the novelist would draw empty counts and missing sections that then
 * fill in, which reads as the profile changing under the reader. So the part a
 * row does know is drawn exactly, and the rest is ghosts until the answer
 * lands.
 */

/** What a row that links to a profile knows about the person. */
export interface NovelistSeed {
  avatar?: NWImage | null;
  banner?: NWImage | null;
  firstName: string;
  image?: string | null;
  lastName: string | null;
  palette?: number;
  username: string;
}

const isPerson = (value: unknown, username: string): value is NovelistSeed =>
  typeof value === "object" &&
  value !== null &&
  "firstName" in value &&
  (value as { username?: unknown }).username === username;

/**
 * The person as any list on the phone holds them: your friends on the session,
 * a profile's friends and a friends list under `profile`, the likers of a post,
 * the leaderboard, the home suggestions.
 */
export const findCachedNovelist = (
  queryClient: QueryClient,
  username: string,
): NovelistSeed | null => {
  const match = (value: unknown) =>
    isPerson(value, username) ? value : undefined;
  return (
    findCached(
      queryClient,
      [
        queryKeys.session(),
        ["profile"],
        ["reactions"],
        ["leaderboard"],
        ["home"],
      ],
      (entity) =>
        match(entity) ??
        match(entity.novelist) ??
        (Array.isArray(entity.friends)
          ? entity.friends.map(match).find(Boolean)
          : undefined),
    ) ?? null
  );
};

/** `novelist-profile.tsx`'s `AVATAR_SIZE`, `AVATAR_RING` and `HEADER_LIFT`. */
const AVATAR_SIZE = 104;
const AVATAR_RING = 5;
const HEADER_LIFT = -58;

export const NovelistProfileSkeleton = ({
  seed,
}: {
  seed: NovelistSeed | null;
}) => {
  const theme = useAppTheme();
  const bannerSrc = seed?.banner?.src
    ? wsrvImage(seed.banner.src, IMAGE_SIZES.BANNER_LARGE)
    : null;
  const name = seed
    ? [seed.firstName, seed.lastName].filter(Boolean).join(" ") || seed.username
    : null;

  return (
    <ScrollView
      scrollEnabled={false}
    >
      <View
        style={[
          styles.banner,
          {
            aspectRatio: bannerSrc ? 5 / 2 : 5 / 1,
            backgroundColor: theme.material.fill,
          },
        ]}
      >
        {bannerSrc ? (
          <CroppedImage
            crop={seed?.banner?.crop}
            style={StyleSheet.absoluteFill}
            uri={bannerSrc}
          />
        ) : null}
      </View>

      <View style={styles.headerRow}>
        <View
          style={[
            styles.avatarRing,
            {
              backgroundColor: theme.background,
              borderColor: theme.background,
            },
          ]}
        >
          {seed ? (
            <Avatar
              image={seed.avatar}
              name={seed.firstName}
              size={AVATAR_SIZE}
              uri={seed.avatar?.src ?? seed.image}
            />
          ) : (
            <SkeletonPulse>
              <Bone circle height={AVATAR_SIZE} on="page" />
            </SkeletonPulse>
          )}
        </View>
      </View>

      <View style={styles.identity}>
        {name ? (
          <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
            {name}
          </Text>
        ) : null}
        {seed ? (
          <Text style={[styles.handle, { color: theme.textGray }]}>
            @{seed.username}
          </Text>
        ) : null}

        <SkeletonPulse label="Loading profile" style={styles.ghosts}>
          {seed ? null : (
            <View style={styles.lines}>
              <Bone height={22} on="page" width="55%" />
              <Bone height={14} on="page" width="30%" />
            </View>
          )}
          <View style={styles.stats}>
            <Bone height={12} on="page" width={64} />
            <Bone height={12} on="page" width={72} />
            <Bone height={12} on="page" width={56} />
          </View>
          <Bone height={40} on="page" radius={radius.full} />
          <View style={styles.lines}>
            <Bone height={12} on="page" />
            <Bone height={12} on="page" width="92%" />
            <Bone height={12} on="page" width="64%" />
          </View>
          <Bone height={10} on="page" width={120} />
          {[0, 1].map((index) => (
            <View key={index} style={styles.row}>
              <Bone circle height={44} on="page" />
              <View style={[styles.lines, styles.fill]}>
                <Bone height={14} on="page" width="50%" />
                <Bone height={10} on="page" width="35%" />
              </View>
            </View>
          ))}
        </SkeletonPulse>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatarRing: {
    borderRadius: (AVATAR_SIZE + AVATAR_RING * 2) / 2,
    borderWidth: AVATAR_RING,
  },
  banner: { overflow: "hidden", width: "100%" },
  fill: { flex: 1 },
  ghosts: { gap: space.md, paddingTop: space.sm },
  handle: { fontSize: fontSize.body },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: HEADER_LIFT,
    paddingHorizontal: space.md,
  },
  identity: { gap: space.sm, paddingHorizontal: space.md, paddingTop: 12 },
  lines: { gap: space.sm },
  name: { fontSize: fontSize.h2, fontWeight: "700" },
  row: { alignItems: "center", flexDirection: "row", gap: space.sm + 4 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
});
