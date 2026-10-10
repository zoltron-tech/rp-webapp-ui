import { Stack, useRouter } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { MenuButton } from "@/components/menu-button";

/**
 * The Interactions tab's own stack.
 *
 * The same argument as the Home tab's, for the same reason: a thread opened
 * from a card has to be pushed *inside* the tab, or the tab bar disappears the
 * moment somebody reads one and the only way back to the inbox is the system
 * back button. Nesting the stack under the tab keeps the bar on screen and
 * Interactions lit while the reader is a screen deep.
 *
 * This is why `interactions.tsx` became `(interactions)/index.tsx`. The group
 * parentheses keep it out of the URL, so the thread route is `/threads/:id` —
 * not `/interactions/threads/:id` — and the tab itself is still `/(tabs)`.
 *
 * The header is this stack's rather than the tab navigator's, which is why the
 * burger is repeated here. Leaving it to the tab would draw a second header
 * above the stack's own on every pushed screen.
 */
export default function InteractionsStackLayout() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => (
          <MenuButton />
        ),
        ...glassHeaderOptions(theme),
      }}
    >
      {/*
        The brand tile, then the page's name set as the lockup sets
        "NOVELIST" — Home's header with the word changed. `title` stays: it is
        what a screen reader calls this screen from the ones pushed over it.
      */}
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <TabHeaderTitle title="Interactions" />,
          title: "Interactions",
        }}
      />
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
      {/*
        Shared with Home: whoever signed a card on this tab opens here rather
        than in another tab's stack, so the back button stays honest.
      */}
      <Stack.Screen name="novelist/[username]/index" />
      <Stack.Screen name="novelist/[username]/friends" />
      <Stack.Screen name="novelist/[username]/muses" />
      <Stack.Screen name="novelist/[username]/stories" />
      <Stack.Screen name="novelist/[username]/activity" />
      <Stack.Screen name="novelist/[username]/prompts" />
      <Stack.Screen name="novelist/[username]/posts" />
      <Stack.Screen name="muse/[museId]" />
    </Stack>
  );
}
