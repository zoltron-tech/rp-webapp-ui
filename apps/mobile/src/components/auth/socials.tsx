import { useQueryClient } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DiscordMark, GoogleG } from "@/components/auth/brand-marks";
import { ErrorBox } from "@/components/auth/screen";
import { Text } from "@/components/text";
import { refreshSessionQueries } from "@/lib/auth";
import { describeAuthError } from "@/lib/auth-errors";
import {
  appleSignInAvailable,
  startAppleSignIn,
  startOAuth,
} from "@/lib/oauth";
import { clearReferral } from "@/lib/referral";
import { GOOGLE_BUTTON_FONT } from "@/lib/ui-fonts";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Apple (iOS only), Google and Discord, with a rule and the word "or" above them.
 *
 * Lifted out of the old combined login screen so sign-in and registration can
 * both offer it without either owning it.
 *
 * Both buttons follow their provider's branding rather than ours
 * (APP_STORE_REVIEW_PLAN.md L7): Google's sign-in guidelines fix the
 * four-colour G, Roboto Medium for the label and two colour schemes — light
 * (white, #747775 stroke, #1F1F1F text) and dark (#131314, #8E918F stroke,
 * #E3E3E3 text) — picked here to follow the app's theme. Discord's require its
 * Clyde mark in white on Blurple. The marks are the official vectors
 * (`brand-marks.tsx`), not icon-font look-alikes.
 *
 * A provider sign-in lands straight in the app whether the account existed or
 * not — there is no separate "register with Google" — which is why the same
 * component reads correctly under either heading.
 */
export const Socials = () => {
  const theme = useAppTheme();
  const google = theme.name === "light" ? GOOGLE_LIGHT : GOOGLE_DARK;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    let live = true;
    appleSignInAvailable()
      .then((available) => live && setAppleAvailable(available))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const start = (provider: "google" | "discord") =>
    complete(() => startOAuth(provider));

  const complete = async (signIn: () => Promise<void>) => {
    setError(null);
    try {
      await signIn();
      void clearReferral();
      await refreshSessionQueries(queryClient);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(
        describeAuthError(
          cause,
          "Sign-in with that account did not complete. Please try again.",
        ),
      );
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.separatorRow}>
        <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
        <Text style={[styles.separatorLabel, { color: theme.textGray }]}>
          or
        </Text>
        <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
      </View>

      <ErrorBox message={error} />

      {/* Apple's own system button, first on iOS (Guideline 4.8 + HIG: at
          least as prominent as the others; black on light, white on dark). */}
      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonStyle={
            theme.name === "light"
              ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          }
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          cornerRadius={radius.lg - 2}
          onPress={() => complete(startAppleSignIn)}
          style={styles.apple}
        />
      )}

      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        onPress={() => start("google")}
        style={({ pressed }) => [
          styles.social,
          {
            backgroundColor: google.fill,
            borderColor: google.stroke,
            borderWidth: 1,
          },
          pressed && styles.socialPressed,
        ]}
      >
        <GoogleG size={20} />
        <Text style={[styles.googleLabel, { color: google.text }]}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Continue with Discord"
        accessibilityRole="button"
        onPress={() => start("discord")}
        style={({ pressed }) => [
          styles.social,
          styles.discord,
          pressed && styles.socialPressed,
        ]}
      >
        <DiscordMark size={22} />
        <Text style={[styles.socialLabel, { color: "#fff" }]}>
          Continue with Discord
        </Text>
      </Pressable>
    </View>
  );
};

/** Google's published sign-in button schemes. Not themeable: they are its brand. */
const GOOGLE_LIGHT = { fill: "#FFFFFF", stroke: "#747775", text: "#1F1F1F" };
const GOOGLE_DARK = { fill: "#131314", stroke: "#8E918F", text: "#E3E3E3" };

const styles = StyleSheet.create({
  // The native view needs explicit dimensions; height matches the others.
  apple: { height: 46, width: "100%" },
  discord: { backgroundColor: "#5865f2" },
  googleLabel: {
    fontFamily: GOOGLE_BUTTON_FONT,
    fontSize: 14,
    lineHeight: 20,
  },
  root: { gap: space.sm },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  separatorLabel: { fontSize: fontSize.caption },
  separatorRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  social: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: radius.lg - 2,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    minHeight: 46,
  },
  socialLabel: { fontSize: fontSize.body, fontWeight: "600" },
  socialPressed: { opacity: 0.85 },
});
