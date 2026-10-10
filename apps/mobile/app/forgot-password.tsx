import { Ionicons } from "@expo/vector-icons";
import { forgotPassword } from "@nw/api/endpoints/account";
import { API_MESSAGE } from "@nw/types";
import { verifyEmailPattern } from "@nw/utils";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { api } from "@/lib/api";
import { AUTH_COPY, isNetworkError } from "@/lib/auth-errors";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "Forgot password?" — web's `/rp/forgot-password`, as a screen of this app.
 *
 * It used to open the website in a browser, which is the one place in signing
 * in where the app handed the person to a different product. The request is a
 * single field and a single call (`POST /account/forgotPassword`), and the
 * reset link in the email opens the website anyway; the part that belongs in
 * the app is asking for it.
 *
 * ## What it says afterwards
 *
 * The same thing whether or not the address has an account. The server
 * answers success either way, on purpose: a "no account for that email" would
 * make this form an account-existence oracle (H5), and the old 404 was exactly
 * that. So the success state says "if an account exists" rather than "sent".
 *
 * It does not offer to send again. One tap is one email to somebody's inbox,
 * and a "send again" button on the done screen is a way to put twenty there
 * with twenty taps — at an address that may not be the tapper's. The way to a
 * second email is the long way: back to sign in, "Forgot password?" again,
 * the address typed again. Somebody who mistyped the address takes that road
 * too; the done screen says which address the link went to so they know.
 *
 * ## Validation
 *
 * The email is checked with the shared predicate before anything is sent, and
 * only once the field has been left — a complaint under the first typed
 * character is being told off for typing. The server's own refusals (a dead
 * connection, a 500) are said in the box above the field, with the support
 * address when there is one.
 */
export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const back = useAuthBack("/login");

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The address a link was requested for; set once the request succeeds. */
  const [sentTo, setSentTo] = useState<string | null>(null);

  const value = email.trim();
  const valid = verifyEmailPattern(value);
  const invalid = touched && value.length > 0 && !valid;
  const canSubmit = valid && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const result = await forgotPassword(api, value);
      if (result.message === API_MESSAGE.Success) {
        setSentTo(value);
      } else if (result.message === API_MESSAGE.NotFound) {
        // An older server still answering 404: say so, since it did.
        setError(`The email address ${value} does not match any account.`);
      } else {
        setError(AUTH_COPY.server);
      }
    } catch (cause) {
      setError(isNetworkError(cause) ? AUTH_COPY.offline : AUTH_COPY.server);
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <AuthScreen
        onBack={() => router.replace("/login")}
        subtitle="Follow the link in the email to choose a new password."
        title="Check your inbox"
      >
        <View style={styles.form}>
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.notice,
              {
                backgroundColor: theme.tones.positive.fill,
                borderColor: theme.tones.positive.ink,
              },
            ]}
          >
            <Ionicons
              color={theme.tones.positive.ink}
              name="mail-unread-outline"
              size={22}
            />
            <View style={styles.noticeText}>
              <Text style={[styles.noticeTitle, { color: theme.text }]}>
                Reset link on its way
              </Text>
              <Text style={[styles.noticeBody, { color: theme.textGray }]}>
                If an account exists for{" "}
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  {sentTo}
                </Text>
                , a reset link has been sent there. It can take a minute to
                arrive; check your spam folder if it does not.
              </Text>
            </View>
          </View>

          <SubmitButton
            label="Back to sign in"
            onPress={() => router.replace("/login")}
          />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      footer={
        <Pressable
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => router.replace("/login")}
          style={styles.switch}
        >
          <Text style={[styles.switchLabel, { color: theme.textGray }]}>
            Remembered it?{" "}
            <Text style={{ color: theme.accent.text, fontWeight: "700" }}>
              Back to sign in
            </Text>
          </Text>
        </Pressable>
      }
      onBack={back}
      subtitle="Enter the email you signed up with and we will send you a link to choose a new password."
      title="Reset your password"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />

        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          autoFocus
          hint={invalid ? "must be a valid email address" : undefined}
          invalid={invalid}
          keyboardType="email-address"
          label="Email"
          onBlur={() => setTouched(true)}
          onChangeText={(next) => {
            setEmail(next);
            if (error) setError(null);
          }}
          onSubmitEditing={() => void submit()}
          placeholder="you@example.com"
          returnKeyType="send"
          value={email}
        />

        <SubmitButton
          busy={busy}
          disabled={!canSubmit}
          label="Send reset email"
          loadingLabel="Sending..."
          onPress={() => void submit()}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md },
  notice: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.m,
    padding: space.m,
  },
  noticeBody: { fontSize: fontSize.label, lineHeight: 19 },
  noticeText: { flex: 1, gap: space.xs },
  noticeTitle: { fontSize: fontSize.body, fontWeight: "700" },
  switch: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  switchLabel: { fontSize: fontSize.label },
});
