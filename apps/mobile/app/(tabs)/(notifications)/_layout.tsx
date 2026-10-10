import { Stack, useRouter } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { MenuButton } from "@/components/menu-button";

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
          headerTitle: () => <TabHeaderTitle title="Notifications" />,
          title: "Notifications",
        }}
      />
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
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
