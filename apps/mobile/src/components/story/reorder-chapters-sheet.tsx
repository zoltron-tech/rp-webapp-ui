import { reorderStoryBoardEvents } from "@nw/api/endpoints/story";
import { useApi } from "@nw/features";
import type { StoryBoardEvent } from "@nw/types";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The chapters' reading order — web's `ReorderStoryboardEventsOverlay`.
 *
 * Web drags rows. Here each row has an up and a down: a drag inside a tray
 * that itself drags away and scrolls is three gestures on one axis, and a
 * chapter list is short enough that two taps move anything anywhere. As on
 * web, moving a row only restages the order; the server is told once, by the
 * tick in the header.
 */
export const ReorderChaptersSheet = ({
  chapters,
  onClose,
  onReordered,
  storyId,
  visible,
}: {
  /** In reading order. */
  chapters: StoryBoardEvent[];
  onClose: () => void;
  onReordered: (chapters: StoryBoardEvent[]) => void;
  storyId: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [order, setOrder] = useState(chapters);
  const [saving, setSaving] = useState(false);

  // Each opening starts from the saved order.
  useEffect(() => {
    if (visible) setOrder(chapters);
    // biome-ignore lint/correctness/useExhaustiveDependencies: read on open
  }, [visible]);

  const dirty = order.some((chapter, index) => chapter.id !== chapters[index]?.id);

  const move = (index: number, by: -1 | 1) => {
    const to = index + by;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[index], next[to]] = [next[to], next[index]];
    setOrder(next);
  };

  const save = async () => {
    setSaving(true);
    const result = await reorderStoryBoardEvents(
      api,
      storyId,
      order.flatMap((chapter) => (chapter.id ? [chapter.id] : [])),
    ).catch(() => ({ message: "error" }) as const);
    setSaving(false);
    if (!Array.isArray(result)) {
      Alert.alert(
        "Could not reorder",
        ("reason" in result && result.reason) ||
          "The new order was not saved. Please try again.",
      );
      return;
    }
    onReordered(result);
    onClose();
  };

  return (
    <BottomSheet
      headerAction={
        <IconButton
          accessibilityLabel="Save order"
          busy={saving}
          disabled={!dirty}
          hitSlop={space.xs}
          icon="checkmark"
          iconSize={20}
          onPress={() => void save()}
          size={36}
          tone="primary"
        />
      }
      ignoreKeyboard
      maxHeightRatio={0.8}
      onClose={onClose}
      subtitle="The order the story is read in"
      title="Reorder chapters"
      visible={visible}
    >
      <ScrollView contentContainerStyle={styles.list}>
        {order.map((chapter, index) => (
          <View
            key={chapter.id}
            style={[
              styles.row,
              {
                backgroundColor: theme.material.fillTranslucent,
                borderColor: theme.material.edgeTranslucent,
              },
            ]}
          >
            <Text style={[styles.number, { color: theme.accent.text }]}>
              {index + 1}
            </Text>
            <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
              {chapter.name}
            </Text>
            <IconButton
              accessibilityLabel={`Move ${chapter.name} up`}
              disabled={index === 0 || saving}
              icon="arrow-up"
              onPress={() => move(index, -1)}
              size={36}
              style={index === 0 ? styles.dimmed : undefined}
              tone="glass"
            />
            <IconButton
              accessibilityLabel={`Move ${chapter.name} down`}
              disabled={index === order.length - 1 || saving}
              icon="arrow-down"
              onPress={() => move(index, 1)}
              size={36}
              style={index === order.length - 1 ? styles.dimmed : undefined}
              tone="glass"
            />
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  dimmed: { opacity: 0.35 },
  list: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  name: { flex: 1, fontSize: fontSize.body, fontWeight: "600", minWidth: 0 },
  number: {
    fontSize: fontSize.label,
    fontWeight: "700",
    textAlign: "center",
    width: 22,
  },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
});
