import { Ionicons } from "@expo/vector-icons";
import { deleteMuseAboutSection } from "@nw/api/endpoints/muse";
import { queryKeys, useApi } from "@nw/features";
import type { Muse, MuseAboutSection } from "@nw/types";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "@/components/image";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { MuseGate, useOwnedMuse } from "@/components/edit-muse/shared";
import { NOTE_MAX, NoteSheet } from "@/components/muse/edit/note-sheet";
import { StorySectionEditor } from "@/components/muse/edit/story-section-editor";
import { RichText } from "@/components/rich-text";
import {
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useMuseAboutSections } from "@/hooks/use-muse";
import { useMuseEdit } from "@/hooks/use-muse-edit";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Web's Story page (`/rp/profile/muses/edit/[id]/about`): the favourite quote,
 * then the story in sections.
 *
 * Web's landing sends "Story" to a separate page with the quote on top and a
 * bottom sheet per section; here it is one screen in the stack. The quote is
 * the same tray the profile edits it with, and a section opens the same
 * full-screen rich text editor — each section a picture and a block of text,
 * shown in the order readers will see them.
 */

export default function EditMuseStory() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Story muse={muse} />}
    </MuseGate>
  );
}

const Story = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const id = muse.id ?? "";
  const edit = useMuseEdit(id);
  const query = useMuseAboutSections(id, true);
  const sections = query.data;

  const [noteOpen, setNoteOpen] = useState(false);
  const [editor, setEditor] = useState<{
    section: MuseAboutSection | null;
  } | null>(null);
  const [menu, setMenu] = useState<MuseAboutSection | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const removeNote = () =>
    Alert.alert(
      "Remove quote?",
      "Remove this character's favorite quote? This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("note");
            const ok = await edit.removeNote();
            setBusy(null);
            if (!ok) Alert.alert("Not removed", "Try again in a moment.");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );

  const removeSection = (section: MuseAboutSection) => {
    setMenu(null);
    if (!section.id) return;
    Alert.alert(
      "Delete this section?",
      "Deleting the section will remove all of its content. This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy(section.id ?? null);
            const result = await deleteMuseAboutSection(api, section.id ?? "");
            setBusy(null);
            if (
              !result ||
              ("message" in result && result.message !== "Success")
            ) {
              Alert.alert("Not deleted", "Try again in a moment.");
              return;
            }
            queryClient.setQueryData<MuseAboutSection[]>(
              queryKeys.museAboutSections(id),
              (list) => (list ?? []).filter((s) => s.id !== section.id),
            );
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const menuItems: ActionItem[] = menu
    ? [
        {
          icon: "create-outline",
          label: "Edit section",
          onPress: () => {
            setMenu(null);
            setEditor({ section: menu });
          },
        },
        { separator: true },
        {
          icon: "trash-outline",
          label: "Delete section",
          onPress: () => removeSection(menu),
          variant: "danger",
        },
      ]
    : [];

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <SettingsGroup
          footer={`A line that defines ${muse.firstName}. Up to ${NOTE_MAX} characters.`}
          title={`Favorite quote by ${muse.firstName}`}
        >
          {muse.note ? (
            <View style={styles.quoteBlock}>
              <Text style={[styles.quote, { color: theme.text }]}>
                “{muse.note}”
              </Text>
              <View style={styles.actions}>
                <PillButton
                  icon="create-outline"
                  label="Edit"
                  onPress={() => setNoteOpen(true)}
                />
                <PillButton
                  busy={busy === "note"}
                  icon="trash-outline"
                  label="Remove"
                  onPress={removeNote}
                  tone="danger"
                />
              </View>
            </View>
          ) : (
            <SettingsRow
              icon="chatbubble-ellipses-outline"
              label="Add a favorite quote"
              onPress={() => setNoteOpen(true)}
              subtitle="Shown above the story on the profile."
            />
          )}
        </SettingsGroup>

        <View style={styles.sectionsHead}>
          <Text style={[styles.groupTitle, { color: theme.textGray }]}>
            Story sections
            {sections && sections.length > 0 ? ` · ${sections.length}` : ""}
          </Text>
          <PillButton
            icon="add"
            label="Add section"
            onPress={() => setEditor({ section: null })}
            tone="accent"
          />
        </View>

        {!sections ? (
          <ActivityIndicator color={theme.primary} style={styles.spinner} />
        ) : sections.length === 0 ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.textGray} name="book-outline" size={34} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No story sections yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textGray }]}>
              Tell {muse.firstName}'s story through sections — rich text with
              pictures and GIFs in it. Readers see them in order.
            </Text>
          </View>
        ) : (
          sections.map((section, index) => (
            <View
              key={section.id ?? `section-${index}`}
              style={[
                styles.card,
                {
                  backgroundColor: theme.material.fill,
                  borderColor: theme.material.edge,
                  opacity: busy === section.id ? 0.5 : 1,
                },
              ]}
            >
              <View style={styles.cardHead}>
                <Text style={[styles.ordinal, { color: theme.accent.text }]}>
                  Section {index + 1}
                </Text>
                <Pressable
                  accessibilityLabel={`Section ${index + 1} options`}
                  accessibilityRole="button"
                  hitSlop={space.sm}
                  onPress={() => setMenu(section)}
                >
                  <Ionicons
                    color={theme.textGray}
                    name="ellipsis-horizontal"
                    size={18}
                  />
                </Pressable>
              </View>
              <Pressable
                accessibilityHint="Opens the section editor"
                onPress={() => setEditor({ section })}
                style={styles.cardBody}
              >
                {section.image ? (
                  <Image
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    source={{
                      uri: wsrvImage(section.image, IMAGE_SIZES.COVER_MEDIUM),
                    }}
                    style={styles.cardImage}
                  />
                ) : null}
                <RichText html={section.text} maxBlocks={4} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <NoteSheet
        edit={edit}
        firstName={muse.firstName}
        note={muse.note ?? ""}
        onClose={() => setNoteOpen(false)}
        visible={noteOpen}
      />
      <ActionMenu
        items={menuItems}
        onClose={() => setMenu(null)}
        title="Story section"
        visible={menu !== null}
      />
      <StorySectionEditor
        museId={id}
        onClose={() => setEditor(null)}
        section={editor?.section ?? null}
        sectionCount={sections?.length ?? 0}
        visible={editor !== null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  body: { gap: space.md, padding: space.m },
  card: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    gap: space.sm,
    overflow: "hidden",
    padding: space.md,
  },
  cardBody: { gap: space.sm },
  cardHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardImage: { aspectRatio: 16 / 9, borderRadius: radius.md, width: "100%" },
  empty: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: space.sm,
    padding: space.xl,
  },
  emptyText: { fontSize: fontSize.label, lineHeight: 20, textAlign: "center" },
  emptyTitle: { fontSize: fontSize.body, fontWeight: "700" },
  groupTitle: type.eyebrow,
  ordinal: {
    fontSize: fontSize.caption,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  quote: {
    fontSize: fontSize.body,
    fontStyle: "italic",
    lineHeight: 22,
  },
  quoteBlock: { gap: space.md, padding: space.md },
  sectionsHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.xs,
    paddingTop: space.sm,
  },
  spinner: { paddingVertical: space.lg },
});
