import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { space, useAppTheme } from "@/theme";

/**
 * The header's menu button, for every tab's stack.
 *
 * Each of the six tab layouts, and the tab navigator, drew this for itself:
 * the same glyph, the same hit slop, the same push. It is a bare glyph rather
 * than an `IconButton` because it sits in a native header, which has no
 * surface for a circle to sit on.
 */
const HIT_SLOP = {
  bottom: space.md,
  left: space.sm,
  right: space.sm,
  top: space.md,
};

export const MenuButton = () => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Open menu"
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      onPress={() => router.push("/menu")}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        paddingHorizontal: space.md,
      })}
    >
      <Ionicons color={theme.text} name="menu" size={26} />
    </Pressable>
  );
};
