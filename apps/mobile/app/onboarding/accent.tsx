import { Ionicons } from "@expo/vector-icons";
import { ACCENT_MAP, type Accent, BASIC_ACCENTS } from "@nw/types/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Text } from "@/components/text";
import { useOnboarding } from "@/hooks/use-onboarding";
import { describeAuthError } from "@/lib/auth-errors";
import { setPalettePreview } from "@/lib/palette-preview";
import {
  accentFromPalette,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * Onboarding, step three of three: the colour, and the finish.
 *
 * Web's "Accent" tab. A tap previews the colour across this stack at once
 * (`setPalettePreview`, the same mechanism the Appearance settings use), so
 * the choice is seen rather than described; the save waits for Finish.
 *
 * Finish does two things in order: writes the palette to the account, then
 * marks the profile finished — which is what lets the tabs open. The session
 * is reset by that call and comes back signed in, and the flow carries on to
 * the welcome.
 *
 * The preview is cleared on the way out either way: a colour that was only
 * tried must not outlive the screen it was tried on.
 */

/** Only the basic four here; the rest are offered later, in Appearance. */
const PALETTES = BASIC_ACCENTS.map((key) => ({ key, name: ACCENT_MAP[key] }));

export default function OnboardingAccentScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const onboarding = useOnboarding();
  const back = useAuthBack("/onboarding/about");

  const [palette, setPalette] = useState<Accent>(
    (onboarding.user?.palette ?? 0) as Accent,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => setPalettePreview(null), []);

  const pick = (next: Accent) => {
    setPalette(next);
    setPalettePreview(next);
    if (error) setError(null);
  };

  const finish = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onboarding.savePalette(palette);
      await onboarding.finish();
      setPalettePreview(null);
      router.replace("/onboarding/welcome");
    } catch (cause) {
      setError(
        describeAuthError(cause, "Your profile could not be finished. Try again."),
      );
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      onBack={back}
      step={[3, 3]}
      subtitle="Colours the app for you, and your profile for everyone who visits it."
      title="Pick your colour"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />

        <View style={styles.palettes}>
          {PALETTES.map(({ key, name }) => {
            const accent = accentFromPalette(key);
            const selected = palette === key;
            return (
              <Pressable
                accessibilityLabel={`${name} theme`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={key}
                onPress={() => pick(key)}
                style={styles.palette}
              >
                <View
                  style={[
                    styles.swatchRing,
                    { borderColor: selected ? accent.solid : "transparent" },
                  ]}
                >
                  <View
                    style={[styles.swatch, { backgroundColor: accent.solid }]}
                  >
                    {selected ? (
                      <Ionicons color="#ffffff" name="checkmark" size={20} />
                    ) : null}
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.paletteName,
                    {
                      color: selected ? theme.text : theme.textGray,
                      fontWeight: selected ? "700" : "500",
                    },
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SubmitButton
          busy={busy}
          label="Finish"
          loadingLabel="Finishing..."
          onPress={() => void finish()}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md },
  palette: { alignItems: "center", gap: space.xs, width: "25%" },
  paletteName: { fontSize: fontSize.meta, textTransform: "capitalize" },
  palettes: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: space.sm,
    rowGap: space.md,
  },
  swatch: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  swatchRing: {
    borderRadius: radius.full,
    borderWidth: 2.5,
    padding: 3,
  },
});
