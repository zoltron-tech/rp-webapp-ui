import { Ionicons } from "@expo/vector-icons";
import type { StoryBoardEvent } from "@nw/types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/** "Used in" — the chapters a codex entry or pin appears in, each a way in. */
export const ChapterChips = ({
  chapters,
  label,
  onOpen,
}: {
  chapters: StoryBoardEvent[];
  label: string;
  onOpen: (chapterId: string) => void;
}) => {
  const theme = useAppTheme();
  if (chapters.length === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>
      {chapters.map((chapter) => (
        <Pressable
          accessibilityLabel={`Read ${chapter.name}`}
          accessibilityRole="link"
          key={chapter.id}
          onPress={() => chapter.id && onOpen(chapter.id)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: pressed
                ? theme.accent.surfaceHover
                : theme.accent.tint,
            },
          ]}
        >
          <Ionicons color={theme.accent.text} name="book-outline" size={12} />
          <Text
            numberOfLines={1}
            style={[styles.chipLabel, { color: theme.accent.text }]}
          >
            {chapter.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipLabel: { flexShrink: 1, fontSize: fontSize.caption, fontWeight: "600" },
  label: { fontSize: fontSize.caption, fontWeight: "600" },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: space.sm,
  },
});
