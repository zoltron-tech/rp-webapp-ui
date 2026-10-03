import type { MentionDataItem, MentionTab } from "@nw/types";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Who `@` could mean — web's `MentionDropdown`, with its tabs.
 *
 * Not a sheet, deliberately. A sheet takes focus, and the moment the field
 * loses focus the keyboard goes and the `@query` being typed is orphaned.
 * This is a strip that appears *between the field and the keyboard*, which is
 * where a phone's own autocomplete lives and where a thumb already is. It is
 * dismissed by typing a space, picking a name, or the caret leaving the
 * query — never by tapping it away, because there is nothing to tap that is
 * not either a name or the keyboard.
 *
 * The tabs are web's `MENTION_TABS`: friends from the session, muses from the
 * search endpoint. Each tab's `getData` is the caller's, as on web, so this
 * knows nothing about where names come from.
 */

/** Web debounces the muse search the same amount. */
const DEBOUNCE_MS = 250;

export const MentionList = ({
  onSelect,
  query,
  tabs,
}: {
  onSelect: (item: MentionDataItem) => void;
  query: string;
  tabs: MentionTab[];
}) => {
  const theme = useAppTheme();
  const [tabId, setTabId] = useState(tabs[0]?.id ?? "");
  const [items, setItems] = useState<MentionDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, DEBOUNCE_MS);

  // A response for an older query is dropped rather than shown: typing "ad"
  // then "ada" must not end with the list for "ad" arriving last.
  const generation = useRef(0);

  const tab = tabs.find((entry) => entry.id === tabId) ?? tabs[0];

  useEffect(() => {
    if (!tab) return;
    generation.current += 1;
    const mine = generation.current;
    setLoading(true);
    void tab
      .getData(debounced)
      .then((result) => {
        if (generation.current !== mine) return;
        setItems(result);
        setLoading(false);
      })
      .catch(() => {
        if (generation.current !== mine) return;
        setItems([]);
        setLoading(false);
      });
  }, [debounced, tab]);

  if (!tab) return null;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.glass.opaque,
          borderColor: theme.glass.edge,
        },
      ]}
    >
      <View style={[styles.tabs, { borderBottomColor: theme.glass.edge }]}>
        {tabs.map((entry) => {
          const active = entry.id === tab.id;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={entry.id}
              // `onPressIn`, so the field keeps focus and the keyboard stays.
              onPressIn={() => setTabId(entry.id)}
              style={[
                styles.tab,
                {
                  borderBottomColor: active
                    ? theme.accent.solid
                    : "transparent",
                },
              ]}
            >
              <Text
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
        {loading ? (
          <ActivityIndicator
            color={theme.textGray}
            size="small"
            style={styles.spinner}
          />
        ) : null}
      </View>

      <ScrollView keyboardShouldPersistTaps="always" style={styles.list}>
        {items.length === 0 && !loading ? (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            {query ? `Nobody matches "${query}".` : "Type a name."}
          </Text>
        ) : null}
        {items.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={`${item.type}-${item.id}`}
            onPressIn={() => onSelect(item)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed ? theme.glass.fillHover : "transparent",
              },
            ]}
          >
            <Avatar name={item.displayName} size={28} uri={item.image} />
            <View style={styles.rowText}>
              <Text
                numberOfLines={1}
                style={[styles.name, { color: theme.text }]}
              >
                {item.displayName}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.meta, { color: theme.textGray }]}
              >
                {item.type === "MUSE"
                  ? item.pennedBy
                    ? `by ${item.pennedBy.username}`
                    : "Character"
                  : "Novelist"}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: { fontSize: fontSize.caption, padding: space.sm },
  // Four rows, then it scrolls: taller and it is the keyboard's rival for
  // the screen rather than a strip above it.
  list: { maxHeight: 4 * 44 },
  meta: { fontSize: 10 },
  name: { fontSize: fontSize.label, fontWeight: "600" },
  root: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.sm,
  },
  rowText: { flex: 1 },
  spinner: { marginLeft: "auto", marginRight: space.sm },
  tab: {
    borderBottomWidth: 2,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 2,
  },
  tabLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  tabs: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
});
