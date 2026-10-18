import { Ionicons } from "@expo/vector-icons";
import { hasUsableCrop, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { Text } from "@/components/text";
import { useStory } from "@/hooks/use-story";
import { asColor, withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import { plainText, STORY_COVER_ZOOM_MAX_PCT } from "@/lib/story";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";
import { EmbedFrame, EmbedSkeleton, OpenRow, Rule, Unavailable } from "./frame";
import { isPausedOffline } from "./hooks";

/**
 * A story link, drawn as a book on a shelf — web's `StoryEmbed`.
 *
 * The cover stands at the left at its 6:9 proportion with a spine shadow;
 * beside it the jacket copy — title, who wrote it, the blurb, the counts —
 * then genres and fandom as stickers and the cast along the bottom. Tone:
 * the story's fandom colour, else its first genre's, else the accent.
 */

const COVER_W = 64;
const COVER_H = Math.round((COVER_W * 9) / 6);
const MAX_STICKERS = 4;
const MAX_CAST = 5;
const MAX_CO_AUTHORS = 3;
/** Bounded, never cropped: the stored crop is against the original's shape. */
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };

/** The colour a story draws in: fandom, else first genre, else none. */
export const storyTone = (story: {
  fandom?: { color: string } | null;
  genres?: { color: string }[];
}): string | undefined =>
  asColor(story.fandom?.color) ?? asColor(story.genres?.[0]?.color);

export const StoryLinkCard = ({ id, url }: { id: string; url: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const query = useStory(id);
  const open = () => router.push(hrefFor({ id, kind: "story", url }));

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A story on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton tall={140} />;
  const story = query.data;
  if (!story) {
    return (
      <Unavailable
        detail="This story is private or no longer here."
        onPress={open}
        title="A story on Novelist World"
      />
    );
  }

  const tone = storyTone(story) ?? theme.accent.solid;
  const coverSrc = story.avatar?.src || story.image || "";
  const coverCrop =
    story.avatar?.src && hasUsableCrop(story.avatar.crop)
      ? story.avatar.crop
      : null;
  const blurb = plainText(story.description).replace(/\s+/g, " ").trim();
  const creator = story.createdBy ?? null;
  const others = (story.members ?? []).filter(
    (m) => m.username !== creator?.username,
  );
  const coAuthors = others.slice(0, MAX_CO_AUTHORS);
  const chapters = story.events ?? [];
  const latest = chapters.length
    ? [...chapters].sort((a, b) => (b.ordinal ?? 0) - (a.ordinal ?? 0))[0]
    : null;

  const stickers: {
    key: string;
    label: string;
    color: string;
    fandom?: boolean;
  }[] = [];
  if (story.fandom && story.fandom.id !== "FANDOMLESS") {
    stickers.push({
      color: asColor(story.fandom.color) ?? tone,
      fandom: true,
      key: `f-${story.fandom.id}`,
      label: story.fandom.name,
    });
  }
  for (const genre of story.genres ?? []) {
    if (stickers.length >= MAX_STICKERS) break;
    stickers.push({
      color: asColor(genre.color) ?? tone,
      key: `g-${genre.id}`,
      label: genre.label,
    });
  }
  const cast = (story.cast ?? []).slice(0, MAX_CAST);
  const castMore = (story.cast?.length ?? 0) - cast.length;

  return (
    <EmbedFrame
      accessibilityLabel={`Open the story ${story.name}`}
      onPress={open}
      tone={tone}
    >
      <View style={styles.card}>
        <View style={styles.jacket}>
          <View
            style={[styles.book, { backgroundColor: withAlpha(tone, 0.35) }]}
          >
            {coverSrc ? (
              <CroppedImage
                crop={coverCrop}
                maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
                style={StyleSheet.absoluteFill}
                uri={wsrvImage(coverSrc, COVER_SIZE)}
              />
            ) : (
              <FallbackArt
                accent={tone}
                kind="story"
                seed={story.name}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.spine} />
          </View>

          <View style={styles.copy}>
            <View style={styles.band}>
              <Ionicons color={tone} name="book" size={12} />
              <Text style={[styles.bandLabel, { color: tone }]}>STORY</Text>
              <View
                style={[
                  styles.visibility,
                  story.isPublic
                    ? {
                        backgroundColor: "rgba(61,220,151,0.12)",
                        borderColor: "rgba(61,220,151,0.3)",
                      }
                    : {
                        backgroundColor: withAlpha(theme.text, 0.09),
                        borderColor: withAlpha(theme.text, 0.14),
                      },
                ]}
              >
                <Ionicons
                  color={story.isPublic ? "#3ddc97" : theme.textGray}
                  name={
                    story.isPublic ? "globe-outline" : "lock-closed-outline"
                  }
                  size={10}
                />
                <Text
                  style={[
                    styles.visibilityLabel,
                    { color: story.isPublic ? "#3ddc97" : theme.textGray },
                  ]}
                >
                  {story.isPublic ? "PUBLISHED" : "PRIVATE"}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.title, { color: theme.text }]}
            >
              {story.name}
            </Text>
            {creator ? (
              <View style={styles.byline}>
                <Text
                  numberOfLines={1}
                  style={[styles.bylineText, { color: theme.textGray }]}
                >
                  by{" "}
                  <Text style={{ color: tone, fontWeight: weight.semibold }}>
                    @{creator.username}
                  </Text>
                </Text>
                {coAuthors.length > 0 ? (
                  <>
                    <View style={styles.authors}>
                      {coAuthors.map((member, index) => (
                        <View
                          key={member.username}
                          style={[
                            styles.authorFace,
                            { borderColor: theme.surfaces.card },
                            index > 0 && styles.authorOverlap,
                          ]}
                        >
                          <Avatar
                            name={member.username}
                            size={18}
                            uri={member.image}
                          />
                        </View>
                      ))}
                    </View>
                    <Text
                      style={[styles.bylineText, { color: theme.textGray }]}
                    >
                      +{others.length}{" "}
                      {others.length === 1 ? "co-author" : "co-authors"}
                    </Text>
                  </>
                ) : null}
              </View>
            ) : null}
            <Text
              numberOfLines={3}
              style={[
                styles.blurb,
                { color: theme.text },
                !blurb && styles.empty,
              ]}
            >
              {blurb || "No blurb yet — the story speaks for itself."}
            </Text>
            <View style={styles.facts}>
              <View style={styles.fact}>
                <Ionicons
                  color={theme.textGray}
                  name="book-outline"
                  size={12}
                />
                <Text style={[styles.factText, { color: theme.textGray }]}>
                  <Text style={[styles.factNumber, { color: theme.text }]}>
                    {chapters.length}
                  </Text>{" "}
                  {chapters.length === 1 ? "chapter" : "chapters"}
                </Text>
              </View>
              <View style={styles.fact}>
                <Ionicons
                  color={story.reacted ? tone : theme.textGray}
                  name={story.reacted ? "heart" : "heart-outline"}
                  size={12}
                />
                <Text
                  style={[
                    styles.factNumber,
                    { color: story.reacted ? tone : theme.text },
                  ]}
                >
                  {story.reactions ?? 0}
                </Text>
              </View>
              {story.members?.length ? (
                <View style={styles.fact}>
                  <Ionicons
                    color={theme.textGray}
                    name="people-outline"
                    size={12}
                  />
                  <Text style={[styles.factText, { color: theme.textGray }]}>
                    <Text style={[styles.factNumber, { color: theme.text }]}>
                      {story.members.length}
                    </Text>{" "}
                    {story.members.length === 1 ? "author" : "authors"}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {stickers.length > 0 ? (
          <View style={styles.stickers}>
            {stickers.map((sticker) => (
              <View
                key={sticker.key}
                style={[
                  styles.sticker,
                  {
                    backgroundColor: withAlpha(sticker.color, 0.16),
                    borderColor: withAlpha(sticker.color, 0.32),
                  },
                ]}
              >
                <View
                  style={[
                    styles.stickerDot,
                    { backgroundColor: sticker.color },
                    sticker.fandom && styles.stickerDiamond,
                  ]}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.stickerLabel, { color: theme.text }]}
                >
                  {sticker.label.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {cast.length > 0 ? (
          <View style={styles.castRow}>
            <Text style={[styles.castLabel, { color: theme.textGray }]}>
              CAST
            </Text>
            <View style={styles.faces}>
              {cast.map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.face,
                    { borderColor: theme.surfaces.card },
                    index > 0 && styles.faceOverlap,
                  ]}
                >
                  <Avatar
                    image={member.avatar}
                    name={member.name}
                    size={22}
                    uri={member.image}
                  />
                </View>
              ))}
            </View>
            {castMore > 0 ? (
              <Text style={[styles.more, { color: theme.textGray }]}>
                +{castMore}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              style={[styles.castNames, { color: theme.textGray }]}
            >
              {cast.map((c) => c.name).join(" · ")}
            </Text>
          </View>
        ) : null}

        <Rule tone={tone} />
        <View style={styles.footer}>
          <Ionicons color={theme.textGray} name="bookmark-outline" size={12} />
          <Text
            numberOfLines={1}
            style={[styles.latest, { color: theme.textGray }]}
          >
            {latest ? (
              <>
                Latest:{" "}
                <Text
                  style={{ color: theme.text, fontWeight: weight.semibold }}
                >
                  {latest.name}
                </Text>
              </>
            ) : (
              "No chapters yet"
            )}
          </Text>
          <OpenRow label="Open story" tone={tone} />
        </View>
      </View>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  authorFace: { borderRadius: radius.full, borderWidth: 1.5 },
  authorOverlap: { marginLeft: -6 },
  authors: { alignItems: "center", flexDirection: "row" },
  band: { alignItems: "center", flexDirection: "row", gap: 6 },
  bandLabel: { fontSize: 10.5, fontWeight: weight.bold, letterSpacing: 1 },
  blurb: { fontSize: fontSize.caption, lineHeight: 17, marginTop: 2 },
  book: {
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 8,
    elevation: 6,
    height: COVER_H,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    width: COVER_W,
  },
  byline: { alignItems: "center", flexDirection: "row", gap: 6, minWidth: 0 },
  bylineText: { flexShrink: 1, fontSize: fontSize.caption },
  card: { gap: space.sm, padding: space.m, paddingBottom: space.sm },
  castLabel: { fontSize: 10.5, fontWeight: weight.bold, letterSpacing: 1 },
  castNames: { flex: 1, fontSize: fontSize.meta, marginLeft: 4, minWidth: 0 },
  castRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  copy: { flex: 1, gap: 3, minWidth: 0 },
  empty: { fontStyle: "italic", opacity: 0.8 },
  face: { borderRadius: radius.full, borderWidth: 2 },
  faceOverlap: { marginLeft: -9 },
  faces: { alignItems: "center", flexDirection: "row" },
  fact: { alignItems: "center", flexDirection: "row", gap: 4 },
  factNumber: { fontSize: fontSize.caption, fontWeight: weight.bold },
  factText: { fontSize: fontSize.meta },
  facts: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    paddingTop: space.xs,
  },
  jacket: { alignItems: "flex-start", flexDirection: "row", gap: space.ms },
  latest: { flexShrink: 1, fontSize: fontSize.caption },
  more: { fontSize: fontSize.meta, fontWeight: weight.semibold, marginLeft: 6 },
  spine: {
    backgroundColor: "rgba(0,0,0,0.35)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 6,
  },
  sticker: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    maxWidth: 160,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  stickerDiamond: { borderRadius: 1, transform: [{ rotate: "45deg" }] },
  stickerDot: { borderRadius: radius.full, height: 5, width: 5 },
  stickerLabel: {
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: weight.bold,
    letterSpacing: 0.5,
  },
  stickers: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  title: { fontSize: 14, fontWeight: weight.bold, lineHeight: 17 },
  visibility: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  visibilityLabel: {
    fontSize: 10,
    fontWeight: weight.bold,
    letterSpacing: 0.6,
  },
});
