import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { ConversationOverlayHost } from "@/context/conversation-overlay";
import { InboxRevealProvider } from "@/context/inbox-reveal";
import { space, useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * The Inbox tab's stack.
 *
 * Same shape as the Home tab, and for the same reason: opening a conversation
 * has to stay inside the tab so the bar remains on screen and Inbox stays lit.
 */
export default function InboxStackLayout() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <InboxRevealProvider>
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
      <Stack.Screen name="index" options={{ title: "Inbox" }} />
      {/*
        The conversation's screen is an empty, transparent placeholder: the
        page is drawn by `ConversationOverlayHost` below, over this stack, so
        the list stays visible under the slide and the stack never has a
        page to ghost on removal. See `context/conversation-overlay`.
      */}
      <Stack.Screen
        name="[conversationId]/index"
        options={{
          animation: "none",
          contentStyle: { backgroundColor: "transparent" },
          headerShown: false,
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen name="[conversationId]/details" options={{ title: "Details" }} />
    </Stack>
    {/* The conversation page itself, over the stack — see the overlay. */}
    <ConversationOverlayHost />
    </InboxRevealProvider>
  );
}
