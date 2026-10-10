import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { Platform, Pressable } from "react-native";
import { space, useAppTheme } from "@/theme";

/** UIKit's own bar-button size. */
const SIZE = 36;

const HIT_SLOP = {
  bottom: space.md,
  left: space.md,
  right: space.md,
  top: space.md,
};

/** The header's back chevron, where the platform will not draw its own. */
export const StackBackButton = () => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      onPress={() => router.back()}
      style={({ pressed }) => ({
        // A square with the glyph in its middle, and no margin: iOS 26 wraps
        // a header item in a glass capsule sized to this view, so anything
        // that shifts the glyph inside the frame shows as off-centre.
        alignItems: "center",
        height: SIZE,
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
        width: SIZE,
      })}
    >
      <Ionicons color={theme.text} name="chevron-back" size={24} />
    </Pressable>
  );
};

interface ScreenRef {
  navigation: {
    canGoBack: () => boolean;
    getState: () => { routes: readonly { key: string }[] };
  };
  route: { key: string };
}

/**
 * A back button for the first screen of a stack that is itself a screen of
 * another stack (the profile settings, a character's, a story).
 *
 * Android draws one there: react-native-screens looks up through the parent
 * stacks before deciding a screen is the root. iOS does not — a
 * `UINavigationController` only knows its own first screen has nothing behind
 * it — so the way out of these stacks had no button. Only the first screen is
 * given one; the rest keep the system's, and its swipe.
 */
export const nestedStackBack = ({
  navigation,
  route,
}: ScreenRef): Pick<NativeStackNavigationOptions, "headerLeft"> => {
  if (Platform.OS !== "ios") return {};
  if (navigation.getState().routes[0]?.key !== route.key) return {};
  if (!navigation.canGoBack()) return {};
  return { headerLeft: () => <StackBackButton /> };
};
