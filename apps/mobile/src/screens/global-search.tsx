import { Ionicons } from "@expo/vector-icons";
import { search } from "@nw/api/endpoints/novelists";
import { useApi } from "@nw/features";
import type { SearchResult } from "@nw/types/common";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { StackBackButton } from "@/components/stack-back-button";
import { useA11ySettings } from "@/lib/a11y-settings";
import { RowSeparator } from "@/components/list-parts";
import { ListStatus } from "@/components/list-status";
import { SearchField } from "@/components/search-field";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Search novelists and characters together — web's `HomeMobileSearch`, as a
 * screen rather than a dropdown, because on a phone the keyboard leaves a
 * dropdown no room.
 *
 * Both searches run on every query and merge into one list, each row saying
 * which it is. Lives in the Home tab's stack so a result opens inside the tab.
 */

const DEBOUNCE_MS = 400;

type SearchType = "novelist" | "muse";

type Tagged = SearchResult & { resultType: SearchType };

const TYPE_LABEL: Record<SearchType, string> = {
  muse: "Character",
  novelist: "Novelist",
};

const keyExtractor = (item: Tagged) =>
  `${item.resultType}-${item.id || item.username}`;

export const GlobalSearchScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [input, setInput] = useState("");
  const term = useDebounce(input.trim(), DEBOUNCE_MS);

  const results = useQuery({
    enabled: term.length > 0,
    queryFn: async (): Promise<Tagged[]> => {
      const [novelists, muses] = await Promise.all([
        search(api, term, "novelist"),
        search(api, term, "muse"),
      ]);
      const tag = (
        list: Awaited<ReturnType<typeof search>>,
        resultType: SearchType,
      ): Tagged[] =>
        list && !("message" in list)
          ? list.map((item) => ({ ...item, resultType }))
          : [];
      return [...tag(novelists, "novelist"), ...tag(muses, "muse")];
    },
    queryKey: ["search", term],
    staleTime: 60 * 1000,
  });

  const open = useCallback(
    (item: Tagged) => {
      if (item.resultType === "novelist" && item.username) {
        router.push({
          params: { username: item.username },
          pathname: "/novelist/[username]",
        });
      } else if (item.resultType === "muse" && item.id) {
        router.push({
          params: { museId: item.id },
          pathname: "/muse/[museId]",
        });
      }
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Tagged }) => {
      const name =
        `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() ||
        item.name ||
        item.username;
      return (
        <Pressable
          accessibilityLabel={`${name}, ${TYPE_LABEL[item.resultType]}`}
          accessibilityRole="link"
          onPress={() => open(item)}
          style={({ pressed }) => [
            styles.row,
            pressed && { backgroundColor: theme.material.fillPressed },
          ]}
        >
          <Avatar name={name} size={44} uri={item.image} />
          <View style={styles.names}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.text }]}
            >
              {name}
            </Text>
            {item.username ? (
              <Text
                numberOfLines={1}
                style={[styles.handle, { color: theme.textGray }]}
              >
                @{item.username}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: theme.accent.tint,
                borderColor: theme.accent.surfaceHover,
              },
            ]}
          >
            <Text style={[styles.chipLabel, { color: theme.accent.text }]}>
              {TYPE_LABEL[item.resultType]}
            </Text>
          </View>
          <Ionicons color={theme.textGray} name="chevron-forward" size={16} />
        </Pressable>
      );
    },
    [open, theme],
  );

  const data = term ? (results.data ?? []) : [];

  /*
   * The field grows out of the magnifier. Home's header has the icon at its
   * trailing side; this screen fades in over it with the field at the icon's
   * width, right-aligned where the icon was, and widens leftward to fill the
   * bar. Width is a layout property, so this runs on the JS driver — one view,
   * once, for a fifth of a second.
   */
  const reduceMotion = useA11ySettings().reduceMotion;
  const grow = useRef(new Animated.Value(0)).current;
  const [slot, setSlot] = useState(0);
  const onSlotLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const first = slot === 0;
    setSlot(width);
    // A later layout (rotation) only resizes; the growth plays once.
    if (!first) return;
    if (reduceMotion) {
      grow.setValue(1);
      return;
    }
    Animated.timing(grow, {
      duration: GROW_MS,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.fill}>
      {/*
        The header bar, drawn here rather than by the stack so the field can
        sit in it: the stack's own header is off for this screen (Home's
        layout), and this bar takes its height and its glass base colour.
      */}
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.glass.opaque,
            height: insets.top + BAR_HEIGHT,
            paddingTop: insets.top,
          },
        ]}
      >
        <StackBackButton />
        <View onLayout={onSlotLayout} style={styles.slot}>
          {slot > 0 ? (
            <Animated.View
              style={{
                opacity: grow.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0.4, 1, 1],
                }),
                width: grow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Math.min(ICON_WIDTH, slot), slot],
                }),
              }}
            >
              <SearchField
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                containerStyle={styles.field}
                onChangeText={setInput}
                placeholder="Search novelists & characters…"
                returnKeyType="search"
                value={input}
              />
            </Animated.View>
          ) : null}
        </View>
      </View>

      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        data={data}
        ItemSeparatorComponent={RowSeparator}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          term ? (
            <ListStatus
              empty="No results found"
              error={results.error}
              loading={results.isPending}
              onRetry={() => void results.refetch()}
            />
          ) : (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              Find a novelist or a character by name.
            </Text>
          )
        }
        renderItem={renderItem}
      />
    </View>
  );
};

/** The stack header's own height (native-stack: 56 on Android, 44 on iOS). */
const BAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;
/** The magnifier's footprint in Home's header, which the field starts at. */
const ICON_WIDTH = 44;
const GROW_MS = 220;

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    paddingLeft: space.sm,
    paddingRight: space.m,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  chipLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  content: { paddingHorizontal: space.sm },
  // Shorter than the pill's usual 42 so it sits inside a 44pt iOS bar.
  field: { minHeight: 36 },
  fill: { flex: 1 },
  // Right-aligned, so the field grows leftward from where the icon was.
  slot: { alignItems: "flex-end", flex: 1, minWidth: 0 },
  handle: { fontSize: fontSize.caption },
  hint: { fontSize: fontSize.body, padding: space.md, textAlign: "center" },
  name: { fontSize: fontSize.body, fontWeight: "600" },
  names: { flex: 1, minWidth: 0 },
  row: {
    alignItems: "center",
    borderRadius: radius.field,
    flexDirection: "row",
    gap: space.m,
    padding: space.sm,
  },
});
