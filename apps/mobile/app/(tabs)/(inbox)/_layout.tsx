import { Stack, useRouter } from "expo-router";
import { Platform } from "react-native";
import { ConversationOverlayHost } from "@/context/conversation-overlay";
import { InboxRevealProvider } from "@/context/inbox-reveal";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";
import { TabHeaderTitle } from "@/components/header-title";
import { MenuButton } from "@/components/menu-button";
import { StackBackButton, tabStackBack } from "@/components/stack-back-button";

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
      screenOptions={(screen) => ({
        contentStyle: { backgroundColor: theme.background },
        headerRight: () => (
          <MenuButton />
        ),
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
          headerTitle: () => <TabHeaderTitle title="Inbox" />,
          title: "Inbox",
        }}
      />
      {/*
        The conversation's screen is an empty, transparent placeholder: the
        page is drawn by `ConversationOverlayHost` below, over this stack, so
        the list stays visible under the slide and the stack never has a
        page to ghost on removal. See `context/conversation-overlay`.

        A plain card on iOS. UIKit presents a modal from the app's root view
        controller, over the whole window — over the overlay too — so the
        empty screen sat on top of the page and took every touch. A card stays
        inside this stack, under the overlay. The cost is that UIKit removes
        the list from under a card, so on iOS a drag back uncovers the
        backdrop until the route pops. The system's own swipe is off: the
        page has its own (`hooks/use-swipe-back`).
      */}
      <Stack.Screen
        name="[conversationId]/index"
        options={{
          animation: "none",
          contentStyle: { backgroundColor: "transparent" },
          gestureEnabled: false,
          headerShown: false,
          presentation: Platform.OS === "ios" ? "card" : "transparentModal",
          // Never shown here (no header), but iOS labels the next screen's
          // back button with it — and with the route's name if there is none.
          title: "Chat",
        }}
      />
      {/*
        Its own back button on iOS. The system's stopped answering taps the
        second time this screen was opened from a conversation (iOS 26.6),
        while the swipe went on working; a button drawn here is a `Pressable`
        that pops the route, and does not depend on the navigation bar's.
      */}
      <Stack.Screen
        name="[conversationId]/details"
        options={{
          headerLeft:
            Platform.OS === "ios" ? () => <StackBackButton /> : undefined,
          title: "Details",
        }}
      />
      {/*
        Where a link card in a conversation goes — a character, a novelist, a
        prompt, a thread — kept inside this tab like the other tabs keep
        theirs. Pushed anywhere else it landed alone in another tab's stack,
        with nothing under it and so no back button. Same drawn back button
        on iOS as Details, for the same reason.
      */}
      {[
        "muse/[museId]",
        "prompt/[promptId]",
        "threads/[threadId]",
        "novelist/[username]/index",
        "novelist/[username]/friends",
        "novelist/[username]/muses",
        "novelist/[username]/stories",
        "novelist/[username]/activity",
        "novelist/[username]/prompts",
        "novelist/[username]/posts",
      ].map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          options={{
            headerLeft:
              Platform.OS === "ios" ? () => <StackBackButton /> : undefined,
            ...(name === "prompt/[promptId]" ? { title: "Prompt" } : null),
            ...(name === "threads/[threadId]" ? { title: "Thread" } : null),
          }}
        />
      ))}
    </Stack>
    {/* The conversation page itself, over the stack — see the overlay. */}
    <ConversationOverlayHost />
    </InboxRevealProvider>
  );
}
