import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { space, useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * The Explore tab's own stack.
 *
 * The same argument as Home's and Interactions': a thread opened from a comment
 * on a feed card has to be pushed *inside* the tab, or the tab bar disappears
 * the moment somebody follows a conversation and the only way back to the feed
 * is the system back button. Nesting the stack under the tab keeps the bar on
 * screen and Explore lit while the thread is read.
 *
 * The group parentheses keep this out of the URL, so the thread route is
 * `/threads/:id` — the same path the Interactions tab registers, which is what
 * Expo Router means by a shared route. Both route files point at
 * `src/screens/thread.tsx`; which tab you are in decides which one answers.
 *
 * The header is this stack's rather than the tab navigator's, which is why the
 * burger is repeated here. Leaving it to the tab would draw a second header
 * above the stack's own on every pushed screen.
 */
export default function ExploreStackLayout() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => (
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            hitSlop={{ bottom: space.md, left: space.sm, right: space.sm, top: space.md }}
            onPress={() => router.push("/menu")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              paddingHorizontal: space.md,
            })}
          >
            <Ionicons color={theme.text} name="menu" size={26} />
          </Pressable>
        ),
        ...glassHeaderOptions(theme),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Explore" }} />
      <Stack.Screen name="threads/[threadId]" options={{ title: "Thread" }} />
      <Stack.Screen name="prompt/[promptId]" options={{ title: "Prompt" }} />
      {/*
        Shared with Home: whoever signed a card on this tab opens here rather
        than in another tab's stack, so the back button stays honest.
      */}
      <Stack.Screen name="novelist/[username]/index" />
      <Stack.Screen name="novelist/[username]/friends" />
      <Stack.Screen name="novelist/[username]/muses" />
      <Stack.Screen name="novelist/[username]/activity" />
      <Stack.Screen name="novelist/[username]/prompts" />
      <Stack.Screen name="novelist/[username]/posts" />
      <Stack.Screen name="muse/[museId]" />
    </Stack>
  );
}
