import { Ionicons } from "@expo/vector-icons";
import { searchFandoms } from "@nw/api/endpoints/muse";
import { useApi } from "@nw/features";
import type { Fandom } from "@nw/types";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { SearchField } from "@/components/search-field";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One search field that matches a character's name or a fandom, with fandom
 * chips under it — the character directory's search, shared with the prompt
 * search on Explore so the two behave the same (and as web's
 * `useFandomSearch` does).
 *
 * While something is typed, the fandoms it names are offered as chips;
 * tapping one pins it as a filter and clears the text, so the results become
 * that fandom's. Pinned fandoms combine (any of them), narrow whatever is
 * typed next, and come off with a second tap. The server does the matching;
 * `useFandomSearch` only gathers what to send (`term`, `fandomIds`).
 */

const QUERY_DEBOUNCE_MS = 350;
/** Fandom suggestions start where the server's fandom matching does. */
const MIN_SUGGEST_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

type FandomOption = { color?: string; id: string; label: string };
type Chip = FandomOption & { active: boolean };

const fandomOption = (fandom: Fandom): FandomOption => ({
  color: fandom.color || undefined,
  id: fandom.id,
  label: fandom.name || fandom.id.replaceAll("_", " "),
});

export interface FandomSearch {
  /** What is in the field, as typed. */
  query: string;
  setQuery: (value: string) => void;
  /** The query to search with: trimmed, after a typing pause; "" at once. */
  term: string;
  /** Pinned fandom ids. */
  fandomIds: string[];
  /** Pinned fandom ids, comma-joined: a stable piece of a query key. */
  fandomKey: string;
  /** Pinned first, then suggestions for the typed text. */
  chips: Chip[];
  toggle: (chip: Chip) => void;
  /** Whether anything narrows the results. */
  filtering: boolean;
}

export const useFandomSearch = (): FandomSearch => {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<FandomOption[]>([]);
  const debounced = useDebounce(query.trim(), QUERY_DEBOUNCE_MS);
  // Typing waits for a pause; clearing does not. Pinning a fandom clears the
  // text, and waiting out the debounce there would ask for the fandom twice.
  const term = query.trim() === "" ? "" : debounced;
  const fandomIds = useMemo(() => pinned.map((fandom) => fandom.id), [pinned]);

  const suggestions = useQuery({
    enabled: term.length >= MIN_SUGGEST_LENGTH,
    queryFn: async () => {
      const result = await searchFandoms(api, term);
      return Array.isArray(result) ? result : [];
    },
    queryKey: ["fandom-search", term],
    staleTime: 5 * 60 * 1000,
  });

  const chips = useMemo(() => {
    const suggested =
      term.length >= MIN_SUGGEST_LENGTH
        ? (suggestions.data ?? [])
            .slice(0, MAX_SUGGESTIONS)
            .map(fandomOption)
            .filter((fandom) => !fandomIds.includes(fandom.id))
        : [];
    return [
      ...pinned.map((fandom) => ({ ...fandom, active: true })),
      ...suggested.map((fandom) => ({ ...fandom, active: false })),
    ];
  }, [fandomIds, pinned, suggestions.data, term.length]);

  const toggle = useCallback(({ active, ...fandom }: Chip) => {
    if (active) {
      setPinned((current) => current.filter((f) => f.id !== fandom.id));
      return;
    }
    setPinned((current) => [...current, fandom]);
    // The text was how the fandom was found; once it is pinned, the text
    // would only narrow the fandom down to names that happen to match it.
    setQuery("");
  }, []);

  return {
    chips,
    fandomIds,
    fandomKey: fandomIds.join(","),
    filtering: term.length > 0 || fandomIds.length > 0,
    query,
    setQuery,
    term,
    toggle,
  };
};

/**
 * The field, and the chip row under it when there are chips. `gutter` is the
 * side margin the chip row scrolls out to, so chips run to the screen edge.
 */
export const FandomSearchBar = ({
  gutter = space.md,
  placeholder,
  search,
  style,
}: {
  gutter?: number;
  placeholder: string;
  search: FandomSearch;
  style?: ViewStyle;
}) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.bar, style]}>
      <SearchField
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={search.setQuery}
        placeholder={placeholder}
        returnKeyType="search"
        value={search.query}
      />
      {search.chips.length > 0 ? (
        <ScrollView
          contentContainerStyle={[styles.chips, { paddingHorizontal: gutter }]}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={[styles.chipScroller, { marginHorizontal: -gutter }]}
        >
          {search.chips.map((chip) => (
            <FandomChip
              active={chip.active}
              color={chip.color ?? theme.accent.solid}
              key={chip.id}
              label={chip.label}
              onPress={() => search.toggle(chip)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
};

/** A fandom: its colour as a dot, filled with it once pinned (the muse list's chip). */
const FandomChip = ({
  active,
  color,
  label,
  onPress,
}: {
  active: boolean;
  color: string;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityHint={
        active ? "Removes this fandom filter" : "Shows only this fandom"
      }
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={{ bottom: space.s, top: space.s }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active
          ? { backgroundColor: color, borderColor: color }
          : {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
      ]}
    >
      {active ? (
        <Ionicons color="#ffffff" name="checkmark" size={14} />
      ) : (
        <View style={[styles.chipDot, { backgroundColor: color }]} />
      )}
      <Text
        numberOfLines={1}
        style={[styles.chipLabel, { color: active ? "#ffffff" : theme.text }]}
      >
        {label}
      </Text>
      {active ? null : <Ionicons color={theme.textGray} name="add" size={14} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: { gap: space.sm },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.s,
    maxWidth: 220,
    minHeight: 32,
    paddingHorizontal: space.ms,
  },
  chipDot: { borderRadius: radius.xs, height: 8, width: 8 },
  chipLabel: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "600" },
  chipScroller: { flexGrow: 0 },
  chips: { gap: space.sm },
});
