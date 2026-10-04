import { useSession } from "@nw/features";
import { Redirect, Stack } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * Web's `/rp/profile/muses/edit/[id]` and `/rp/profile/muses/create`, as a
 * stack: the landing page and the sections it opens, each its own screen, and
 * the first step of a new character.
 *
 * Outside the tabs, like the profile settings: a form's last field must not
 * sit under a floating bar. The session gate is here so no screen below has
 * to reason about having no novelist; whether the character is *yours* is each
 * screen's (`useOwnedMuse`), because only they have loaded it.
 */
export default function EditMuseLayout() {
  const theme = useAppTheme();
  const { status } = useSession();

  if (status === "loading") return null;
  if (status !== "signed-in") return <Redirect href="/novelists" />;

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        ...glassHeaderOptions(theme),
      }}
    >
      <Stack.Screen name="new" options={{ title: "New character" }} />
      <Stack.Screen name="[museId]/index" options={{ title: "Edit character" }} />
      <Stack.Screen name="[museId]/appearance" options={{ title: "Appearance" }} />
      <Stack.Screen name="[museId]/information" options={{ title: "Information" }} />
      <Stack.Screen name="[museId]/story" options={{ title: "Story" }} />
      <Stack.Screen name="[museId]/gallery" options={{ title: "Gallery" }} />
      <Stack.Screen name="[museId]/connections" options={{ title: "Connections" }} />
    </Stack>
  );
}
