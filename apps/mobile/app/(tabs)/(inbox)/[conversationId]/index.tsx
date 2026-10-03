import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { conversationOverlay } from "@/context/conversation-overlay";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";

/**
 * The conversation route.
 *
 * Nothing is drawn here. The page is drawn by the Inbox layout over its stack
 * (`context/conversation-overlay`, `screens/conversation`); this screen is a
 * touch-transparent placeholder whose job is the navigation state: it tells
 * the overlay when it mounts, when it has focus, when it unmounts, and it
 * owns the two things only a screen can — the tab bar's hold, and the
 * hardware back button while it is the focused screen.
 */
export default function ConversationRoute() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  // A conversation is a full-screen surface. The tab bar under it costs a row
  // of messages, and it also sits between the composer and the keyboard — the
  // input lifts by the keyboard's height while the bar keeps its own, leaving a
  // gap the size of the bar.
  const tabBar = useHideTabBar();

  useEffect(() => {
    if (!conversationId) return;
    conversationOverlay.show(conversationId, tabBar.release);
    return () => conversationOverlay.hide(conversationId);
  }, [conversationId, tabBar.release]);

  // A screen pushed over this one (the details, a profile) is a real stack
  // screen above this placeholder; the overlay hides while it is up.
  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;
      conversationOverlay.setFocused(conversationId, true);
      return () => conversationOverlay.setFocused(conversationId, false);
    }, [conversationId]),
  );

  // Android's back slides the page away too. Only while focused: a screen
  // pushed on top has its own back, and sheets (`components/sheet`) register
  // later, so theirs run first and swallow the press.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => (conversationId ? conversationOverlay.leave(conversationId) : false),
      );
      return () => subscription.remove();
    }, [conversationId]),
  );

  return <View pointerEvents="none" style={styles.fill} />;
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
