import { verifyAccount } from "@nw/api/endpoints/account";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthScreen, SubmitButton } from "@/components/auth/screen";
import { api } from "@/lib/api";
import { useAppTheme } from "@/theme";

/**
 * Confirming an email address, from the emailed link — web's `/rp/verify-email`.
 * Opening the link is the whole action, so there is nothing to press first.
 */

type State = "checking" | "failed" | "verified";

export default function VerifyEmailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [state, setState] = useState<State>(token ? "checking" : "failed");
  // A re-render must not spend a one-time token twice.
  const asked = useRef(false);

  useEffect(() => {
    if (!token || asked.current) return;
    asked.current = true;
    verifyAccount(api, token)
      .then((result) =>
        setState(result.message === "success" ? "verified" : "failed"),
      )
      .catch(() => setState("failed"));
  }, [token]);

  const leave = () => router.replace("/");

  if (state === "checking") {
    return (
      <AuthScreen onBack={leave} title="Verifying your account">
        <View style={styles.wait}>
          <ActivityIndicator color={theme.accent.solid} />
        </View>
      </AuthScreen>
    );
  }

  return state === "verified" ? (
    <AuthScreen
      onBack={leave}
      subtitle="Your account is activated. Happy writing!"
      title="Account verified"
    >
      <SubmitButton label="Continue" onPress={leave} />
    </AuthScreen>
  ) : (
    <AuthScreen
      onBack={leave}
      subtitle="The link may have expired. Log in and generate a new one."
      title="Verification failed"
    >
      <SubmitButton label="Continue" onPress={leave} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  wait: { alignItems: "center", padding: 32 },
});
