import { RETENTION_PERIOD, retentionNoticeFor } from "@nw/chat";
import { mixColors } from "@nw/theme";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "These messages fade away after 14 days."
 *
 * Sits at the top of the history, above the oldest message, exactly where the
 * web panel puts it — a person scrolling all the way back should find the rule
 * about retention there rather than pinned over the conversation.
 *
 * The wording is one of six variants from `@nw/chat`, picked by hashing the
 * conversation id. Two reasons it is not `Math.random()`: it would reshuffle on
 * every render, and the retention period is a promise about the user's data, so
 * both clients read it from the same list rather than each keeping a copy that
 * can drift to a different number of days.
 *
 * Web's `color-mix(in srgb, var(--accent) 8%, var(--bg-3))` has no React Native
 * equivalent, which is what `mixColors` in `@nw/theme` is for.
 */
export const RetentionNotice = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const theme = useAppTheme();
  const notice = useMemo(
    () => retentionNoticeFor(conversationId),
    [conversationId],
  );

  // The emphasised period is lifted out of `line2` so it can carry the accent,
  // the way web wraps it in a <strong>. Split rather than hardcoded, so a
  // variant that words it differently still renders as one sentence.
  const [before, after] = notice.line2.split(RETENTION_PERIOD);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.notice,
          {
            backgroundColor: mixColors(
              theme.accent.solid,
              0.08,
              theme.material.fill,
            ),
            borderColor: mixColors(
              theme.accent.solid,
              0.2,
              theme.background,
            ),
          },
        ]}
      >
        <Text style={[styles.line1, { color: theme.textGray }]}>
          {notice.line1}
        </Text>
        <Text style={[styles.line2, { color: theme.textGray }]}>
          {before}
          {/*
            Web emphasises this with `--accent-hover` (step 7). Step 7 is a
            border role — at 12px on a tinted card it is close to unreadable on
            a phone, so this uses step 11, the scale's "accent text on a dark
            background". Same colour to the eye, legible at this size.
          */}
          <Text style={[styles.period, { color: theme.accent.text }]}>
            {RETENTION_PERIOD}
          </Text>
          {after ?? ""}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line1: { fontSize: fontSize.caption, fontWeight: "500", textAlign: "center" },
  line2: {
    fontSize: fontSize.caption,
    opacity: 0.8,
    textAlign: "center",
  },
  notice: {
    borderRadius: radius.lg,
    borderWidth: border.edge,
    gap: space.xxs,
    maxWidth: "90%",
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  period: { fontWeight: "700" },
  wrapper: { alignItems: "center", paddingVertical: space.sm },
});
