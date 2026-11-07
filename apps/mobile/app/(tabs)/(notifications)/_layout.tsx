import { Stack, useRouter } from "expo-router";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { HeaderActions } from "@/components/header-actions";
import {
  StackBackButton,
  tabStackBack,
} from "@/components/stack-back-button";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";

/**
 * The Notifications tab's own stack.
 *
 * Notifications used to be the one tab that was a bare screen, which was fine
 * while its rows went nowhere. Now every row leads somewhere — a thread, a
 * prompt, a character, a profile (see `lib/notification-target`) — and a push
 * from a bare tab screen lands in *another tab's* stack: the bar would light
 * Home while the reader was reading something they opened from their
 * notifications, and back would return them there.
 *
 * So it is a stack like Home's and Interactions', carrying the same set of
 * destinations. The group parentheses keep it out of the URL, so the thread
 * route is still `/threads/:id` and a push resolves inside whichever tab is
 * on screen.
 *
 * The header is this stack's rather than the tab navigator's, which is why the
 * burger is repeated here. Leaving it to the tab would draw a second header
 * above the stack's own on every pushed screen.
 */
export default function NotificationsStackLayout() {
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
          // The list has no column in the tab bar — the header bell opens it
          // from another tab — so it carries its way back, on both platforms.
          // Back walks the tab history; opened cold from a push, it goes Home.
          headerLeft: () => <StackBackButton fallback="/(tabs)/(home)" />,
          // No bell on the page the bell opens. The screens pushed from here
          // keep it: from a thread it is the way back to this list.
          headerRight: () => <HeaderActions bell={false} />,
          headerTitle: () => (
            <TabHeaderTitle back bell={false} title="Notifications" />
          ),
          title: "Notifications",
        }}
      />
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
      <Stack.Screen name="muse/[museId]" />
    </Stack>
  );
}
