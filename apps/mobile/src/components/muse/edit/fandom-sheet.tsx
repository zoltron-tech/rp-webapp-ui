import { Ionicons } from "@expo/vector-icons";
import { searchFandoms } from "@nw/api/endpoints/muse";
import { useApi } from "@nw/features";
import type { Fandom } from "@nw/types";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { SkeletonRows } from "@/components/list-skeletons";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { FandomRowSkeleton } from "@/components/sheet-skeletons";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { asColor } from "@/lib/color";
import { fontSize, radius, space, useAppTheme } from "@/theme";
import { SearchField } from "@/components/search-field";

/**
 * Web's fandom picker: type, choose. The search is the public fandom
 * endpoint, debounced; a tap saves at once and closes.
 *
 * Given `onPick` instead of `edit`, a tap hands the fandom back and closes
 * without saving — for a character that does not exist yet.
 */
export const FandomSheet = ({
  current,
  edit,
  onClose,
  onPick,
  visible,
}: {
  current: Fandom | null | undefined;
  edit?: MuseEdit;
  onClose: () => void;
  onPick?: (fandom: Fandom) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setError(null);
    }
  }, [visible]);

  const results = useQuery({
    enabled: visible && debounced.length > 0,
    queryFn: async (): Promise<Fandom[]> => {
      const result = await searchFandoms(api, debounced);
      return Array.isArray(result) ? result : [];
    },
    queryKey: ["fandoms", "search", debounced],
    staleTime: 5 * 60_000,
  });

  const choose = async (fandom: Fandom) => {
    if (busy) return;
    if (onPick || !edit) {
      onPick?.(fandom);
      onClose();
      return;
    }
    setBusy(fandom.id);
    setError(null);
    const ok = await edit.changeFandom(fandom);
    setBusy(null);
    if (!ok) {
      setError("Could not change the fandom. Try again.");
      return;
    }
    onClose();
  };

  return (
    <FormSheet
      error={error}
      fill
      maxHeightRatio={0.8}
      onClose={onClose}
      subtitle={current?.name ? `Currently ${current.name}` : undefined}
      title="Fandom"
      visible={visible}
    >
      <SearchField
        autoFocus
        onChangeText={setQuery}
        placeholder="Search fandoms…"
        value={query}
      />

      <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
        {results.isFetching && !results.data ? (
          <SkeletonRows
            count={6}
            gap={0}
            render={(index) => <FandomRowSkeleton index={index} />}
          />
        ) : debounced && (results.data?.length ?? 0) === 0 ? (
          <Text style={[styles.hint, { color: theme.textGray }]}>
            No fandom matches “{debounced}”.
          </Text>
        ) : !debounced ? (
          <Text style={[styles.hint, { color: theme.textGray }]}>
            Start typing to search.
          </Text>
        ) : (
          results.data?.map((fandom) => {
            const color = asColor(fandom.color) ?? theme.material.edgeTranslucent;
            const selected = fandom.id === current?.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                disabled={busy !== null}
                key={fandom.id}
                onPress={() => void choose(fandom)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : "transparent",
                    borderBottomColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text
                  numberOfLines={1}
                  style={[styles.name, { color: theme.text }]}
                >
                  {fandom.name}
                </Text>
                {busy === fandom.id ? (
                  <ActivityIndicator color={theme.primary} size="small" />
                ) : selected ? (
                  <Ionicons
                    color={theme.accent.text}
                    name="checkmark"
                    size={18}
                  />
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  dot: { borderRadius: radius.sm, height: 10, width: 10 },
  hint: {
    fontSize: fontSize.label,
    fontStyle: "italic",
    paddingVertical: space.md,
    textAlign: "center",
  },
  list: { flex: 1 },
  name: { flex: 1, fontSize: fontSize.body },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.ms,
    paddingHorizontal: space.xs,
    paddingVertical: space.m,
  },
});
