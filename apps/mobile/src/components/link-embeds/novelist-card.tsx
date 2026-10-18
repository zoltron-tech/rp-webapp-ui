import { Ionicons } from "@expo/vector-icons";
import { hasUsableCrop, IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { mainVerseMuses } from "@nw/utils/muse";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { BadgeRow } from "@/components/badges";
import { CroppedImage } from "@/components/cropped-image";
import { GradientSurface } from "@/components/gradient-surface";
import { Text } from "@/components/text";
import { asColor, withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import { fullName } from "@/lib/names";
import {
  accentFromPalette,
  fontSize,
  radius,
  space,
  useAppTheme,
  weight,
} from "@/theme";
import {
  chipText,
  EmbedFrame,
  EmbedSkeleton,
  MediaChip,
  OpenRow,
  Rule,
  Unavailable,
} from "./frame";
import { isPausedOffline, useNovelistEmbed } from "./hooks";

/**
 * A novelist link, drawn as the novelist — web's `NovelistEmbed`.
 *
 * An author card: their banner, the face
 * breaking the banner's edge, name and handle, their note if they left one,
 * then the shelf — their characters' faces, the fandoms they write in, the
 * badges they have earned. The card takes the novelist's own palette.
 */

const BANNER_HEIGHT = 84;
const MAX_FACES = 5;
const MAX_FANDOMS = 3;

export const NovelistLinkCard = ({ id, url }: { id: string; url: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const query = useNovelistEmbed(id);
  const open = () => router.push(hrefFor({ id, kind: "novelist", url }));

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A novelist on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton />;
  const novelist = query.data;
  if (!novelist) {
    return (
      <Unavailable
        detail={`@${id} isn’t here any more, or isn’t visible to you.`}
        onPress={open}
        title="A novelist on Novelist World"
      />
    );
  }

  const tone = accentFromPalette(novelist.palette).solid;
  const name = fullName(novelist) || novelist.username;
  const bannerSrc = novelist.banner?.src || "";
  const standIn =
    !bannerSrc && !!novelist.image && !novelist.image.endsWith(".gif");
  const bannerCrop = hasUsableCrop(novelist.banner?.crop)
    ? (novelist.banner?.crop ?? null)
    : null;

  const muses = mainVerseMuses(novelist.muses ?? []);
  const faces = muses.slice(0, MAX_FACES);
  const museCount = Math.max(novelist.museCount ?? 0, muses.length);
  const more = museCount - faces.length;
  const fandoms = (novelist.fandoms ?? [])
    .filter((f) => f.id !== "FANDOMLESS")
    .slice(0, MAX_FANDOMS);
  const since = novelist.createdAt
    ? new Date(novelist.createdAt).getFullYear()
    : null;
  const note = novelist.note?.text?.trim() ? novelist.note : null;
  const noteTone = asColor(note?.color) ?? tone;

  return (
    <EmbedFrame
      accessibilityLabel={`Open ${name}'s profile`}
      onPress={open}
      tone={tone}
    >
      <View style={[styles.banner, { backgroundColor: withAlpha(tone, 0.22) }]}>
        {bannerSrc ? (
          <CroppedImage
            cover
            crop={bannerCrop}
            style={StyleSheet.absoluteFill}
            uri={wsrvImage(bannerSrc, IMAGE_SIZES.BANNER_MEDIUM)}
          />
        ) : standIn ? (
          <CroppedImage
            blurRadius={14}
            style={[StyleSheet.absoluteFill, styles.standIn]}
            uri={wsrvImage(novelist.image, IMAGE_SIZES.AVATAR_MEDIUM)}
          />
        ) : null}
        {/* A gradient, not a band: a flat 55% strip drew a hard line
            across the banner where it began. */}
        <GradientSurface
          from={withAlpha(theme.surfaces.card, 0)}
          style={styles.bannerFade}
          to={withAlpha(theme.surfaces.card, 0.75)}
        />
        <View style={styles.chips}>
          <MediaChip>
            <Ionicons color="#fff" name="create-outline" size={11} />
            <Text style={chipText}>NOVELIST</Text>
          </MediaChip>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.identity}>
          <View
            style={[styles.avatarRing, { borderColor: theme.surfaces.card }]}
          >
            <Avatar
              image={novelist.avatar}
              name={name}
              size={48}
              uri={novelist.image}
              username={novelist.username}
            />
            {novelist.isVerified ? (
              <View
                style={[
                  styles.verified,
                  { backgroundColor: tone, borderColor: theme.surfaces.card },
                ]}
              >
                <Ionicons color="#fff" name="checkmark" size={10} />
              </View>
            ) : null}
          </View>
          <View style={styles.text}>
            <Text
              numberOfLines={2}
              style={[styles.name, { color: theme.text }]}
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.handle, { color: theme.textGray }]}
            >
              <Text style={{ color: tone, fontWeight: weight.semibold }}>
                @{novelist.username}
              </Text>
              {since ? `  ·  writing since ${since}` : ""}
            </Text>
          </View>
        </View>

        {note ? (
          <View
            style={[
              styles.note,
              {
                backgroundColor: withAlpha(noteTone, 0.16),
                borderColor: withAlpha(noteTone, 0.3),
              },
            ]}
          >
            <Text style={styles.noteEmoji}>{note.emoji || "✦"}</Text>
            <Text
              numberOfLines={1}
              style={[styles.noteText, { color: theme.text }]}
            >
              {note.text}
            </Text>
          </View>
        ) : null}

        <View style={styles.stats}>
          <Text style={[styles.stat, { color: theme.textGray }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {museCount}
            </Text>{" "}
            {museCount === 1 ? "character" : "characters"}
          </Text>
          <Text style={[styles.stat, { color: theme.textGray }]}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {novelist.friendsCount ?? 0}
            </Text>{" "}
            {novelist.friendsCount === 1 ? "friend" : "friends"}
          </Text>
          {novelist.badges?.length ? (
            <Text style={[styles.stat, { color: theme.textGray }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {novelist.badges.length}
              </Text>{" "}
              {novelist.badges.length === 1 ? "badge" : "badges"}
            </Text>
          ) : null}
        </View>

        {faces.length > 0 ? (
          <View style={styles.shelf}>
            <Text style={[styles.shelfLabel, { color: theme.textGray }]}>
              CHARACTERS
            </Text>
            <View style={styles.faces}>
              {faces.map((muse, index) => (
                <View
                  key={muse.id ?? muse.firstName}
                  style={[
                    styles.face,
                    { borderColor: theme.surfaces.card },
                    index > 0 && styles.faceOverlap,
                  ]}
                >
                  <Avatar
                    image={muse.avatar}
                    name={muse.firstName}
                    size={22}
                    uri={muse.image}
                  />
                </View>
              ))}
            </View>
            {more > 0 ? (
              <Text style={[styles.more, { color: theme.textGray }]}>
                +{more}
              </Text>
            ) : null}
          </View>
        ) : null}

        {fandoms.length > 0 ? (
          <View style={styles.fandoms}>
            {fandoms.map((fandom) => {
              const colour = asColor(fandom.color) ?? tone;
              return (
                <View
                  key={fandom.id}
                  style={[
                    styles.fandom,
                    {
                      backgroundColor: withAlpha(colour, 0.16),
                      borderColor: withAlpha(colour, 0.32),
                    },
                  ]}
                >
                  <View
                    style={[styles.fandomDot, { backgroundColor: colour }]}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.fandomLabel, { color: theme.text }]}
                  >
                    {fandom.name.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <Rule tone={tone} />
        <View style={styles.footer}>
          <BadgeRow
            animated={false}
            badges={novelist.badges}
            max={4}
            size={22}
          />
          <OpenRow label="Visit profile" tone={tone} />
        </View>
      </View>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  avatarRing: { borderRadius: radius.full, borderWidth: 3, marginTop: -27 },
  banner: { height: BANNER_HEIGHT, overflow: "hidden" },
  bannerFade: {
    bottom: 0,
    height: "60%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  body: { gap: space.s, paddingBottom: space.sm, paddingHorizontal: space.m },
  chips: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: space.sm,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
  face: { borderRadius: radius.full, borderWidth: 2 },
  faceOverlap: { marginLeft: -9 },
  faces: { alignItems: "center", flexDirection: "row" },
  fandom: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    maxWidth: 160,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  fandomDot: { borderRadius: radius.full, height: 5, width: 5 },
  fandomLabel: {
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: weight.bold,
    letterSpacing: 0.5,
  },
  fandoms: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    paddingTop: space.xs,
  },
  handle: { fontSize: fontSize.caption },
  identity: { alignItems: "flex-start", flexDirection: "row", gap: space.ms },
  more: { fontSize: fontSize.meta, fontWeight: weight.semibold, marginLeft: 6 },
  name: { fontSize: 14, fontWeight: weight.bold, lineHeight: 17 },
  note: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    maxWidth: "100%",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  noteEmoji: { fontSize: fontSize.label },
  noteText: { flexShrink: 1, fontSize: fontSize.caption },
  shelf: { alignItems: "center", flexDirection: "row", gap: space.sm },
  shelfLabel: { fontSize: 10.5, fontWeight: weight.bold, letterSpacing: 1 },
  standIn: { opacity: 0.7, transform: [{ scale: 1.2 }] },
  stat: { fontSize: fontSize.caption },
  statNumber: { fontSize: fontSize.caption, fontWeight: weight.bold },
  stats: { flexDirection: "row", gap: space.m },
  text: { flex: 1, gap: 2, minWidth: 0, paddingTop: space.sm },
  verified: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: -1,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -3,
    width: 20,
  },
});
