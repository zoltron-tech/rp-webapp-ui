import { Stack } from "expo-router";
import { ambientScreenLayout } from "@/components/ambient-background";
import { HeaderActions } from "@/components/header-actions";
import { TabHeaderTitle } from "@/components/header-title";
import { tabStackBack } from "@/components/stack-back-button";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";

/**
 * The Characters tab's own stack: the character directory, and everything a
 * card in it leads to.
 *
 * As with Explore's: a character opened from the grid — and its novelist,
 * their posts, a thread — is pushed *inside* the tab, so the bar stays on
 * screen with Characters lit and back returns to the grid where it was. The
 * route files are the shared screens (`/muse/:id`, `/novelist/:username`…),
 * one per group, so whichever tab is on screen answers.
 *
 * The header is this stack's, which is why the bell and burger are repeated
 * here; leaving them to the tab navigator would draw a second header.
 */
export default function CharactersStackLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={(screen) => ({
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => <HeaderActions />,
        ...glassHeaderOptions(theme),
        // A page that arrived first in this stack still needs a way back on iOS.
        ...tabStackBack(screen),
      })}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <TabHeaderTitle title="Characters" />,
          title: "Character Directory",
        }}
      />
      <Stack.Screen name="muse/[museId]" />
      <Stack.Screen name="novelist/[username]/index" />
      <Stack.Screen name="novelist/[username]/friends" />
      <Stack.Screen name="novelist/[username]/muses" />
      <Stack.Screen name="novelist/[username]/books" />
      <Stack.Screen name="novelist/[username]/stories" />
      <Stack.Screen name="novelist/[username]/activity" />
      <Stack.Screen name="novelist/[username]/prompts" />
      <Stack.Screen name="novelist/[username]/posts" />
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
    </Stack>
  );
}
