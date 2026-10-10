import type { Badge } from "@nw/types/badge";
import { toFormattedDate } from "@nw/utils";
import { StyleSheet, View } from "react-native";
import { BadgeCrest } from "@/components/badges";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One badge, large and moving, with everything there is to say about it.
 *
 * The shelf shows twelve crests held still, because twelve of these drawings
 * animating at once is what made that screen crawl. The drawing is worth
 * looking at, so it gets a place of its own: tap a tile and the crest is here
 * at four times the size, playing its motion, with the title, what it means
 * and — for one not yet earned — what earns it.
 *
 * A tray rather than a pushed screen (AGENTS.md): it is a detail of the
 * thing under it, and swiping down is the way back.
 */

/** Large enough for the artwork's small parts — birds, sparks, dots — to read. */
const CREST = 150;

export const BadgeDetailSheet = ({
  badge,
  onClose,
}: {
  /** Null closes the tray. */
  badge: Badge | null;
  onClose: () => void;
}) => {
  const theme = useAppTheme();
  const locked = badge ? !badge.earned : false;

  return (
    <BottomSheet
      ignoreKeyboard
      maxHeightRatio={0.72}
      onClose={onClose}
      subtitle={
        badge
          ? locked
            ? "Not earned yet"
            : badge.awardedAt
              ? `Earned ${toFormattedDate(badge.awardedAt)}`
              : "Earned"
          : undefined
      }
      title={badge?.title ?? "Badge"}
      visible={badge !== null}
    >
      {badge ? (
        <View style={styles.body}>
          {/* Mounted only while open, so the motion clock runs only here. */}
          <View style={styles.crest}>
            <BadgeCrest
              code={badge.code}
              motionScope="badge-detail"
              muted={locked}
              replayOnPress
              size={CREST}
            />
          </View>

          <Text style={[styles.description, { color: theme.text }]}>
            {badge.description}
          </Text>

          {/*
            What earns it, either way. Locked, it is the thing to go and do;
            earned, it is the thing that was done, and the box turns green
            to say so.
          */}
          <View
            style={[
              styles.requirement,
              locked
                ? {
                    backgroundColor: theme.material.fillTranslucent,
                    borderColor: theme.material.edgeTranslucent,
                  }
                : {
                    backgroundColor: theme.tones.positive.fill,
                    borderColor: theme.tones.positive.fill,
                  },
            ]}
          >
            <Text
              style={[
                styles.requirementLabel,
                { color: locked ? theme.textGray : theme.tones.positive.ink },
              ]}
            >
              {locked ? "HOW TO EARN IT" : "HOW IT WAS EARNED"}
            </Text>
            <Text
              style={[
                styles.requirementText,
                { color: locked ? theme.text : theme.tones.positive.ink },
              ]}
            >
              {badge.requirement}
            </Text>
          </View>

          <Text style={[styles.hint, { color: theme.textGray }]}>
            Tap the badge to play it again.
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    gap: space.md,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  crest: { paddingVertical: space.sm },
  description: {
    fontSize: fontSize.body,
    lineHeight: 21,
    maxWidth: 320,
    textAlign: "center",
  },
  hint: { fontSize: fontSize.meta },
  requirement: {
    alignSelf: "stretch",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.xs,
    padding: space.m,
  },
  requirementLabel: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 1,
  },
  requirementText: { fontSize: fontSize.body, lineHeight: 20 },
});
