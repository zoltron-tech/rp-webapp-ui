import { Ionicons } from "@expo/vector-icons";
import { imageSources, richTextToPlainText } from "@nw/richtext";
import type { PromptSource } from "@nw/types";
import { toFormattedDate } from "@nw/utils/format";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Image } from "@/components/image";
import { parseCached } from "@/components/rich-text";
import { Text } from "@/components/text";
import { asHex, withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import {
  accentFromPalette,
  fontSize,
  radius,
  space,
  useAppTheme,
  weight,
} from "@/theme";
import {
  EmbedFrame,
  EmbedSkeleton,
  KindLabel,
  OpenRow,
  Rule,
  Unavailable,
} from "./frame";
import { isPausedOffline, usePromptEmbed } from "./hooks";

/**
 * A prompt link, drawn as the prompt — web's `PromptEmbed`.
 *
 * Words first: who wrote it across the top, the opening lines, a thumbnail
 * when it has a picture, and the thread's counts along the bottom.
 */

const EXCERPT_LINES = 4;
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

/** The plain words of saved rich text, for an excerpt. */
export const excerptOf = (html: string | null | undefined): string =>
  html
    ? richTextToPlainText(parseCached(html))
        .replace(/\n{2,}/g, "\n")
        .trim()
    : "";

/** The hex a source draws in: a character's accent, or a novelist's palette. */
export const sourceTone = (
  source: PromptSource | null | undefined,
): string | undefined => {
  if (!source?.useAccent || source.accent == null) return undefined;
  if (source.sourceType === "MUSE") return asHex(source.accent);
  const palette = Number(source.accent);
  return Number.isFinite(palette)
    ? accentFromPalette(palette).solid
    : undefined;
};

/** Avatar, name, role tag and a meta line — shared by prompt and thread. */
export const AuthorHeader = ({
  meta,
  source,
  tone,
  trailing,
}: {
  meta: React.ReactNode;
  source: PromptSource;
  tone: string;
  trailing?: React.ReactNode;
}) => {
  const theme = useAppTheme();
  const isMuse = source.sourceType === "MUSE";
  return (
    <View style={styles.header}>
      <Avatar
        image={source.avatar}
        name={source.name}
        size={36}
        uri={source.image}
      />
      <View style={styles.author}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {source.name}
          </Text>
          <View
            style={[
              styles.role,
              {
                backgroundColor: withAlpha(tone, 0.14),
                borderColor: withAlpha(tone, 0.28),
              },
            ]}
          >
            <Text style={[styles.roleLabel, { color: tone }]}>
              {isMuse ? "CHARACTER" : "NOVELIST"}
            </Text>
          </View>
        </View>
        <View style={styles.meta}>{meta}</View>
      </View>
      {trailing}
    </View>
  );
};

const PRIVACY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  CUSTOM: "settings-outline",
  FRIENDS: "people-outline",
  ONLY_ME: "lock-closed-outline",
  PUBLIC: "globe-outline",
};

export const PromptLinkCard = ({ id, url }: { id: string; url: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const query = usePromptEmbed(id);
  const open = () => router.push(hrefFor({ id, kind: "prompt", url }));

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A prompt on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton tall={120} />;
  const prompt = query.data;
  if (!prompt) {
    return (
      <Unavailable
        detail="This prompt is private or no longer here."
        onPress={open}
        title="A prompt on Novelist World"
      />
    );
  }

  const tone = sourceTone(prompt.source) ?? theme.accent.solid;
  const nodes = parseCached(prompt.text);
  const excerpt = richTextToPlainText(nodes)
    .replace(/\n{2,}/g, "\n")
    .trim();
  const media = prompt.media?.trim() || "";
  const thumb =
    media && !VIDEO_RE.test(media) ? media : (imageSources(nodes)[0] ?? null);

  return (
    <EmbedFrame
      accessibilityLabel={`Open ${prompt.source.name}'s prompt`}
      onPress={open}
      tone={tone}
    >
      <View style={styles.card}>
        <AuthorHeader
          meta={
            <>
              <Text style={[styles.metaText, { color: theme.textGray }]}>
                {toFormattedDate(prompt.createdOn)}
              </Text>
              <View
                style={[styles.metaDot, { backgroundColor: theme.textGray }]}
              />
              <Ionicons
                color={theme.textGray}
                name={PRIVACY_ICON[prompt.privacy] ?? "globe-outline"}
                size={11}
              />
            </>
          }
          source={prompt.source}
          tone={tone}
          trailing={
            <KindLabel icon="create-outline" label="Prompt" tone={tone} />
          }
        />

        <View style={styles.bodyRow}>
          <Text
            numberOfLines={thumb ? EXCERPT_LINES : EXCERPT_LINES - 1}
            style={[
              styles.excerpt,
              { color: theme.text },
              !excerpt && styles.empty,
            ]}
          >
            {excerpt || "A prompt with no words — just the picture."}
          </Text>
          {thumb ? (
            <Image
              contentFit="cover"
              source={{ uri: wsrvImage(thumb, IMAGE_SIZES.AVATAR_MEDIUM) }}
              style={styles.thumb}
            />
          ) : null}
        </View>

        <Rule tone={tone} />
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Ionicons
              color={prompt.reacted ? tone : theme.textGray}
              name={prompt.reacted ? "heart" : "heart-outline"}
              size={13}
            />
            <Text
              style={[
                styles.statLabel,
                { color: prompt.reacted ? tone : theme.textGray },
              ]}
            >
              {prompt.reactions ?? 0}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              color={theme.textGray}
              name="chatbubble-outline"
              size={13}
            />
            <Text style={[styles.statLabel, { color: theme.textGray }]}>
              {prompt.commentCount ?? 0}
            </Text>
          </View>
          <OpenRow label="Open thread" tone={tone} />
        </View>
      </View>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  author: { flex: 1, gap: 1, minWidth: 0 },
  bodyRow: { alignItems: "flex-start", flexDirection: "row", gap: space.ms },
  card: { gap: space.ms, padding: space.m, paddingBottom: space.ms },
  empty: { fontStyle: "italic", opacity: 0.8 },
  excerpt: { flex: 1, fontSize: fontSize.label, lineHeight: 19, minWidth: 0 },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingTop: space.xs,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    minWidth: 0,
  },
  meta: { alignItems: "center", flexDirection: "row", gap: 5 },
  metaDot: { borderRadius: radius.full, height: 3, opacity: 0.5, width: 3 },
  metaText: { fontSize: fontSize.meta },
  name: { flexShrink: 1, fontSize: fontSize.label, fontWeight: weight.bold },
  nameRow: { alignItems: "center", flexDirection: "row", gap: 6, minWidth: 0 },
  role: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  roleLabel: { fontSize: 9, fontWeight: weight.bold, letterSpacing: 0.6 },
  stat: { alignItems: "center", flexDirection: "row", gap: 4 },
  statLabel: { fontSize: fontSize.caption },
  thumb: { borderRadius: radius.field, height: 76, width: 76 },
});
