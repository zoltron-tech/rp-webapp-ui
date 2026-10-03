import { Ionicons } from "@expo/vector-icons";
import { mixColors } from "@nw/theme";
import type { Muse, Prompt } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CollapsibleRichText } from "@/components/collapsible-rich-text";
import { FeedMedia } from "@/components/feed/feed-media";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { HeartButton } from "@/components/heart-button";
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  MusePanel,
  PANEL,
  SectionEmpty,
  SectionLabel,
  Shimmer,
} from "@/components/muse/panel";
import { FOLDED_BLOCKS } from "@/components/rich-text";
import { useMusePrompts } from "@/hooks/use-muse";
import { useToggleReaction } from "@/hooks/use-toggle-reaction";
import { withAlpha } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { fontSize, radius, space } from "@/theme";

/**
 * Web's `PromptsSection`: the open starters this character has written.
 *
 * Web draws these as compact glass cards rather than full feed cards — the
 * date and the privacy chip, the text, the picture, then the comment count
 * and the hearts — and so does this. The heart is live (`useToggleReaction`,
 * the same hook the feed uses) and its count opens the same likers tray; the
 * comment count is a count, because the prompt page it links to on web has no
 * counterpart on this client yet.
 */
export const MusePostsSection = ({
  active,
  look,
  motion,
  muse,
}: {
  active: boolean;
  look: MuseLook;
  motion: boolean;
  muse: Muse | null;
}) => {
  const { accent } = look;
  const query = useMusePrompts(muse?.id ?? undefined, active);
  const prompts = query.data;
  const [likers, setLikers] = useState<Prompt | null>(null);

  return (
    <>
      <MusePanel accent={accent} hideBackground={look.hideExpandedBackground}>
        <MiniHeader look={look} muse={muse} />
        <Divider accent={accent} />
        <SectionLabel>Interactions</SectionLabel>

        {!prompts ? (
          <View style={styles.list}>
            <Shimmer height={120} />
            <Shimmer height={120} />
            <Shimmer height={120} />
          </View>
        ) : prompts.length === 0 ? (
          <SectionEmpty
            accent={accent}
            label="No open starters yet."
            motion={motion}
            scene="open-starter"
          />
        ) : (
          <View style={styles.list}>
            {prompts.map((prompt) => (
              <MusePromptCard
                accent={accent}
                key={prompt.id}
                onShowLikers={setLikers}
                prompt={prompt}
              />
            ))}
          </View>
        )}
      </MusePanel>

      <LikersSheet
        count={likers?.reactions ?? 0}
        onClose={() => setLikers(null)}
        targetId={likers?.id ?? null}
      />
    </>
  );
};

const commentsLabel = (count: number) =>
  count > 0
    ? `${count} comment${count === 1 ? "" : "s"}`
    : "Comments & replies";

/** Web's `PromptCard` on the muse page — the compact one, not the feed's. */
const MusePromptCard = memo(function MusePromptCard({
  accent,
  onShowLikers,
  prompt,
}: {
  accent?: string;
  onShowLikers: (prompt: Prompt) => void;
  prompt: Prompt;
}) {
  const reaction = useToggleReaction({
    id: prompt.id,
    reacted: prompt.reacted,
    reactions: prompt.reactions,
    type: "prompt",
  });

  const when = useMemo(
    () => toFormattedDate(prompt.createdOn),
    [prompt.createdOn],
  );

  // A solid hex, because the fold's fade has to dissolve into *something*.
  const surface = accent ? mixColors(accent, 0.14, "#0a0a0e") : "#141418";
  const tint = accent ?? PANEL.secondary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: surface,
          borderColor: accent ? withAlpha(accent, 0.3) : PANEL.cardBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: tint }]}>{when}</Text>
        <View
          style={[
            styles.privacy,
            {
              backgroundColor: accent ? withAlpha(accent, 0.16) : PANEL.pill,
              borderColor: accent ? withAlpha(accent, 0.35) : PANEL.pillBorder,
            },
          ]}
        >
          <Ionicons
            color={PANEL.secondary}
            name={PRIVACY_ICON[prompt.privacy] ?? "earth-outline"}
            size={10}
          />
          <Text style={styles.privacyLabel}>
            {prompt.privacy === "CUSTOM" && prompt.sharedWith?.length
              ? `Shared with ${prompt.sharedWith.length}`
              : (PRIVACY_LABEL[prompt.privacy] ?? prompt.privacy)}
          </Text>
        </View>
      </View>

      {prompt.text ? (
        <CollapsibleRichText
          collapsedHeight={100}
          fadeColor={surface}
          html={prompt.text}
          maxBlocks={FOLDED_BLOCKS}
        />
      ) : null}

      {prompt.media ? <FeedMedia url={prompt.media} /> : null}

      <View style={styles.footer}>
        <View style={styles.comments}>
          <Ionicons color={tint} name="chatbubble-outline" size={12} />
          <Text style={[styles.commentsLabel, { color: tint }]}>
            {commentsLabel(prompt.commentCount ?? 0)}
          </Text>
        </View>
        <HeartButton
          compact
          liked={reaction.reacted}
          likes={reaction.reactions}
          onPressCount={
            reaction.reactions > 0 ? () => onShowLikers(prompt) : undefined
          }
          onToggle={() => void reaction.toggle()}
          size={18}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
    padding: space.sm + 4,
  },
  comments: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 5,
  },
  commentsLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  date: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: space.xs,
  },
  list: { gap: space.sm + 2 },
  privacy: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  privacyLabel: {
    color: PANEL.secondary,
    fontSize: 10,
    fontWeight: "600",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
