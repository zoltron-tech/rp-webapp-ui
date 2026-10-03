import { queryKeys } from "@nw/features";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Socials } from "@/components/auth/socials";
import { TextField } from "@/components/text-field";
import { signInWithPassword } from "@/lib/auth";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Sign in. Only sign in.
 *
 * This screen used to be both halves of authentication behind a segmented
 * control, and the register half is why it could not fit: four fields, the live
 * password rules, a consent row, two provider buttons and the terms do not go
 * on an iPhone SE and cannot be made to without deleting something. The old
 * file said so in a comment and kept a `ScrollView` to cope.
 *
 * Splitting them is what fixes it rather than coping with it. Registration is
 * three short steps of its own (`app/register/`), and what is left here is two
 * fields — which fits the baseline with most of a screen to spare.
 *
 * The segmented control went with it. It existed to switch between the two
 * forms; two routes and a link at the foot do the same job, and they do it in a
 * way the back gesture understands.
 *
 * ## What did not change
 *
 * The validation. `signInWithPassword` and the "does it contain an @" rule that
 * decides between the email and username fields are the same as web's, and the
 * shared `@nw/utils` predicates are still the only definition of what this app
 * accepts.
 */

const FORGOT_PASSWORD_URL = "https://novelist.world/rp/forgot-password";

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = useAuthBack("/novelists");

  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !busy;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      // The web form decides between the two fields by looking for an "@";
      // doing the same here keeps one behaviour across both clients.
      const value = identifier.trim();
      await signInWithPassword(
        value.includes("@")
          ? { email: value, password }
          : { password, username: value },
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      router.replace("/(tabs)");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Invalid username or password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      footer={
        <Pressable
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => router.replace("/register")}
          style={styles.switch}
        >
          <Text style={[styles.switchLabel, { color: theme.textGray }]}>
            New here?{" "}
            <Text style={{ color: theme.accent.text, fontWeight: "700" }}>
              Create an account
            </Text>
          </Text>
        </Pressable>
      }
      onBack={back}
      subtitle="Sign in to pick up where you left off."
      title="Welcome back"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />

        <TextField
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          label="Username or email"
          onChangeText={setIdentifier}
          placeholder="you@example.com"
          returnKeyType="next"
          value={identifier}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="current-password"
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => canSubmit && void submit()}
          placeholder="If you remember it..."
          returnKeyType="go"
          secureTextEntry
          value={password}
        />

        <SubmitButton
          busy={busy}
          disabled={!canSubmit}
          label="Sign in"
          loadingLabel="Retrieving account..."
          onPress={() => void submit()}
        />

        <Pressable
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => void Linking.openURL(FORGOT_PASSWORD_URL)}
          style={styles.forgot}
        >
          <Text style={[styles.forgotLabel, { color: theme.accent.text }]}>
            Forgot password?
          </Text>
        </Pressable>

        <Socials />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgot: { alignItems: "center", paddingVertical: space.xs },
  forgotLabel: { fontSize: fontSize.label, fontWeight: "600" },
  form: { gap: space.sm + 4 },
  switch: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  switchLabel: { fontSize: fontSize.label },
});
