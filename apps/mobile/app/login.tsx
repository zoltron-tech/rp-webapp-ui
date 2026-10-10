import { verifyEmailPattern } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Socials } from "@/components/auth/socials";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { refreshSessionQueries, signInWithPassword } from "@/lib/auth";
import { describeAuthError } from "@/lib/auth-errors";
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
 * ## Validation, and what a refusal says
 *
 * `signInWithPassword` and the "does it contain an @" rule that decides
 * between the email and username fields are the same as web's, and the shared
 * `@nw/utils` predicates are still the only definition of what this app
 * accepts. Two things are checked before anything is sent: an identifier
 * with an `@` has to be a whole email address (one without is a username, and
 * the server is the judge of those), and the password has to be there. Both
 * are said under their field, and only once the field has been left — a
 * complaint under the first typed character is being told off for typing.
 *
 * What the server refuses is said in the box above the fields, in a sentence:
 * a wrong password, a rate limit, a dead connection. It used to show the
 * server's code — `bad_payload` for a wrong password — which is the bug this
 * version of the screen exists to fix. See `lib/auth-errors.ts` for the
 * sentences and `lib/auth.ts` for where each code becomes one. The box clears
 * as soon as either field changes: the refusal was for what was typed before.
 */

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = useAuthBack("/welcome");

  const value = identifier.trim();
  const looksLikeEmail = value.includes("@");
  const identifierProblem =
    touched.identifier && value.length === 0
      ? "enter your username or email"
      : touched.identifier && looksLikeEmail && !verifyEmailPattern(value)
        ? "must be a valid email address"
        : undefined;
  const passwordProblem =
    touched.password && password.length === 0 ? "enter your password" : undefined;

  const wellFormed =
    value.length > 0 &&
    (!looksLikeEmail || verifyEmailPattern(value)) &&
    password.length > 0;
  const canSubmit = wellFormed && !busy;

  const submit = async () => {
    // Enter on the password field while something is still wrong: say what,
    // rather than silently doing nothing.
    if (!wellFormed) {
      setTouched({ identifier: true, password: true });
      return;
    }
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // The web form decides between the two fields by looking for an "@";
      // doing the same here keeps one behaviour across both clients.
      await signInWithPassword(
        looksLikeEmail
          ? { email: value, password }
          : { password, username: value },
      );
      await refreshSessionQueries(queryClient);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(
        describeAuthError(cause, "Sign-in did not complete. Please try again."),
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
          hint={identifierProblem}
          invalid={Boolean(identifierProblem)}
          keyboardType="email-address"
          label="Username or email"
          onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
          onChangeText={(next) => {
            setIdentifier(next);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          returnKeyType="next"
          value={identifier}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="current-password"
          hint={passwordProblem}
          invalid={Boolean(passwordProblem)}
          label="Password"
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          onChangeText={(next) => {
            setPassword(next);
            if (error) setError(null);
          }}
          onSubmitEditing={() => void submit()}
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
          onPress={() => router.push("/forgot-password")}
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
  form: { gap: space.m },
  switch: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  switchLabel: { fontSize: fontSize.label },
});
