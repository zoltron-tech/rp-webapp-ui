import { useSession } from "@nw/features";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { ambientScreenLayout } from "@/components/ambient-background";
import { setPalettePreview, usePalettePreview } from "@/lib/palette-preview";
import { AccentProvider, useAppTheme } from "@/theme";

/**
 * Onboarding — web's `/rp/onboarding` and the three prompts that follow it,
 * as a stack of short screens in the register flow's shell.
 *
 * ## The order
 *
 * 1. **Your profile** (three steps): name and photo, about, theme colour. The
 *    author profile, not a character — web's callout says so and so does
 *    the first screen. The last step marks the profile finished.
 * 2. **Welcome** — web's welcome page: the greeting, and its offer of a
 *    first character. Creating one opens the new-character screen, which
 *    returns to step 3 once the character exists; skipping goes to step 3
 *    directly.
 * 3. **Join the Discord**, or skip. Web shows it as a dialog over the home
 *    page right after onboarding; a screen in the flow is the same offer
 *    without a modal over the first thing the person sees.
 * 4. **Find novelists**, or skip — web's "Fellows" page.
 *
 * ## Who may be here
 *
 * The profile steps run while the session is `onboarding`; the rest run
 * `signed-in`, after `finish` has flipped the profile. Signed out there is
 * nothing to set up, so the stack sends them to sign in. There is no guard
 * the other way: a finished account that deep-links here just sees the
 * screens, and every one of them leads to the app.
 *
 * ## The colour being tried on
 *
 * The whole stack paints in the palette the colour step is previewing
 * (`lib/palette-preview`), the way the profile settings stack does: a swatch
 * tapped on "Pick your colour" recolours the screen on the next frame —
 * the gradient, the step dots, the Finish button — so the choice is seen
 * before it is saved. The store only repaints a stack that wraps itself in
 * `AccentProvider`; without this wrapper a tap moved the tick and nothing
 * else. Leaving the flow ends the preview, whatever state it was in.
 */
export default function OnboardingLayout() {
  const { status } = useSession();
  const preview = usePalettePreview();

  useEffect(() => () => setPalettePreview(null), []);

  if (status === "signed-out") return <Redirect href="/login" />;

  return (
    <AccentProvider palette={preview}>
      <OnboardingStack />
    </AccentProvider>
  );
}

/** Inside the provider, so the stack's own chrome reads the previewed accent. */
const OnboardingStack = () => {
  const theme = useAppTheme();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        // Each screen draws its own chevron and step dots in the content.
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />
      <Stack.Screen name="accent" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="discord" />
      <Stack.Screen name="novelists" />
    </Stack>
  );
};
