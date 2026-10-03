import { useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { PANEL } from "@/components/muse/panel";
import { withAlpha } from "@/lib/color";
import { radius, space } from "@/theme";

/**
 * Web's `PennedBy`: "Penned by" and a chip with the author's face and handle.
 *
 * Tapping opens the author. Your own handle lands on the Profile tab, which
 * already holds the novelist from the session; anyone else's is pushed as a
 * profile — the same split the novelist list makes.
 */
export const PennedBy = ({
  accent,
  novelist,
  textColor,
}: {
  accent?: string;
  novelist: Pick<Novelist, "username" | "image" | "avatar"> | null | undefined;
  /** Advanced appearance override; falls back to the default text colours. */
  textColor?: string;
}) => {
  const router = useRouter();
  const session = useSession();

  if (!novelist?.username) return null;

  const open = () => {
    if (session.novelist?.username === novelist.username) {
      router.push("/(tabs)/(profile)");
      return;
    }
    router.push({
      params: { username: novelist.username },
      pathname: "/novelist/[username]",
    });
  };

  return (
    <View style={styles.row}>
      <Text style={[styles.lead, textColor ? { color: textColor } : null]}>
        Penned by
      </Text>
      <Pressable
        accessibilityLabel={`Penned by ${novelist.username}`}
        accessibilityRole="button"
        hitSlop={space.xs}
        onPress={open}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: accent ? withAlpha(accent, 0.18) : PANEL.pill,
            borderColor: accent ? withAlpha(accent, 0.4) : PANEL.pillBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Avatar
          image={novelist.avatar}
          name={novelist.username}
          size={16}
          uri={wsrvImage(novelist.avatar?.src ?? novelist.image, {
            fit: "inside",
            h: 48,
            w: 48,
          })}
        />
        <Text
          numberOfLines={1}
          style={[styles.name, textColor ? { color: textColor } : null]}
        >
          {novelist.username}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexShrink: 1,
    gap: 5,
    maxWidth: 180,
    paddingLeft: 3,
    paddingRight: space.sm + 1,
    paddingVertical: 2,
  },
  lead: { color: PANEL.muted, fontSize: 11 },
  name: {
    color: PANEL.secondary,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
});
