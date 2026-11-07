import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { CodexEntry, StoryBoardEvent } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { Image } from "@/components/image";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import { ChapterChips } from "@/components/story/chapter-chips";
import { StoryProse } from "@/components/story/story-prose";
import { asColor, withAlpha } from "@/lib/color";
import { codexIcon } from "@/lib/story";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/** A codex entry's icon, in its own colour — or the entry's picture. */
export const EntryGlyph = ({
  entry,
  size = 40,
}: {
  entry: Pick<CodexEntry, "color" | "icon" | "image">;
  size?: number;
}) => {
  const theme = useAppTheme();
  const color = asColor(entry.color) ?? theme.accent.solid;
  const box = { borderRadius: size * 0.26, height: size, width: size };

  if (entry.image) {
    return (
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{
          uri: wsrvImage(entry.image, {
            fit: "cover",
            h: size * 3,
            w: size * 3,
          }),
        }}
        style={[box, { backgroundColor: theme.glass.fillPressed }]}
        transition={0}
      />
    );
  }

  return (
    <View
      style={[styles.glyph, box, { backgroundColor: withAlpha(color, 0.18) }]}
    >
      <MaterialCommunityIcons
        color={color}
        name={
          codexIcon(entry.icon) as keyof typeof MaterialCommunityIcons.glyphMap
        }
        size={size * 0.5}
      />
    </View>
  );
};

/**
 * Reading a codex entry — web's `EntryReader`.
 *
 * The card in the list is a clamped preview; this is where the entry is
 * actually read, with the chapters it appears in as ways into them.
 */
export const EntrySheet = ({
  categoryName,
  chapters,
  entry,
  onClose,
  onEdit,
  onOpenChapter,
}: {
  categoryName?: string | null;
  /** The story's chapters; the entry's own are picked out of these. */
  chapters: StoryBoardEvent[];
  entry: CodexEntry | null;
  onClose: () => void;
  /** Given to a story member. */
  onEdit?: (entry: CodexEntry) => void;
  onOpenChapter: (chapterId: string) => void;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  // Held through the close animation, so the sheet does not empty as it slides.
  const [shown, setShown] = useState(entry);
  useEffect(() => {
    if (entry) setShown(entry);
  }, [entry]);

  const used = shown
    ? shown.chapterIds
        .map((id) => chapters.find((chapter) => chapter.id === id))
        .filter((chapter): chapter is StoryBoardEvent => Boolean(chapter))
    : [];

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      subtitle={categoryName ?? undefined}
      title={shown?.name}
      visible={Boolean(entry)}
    >
      {shown ? (
        <ScrollView
          contentContainerStyle={[
            styles.body,
            { paddingBottom: insets.bottom + space.lg },
          ]}
        >
          {onEdit ? (
            <View style={styles.editRow}>
              <PillButton
                icon="create-outline"
                label="Edit entry"
                onPress={() => onEdit(shown)}
              />
            </View>
          ) : null}

          {/* The sheet's own header already names the entry and its
              category; a picture is the one thing it cannot carry. */}
          {shown.image ? <EntryGlyph entry={shown} size={56} /> : null}

          {shown.description ? (
            <StoryProse html={shown.description} />
          ) : (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              No description yet.
            </Text>
          )}

          <ChapterChips
            chapters={used}
            label="Appears in"
            onOpen={onOpenChapter}
          />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.md, paddingHorizontal: space.md, paddingTop: space.xs },
  category: { fontSize: fontSize.caption, textTransform: "uppercase" },
  editRow: { flexDirection: "row" },
  glyph: { alignItems: "center", justifyContent: "center" },
  head: { alignItems: "center", flexDirection: "row", gap: space.md },
  headText: { flex: 1, gap: space.xxs },
  hint: { fontSize: fontSize.body },
  name: { fontSize: fontSize.title, fontWeight: "700" },
  thumb: { borderRadius: radius.md },
});
