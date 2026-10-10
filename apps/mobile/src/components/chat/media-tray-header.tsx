import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import {
  Animated,
  type GestureResponderHandlers,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The strip along the top of a media tray: grip, the three tabs, the way back
 * to the keyboard. Shared by the two trays — the conversation's, which floats
 * over the thread, and the prompt composer's, which sits in its column — so
 * the control reads the same wherever GIFs are picked.
 *
 * The strip is also the drag handle (`panHandlers`): the grid below it
 * scrolls, and without `react-native-gesture-handler` there is no clean way
 * to arbitrate a vertical drag between the two, so the header resizes and the
 * grid scrolls, with no ambiguity in either.
 *
 * `keyboardIcon="check"` draws the way back as a filled tick — for the
 * editors (the prompt composer, a story section), where what you do after a
 * GIF is go on writing, and a chevron read as "close" rather than "done".
 */

export type TrayTab = "gif" | "sticker" | "clip";

export const TABS: {
  id: TrayTab;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
}[] = [
  { icon: "images-outline", id: "gif", label: "GIFs" },
  { icon: "happy-outline", id: "sticker", label: "Stickers" },
  { icon: "film-outline", id: "clip", label: "Clips" },
];

export const MediaTrayHeader = ({
  keyboardIcon = "chevron",
  onRequestKeyboard,
  onTabChange,
  panHandlers,
  rendered,
  tabs,
}: {
  /** The tabs to offer, when not all three — a passage takes no clips. */
  tabs?: TrayTab[];
  keyboardIcon?: "chevron" | "check";
  onRequestKeyboard: () => void;
  onTabChange: (tab: TrayTab) => void;
  panHandlers?: GestureResponderHandlers;
  rendered: TrayTab;
}) => {
  const theme = useAppTheme();
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const shown = tabs ? TABS.filter((entry) => tabs.includes(entry.id)) : TABS;

  // The indicator follows the active tab. Spring rather than timing: a tab
  // strip is a physical control and it should arrive with a little weight.
  useEffect(() => {
    if (tabsWidth === 0) return;
    const slot = tabsWidth / shown.length;
    Animated.spring(indicatorX, {
      bounciness: 6,
      speed: 20,
      toValue: shown.findIndex((entry) => entry.id === rendered) * slot + 2,
      useNativeDriver: true,
    }).start();
  }, [indicatorX, rendered, shown.length, tabsWidth]);

  return (
    <View
      {...panHandlers}
      style={[styles.header, { borderBottomColor: theme.glass.edge }]}
    >
      <View style={[styles.grip, { backgroundColor: theme.glass.grip }]} />

      <View style={styles.headerRow}>
        <View
          onLayout={({ nativeEvent }) => setTabsWidth(nativeEvent.layout.width)}
          style={[
            styles.tabs,
            {
              backgroundColor: theme.glass.fillHover,
              borderColor: theme.glass.edge,
            },
          ]}
        >
          {/*
            One pill that slides, rather than three that light up. The movement
            is what says the tabs are one control with a position in it.
          */}
          {tabsWidth > 0 ? (
            <Animated.View
              style={[
                styles.indicator,
                {
                  backgroundColor: theme.accent.surface,
                  borderColor: theme.accent.surfaceHover,
                  transform: [{ translateX: indicatorX }],
                  width: tabsWidth / shown.length - 4,
                },
              ]}
            />
          ) : null}

          {shown.map((entry) => {
            const active = entry.id === rendered;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={entry.id}
                // Keeps the keyboard down while switching tabs: focus moving
                // to a pill raises it over the grid you just switched to.
                onPressIn={() => onTabChange(entry.id)}
                style={styles.tab}
              >
                <Ionicons
                  color={active ? theme.accent.text : theme.textGray}
                  name={entry.icon}
                  size={15}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    { color: active ? theme.accent.text : theme.textGray },
                  ]}
                >
                  {entry.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityLabel={
            keyboardIcon === "check" ? "Done, back to typing" : "Show keyboard"
          }
          accessibilityRole="button"
          hitSlop={space.sm}
          onPress={onRequestKeyboard}
          style={({ pressed }) => [
            styles.keyboardButton,
            keyboardIcon === "check"
              ? {
                  backgroundColor: pressed
                    ? theme.accent.fillPressed
                    : theme.accent.fill,
                  borderColor: theme.accent.fill,
                }
              : {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.glass.fillHover,
                  borderColor: theme.glass.edge,
                },
          ]}
        >
          <Ionicons
            color={keyboardIcon === "check" ? "#ffffff" : theme.text}
            name={keyboardIcon === "check" ? "checkmark" : "chevron-down"}
            size={18}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grip: {
    alignSelf: "center",
    borderRadius: radius.full,
    height: 5,
    marginBottom: space.xs,
    width: 44,
  },
  header: {
    // The strip carries the drag, so it also carries the divider: the grid
    // scrolls under a header that stays put.
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: space.sm,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingHorizontal: space.sm,
  },
  indicator: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    bottom: 2,
    left: 0,
    position: "absolute",
    top: 2,
  },
  keyboardButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: space.xs,
    justifyContent: "center",
    paddingVertical: space.s,
  },
  tabLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  tabs: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    padding: space.xxs,
  },
});
