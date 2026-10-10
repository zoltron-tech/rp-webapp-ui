import { Ionicons } from "@expo/vector-icons";
import type { ApiClient } from "@nw/api";
import { deleteMuseMedia } from "@nw/api/endpoints/muse";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { API_MESSAGE } from "@nw/types";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { PANEL } from "@/components/muse/panel";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Picking several gallery files and deleting them together.
 *
 * One file at a time was the only way to clear a gallery: tap, confirm,
 * wait, twenty times. Web and the app now share the same shape — a "Select"
 * mode in which tiles toggle instead of opening, a bar that says how many
 * are chosen with "Select all" and "Delete", and one confirmation for the
 * lot. This file holds the parts both mobile galleries share: the mode's
 * state, the tick drawn over a chosen tile, the bar, and the delete loop.
 *
 * ## The loop, not a bulk endpoint
 *
 * The service deletes one URL per request. Twenty requests for a full
 * gallery is fine on a phone, and it keeps the app working against the
 * service as deployed; a bulk endpoint can replace `deleteManyMuseMedia`
 * later without the screens noticing. Each file is removed from the muse
 * (the metadata row, its hearts and notifications) and then from storage,
 * in the order a single delete does it. The URLs that fail come back so the
 * caller can put them back on screen.
 */

export const useMediaSelection = () => {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const start = useCallback((url?: string) => {
    setSelecting(true);
    if (url) setSelected(new Set([url]));
  }, []);

  const stop = useCallback(() => {
    setSelecting(false);
    setSelected(new Set());
  }, []);

  const toggle = useCallback((url: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }, []);

  const selectAll = useCallback((urls: readonly string[]) => {
    setSelected(new Set(urls));
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  /** Drop URLs that have left the gallery (deleted elsewhere, refetched). */
  const retain = useCallback((urls: readonly string[]) => {
    setSelected((current) => {
      const next = new Set([...current].filter((url) => urls.includes(url)));
      return next.size === current.size ? current : next;
    });
  }, []);

  return { clear, retain, selectAll, selected, selecting, start, stop, toggle };
};

export type MediaSelection = ReturnType<typeof useMediaSelection>;

/** Deletes each URL from the muse and from storage; returns those that failed. */
export const deleteManyMuseMedia = async (
  api: ApiClient,
  museId: string,
  urls: readonly string[],
): Promise<string[]> => {
  const failed: string[] = [];
  for (const url of urls) {
    const result = await deleteMuseMedia(api, museId, url);
    if (!result || result.message !== API_MESSAGE.Success) {
      failed.push(url);
      continue;
    }
    void deleteMedia(api, url);
  }
  return failed;
};

const MARK = 22;

/**
 * The tick over a tile in select mode: an empty ring until chosen, a filled
 * accent disc with a check after. Over the picture, not instead of it.
 */
export const SelectMark = ({
  accent,
  selected,
}: {
  accent: string;
  selected: boolean;
}) => (
  <View
    pointerEvents="none"
    style={[styles.markWash, selected && styles.markWashOn]}
  >
    <View
      style={[
        styles.mark,
        selected
          ? { backgroundColor: accent, borderColor: accent }
          : styles.markOff,
      ]}
    >
      {selected ? (
        <Ionicons color="#ffffff" name="checkmark" size={15} />
      ) : null}
    </View>
  </View>
);

/**
 * The bar that stands in for a section's title while selecting: the count,
 * select all or none, delete, and a way out. `dark` draws it in the muse
 * panel's whites; otherwise in the settings screen's theme.
 */
export const SelectionBar = ({
  busy,
  count,
  dark,
  onCancel,
  onClear,
  onDelete,
  onSelectAll,
  total,
}: {
  busy?: boolean;
  count: number;
  dark?: boolean;
  onCancel: () => void;
  onClear: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  total: number;
}) => {
  const theme = useAppTheme();
  const text = dark ? PANEL.primary : theme.text;
  const muted = dark ? PANEL.secondary : theme.textGray;
  const pill = dark ? PANEL.pill : theme.material.fill;
  const pillEdge = dark ? PANEL.pillBorder : theme.material.edge;
  const all = total > 0 && count === total;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.bar,
        {
          backgroundColor: dark ? PANEL.card : theme.material.fill,
          borderColor: dark ? PANEL.cardBorder : theme.material.edge,
        },
      ]}
    >
      <Text style={[styles.count, { color: text }]}>
        {count === 0 ? "Select files" : `${count} selected`}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={busy || total === 0}
          hitSlop={space.xs}
          onPress={all ? onClear : onSelectAll}
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: pill, borderColor: pillEdge },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.pillLabel, { color: text }]}>
            {all ? "None" : "All"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Delete ${count} selected`}
          accessibilityRole="button"
          disabled={busy || count === 0}
          hitSlop={space.xs}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.pill,
            styles.delete,
            {
              backgroundColor: count === 0 ? pill : theme.error,
              borderColor: count === 0 ? pillEdge : theme.error,
              opacity: count === 0 ? 0.55 : 1,
            },
            pressed && styles.pressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons
              color={count === 0 ? muted : "#ffffff"}
              name="trash-outline"
              size={14}
            />
          )}
          <Text
            style={[
              styles.pillLabel,
              { color: count === 0 ? muted : "#ffffff" },
            ]}
          >
            Delete
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Stop selecting"
          accessibilityRole="button"
          disabled={busy}
          hitSlop={space.xs}
          onPress={onCancel}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Ionicons color={muted} name="close" size={18} />
        </Pressable>
      </View>
    </View>
  );
};

/** The way into select mode: a small outlined pill beside the section title. */
export const SelectButton = ({
  dark,
  onPress,
}: {
  dark?: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const color = dark ? PANEL.secondary : theme.textGray;
  return (
    <Pressable
      accessibilityLabel="Select files"
      accessibilityRole="button"
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.select,
        {
          borderColor: dark ? "rgba(255,255,255,0.3)" : theme.material.edge,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons color={color} name="checkmark-circle-outline" size={13} />
      <Text style={[styles.selectLabel, { color }]}>Select</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.s },
  bar: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "space-between",
    paddingLeft: space.m,
    paddingRight: space.s,
    paddingVertical: space.s,
  },
  close: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  count: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "700" },
  delete: { flexDirection: "row", gap: space.xs },
  mark: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    height: MARK,
    justifyContent: "center",
    width: MARK,
  },
  markOff: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderColor: "rgba(255,255,255,0.9)",
  },
  markWash: {
    alignItems: "flex-end",
    inset: 0,
    padding: 5,
    position: "absolute",
  },
  markWashOn: { backgroundColor: "rgba(0,0,0,0.3)" },
  pill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 30,
    paddingHorizontal: space.m,
  },
  pillLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  pressed: { opacity: 0.7 },
  select: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.ms,
    paddingVertical: 3,
  },
  selectLabel: { fontSize: fontSize.meta, fontWeight: "600" },
});
