import { Ionicons } from "@expo/vector-icons";
import { getHeadcanon } from "@nw/api/endpoints/headcanon";
import { useApi } from "@nw/features";
import { HEADCANON_ERROR, type HeadcanonDetail } from "@nw/types/headcanon";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Text } from "@/components/text";
import { useHeadcanonCatalog } from "@/hooks/use-headcanons";
import { asHex, withAlpha } from "@/lib/color";
import { catalogLookups } from "@/lib/headcanons";
import { museName } from "@/lib/muse-appearance";
import { plainText } from "@/lib/story";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";
import {
  EmbedFrame,
  EmbedSkeleton,
  KindLabel,
  OpenRow,
  Rule,
  Unavailable,
} from "./frame";
import { isPausedOffline } from "./hooks";

/**
 * A headcanon link, drawn as the headcanon — web's `HeadcanonEmbed`: the
 * character's face and name, the card's title and first lines, its category
 * and hearts. A spoiler stays hidden in the preview; a friends-only card says
 * so instead of leaking it. The link is a character link with
 * `?headcanon=`, so tapping opens Canon on that card.
 */

type Loaded =
  | { status: "ready"; detail: HeadcanonDetail }
  | { status: "friends-only" }
  | { status: "unavailable" };

const useHeadcanonEmbed = (headcanonId: string) => {
  const api = useApi();
  return useQuery({
    networkMode: "offlineFirst",
    queryFn: async (): Promise<Loaded> => {
      const result = await getHeadcanon(api, headcanonId);
      if (result && typeof result === "object" && "headcanon" in result) {
        return { detail: result, status: "ready" };
      }
      if (
        result &&
        typeof result === "object" &&
        "reason" in result &&
        (result as { reason?: string }).reason === HEADCANON_ERROR.FriendsOnly
      ) {
        return { status: "friends-only" };
      }
      if (result === null) return { status: "unavailable" };
      throw new Error("headcanon");
    },
    queryKey: ["headcanon", headcanonId],
    staleTime: 5 * 60 * 1000,
  });
};

export const HeadcanonLinkCard = ({
  headcanonId,
  museId,
}: {
  headcanonId: string;
  museId: string;
}) => {
  const router = useRouter();
  const theme = useAppTheme();
  const query = useHeadcanonEmbed(headcanonId);
  const catalog = useHeadcanonCatalog().data ?? null;
  const lookups = useMemo(() => catalogLookups(catalog), [catalog]);
  const loaded = query.data;

  // The character the card was opened on (its verse when it has one).
  const target =
    loaded?.status === "ready" ? (loaded.detail.muse.id ?? museId) : museId;
  const open = () =>
    router.push({
      params: { headcanon: headcanonId, museId: target },
      pathname: "/muse/[museId]",
    });

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A headcanon on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton tall={110} />;
  if (!loaded || loaded.status === "unavailable") {
    return (
      <Unavailable
        detail="This headcanon is private or no longer here."
        onPress={open}
        title="A headcanon on Novelist World"
      />
    );
  }
  if (loaded.status === "friends-only") {
    return (
      <Unavailable
        detail="Only the writer's friends can read this one."
        onPress={open}
        title="A friends-only headcanon"
      />
    );
  }

  const { headcanon, muse } = loaded.detail;
  const name = museName(muse);
  const accent = muse.useAccent ? asHex(muse.accent) : undefined;
  const tone = accent ?? theme.accent.solid;
  const excerpt = plainText(headcanon.body);
  const title =
    headcanon.title ||
    (headcanon.spoiler
      ? "Untitled spoiler"
      : excerpt.length > 60
        ? `${excerpt.slice(0, 60)}…`
        : excerpt);

  return (
    <EmbedFrame
      accessibilityLabel={`Open headcanon: ${title}`}
      onPress={open}
      tone={accent}
    >
      <View style={styles.body}>
        <View style={styles.who}>
          <Avatar image={muse.avatar} name={name} size={36} uri={muse.image} />
          <View style={styles.whoText}>
            <KindLabel
              icon="bulb-outline"
              label={`HEADCANON · ${lookups.categoryLabel(headcanon.category).toUpperCase()}`}
              tone={accent}
            />
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.textGray }]}
            >
              {name}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>

        {headcanon.spoiler ? (
          <View
            style={[styles.veil, { backgroundColor: withAlpha(tone, 0.12) }]}
          >
            <Ionicons color={theme.textGray} name="eye-off-outline" size={13} />
            <Text style={[styles.veilLabel, { color: theme.textGray }]}>
              Spoiler — open to read
            </Text>
          </View>
        ) : headcanon.title && excerpt ? (
          <Text
            numberOfLines={3}
            style={[styles.excerpt, { color: theme.textGray }]}
          >
            {excerpt}
          </Text>
        ) : null}

        <Rule tone={accent} />
        <View style={styles.foot}>
          <View style={styles.hearts}>
            <Ionicons color={theme.textGray} name="heart-outline" size={13} />
            <Text style={[styles.heartCount, { color: theme.textGray }]}>
              {headcanon.heartCount}
            </Text>
            {headcanon.alternateUniverse ? (
              <Text style={[styles.au, { color: theme.textGray }]}>· AU</Text>
            ) : null}
          </View>
          <OpenRow label="Read it" tone={accent} />
        </View>
      </View>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  au: { fontSize: fontSize.caption, fontWeight: weight.semibold },
  body: { gap: space.sm, padding: space.m },
  excerpt: { fontSize: fontSize.caption, lineHeight: 17 },
  foot: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heartCount: { fontSize: fontSize.caption, fontWeight: weight.semibold },
  hearts: { alignItems: "center", flexDirection: "row", gap: 4 },
  name: { fontSize: fontSize.caption },
  title: { fontSize: 14, fontWeight: weight.bold, lineHeight: 18 },
  veil: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.s,
    justifyContent: "center",
    paddingVertical: space.sm,
  },
  veilLabel: { fontSize: fontSize.caption, fontWeight: weight.semibold },
  who: { alignItems: "center", flexDirection: "row", gap: space.sm },
  whoText: { flex: 1, gap: 2, minWidth: 0 },
});
