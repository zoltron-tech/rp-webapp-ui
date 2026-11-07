import { resetPassword } from "@nw/api/endpoints/account";
import { API_MESSAGE } from "@nw/types";
import { verifyPasswordPattern, verifyPasswordsMatch } from "@nw/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
} from "@/components/auth/screen";
import { PasswordChecks } from "@/components/password-checks";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { AUTH_COPY, isNetworkError } from "@/lib/auth-errors";
import { space } from "@/theme";

/**
 * Choosing a new password, from the emailed link — web's `/rp/reset-password`.
 *
 * The token is the link's, and the server is what judges it: a stale one
 * answers unauthorized, and the screen sends the person back for a new link.
 * The cap of 30 matches web's, so a password set here works there.
 */

const MAX_PASSWORD = 30;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [expired, setExpired] = useState(!token);

  const toLogin = () => router.replace("/login");
  const valid =
    verifyPasswordPattern(password) &&
    verifyPasswordsMatch(password, confirmPassword);

  const submit = async () => {
    if (!valid || busy || !token) return;
    setBusy(true);
    setError(null);
    try {
      const result = await resetPassword(api, token, password);
      if (result.message === API_MESSAGE.Success) setDone(true);
      else if (result.message === API_MESSAGE.Unauthorized) setExpired(true);
      else setError(AUTH_COPY.server);
    } catch (cause) {
      setError(isNetworkError(cause) ? AUTH_COPY.offline : AUTH_COPY.server);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthScreen
        onBack={toLogin}
        subtitle="Sign in with your new password."
        title="Password changed"
      >
        <SubmitButton label="Back to sign in" onPress={toLogin} />
      </AuthScreen>
    );
  }

  if (expired) {
    return (
      <AuthScreen
        onBack={toLogin}
        subtitle="This link has expired or was already used. Request a new one."
        title="Link not valid"
      >
        <SubmitButton
          label="Request a new link"
          onPress={() => router.replace("/forgot-password")}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      onBack={toLogin}
      subtitle="Eight characters or more, with a capital, a number and a symbol."
      title="Choose a new password"
    >
      <View style={styles.form}>
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          autoFocus
          counterMax={MAX_PASSWORD}
          label="New password"
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
          onSubmitEditing={() => void submit()}
          returnKeyType="done"
          secureTextEntry
          value={confirmPassword}
        />
        <PasswordChecks confirmPassword={confirmPassword} password={password} />
        {error ? <ErrorBox message={error} /> : null}
        <SubmitButton
          busy={busy}
          disabled={!valid}
          label="Change password"
          onPress={() => void submit()}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.m },
});
