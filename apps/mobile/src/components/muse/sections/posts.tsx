import { Ionicons } from "@expo/vector-icons";
import type { Friend, Muse, Prompt } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import { useRouter } from "expo-router";
import { memo, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { CollapsibleRichText } from "@/components/collapsible-rich-text";
import { FeedMedia } from "@/components/feed/feed-media";
import { LikersSheet } from "@/components/feed/likers-sheet";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { SharedWithSheet } from "@/components/feed/shared-with-sheet";
import { HeartButton } from "@/components/heart-button";
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  itemFill,
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
import { border, fontSize, radius, space } from "@/theme";

/**
 * Web's `PromptsSection`: the open starters this character has written.
 *
 * Web draws these as compact glass cards rather than full feed cards — the
 * date and the privacy chip, the text, the picture, then the comment count
 * and the hearts — and so does this. The heart is live (`useToggleReaction`,
 * the same hook the feed uses) and its count opens the same likers tray; the
 * comment count opens the prompt page.
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
  const [sharedWith, setSharedWith] = useState<Friend[] | null>(null);

  return (
    <>
      <MusePanel
        accent={accent}
        hideBackground={look.hideExpandedBackground}
        header={
          <>
            <MiniHeader look={look} muse={muse} />
            <Divider accent={accent} />
            <SectionLabel>Interactions</SectionLabel>
          </>
        }
      >
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
                menuText={look.menuText}
                onShowLikers={setLikers}
                onShowSharedWith={setSharedWith}
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

      <SharedWithSheet
        friends={sharedWith}
        onClose={() => setSharedWith(null)}
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
  menuText,
  onShowLikers,
  onShowSharedWith,
  prompt,
}: {
  accent?: string;
  /** The side menu's text colour, which the date and comment count share. */
  menuText?: string;
  onShowLikers: (prompt: Prompt) => void;
  onShowSharedWith: (friends: Friend[]) => void;
  prompt: Prompt;
}) {
  const router = useRouter();
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

  const sharedWith =
    prompt.privacy === "CUSTOM" ? (prompt.sharedWith ?? []) : [];

  // The items' shared 70% fill. The fold's fade dissolves into the same
  // colour, so where it ends the card reads as one surface.
  const surface = itemFill(accent);
  // The date and the comment count read in the side menu's ink (its
  // resting text: the muse's menu text colour at 70%, else soft white) —
  // quiet metadata, where the accent is kept for what can be tapped.
  const tint = menuText ? withAlpha(menuText, 0.7) : "rgba(255,255,255,0.6)";

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
        <Pressable
          accessibilityRole={sharedWith.length > 0 ? "button" : undefined}
          disabled={sharedWith.length === 0}
          hitSlop={space.xs}
          onPress={() => onShowSharedWith(sharedWith)}
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
            {sharedWith.length > 0
              ? `Shared with ${sharedWith.length}`
              : (PRIVACY_LABEL[prompt.privacy] ?? prompt.privacy)}
          </Text>
        </Pressable>
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
        <Pressable
          accessibilityRole="link"
          hitSlop={space.sm}
          onPress={() =>
            router.push({
              params: { promptId: prompt.id },
              pathname: "/prompt/[promptId]",
            })
          }
          style={({ pressed }) => [
            styles.comments,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons color={tint} name="chatbubble-outline" size={12} />
          <Text style={[styles.commentsLabel, { color: tint }]}>
            {commentsLabel(prompt.commentCount ?? 0)}
          </Text>
        </Pressable>
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
    borderRadius: radius.field,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  comments: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: space.s,
  },
  commentsLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  date: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: space.xs,
  },
  list: { gap: space.ms },
  privacy: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  privacyLabel: {
    color: PANEL.secondary,
    fontSize: fontSize.meta,
    fontWeight: "600",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
