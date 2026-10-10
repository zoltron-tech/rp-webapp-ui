import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/logo";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { PRIVACY_URL, TERMS_URL } from "@/lib/links";

/**
 * `/rp/novelists` — the public landing screen.
 *
 * The web version is a 342-line marketing page: animated hero, a live
 * manuscript demo, a storybook reader, a feature grid and an install prompt.
 * None of that ports, and most of it should not — someone reading this has
 * already installed the app, so the "download it" half of the argument is
 * already won.
 *
 * ## Why there is so little here
 *
 * The previous version was Apple's welcome sheet: an icon, a title, and three
 * icon rows arguing for the product. That is the right pattern for a first run
 * that has something to teach, and the wrong one here, because this screen has
 * exactly one job and three feature rows are not it.
 *
 * Someone on this screen has already chosen the app. The only question left is
 * which of two doors they go through, and every line above those doors is a
 * line between them and the answer. It also could not be *promised* to fit: the
 * three rows put the iPhone SE baseline within a few points of scrolling, and a
 * landing screen that scrolls to reach its own buttons is a landing screen with
 * its buttons in the wrong place.
 *
 * So what is left is the icon, the name, one sentence of what the thing is, and
 * the two doors. It fits the 375×667 baseline in `AGENTS.md` with room to
 * spare, at any text size, with nothing to scroll.
 *
 * ## The two doors are not the same size
 *
 * "Create account" is the filled button and "Sign in" is the quiet one, because
 * a signed-out install is far more often a new account than a returning one —
 * a returning reader's token is in the keychain and they never see this screen.
 * Both are full-width and 50pt: the quiet one is quiet in weight, not in
 * reach.
 */


export default function WelcomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.accent.tint, theme.background]}
        locations={[0, 0.5]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.page,
          {
            paddingBottom: insets.bottom + space.lg,
            paddingTop: insets.top + space.lg,
          },
        ]}
      >
        {/*
          The centre block floats between two flexible spacers rather than
          sitting under the top one. On a tall phone that puts the name at the
          optical centre and the buttons in the thumb's reach; on the SE the
          spacers collapse and the same layout simply tightens.
        */}
        <View style={styles.spacer} />

        <View style={styles.brand}>
          {/*
            The icon at app-icon size and app-icon radius, without the wordmark
            — the title underneath is the wordmark. The brand's 5px corner on a
            64px tile reads as a rounded rectangle rather than an icon, which is
            why the radius is passed.
          */}
          <Logo cornerRadius={15} showWordmark={false} size={64} />

          <Text style={[styles.title, { color: theme.text }]}>
            Novelist <Text style={{ color: theme.accent.text }}>World</Text>
          </Text>

          <Text style={[styles.lede, { color: theme.textGray }]}>
            A shared desk for writers — your characters, your worlds, and a
            co-author writing the next scene.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/register")}
            style={({ pressed }) => [
              styles.primary,
              {
                backgroundColor: pressed
                  ? theme.accent.fillPressed
                  : theme.accent.fill,
              },
            ]}
          >
            {/* Step 9 of a Radix scale is built to carry white text at any accent. */}
            <Text style={styles.primaryLabel}>Create account</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.secondary,
              {
                backgroundColor: pressed
                  ? theme.material.fillPressed
                  : "transparent",
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Text style={[styles.secondaryLabel, { color: theme.text }]}>
              Sign in
            </Text>
          </Pressable>

          <Text style={[styles.terms, { color: theme.textGray }]}>
            By continuing you agree to our{" "}
            <Text
              onPress={() => void Linking.openURL(TERMS_URL)}
              style={{ color: theme.accent.text }}
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
              onPress={() => void Linking.openURL(PRIVACY_URL)}
              style={{ color: theme.accent.text }}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space.ms },
  brand: { alignItems: "center", gap: space.md },
  lede: {
    fontSize: fontSize.body,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: "center",
  },
  page: { flex: 1, paddingHorizontal: space.lg },
  primary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: radius.lg - 2,
    justifyContent: "center",
    minHeight: 50,
  },
  primaryLabel: { color: "#fff", fontSize: fontSize.body, fontWeight: "600" },
  root: { flex: 1 },
  /*
   * Outlined rather than plain text. A bare label under a filled button reads
   * as a footnote, and "I already have an account" is not a footnote — it is
   * the other half of the choice, and it has to look like a control.
   */
  secondary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: radius.lg - 2,
    borderWidth: border.edge,
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryLabel: { fontSize: fontSize.body, fontWeight: "600" },
  spacer: { flex: 1 },
  terms: { fontSize: fontSize.meta, lineHeight: 15, paddingTop: space.xs, textAlign: "center" },
  title: { fontSize: fontSize.display, fontWeight: "700", lineHeight: 34 },
});
