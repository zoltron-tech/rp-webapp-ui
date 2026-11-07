import { Ionicons } from "@expo/vector-icons";
import { useSession, useUnreadConversations } from "@nw/features";
import { Redirect, Tabs, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { StartupFallback } from "@/components/startup-fallback";
import { TabBar } from "@/components/tab-bar";
import { TabBarChromeProvider } from "@/context/tab-bar";
import { useUnreadReplyCount } from "@/hooks/use-unread-reply-count";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { readAccessToken } from "@/lib/session-store";
import { useWelcomeBack } from "@/lib/welcome-back";
import { radius, useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { tabBarStyle } from "@/theme/tab-bar";
import { HeaderActions } from "@/components/header-actions";

/**
 * The signed-in shell.
 *
 * Five tabs in the bar, and Notifications as a sixth route with no column —
 * the bell in every header opens it. The web app's left nav has fourteen
 * destinations; adding tabs before the screens behind them exist would be a
 * tab bar of dead ends, so routes arrive here as their phases land
 * (MONOREPO_MIGRATION_PLAN Phases 3–9).
 *
 * Six columns is close to the ceiling. The bar divides the window evenly between its
 * columns (`tabWidth`), so at the 375pt baseline a column is 57pt against a
 * 56pt lozenge — a seventh tab would have the highlight wider than the tab it
 * highlights, and the bar would need a different shape rather than one more
 * icon.
 *
 * The gate is here rather than in each screen: one redirect, and no screen has
 * to reason about being rendered without a session.
 *
 * While the session is still being asked for, a stored token opens the tabs
 * rather than holding them blank: the reader signed in last time is almost
 * always still signed in, and each screen has its own skeleton for the wait.
 * Only a definite "signed out" (or "onboarding") redirects. See `app/index.tsx`.
 *
 * Icons come from `@expo/vector-icons`, which Expo already ships — the web icon
 * set is 3,352 lines of inline SVG that would need `react-native-svg` and a
 * hand port each. Ionicons carries the same outline/filled pair convention the
 * web nav uses for inactive/active, so the behaviour matches even though the
 * artwork does not yet.
 *
 * The bar itself is `TabBar`, not the library's: a floating pill with a
 * highlight that slides between tabs. The outline/filled pair each tab declares
 * below is still what gets drawn — the bar crossfades between the two rather
 * than choosing one — so adding a tab here needs nothing from the bar.
 *
 * `TabBarChromeProvider` wraps the navigator rather than sitting inside it,
 * because the bar and the screens are siblings: `BottomTabView` renders the bar
 * next to the scene container, not within it, so this is the lowest node that
 * is an ancestor of both. The bar reads its size from that context and every
 * screen reads the padding it has to leave — see `context/tab-bar.tsx`.
 */
export default function TabsLayout() {
  const theme = useAppTheme();
  const router = useRouter();
  const { novelist, status } = useSession();
  useWelcomeBack(novelist);
  const { unreadCount } = useUnreadConversations();
  const unreadReplies = useUnreadReplyCount();
  // Push registration, tap routing and the icon's number.
  usePushNotifications();

  // Never nothing: a session that does not resolve gets a way out. See
  // `StartupFallback`.
  if (status === "loading" && !readAccessToken()) return <StartupFallback />;
  if (status === "onboarding") return <Redirect href="/onboarding" />;
  if (status !== "signed-in" && status !== "loading") {
    return <Redirect href="/welcome" />;
  }

  return (
    <TabBarChromeProvider>
      <Tabs
        // Back walks the tabs you visited rather than jumping to Home. The
        // bell opens Notifications as a tab with no column of its own, and
        // its back button has to return to whichever tab the bell was in.
        backBehavior="history"
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerRight: () => <HeaderActions />,
          ...glassHeaderOptions(theme),
          sceneStyle: { backgroundColor: theme.background },
          // Colours and the badge are the bar's own now; this is the library's
          // slot, kept so the bar honours `display: "none"` from anyone who
          // sets it the standard way. (`useHideTabBar` goes through the chrome
          // context instead — see there for why.)
          tabBarStyle: tabBarStyle(theme),
        }}
      >
        {/* A stack, not a screen: profiles opened from the list live inside this
            tab so the bar stays put and Home stays lit. Its own header is the
            stack's, so the tab must not draw a second one. */}
        <Tabs.Screen
          name="(home)"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                color={color}
                name={focused ? "home" : "home-outline"}
                size={size}
              />
            ),
            title: "Home",
          }}
        />
        {/*
          Explore sits immediately right of Home, which is where the web nav
          puts it and what the pair means: Home is the novelists you already
          know, Explore is everything else. Putting the discovery feed the far
          side of your own conversations would make it the thing you scroll past
          rather than the thing you scroll to.

          It also un-dead-ends the Interactions screen: that list's empty state
          tells you to find a starter somebody else has posted, and until now
          there was nowhere on this client to do that.

          A stack, like Home's and Interactions': a thread opened from a comment
          lives inside this tab so the bar stays put and Explore stays lit. Its
          own header is the stack's, so the tab must not draw a second one.
        */}
        <Tabs.Screen
          name="(explore)"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                color={color}
                name={focused ? "compass" : "compass-outline"}
                size={size}
              />
            ),
            title: "Explore",
          }}
        />
        {/*
          The character directory, beside Explore: the two discovery tabs
          together — Explore for what people are writing, this for who they
          are writing as. A stack, like Explore's, so a character opened from
          the grid stays inside the tab.

          "Muses" under the icon: "Characters" is wider than a sixth of a
          375pt bar and truncated. The title stays the full name for screen
          readers.
        */}
        <Tabs.Screen
          name="(characters)"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                color={color}
                name={focused ? "people" : "people-outline"}
                size={size}
              />
            ),
            tabBarLabel: "Muses",
            title: "Character Directory",
          }}
        />
        {/*
          Interactions sits between Home and the Inbox deliberately. Both are
          conversations you are part of, and the pair reads left to right as
          public first, private second — the threads anyone can join, then the
          ones only you can. Putting it the other side of the Inbox would have
          split the two halves of "someone replied to you" with a bell.

          A stack, like Home's: a thread opened from a card lives inside this
          tab so the bar stays put and Interactions stays lit. Its own header is
          the stack's, so the tab must not draw a second one.
        */}
        <Tabs.Screen
          name="(interactions)"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                color={color}
                name={focused ? "git-branch" : "git-branch-outline"}
                size={size}
              />
            ),
            tabBarBadge: unreadReplies > 0 ? unreadReplies : undefined,
            // One word under the icon; the title stays for screen readers.
            tabBarLabel: "Threads",
            title: "Interactions",
          }}
        />
        <Tabs.Screen
          name="(inbox)"
          options={{
            headerShown: false,
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                color={color}
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
              />
            ),
            title: "Inbox",
          }}
        />
        {/*
          A stack, like Home's: every notification row now leads somewhere — a
          thread, a prompt, a character, a profile — and those have to open
          inside this tab, or the bar lights Home while the reader is reading
          something they opened from here. Its own header is the stack's, so
          the tab must not draw a second one.

          No column in the bar: it is reached from the bell in every header
          (`HeaderActions`), which carries the unseen count. `href: null` keeps
          the route in this navigator — push taps and rows still land here —
          and `TabBar` skips it, lighting no column while it is on screen.
        */}
        <Tabs.Screen
          name="(notifications)"
          options={{
            headerShown: false,
            href: null,
            // No bar while here, on the list or anything opened from it. The
            // bell opens this as a page over the tab you were in, with its own
            // back button; a bar with no column lit read as a second way out.
            // `TabBar` honours `display: "none"` and tells the screens, so
            // nothing pads for the missing bar.
            tabBarStyle: { ...tabBarStyle(theme), display: "none" },
            title: "Notifications",
          }}
        />
        {/*
          Your own face, not a generic person glyph.

          It is the one tab whose destination is about a specific someone, and the
          picture says whose account is signed in — which a shared phone, or two
          accounts, makes worth saying. Focus is a ring rather than a second
          artwork, since there is no filled variant of a photograph.
        */}
        <Tabs.Screen
          name="(profile)"
          options={{
            // The stack draws its own header, as the Home tab's does.
            headerShown: false,
            tabBarIcon: ({ focused, size }) => (
              <View
                style={[
                  styles.face,
                  {
                    borderColor: focused
                      ? theme.accent.textStrong
                      : "transparent",
                  },
                ]}
              >
                <Avatar
                  name={novelist?.firstName}
                  size={size - 4}
                  uri={novelist?.image}
                />
              </View>
            ),
            title: "Profile",
          }}
        />
      </Tabs>
    </TabBarChromeProvider>
  );
}

const styles = StyleSheet.create({
  face: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    padding: 1.5,
  },
});
