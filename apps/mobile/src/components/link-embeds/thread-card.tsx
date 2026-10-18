import { Ionicons } from "@expo/vector-icons";
import { imageSources, richTextToPlainText } from "@nw/richtext";
import type { PromptSource, Reply } from "@nw/types";
import { toFormattedDate } from "@nw/utils/format";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Image } from "@/components/image";
import { parseCached } from "@/components/rich-text";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import { hrefFor } from "@/lib/link-embeds";
import { fontSize, radius, space, useAppTheme, weight } from "@/theme";
import { EmbedFrame, EmbedSkeleton, OpenRow, Rule, Unavailable } from "./frame";
import {
  isPausedOffline,
  useThreadEmbed,
  useThreadRepliesSample,
} from "./hooks";
import { excerptOf, sourceTone } from "./prompt-card";

/**
 * A thread link, drawn as the exchange it is — web's `ThreadEmbed`.
 *
 * Two voices paired at the top (the prompt's author and whoever answered),
 * the prompt's opening and the thread's first reply as facing turns, the
 * newest reply as a faint third line, and the cast of repliers along the
 * bottom. Two tones: the frame runs from the prompt author's colour to the
 * opener's, and each turn is tinted with its speaker's.
 */

const CAST_SIZE = 4;
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

const castOf = (replies: Reply[], openerId: string): PromptSource[] => {
  const seen = new Set<string>([openerId]);
  const cast: PromptSource[] = [];
  for (const reply of replies) {
    const id = reply.source?.sourceId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    cast.push(reply.source);
    if (cast.length === CAST_SIZE) break;
  }
  return cast;
};

const Turn = ({
  excerpt,
  lines,
  side,
  source,
  thumb,
  tone,
  verb,
}: {
  excerpt: string;
  lines: number;
  side: "a" | "b";
  source: PromptSource;
  thumb?: string | null;
  tone: string;
  verb: string;
}) => {
  const theme = useAppTheme();
  const right = side === "b";
  return (
    <View
      style={[
        styles.turn,
        right ? styles.turnRight : styles.turnLeft,
        {
          backgroundColor: withAlpha(tone, 0.1),
          borderColor: withAlpha(tone, 0.22),
        },
      ]}
    >
      <Avatar
        image={source.avatar}
        name={source.name}
        size={20}
        uri={source.image}
      />
      <View style={[styles.turnBody, right && styles.turnBodyRight]}>
        <Text
          numberOfLines={1}
          style={[styles.turnWho, { color: tone }, right && styles.textRight]}
        >
          {source.name}{" "}
          <Text style={{ color: theme.textGray, fontWeight: weight.medium }}>
            {verb}
          </Text>
        </Text>
        <Text
          numberOfLines={lines}
          style={[
            styles.turnText,
            { color: theme.text },
            right && styles.textRight,
            !excerpt && styles.empty,
          ]}
        >
          {excerpt || "A reply with no words — just a picture."}
        </Text>
      </View>
      {thumb ? (
        <Image
          contentFit="cover"
          source={{ uri: wsrvImage(thumb, IMAGE_SIZES.AVATAR_MEDIUM) }}
          style={styles.thumb}
        />
      ) : null}
    </View>
  );
};

export const ThreadLinkCard = ({ id, url }: { id: string; url: string }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const query = useThreadEmbed(id);
  const replies = useThreadRepliesSample(id, !!query.data);
  const open = () => router.push(hrefFor({ id, kind: "thread", url }));

  if (isPausedOffline(query)) {
    return (
      <Unavailable
        detail="You’re offline. It will open when you’re back."
        onPress={open}
        title="A thread on Novelist World"
      />
    );
  }
  if (query.isPending) return <EmbedSkeleton tall={170} />;
  const comment = query.data;
  if (!comment) {
    return (
      <Unavailable
        detail="This thread is private or no longer here."
        onPress={open}
        title="A thread on Novelist World"
      />
    );
  }

  const opener = comment.source;
  const promptAuthor = comment.prompt?.source ?? null;
  const same = !!promptAuthor && promptAuthor.sourceId === opener.sourceId;
  const toneB = sourceTone(opener) ?? theme.accent.solid;
  const toneA = sourceTone(promptAuthor) ?? theme.accent.solid;

  const replyNodes = parseCached(comment.text);
  const replyWords = richTextToPlainText(replyNodes)
    .replace(/\n{2,}/g, "\n")
    .trim();
  const media = comment.media?.trim() || "";
  const thumb =
    media && !VIDEO_RE.test(media)
      ? media
      : (imageSources(replyNodes)[0] ?? null);
  const sample = replies.data ?? [];
  const latest = sample[0] ?? null;
  const latestWords = latest ? excerptOf(latest.text).replace(/\s+/g, " ") : "";
  const cast = castOf(sample, opener.sourceId);
  const replyCount = comment.replyCount ?? 0;

  return (
    <EmbedFrame
      accessibilityLabel={`Open ${opener.name}'s thread`}
      onPress={open}
      tone={toneA}
      toneTo={toneB}
    >
      <View style={styles.card}>
        <View style={styles.band}>
          <Ionicons color={toneB} name="chatbubbles" size={12} />
          <Text style={[styles.bandLabel, { color: toneB }]}>THREAD</Text>
          <Text style={[styles.bandTime, { color: theme.textGray }]}>
            · {toFormattedDate(comment.createdOn)}
          </Text>
          <View
            style={[
              styles.status,
              comment.concluded
                ? {
                    backgroundColor: withAlpha(theme.text, 0.09),
                    borderColor: withAlpha(theme.text, 0.14),
                  }
                : {
                    backgroundColor: "rgba(61,220,151,0.12)",
                    borderColor: "rgba(61,220,151,0.3)",
                  },
            ]}
          >
            {comment.concluded ? (
              <Ionicons
                color={theme.textGray}
                name="checkmark-circle-outline"
                size={11}
              />
            ) : (
              <View style={styles.liveDot} />
            )}
            <Text
              style={[
                styles.statusLabel,
                { color: comment.concluded ? theme.textGray : "#3ddc97" },
              ]}
            >
              {comment.concluded ? "CONCLUDED" : "OPEN"}
            </Text>
          </View>
        </View>

        <View style={styles.pair}>
          <View style={styles.duo}>
            {promptAuthor && !same ? (
              <View
                style={[styles.duoBack, { borderColor: theme.surfaces.card }]}
              >
                <Avatar
                  image={promptAuthor.avatar}
                  name={promptAuthor.name}
                  size={40}
                  uri={promptAuthor.image}
                />
              </View>
            ) : null}
            <View
              style={[
                styles.duoFront,
                { borderColor: theme.surfaces.card },
                (!promptAuthor || same) && styles.duoAlone,
              ]}
            >
              <Avatar
                image={opener.avatar}
                name={opener.name}
                size={40}
                uri={opener.image}
              />
            </View>
          </View>
          <View style={styles.pairText}>
            <Text
              numberOfLines={1}
              style={[styles.names, { color: theme.text }]}
            >
              {opener.name}
              {promptAuthor && !same ? (
                <Text style={{ color: theme.textGray }}>
                  {" "}
                  ⇄ {promptAuthor.name}
                </Text>
              ) : null}
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.story, { color: theme.textGray }]}
            >
              <Text style={{ color: toneB, fontWeight: weight.semibold }}>
                {opener.name}
              </Text>
              {promptAuthor
                ? same
                  ? " continued their own prompt"
                  : [
                      " picked up ",
                      <Text
                        key="a"
                        style={{ color: toneA, fontWeight: weight.semibold }}
                      >
                        {promptAuthor.name}
                      </Text>,
                      "’s prompt",
                    ]
                : " opened a thread"}
              {replyCount > 0
                ? ` · ${replyCount} ${replyCount === 1 ? "reply" : "replies"} so far`
                : " · waiting for a first reply"}
            </Text>
          </View>
        </View>

        <View style={styles.exchange}>
          {promptAuthor ? (
            <Turn
              excerpt={excerptOf(comment.prompt?.text)}
              lines={2}
              side="a"
              source={promptAuthor}
              tone={toneA}
              verb="opened with"
            />
          ) : null}
          <Turn
            excerpt={replyWords}
            lines={3}
            side="b"
            source={opener}
            thumb={thumb}
            tone={toneB}
            verb="answered"
          />
          {latest && latestWords ? (
            <View style={styles.latest}>
              <Ionicons
                color={theme.textGray}
                name="return-down-forward-outline"
                size={12}
              />
              <Avatar
                image={latest.source.avatar}
                name={latest.source.name}
                size={16}
                uri={latest.source.image}
              />
              <Text
                numberOfLines={1}
                style={[styles.latestText, { color: theme.textGray }]}
              >
                <Text
                  style={{ color: theme.text, fontWeight: weight.semibold }}
                >
                  {latest.source.name}
                </Text>
                , {toFormattedDate(latest.createdOn)}: {latestWords}
              </Text>
            </View>
          ) : null}
        </View>

        <Rule tone={toneB} />
        <View style={styles.footer}>
          {cast.length > 0 ? (
            <View style={styles.cast}>
              {cast.map((member, index) => (
                <View
                  key={member.sourceId}
                  style={[
                    styles.castFace,
                    { borderColor: theme.surfaces.card },
                    index > 0 && styles.castOverlap,
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
          ) : null}
          <View style={styles.stat}>
            <Ionicons
              color={theme.textGray}
              name="chatbubble-outline"
              size={13}
            />
            <Text style={[styles.statLabel, { color: theme.textGray }]}>
              {replyCount}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              color={comment.reacted ? toneB : theme.textGray}
              name={comment.reacted ? "heart" : "heart-outline"}
              size={13}
            />
            <Text
              style={[
                styles.statLabel,
                { color: comment.reacted ? toneB : theme.textGray },
              ]}
            >
              {comment.reactions ?? 0}
            </Text>
          </View>
          <OpenRow label="Open thread" tone={toneB} />
        </View>
      </View>
    </EmbedFrame>
  );
};

const styles = StyleSheet.create({
  band: { alignItems: "center", flexDirection: "row", gap: 5 },
  bandLabel: { fontSize: 10.5, fontWeight: weight.bold, letterSpacing: 1 },
  bandTime: { flexShrink: 1, fontSize: fontSize.meta },
  card: { gap: space.ms, padding: space.m, paddingBottom: space.ms },
  cast: { alignItems: "center", flexDirection: "row" },
  castFace: { borderRadius: radius.full, borderWidth: 2 },
  castOverlap: { marginLeft: -8 },
  duo: { flexDirection: "row", height: 46, width: 76 },
  duoAlone: { left: 0 },
  duoBack: {
    borderRadius: radius.full,
    borderWidth: 2.5,
    left: 0,
    position: "absolute",
    top: 0,
  },
  duoFront: {
    borderRadius: radius.full,
    borderWidth: 2.5,
    left: 30,
    position: "absolute",
    top: 0,
  },
  empty: { fontStyle: "italic", opacity: 0.8 },
  exchange: { gap: space.s },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    paddingTop: space.xs,
  },
  latest: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 4,
  },
  latestText: { flex: 1, fontSize: fontSize.meta, minWidth: 0 },
  liveDot: {
    backgroundColor: "#3ddc97",
    borderRadius: radius.full,
    height: 5,
    width: 5,
  },
  names: { fontSize: fontSize.body, fontWeight: weight.bold },
  pair: { alignItems: "center", flexDirection: "row", gap: space.m },
  pairText: { flex: 1, gap: 2, minWidth: 0 },
  stat: { alignItems: "center", flexDirection: "row", gap: 4 },
  statLabel: { fontSize: fontSize.caption },
  status: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusLabel: { fontSize: 10, fontWeight: weight.bold, letterSpacing: 0.6 },
  story: { fontSize: fontSize.meta, lineHeight: 15 },
  textRight: { textAlign: "right" },
  thumb: { borderRadius: radius.md, height: 52, width: 52 },
  turn: {
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: 9,
    paddingVertical: 7,
    width: "94%",
  },
  turnBody: { flex: 1, gap: 2, minWidth: 0 },
  turnBodyRight: { alignItems: "flex-end" },
  turnLeft: { alignSelf: "flex-start", borderTopLeftRadius: 4 },
  turnRight: {
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
    flexDirection: "row-reverse",
  },
  turnText: { fontSize: fontSize.label, lineHeight: 18 },
  turnWho: { fontSize: 10.5, fontWeight: weight.semibold },
});
