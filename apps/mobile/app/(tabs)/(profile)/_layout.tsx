import { Stack, useRouter } from "expo-router";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { HeaderActions } from "@/components/header-actions";
import { tabStackBack } from "@/components/stack-back-button";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";

/**
 * The Profile tab's own stack.
 *
 * Your friends and your characters are *your* pages, so opening them has to
 * leave the Profile tab lit — pushing them into the Home stack (which is where
 * every other novelist's are) lit Home instead, and the bar then disagreed with
 * the screen. Same screens either way: the lists are components in
 * `src/screens`, mounted by a thin route in whichever stack the person is in.
 *
 * The header is this stack's rather than the tab navigator's, for the reason
 * the Home stack gives: leaving it to the tab puts a second header above the
 * stack's own on every pushed screen.
 */
/**
 * The profile page sits under anything opened into this stack from outside it
 * — the menu's Characters and Badges — so those screens get a back button to
 * your profile instead of being the bottom of an otherwise empty stack. Takes
 * effect with `router.push(..., { withAnchor: true })`.
 */
export const unstable_settings = { initialRouteName: "index" };

export default function ProfileStackLayout() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={(screen) => ({
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => <HeaderActions />,
        ...glassHeaderOptions(theme),
        // A page that arrived first in this stack (a link from another tab,
        // from a chat, from a story) still needs a way back on iOS.
        ...tabStackBack(screen),
      })}
    >
      {/*
        The brand tile, then the page's name set as the lockup sets
        "NOVELIST" — Home's header with the word changed. `title` stays: it is
        what a screen reader calls this screen from the ones pushed over it.
      */}
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <TabHeaderTitle title="Profile" />,
          title: "Profile",
        }}
      />
      <Stack.Screen name="friends" options={{ title: "Friends" }} />
      <Stack.Screen name="music" options={{ title: "Music" }} />
      <Stack.Screen name="muses" options={{ title: "Characters" }} />
      <Stack.Screen name="books" options={{ title: "Bookshelf" }} />
      <Stack.Screen name="stories" options={{ title: "Stories" }} />
      <Stack.Screen name="activity" options={{ title: "Activity" }} />
      <Stack.Screen name="prompts" options={{ title: "Prompts" }} />
      <Stack.Screen name="posts" options={{ title: "Posts" }} />
      <Stack.Screen name="badges" options={{ title: "Badges" }} />
      <Stack.Screen name="muse/[museId]" />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
      {/* A thread link in a post here opens here, not alone in another tab. */}
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      {/*
        Shared with Home: whoever signed a card on this tab opens here rather
        than in another tab's stack, so the back button stays honest.
      */}
      <Stack.Screen name="novelist/[username]/index" />
      <Stack.Screen name="novelist/[username]/friends" />
      <Stack.Screen name="novelist/[username]/muses" />
      <Stack.Screen name="novelist/[username]/books" />
      <Stack.Screen name="novelist/[username]/stories" />
      <Stack.Screen name="novelist/[username]/activity" />
      <Stack.Screen name="novelist/[username]/prompts" />
      <Stack.Screen name="novelist/[username]/posts" />
    </Stack>
  );
}
