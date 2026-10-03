import { verifyPasswordPattern, verifyPasswordsMatch } from "@nw/utils";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthScreen,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { PasswordChecks } from "@/components/password-checks";
import { TextField } from "@/components/text-field";
import { useRegisterDraft } from "@/context/register-draft";
import { space } from "@/theme";

/**
 * Step two of three: the password.
 *
 * Two fields and the live rules, which is the whole reason this is a step of
 * its own — `PasswordChecks` is up to five lines of feedback, and five lines
 * appearing mid-form is what pushed the old combined screen past the bottom of
 * an iPhone SE while somebody was typing into it.
 *
 * ⚠ The cap is **30**, matching `MAX_PASSWORD_LENGTH` in web's
 * `components/common/password-field`, so a password accepted here is accepted
 * there. The counter is shown for the same reason web shows it: a field that
 * silently stops accepting characters looks broken.
 *
 * **Nothing is sent from this screen.** The password is held in memory by the
 * flow's layout and travels to step three, which makes the one signup call.
 */

/** What web's `PasswordField` caps at, so a password valid here is valid there. */
const MAX_PASSWORD = 30;

export default function RegisterPasswordScreen() {
  const router = useRouter();
  const { draft, update } = useRegisterDraft();

  const [password, setPassword] = useState(draft.password);
  const [confirmPassword, setConfirmPassword] = useState(draft.password);
  const back = useAuthBack("/register");

  // Reached without an email — a deep link, or a reload that dropped the draft.
  // Sending them to the start is the only thing this screen can honestly do.
  if (!draft.email) return <Redirect href="/register" />;

  const valid =
    verifyPasswordPattern(password) &&
    verifyPasswordsMatch(password, confirmPassword);

  const next = () => {
    if (!valid) return;
    update({ password });
    router.push("/register/username");
  };

  return (
    <AuthScreen
      onBack={back}
      step={[2, 3]}
      subtitle="Eight characters or more, with a capital, a number and a symbol."
      title="Pick a password"
    >
      <View style={styles.form}>
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          autoFocus
          counterMax={MAX_PASSWORD}
          label="Password"
          maxLength={MAX_PASSWORD}
          onChangeText={setPassword}
          returnKeyType="next"
          secureTextEntry
          value={password}
        />

        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="Confirm password"
          maxLength={MAX_PASSWORD}
          onChangeText={setConfirmPassword}
          onSubmitEditing={next}
          returnKeyType="next"
          secureTextEntry
          value={confirmPassword}
        />

        <PasswordChecks confirmPassword={confirmPassword} password={password} />

        <SubmitButton disabled={!valid} label="Continue" onPress={next} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.sm + 4 },
});
