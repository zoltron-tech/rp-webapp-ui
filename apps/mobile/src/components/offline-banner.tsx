import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOfflineBannerReveal } from "@/animation/effects";
import { Text } from "@/components/text";
import { useOffline } from "@/lib/connectivity";
import { useOutbox } from "@/lib/local-store";
import { space, useAppTheme } from "@/theme";

/**
 * A thin strip under the status bar while the phone has no network.
 *
 * Quiet on purpose. The screens already say what is missing where it is
 * missing (`components/offline.tsx`); this is the one line that says *why*,
 * everywhere, so a feed that looks a little old and a thread that will not
 * send are read as one condition and not two bugs. It never moves the layout
 * under it: it floats over the top bar, and drops out the way it came in
 * when the signal returns.
 *
 * It also counts what is waiting to go out (`local-store/outbox.ts`), and
 * when there is something, tapping it opens the outbox. With nothing waiting
 * it takes no touches at all.
 */
export const OfflineBanner = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const waiting = useOutbox().length;
  const reveal = useOfflineBannerReveal(offline);

  if (!reveal.mounted) return null;

  const label =
    waiting > 0
      ? `Offline · ${waiting} waiting to send`
      : "Offline · showing what's saved";

  return (
    /*
     * A thin strip along the top edge of whichever header is up, directly
     * under the status bar. Every header in the app centres its title some
     * fifty points below the inset, so a strip this short sits in the
     * header's own top padding and never crosses the title — a floating pill
     * at the same height did.
     */
    <Animated.View
      pointerEvents={waiting > 0 ? "box-none" : "none"}
      style={[styles.root, { top: insets.top }, reveal.style]}
    >
      <Pressable
        accessibilityHint={waiting > 0 ? "Opens the outbox" : undefined}
        accessibilityLiveRegion="polite"
        accessibilityRole={waiting > 0 ? "button" : "text"}
        disabled={waiting === 0}
        onPress={() => router.navigate("/outbox")}
        style={({ pressed }) => [
          styles.strip,
          {
            backgroundColor: theme.glass.opaque,
            borderBottomColor: theme.glass.edge,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name="cloud-offline-outline" size={11} />
        <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>
        {waiting > 0 ? (
          <Ionicons color={theme.textGray} name="chevron-forward" size={11} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

/** Short enough to stay inside a header's top padding. */
const STRIP_HEIGHT = 20;

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
  root: {
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 100,
  },
  strip: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    height: STRIP_HEIGHT,
    justifyContent: "center",
  },
});
