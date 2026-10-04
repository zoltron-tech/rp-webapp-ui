import { Ionicons } from "@expo/vector-icons";
import { queryKeys } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { ErrorBox } from "@/components/auth/screen";
import { startOAuth } from "@/lib/oauth";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Google and Discord, with a rule and the word "or" above them.
 *
 * Lifted out of the old combined login screen so sign-in and registration can
 * both offer it without either owning it. Both marks are brand requirements
 * rather than decoration: Google's identity guidelines require the G alongside
 * "Sign in with Google" on a white button, and Discord's require the mark on
 * blurple.
 *
 * A provider sign-in lands straight in the app whether the account existed or
 * not — there is no separate "register with Google" — which is why the same
 * component reads correctly under either heading.
 */
export const Socials = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const start = async (provider: "google" | "discord") => {
    setError(null);
    try {
      await startOAuth(provider);
      await queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      router.replace("/(tabs)");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.separatorRow}>
        <View
          style={[styles.rule, { backgroundColor: theme.material.edge }]}
        />
        <Text style={[styles.separatorLabel, { color: theme.textGray }]}>
          or
        </Text>
        <View
          style={[styles.rule, { backgroundColor: theme.material.edge }]}
        />
      </View>

      <ErrorBox message={error} />

      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        onPress={() => start("google")}
        style={({ pressed }) => [
          styles.social,
          styles.google,
          pressed && styles.socialPressed,
        ]}
      >
        <Ionicons color="#3c4043" name="logo-google" size={18} />
        <Text style={[styles.socialLabel, { color: "#3c4043" }]}>
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
        <Ionicons color="#fff" name="logo-discord" size={18} />
        <Text style={[styles.socialLabel, { color: "#fff" }]}>
          Continue with Discord
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  discord: { backgroundColor: "#5865f2" },
  google: { backgroundColor: "#fff" },
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
