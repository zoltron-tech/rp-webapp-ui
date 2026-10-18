import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { hasUsableCrop, IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { Text } from "@/components/text";
import { asHex, withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import { museName } from "@/lib/muse-appearance";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";
import { GradientSurface } from "@/components/gradient-surface";
import {
  chipText,
  EmbedFrame,
  EmbedSkeleton,
  MediaChip,
  Unavailable,
  useEmbedNarrow,
} from "./frame";
import { isPausedOffline, useMuseEmbed } from "./hooks";

/**
 * A character link, drawn as the character — web's `MuseEmbed`.
 *
 * Cover art across the top with the fandom stamped on it, the face
 * breaking the cover's edge, name and author beside it, their note as a
 * quote, a few nicknames. Called a character here, never a muse: UI copy on
 * this client says "character".
 */

const COVER_HEIGHT = 96;
const MAX_NICKNAMES = 3;
const MAX_NICKNAMES_NARROW = 2;

export const MuseLinkCard = ({ id, url }: { id: string; url: string }) => {
  const router = useRouter();
  const query = useMuseEmbed(id);
  const open = () => router.push(hrefFor({ id, kind: "muse", url }));

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A character on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton />;
  const muse = query.data;
  if (!muse) {
    return (
      <Unavailable
        detail="This character is private or no longer here."
        onPress={open}
        title="A character on Novelist World"
      />
    );
  }

  const accent = muse.useAccent ? asHex(muse.accent) : undefined;
  const name = museName(muse);

  return (
    <EmbedFrame
      accessibilityLabel={`Open ${name}`}
      onPress={open}
      tone={accent}
    >
      <MuseCardContent accent={accent} muse={muse} name={name} />
    </EmbedFrame>
  );
};

/** Inside the frame, because it lays out by the frame's measured width. */
const MuseCardContent = ({
  accent,
  muse,
  name,
}: {
  accent: string | undefined;
  muse: Muse;
  name: string;
}) => {
  const theme = useAppTheme();
  const narrow = useEmbedNarrow();
  const tone = accent ?? theme.accent.solid;
  const coverSrc = muse.cardBackground?.src || muse.image || "";
  const coverCrop =
    muse.cardBackground?.src && hasUsableCrop(muse.cardBackground.crop)
      ? muse.cardBackground.crop
      : null;
  const fandom =
    muse.fandom && muse.fandom.id !== "FANDOMLESS" ? muse.fandom : null;
  const nicknames = (muse.nicknames ?? [])
    .filter((n) => n?.trim())
    .slice(0, narrow ? MAX_NICKNAMES_NARROW : MAX_NICKNAMES);
  const avatarSize = narrow ? 44 : 52;
  const quote = muse.note?.trim() ?? "";

  return (
    <>
      <View style={[styles.cover, { backgroundColor: withAlpha(tone, 0.22) }]}>
        {coverSrc ? (
          <CroppedImage
            cover
            crop={coverCrop}
            style={StyleSheet.absoluteFill}
            uri={wsrvImage(coverSrc, IMAGE_SIZES.CARD_BG_MINI)}
          />
        ) : (
          <FallbackArt
            accent={accent}
            kind="character"
            seed={name}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Fades the art into the card, so the face and name sit on
            something calm whatever the cover is. */}
        <GradientSurface
          from={withAlpha(theme.surfaces.card, 0)}
          style={styles.coverFade}
          to={withAlpha(theme.surfaces.card, 0.7)}
        />
        <View style={styles.chips}>
          {fandom ? (
            <MediaChip tint={fandom.color}>
              <View style={styles.dot} />
              <Text numberOfLines={1} style={[chipText, styles.chipShrink]}>
                {fandom.name.toUpperCase()}
              </Text>
            </MediaChip>
          ) : null}
        </View>
      </View>

      <View style={[styles.body, narrow && styles.bodyNarrow]}>
        {/* Card-coloured gap, then a hairline of the character's colour. */}
        <View
          style={[
            styles.avatarRing,
            { borderColor: tone, marginTop: -(avatarSize / 2 + 4.5) },
          ]}
        >
          <View
            style={[styles.avatarGap, { borderColor: theme.surfaces.card }]}
          >
            <Avatar
              image={muse.avatar}
              name={name}
              size={avatarSize}
              uri={muse.image}
            />
          </View>
        </View>
        <View style={styles.text}>
          <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
            {name}
          </Text>
          {muse.pennedBy?.username ? (
            <Text
              numberOfLines={1}
              style={[styles.penned, { color: theme.textGray }]}
            >
              penned by{" "}
              <Text
                style={{
                  color: accent ?? theme.accent.text,
                  fontWeight: weight.semibold,
                }}
              >
                @{muse.pennedBy.username}
              </Text>
            </Text>
          ) : null}
          {quote ? (
            <Text
              numberOfLines={2}
              style={[styles.quote, { color: theme.textGray }]}
            >
              <Text style={{ color: tone }}>❝ </Text>
              {quote}
            </Text>
          ) : null}
          {nicknames.length > 0 ? (
            <View style={styles.nicknames}>
              {nicknames.map((nickname) => (
                <View
                  key={nickname}
                  style={[
                    styles.nickname,
                    {
                      backgroundColor: withAlpha(tone, 0.16),
                      borderColor: withAlpha(tone, 0.28),
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.nicknameLabel, { color: theme.text }]}
                  >
                    {nickname}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        {narrow ? null : (
          <View
            style={[styles.arrow, { backgroundColor: withAlpha(tone, 0.14) }]}
          >
            <Ionicons color={tone} name="arrow-forward" size={15} />
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  arrow: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.full,
    height: 28,
    justifyContent: "center",
    marginTop: space.sm,
    width: 28,
  },
  avatarGap: { borderRadius: radius.full, borderWidth: 3 },
  avatarRing: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  body: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: space.m,
    paddingBottom: space.ms,
    paddingHorizontal: space.m,
  },
  /* A chat bubble on a phone: tighter, as web's under-300 rule. */
  bodyNarrow: {
    gap: space.ms,
    paddingBottom: space.ms,
    paddingHorizontal: space.ms,
  },
  chipShrink: { flexShrink: 1 },
  chips: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    justifyContent: "space-between",
    left: space.sm,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
  cover: { height: COVER_HEIGHT, overflow: "hidden" },
  coverFade: {
    bottom: 0,
    height: "45%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.full,
    height: 5,
    width: 5,
  },
  name: { fontSize: 14, fontWeight: weight.bold, lineHeight: 17 },
  nickname: {
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: 120,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  nicknameLabel: { fontSize: fontSize.meta, fontWeight: weight.semibold },
  nicknames: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 },
  penned: { fontSize: 11.5 },
  quote: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 17,
    marginTop: 4,
  },
  text: { flex: 1, gap: 2, minWidth: 0, paddingTop: space.sm },
});
