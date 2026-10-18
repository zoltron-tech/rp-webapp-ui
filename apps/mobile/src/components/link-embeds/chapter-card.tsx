import { Ionicons } from "@expo/vector-icons";
import { hasUsableCrop, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { type ReactNode, useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, Pattern, Polygon, Rect } from "react-native-svg";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { FallbackArt } from "@/components/fallback-art";
import { GradientSurface } from "@/components/gradient-surface";
import { Text } from "@/components/text";
import { useStory, useStoryChapter } from "@/hooks/use-story";
import { withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import { plainText, STORY_COVER_ZOOM_MAX_PCT } from "@/lib/story";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";
import {
  EmbedFrame,
  EmbedSkeleton,
  Unavailable,
  useEmbedNarrow,
} from "./frame";
import { isPausedOffline, useChapterOpening } from "./hooks";
import { storyTone } from "./story-card";

/**
 * A chapter link, drawn as a page held open in its book — web's
 * `ChapterEmbed`.
 *
 * The story's cover as a slim spine with a ribbon bookmark (striped for a
 * flashback), the chapter's number in the story, its title, where and when
 * it happens, its overture; the opening passage as a drop-cap pull-quote
 * with a byline; passages, authors and the featured song; and the chapters
 * either side of this one, with the way in.
 */

const SPINE_W = 44;
const SPINE_H = 66;
/** Bounded, never cropped: the stored crop is against the original's shape. */
const COVER_SIZE = { fit: "inside" as const, h: 900, w: 600 };
const RIBBON_W = 12;
const RIBBON_H = Math.round(SPINE_H * 0.62);

/**
 * The ribbon bookmark, with web's notched tail; striped for a flashback, the
 * stripes the timeline uses.
 */
const Ribbon = ({ flashback, tone }: { flashback: boolean; tone: string }) => {
  // Per instance: two cards sharing a pattern id paint with whichever mounted last.
  const stripes = `nwRibbon${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <View style={styles.ribbon}>
      <Svg height={RIBBON_H} width={RIBBON_W}>
        {flashback ? (
          <Defs>
            <Pattern
              height={8}
              id={stripes}
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
              width={8}
            >
              <G>
                <Rect fill={tone} height={8} width={4} />
                <Rect fill="rgba(0,0,0,0.45)" height={8} width={4} x={4} />
                <Rect fill={tone} height={8} opacity={0.55} width={4} x={4} />
              </G>
            </Pattern>
          </Defs>
        ) : null}
        <Polygon
          fill={flashback ? `url(#${stripes})` : tone}
          points={`0,0 ${RIBBON_W},0 ${RIBBON_W},${RIBBON_H} ${RIBBON_W / 2},${RIBBON_H * 0.82} 0,${RIBBON_H}`}
        />
      </Svg>
    </View>
  );
};

/** The page: web's padding, tightened in a phone bubble, with its tinted wash. */
const Page = ({ children, tone }: { children: ReactNode; tone: string }) => {
  const narrow = useEmbedNarrow();
  return (
    <View style={[styles.card, narrow && styles.cardNarrow]}>
      <GradientSurface
        from={withAlpha(tone, 0.12)}
        style={styles.wash}
        to={withAlpha(tone, 0)}
      />
      {children}
    </View>
  );
};

/** Neighbours and the way in: side by side, or stacked under 300pt as web does. */
const Nav = ({
  border,
  children,
  read,
}: {
  border: string;
  children: ReactNode;
  read: ReactNode;
}) => {
  const narrow = useEmbedNarrow();
  return (
    <View
      style={[
        styles.nav,
        narrow && styles.navNarrow,
        { borderTopColor: border },
      ]}
    >
      {children}
      {read}
    </View>
  );
};

export const ChapterLinkCard = ({ id, url }: { id: string; url: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const chapter = useStoryChapter(id);
  const story = useStory(chapter.data?.storyBoardId);
  const opening = useChapterOpening(id, !!chapter.data);
  const open = () => router.push(hrefFor({ id, kind: "chapter", url }));

  if (isPausedOffline(chapter)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A chapter on Novelist World"
      />
    );
  }
  if (chapter.isPending) return <EmbedSkeleton tall={150} />;
  const event = chapter.data;
  if (!event) {
    return (
      <Unavailable
        detail="This chapter is private or no longer here."
        onPress={open}
        title="A chapter on Novelist World"
      />
    );
  }

  const book = story.data ?? null;
  const tone = (book ? storyTone(book) : undefined) ?? theme.accent.solid;
  const chapters = [...(book?.events ?? [])].sort(
    (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0),
  );
  const index = chapters.findIndex((c) => c.id === event.id);
  const at = index >= 0 ? index + 1 : (event.ordinal ?? 0);
  const count = chapters.length || Math.max(event.ordinal ?? 0, 1);
  const prev = index > 0 ? chapters[index - 1] : null;
  const next =
    index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const coverSrc =
    event.avatar?.src || event.image || book?.avatar?.src || book?.image || "";
  const coverCrop = event.avatar?.src
    ? hasUsableCrop(event.avatar.crop)
      ? event.avatar.crop
      : null
    : book?.avatar?.src && hasUsableCrop(book.avatar.crop)
      ? book.avatar.crop
      : null;

  const overture = plainText(event.description).replace(/\s+/g, " ").trim();
  const first = opening.data?.threads[0] ?? null;
  const openingWords = first
    ? plainText(first.message).replace(/\s+/g, " ").trim()
    : "";
  const passageCount = opening.data?.totalCount ?? null;
  const location = event.location?.trim() || "";
  const when = event.eventTime?.trim() || "";
  const authors = book?.members?.length ?? 0;
  const song = event.song ?? null;

  return (
    <EmbedFrame
      accessibilityLabel={`Open the chapter ${event.name}`}
      onPress={open}
      tone={tone}
    >
      <Page tone={tone}>
        <View style={styles.head}>
          <View
            style={[styles.spine, { backgroundColor: withAlpha(tone, 0.35) }]}
          >
            {/* The art is clipped to the cover's corners; only the ribbon
                hangs over the top edge. */}
            <View style={styles.spineArt}>
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
                  kind="chapter"
                  seed={event.name}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={styles.spineFold} />
            </View>
            <Ribbon flashback={!!event.isFlashback} tone={tone} />
          </View>

          <View style={styles.copy}>
            <View style={styles.band}>
              <Ionicons color={tone} name="bookmark" size={12} />
              <Text
                numberOfLines={1}
                style={[styles.bandLabel, { color: tone }]}
              >
                CHAPTER {at}
                {count > 1 ? ` OF ${count}` : ""}
              </Text>
              {event.isFlashback ? (
                <View
                  style={[
                    styles.flashback,
                    {
                      backgroundColor: withAlpha(theme.text, 0.09),
                      borderColor: withAlpha(theme.text, 0.14),
                    },
                  ]}
                >
                  <Text
                    style={[styles.flashbackLabel, { color: theme.textGray }]}
                  >
                    FLASHBACK
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              numberOfLines={2}
              style={[styles.title, { color: theme.text }]}
            >
              {event.name}
            </Text>
            {book ? (
              <Text
                numberOfLines={1}
                style={[styles.of, { color: theme.textGray }]}
              >
                from{" "}
                <Text
                  style={{ color: theme.text, fontWeight: weight.semibold }}
                >
                  {book.name}
                </Text>
              </Text>
            ) : null}
            {location ? (
              <View style={styles.setting}>
                <Ionicons
                  color={theme.textGray}
                  name="location-outline"
                  size={11}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.settingText, { color: theme.textGray }]}
                >
                  {location}
                </Text>
              </View>
            ) : null}
            {when ? (
              <View style={styles.setting}>
                <Ionicons
                  color={theme.textGray}
                  name="time-outline"
                  size={11}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.settingText, { color: theme.textGray }]}
                >
                  {when}
                </Text>
              </View>
            ) : null}
            {overture ? (
              <Text
                numberOfLines={2}
                style={[styles.overture, { color: theme.text }]}
              >
                {overture}
              </Text>
            ) : null}
          </View>
        </View>

        {first && openingWords ? (
          <View
            style={[
              styles.opening,
              { backgroundColor: withAlpha(tone, 0.08), borderLeftColor: tone },
            ]}
          >
            <Text
              numberOfLines={3}
              style={[styles.openingText, { color: theme.text }]}
            >
              <Text style={[styles.dropCap, { color: tone }]}>
                {openingWords.charAt(0)}
              </Text>
              {openingWords.slice(1)}
            </Text>
            <View style={styles.openingBy}>
              <Text style={[styles.openingDash, { color: theme.textGray }]}>
                —
              </Text>
              <Avatar
                image={first.author.avatar}
                name={first.author.name}
                size={16}
                uri={first.author.image}
              />
              <Text
                numberOfLines={1}
                style={[styles.openingByText, { color: theme.textGray }]}
              >
                <Text
                  style={{ color: theme.text, fontWeight: weight.semibold }}
                >
                  {first.author.name}
                </Text>
                , opening passage
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.facts}>
          <View style={styles.fact}>
            <Ionicons color={theme.textGray} name="create-outline" size={12} />
            <Text style={[styles.factText, { color: theme.textGray }]}>
              <Text style={[styles.factNumber, { color: theme.text }]}>
                {passageCount ?? 0}
              </Text>{" "}
              {passageCount === 1 ? "passage" : "passages"}
            </Text>
          </View>
          {authors > 0 ? (
            <View style={styles.fact}>
              <Ionicons
                color={theme.textGray}
                name="people-outline"
                size={12}
              />
              <Text style={[styles.factText, { color: theme.textGray }]}>
                <Text style={[styles.factNumber, { color: theme.text }]}>
                  {authors}
                </Text>{" "}
                {authors === 1 ? "author" : "authors"}
              </Text>
            </View>
          ) : null}
          {song ? (
            <View style={[styles.fact, styles.song]}>
              <Ionicons color={tone} name="musical-notes-outline" size={12} />
              <Text
                numberOfLines={1}
                style={[styles.factText, { color: tone, flexShrink: 1 }]}
              >
                <Text style={{ fontWeight: weight.bold }}>{song.title}</Text>
                {song.artist ? ` · ${song.artist}` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        <Nav
          border={withAlpha(tone, 0.22)}
          read={
            <View style={[styles.read, { backgroundColor: tone }]}>
              <Text style={styles.readLabel}>Read chapter</Text>
              <Ionicons color="#fff" name="arrow-forward" size={13} />
            </View>
          }
        >
          <View style={styles.neighbours}>
            <View style={styles.neighbour}>
              <Ionicons color={theme.textGray} name="chevron-back" size={11} />
              <Text
                numberOfLines={1}
                style={[styles.neighbourText, { color: theme.textGray }]}
              >
                Before:{" "}
                {prev ? (
                  <Text
                    style={{ color: theme.text, fontWeight: weight.semibold }}
                  >
                    {prev.name}
                  </Text>
                ) : (
                  <Text style={styles.italic}>the beginning</Text>
                )}
              </Text>
            </View>
            <View style={styles.neighbour}>
              <Ionicons
                color={theme.textGray}
                name="chevron-forward"
                size={11}
              />
              <Text
                numberOfLines={1}
                style={[styles.neighbourText, { color: theme.textGray }]}
              >
                Next:{" "}
                {next ? (
                  <Text
                    style={{ color: theme.text, fontWeight: weight.semibold }}
                  >
                    {next.name}
                  </Text>
                ) : (
                  <Text style={styles.italic}>the latest chapter</Text>
                )}
              </Text>
            </View>
          </View>
        </Nav>
      </Page>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  band: { alignItems: "center", flexDirection: "row", gap: 6, minWidth: 0 },
  bandLabel: {
    flexShrink: 1,
    fontSize: 10.5,
    fontWeight: weight.bold,
    letterSpacing: 1,
  },
  card: {
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.m,
    paddingTop: space.ms,
  },
  cardNarrow: {
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.ms,
    paddingTop: space.ms,
  },
  copy: { flex: 1, gap: 3, minWidth: 0 },
  dropCap: { fontSize: 22, fontWeight: weight.bold },
  fact: { alignItems: "center", flexDirection: "row", gap: 4 },
  factNumber: { fontSize: fontSize.caption, fontWeight: weight.bold },
  factText: { fontSize: fontSize.meta },
  facts: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  flashback: {
    borderRadius: radius.full,
    borderWidth: 1,
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  flashbackLabel: { fontSize: 10, fontWeight: weight.bold, letterSpacing: 0.6 },
  head: { alignItems: "flex-start", flexDirection: "row", gap: space.ms },
  italic: { fontStyle: "italic" },
  nav: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: space.ms,
    paddingTop: space.sm,
  },
  /* In a phone bubble the names need the whole line; the button goes under. */
  navNarrow: { alignItems: "stretch", flexDirection: "column", gap: space.sm },
  neighbour: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minWidth: 0,
  },
  neighbourText: { flexShrink: 1, fontSize: fontSize.meta },
  neighbours: { flex: 1, gap: 2, minWidth: 0 },
  of: { fontSize: fontSize.caption },
  opening: {
    borderLeftWidth: 3,
    borderRadius: 10,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  openingBy: { alignItems: "center", flexDirection: "row", gap: 6 },
  openingByText: { flexShrink: 1, fontSize: fontSize.meta },
  openingDash: { fontSize: fontSize.meta, opacity: 0.6 },
  openingText: { fontSize: fontSize.caption, lineHeight: 18 },
  overture: { fontSize: fontSize.caption, lineHeight: 17, marginTop: 2 },
  read: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  readLabel: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: weight.semibold,
  },
  ribbon: {
    elevation: 4,
    position: "absolute",
    right: 8,
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    top: -6,
  },
  setting: { alignItems: "center", flexDirection: "row", gap: 4, minWidth: 0 },
  settingText: { flexShrink: 1, fontSize: fontSize.meta, fontStyle: "italic" },
  song: { maxWidth: "100%" },
  spine: {
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 6,
    elevation: 5,
    height: SPINE_H,
    marginTop: 2,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    width: SPINE_W,
  },
  spineArt: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 6,
    overflow: "hidden",
  },
  spineFold: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 3,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 6,
  },
  title: { fontSize: 14, fontWeight: weight.bold, lineHeight: 17 },
  wash: { height: "45%", left: 0, position: "absolute", right: 0, top: 0 },
});
