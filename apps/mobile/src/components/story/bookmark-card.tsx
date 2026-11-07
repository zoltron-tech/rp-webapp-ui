import { Ionicons } from "@expo/vector-icons";
import type { BookmarkedStoryBoardEvent } from "@nw/types";
import { toFormattedDate, wsrvImage } from "@nw/utils";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/button";
import { CroppedImage } from "@/components/cropped-image";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A saved place in a chapter — web's `BookmarkCard`. Opening it goes back to
 * the exact passage the reader stopped on. `onRemove` is the Bookmarks page's;
 * Home's Continue Reading card has none.
 */

const COVER_WIDTH = 72;

export const BookmarkCard = memo(function BookmarkCard({
  bookmarked,
  onRemove,
}: {
  bookmarked: BookmarkedStoryBoardEvent;
  onRemove?: (bookmarked: BookmarkedStoryBoardEvent) => void;
}) {
  const theme = useAppTheme();
  const router = useRouter();
  const { bookmark, event, storyBoardName } = bookmarked;

  const open = () => {
    if (!event.id) return;
    router.push({
      params: { eventId: event.id, t: String(bookmark.threadIndex) },
      pathname: "/story/chapter/[eventId]",
    });
  };

  const cover = wsrvImage(event.avatar?.src || event.image, {
    fit: "inside",
    h: 300,
    w: 200,
  });

  return (
    <Pressable
      accessibilityHint="Goes back to where you stopped"
      accessibilityLabel={`${event.name}, ${storyBoardName}`}
      accessibilityRole="link"
      onPress={open}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.material.fill,
          borderColor: theme.material.edge,
        },
      ]}
    >
      <View
        style={[styles.cover, { backgroundColor: theme.material.fillPressed }]}
      >
        {cover ? (
          <CroppedImage
            crop={event.avatar?.crop}
            style={StyleSheet.absoluteFill}
            uri={cover}
          />
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[styles.eyebrow, { color: theme.accent.text }]}
        >
          {storyBoardName}
        </Text>
        <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {event.name}
        </Text>
        <View style={styles.meta}>
          <Ionicons color={theme.textGray} name="bookmark" size={11} />
          <Text style={[styles.metaText, { color: theme.textGray }]}>
            Passage {bookmark.threadIndex + 1}
            {bookmark.modifiedAt
              ? ` · ${toFormattedDate(bookmark.modifiedAt)}`
              : ""}
          </Text>
        </View>
        {onRemove ? (
          <View style={styles.actions}>
            <Button
              label="Continue reading"
              onPress={open}
              size="xs"
              variant="primary"
            />
            <Button
              accessibilityLabel={`Remove bookmark for ${event.name}`}
              icon="trash-outline"
              onPress={() => onRemove(bookmarked)}
              size="xs"
              variant="quiet"
            />
          </View>
        ) : null}
      </View>

      {onRemove ? null : (
        <Ionicons color={theme.textGray} name="chevron-forward" size={18} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
  },
  body: { flex: 1, gap: space.xs, minWidth: 0 },
  card: {
    alignItems: "center",
    borderRadius: radius.card,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    padding: space.m,
  },
  cover: {
    aspectRatio: 2 / 3,
    borderRadius: radius.xs,
    overflow: "hidden",
    width: COVER_WIDTH,
  },
  eyebrow: { fontSize: fontSize.caption, fontWeight: "600" },
  meta: { alignItems: "center", flexDirection: "row", gap: space.xs },
  metaText: { fontSize: fontSize.caption },
  title: { fontSize: fontSize.body, fontWeight: "700", lineHeight: 19 },
});
