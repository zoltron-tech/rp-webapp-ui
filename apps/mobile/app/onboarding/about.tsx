import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { useOnboarding } from "@/hooks/use-onboarding";
import { describeAuthError } from "@/lib/auth-errors";
import { space } from "@/theme";

/**
 * Onboarding, step two of three: a few words about you.
 *
 * Web's "About" tab: one textarea, optional. Plain text here rather than the
 * rich editor the profile's About page has — a first bio is a sentence or
 * two, and a toolbar over an empty field on the second screen of setup is
 * more interface than content. The full editor is one tap away afterwards.
 *
 * Skipping sends nothing; the profile keeps whatever it had (nothing).
 */

/** Web's `about` cap. */
const MAX_ABOUT = 1000;

export default function OnboardingAboutScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const back = useAuthBack("/onboarding");

  const [about, setAbout] = useState(onboarding.novelist?.about ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = about.trim();
  const unchanged = value === (onboarding.novelist?.about ?? "").trim();

  const next = async () => {
    if (busy) return;
    if (unchanged) {
      router.push("/onboarding/accent");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onboarding.saveProfile({ about: value });
      router.push("/onboarding/accent");
    } catch (cause) {
      setError(describeAuthError(cause, "Your bio could not be saved. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      onBack={back}
      step={[2, 3]}
      subtitle="What you write, what you're into, what you're looking for. You can change it any time."
      title="About you"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />

        <TextField
          autoFocus
          counterMax={MAX_ABOUT}
          label="About (optional)"
          maxLength={MAX_ABOUT}
          multiline
          numberOfLines={5}
          onChangeText={(next) => {
            setAbout(next);
            if (error) setError(null);
          }}
          placeholder="Tell us a bit about yourself..."
          style={styles.about}
          textAlignVertical="top"
          value={about}
        />

        <SubmitButton
          busy={busy}
          label="Continue"
          loadingLabel="Saving..."
          onPress={() => void next()}
        />
        <Button
          disabled={busy}
          label="Skip for now"
          onPress={() => router.push("/onboarding/accent")}
          size="lg"
          variant="quiet"
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  about: { minHeight: 120 },
  form: { gap: space.m },
});
