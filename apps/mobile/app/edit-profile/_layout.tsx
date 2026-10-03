import { useSession } from "@nw/features";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { setPalettePreview, usePalettePreview } from "@/lib/palette-preview";
import { AccentProvider, useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * Web's `/rp/profile/edit`, as a stack: the landing page and the sections it
 * opens, each its own screen so the back button walks out the way you came.
 *
 * Outside the tabs on purpose — these are settings, not a place you browse,
 * and the bar floating over a form's last field is the one thing a settings
 * screen must not do. The session gate is here for the reason the tabs keep
 * theirs: no screen below has to reason about having no novelist.
 *
 * The whole stack — header included — paints in the theme colour being tried
 * on (`lib/palette-preview`), so a swatch answers on the next frame while the
 * rest of the app catches up.
 */
export default function EditProfileLayout() {
  const { status } = useSession();
  const preview = usePalettePreview();

  // Leaving settings ends the preview, whatever state it was in.
  useEffect(() => () => setPalettePreview(null), []);

  if (status === "loading") return null;
  if (status !== "signed-in") return <Redirect href="/novelists" />;

  return (
    <AccentProvider palette={preview}>
      <EditProfileStack />
    </AccentProvider>
  );
}

/** Inside the provider, so the header reads the previewed theme too. */
const EditProfileStack = () => {
  const theme = useAppTheme();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        ...glassHeaderOptions(theme),
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Edit profile" }} />
      <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
      <Stack.Screen name="account" options={{ title: "Account" }} />
      <Stack.Screen name="devices" options={{ title: "Devices" }} />
    </Stack>
  );
};
