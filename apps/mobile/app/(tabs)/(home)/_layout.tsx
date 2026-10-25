import { Stack, useRouter } from "expo-router";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { MenuButton } from "@/components/menu-button";
import { tabStackBack } from "@/components/stack-back-button";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";

/**
 * The Home tab's own stack.
 *
 * A profile pushed from the feed has to stay *inside* the tab, not on
 * top of it — otherwise the tab bar disappears the moment someone opens a
 * profile and the only way back to notifications is the system back button.
 * Nesting the stack under the tab is what keeps the bar on screen and Home lit
 * while the person is three screens deep.
 *
 * The header is this stack's rather than the tab navigator's, so the burger is
 * repeated here. Leaving it to the tab would put a second header above the
 * stack's own on every pushed screen.
 */
/**
 * Every tab's `index` is the URL `/` once the groups are stripped, so opening
 * the app is a tie between six routes — and expo-router breaks it in favour of
 * any route a layout names as its `initialRouteName`. The Profile stack names
 * one (for its anchor), which on its own made the app open on Profile and left
 * Home unmounted until its first tap. Naming Home's here puts the two level,
 * and the tie falls back to route order, where Home is first.
 */
export const unstable_settings = { initialRouteName: "index" };

export default function HomeStackLayout() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={(screen) => ({
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => <MenuButton />,
        ...glassHeaderOptions(theme),
        // A page that arrived first in this stack (a link from another tab,
        // from a chat, from a story) still needs a way back on iOS.
        ...tabStackBack(screen),
      })}
    >
      {/*
        The brand lockup in place of the word "Home", as web's top bar shows
        it. `title` stays "Home": it is what the back button and a screen
        reader call this screen from the ones pushed over it.
      */}
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <TabHeaderTitle />,
          title: "Home",
        }}
      />
      <Stack.Screen name="directory" options={{ title: "Novelists" }} />
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
      <Stack.Screen name="novelist/[username]/index" />
      <Stack.Screen name="novelist/[username]/friends" />
      <Stack.Screen name="novelist/[username]/muses" />
      <Stack.Screen name="novelist/[username]/books" />
      <Stack.Screen name="novelist/[username]/stories" />
      <Stack.Screen name="novelist/[username]/activity" />
      <Stack.Screen name="novelist/[username]/prompts" />
      <Stack.Screen name="novelist/[username]/posts" />
      {/* A character, from a profile or a character list. The screen sets its
          own title and hides the tab bar for the section menu. */}
      <Stack.Screen name="muse/[museId]" />
    </Stack>
  );
}
