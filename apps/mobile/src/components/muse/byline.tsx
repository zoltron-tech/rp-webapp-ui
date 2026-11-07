import { Ionicons } from "@expo/vector-icons";
import type { Novelist } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { PANEL } from "@/components/muse/panel";
import { Text } from "@/components/text";
import { withAlpha } from "@/lib/color";
import { border, fontSize, radius, space } from "@/theme";

/**
 * The byline — whose pen this character came from — above the verses.
 *
 * A chapter divider rather than a button: two ruled lines closing on a small
 * signature, "From the pen of", the author's face and name, and a chevron
 * that says the signature goes somewhere. The name sits in the same chip the
 * card's "Penned by" uses — the accent at eighteen percent, a hairline of it
 * round — so it reads as the same control in a second place, and as a control
 * at all. Web draws the same line above its verse header.
 *
 * Routes through `/novelist/[username]`, which redirects your own handle to
 * the Profile tab.
 */
export const Byline = ({
  accent,
  author,
  textColor,
}: {
  /** The muse's accent, for the rules and the pen. */
  accent?: string;
  /**
   * Null while nobody knows yet — a deep link before the first answer. The
   * rules are drawn alone then, at the bar's full height (`BYLINE_HEIGHT`),
   * so the rows under it do not move when the signature arrives.
   */
  author: Pick<
    Novelist,
    "username" | "firstName" | "lastName" | "image" | "avatar"
  > | null;
  /** The muse's `pennedByColor` override, when the author set one. */
  textColor?: string;
}) => {
  const router = useRouter();
  const tint = accent ?? "#ffffff";
  const name = author
    ? [author.firstName, author.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <View style={styles.bar}>
      <View
        style={[styles.rule, { backgroundColor: withAlpha(tint, 0.35) }]}
      />
      {author ? (
        <Pressable
          accessibilityHint="Opens the novelist who writes this character"
          accessibilityLabel={`From the pen of ${name || author.username}`}
          accessibilityRole="link"
          hitSlop={space.xs}
          onPress={() =>
            router.push({
              params: { username: author.username },
              pathname: "/novelist/[username]",
            })
          }
          style={({ pressed }) => [
            styles.signature,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons color={tint} name="pencil-outline" size={11} />
          <Text style={styles.lead}>From the pen of</Text>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: accent ? withAlpha(accent, 0.18) : PANEL.pill,
                borderColor: accent ? withAlpha(accent, 0.4) : PANEL.pillBorder,
              },
            ]}
          >
            <Avatar
              image={author.avatar}
              name={author.username}
              size={18}
              uri={wsrvImage(author.avatar?.src ?? author.image, {
                fit: "inside",
                h: 54,
                w: 54,
              })}
            />
            <Text
              numberOfLines={1}
              style={[styles.name, textColor ? { color: textColor } : null]}
            >
              {name || author.username}
            </Text>
            <Ionicons
              color="rgba(255,255,255,0.7)"
              name="chevron-forward"
              size={12}
            />
          </View>
        </Pressable>
      ) : null}
      <View
        style={[styles.rule, { backgroundColor: withAlpha(tint, 0.35) }]}
      />
    </View>
  );
};

/** The signature's `minHeight` between the bar's top padding and web's 8px foot. */
const BYLINE_HEIGHT = space.xs + 28 + space.sm;

const styles = StyleSheet.create({
  /* Web's `BylineInner` at ≤950px: 440 wide at most, 16 in from each side. */
  bar: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: space.ms,
    maxWidth: 440,
    minHeight: BYLINE_HEIGHT,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    width: "100%",
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    flexShrink: 1,
    gap: 5,
    paddingLeft: 3,
    paddingRight: 5,
    paddingVertical: 3,
  },
  lead: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.meta,
    fontStyle: "italic",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  name: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: fontSize.caption,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  rule: { borderRadius: 1, flex: 1, height: 1 },
  signature: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: space.s,
    maxWidth: "80%",
    minHeight: 28,
  },
});
