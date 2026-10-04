import { Ionicons } from "@expo/vector-icons";
import { deleteMuseAboutSection } from "@nw/api/endpoints/muse";
import { queryKeys, useApi } from "@nw/features";
import type { Muse, MuseAboutSection } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { FeedMedia } from "@/components/feed/feed-media";
import { NoteSheet } from "@/components/muse/edit/note-sheet";
import { StorySectionEditor } from "@/components/muse/edit/story-section-editor";
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  MusePanel,
  PANEL,
  SectionEmpty,
  SectionLabel,
  Shimmer,
} from "@/components/muse/panel";
import { AddButton } from "@/components/muse/sections/info";
import { RichText } from "@/components/rich-text";
import { useMuseAboutSections } from "@/hooks/use-muse";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import type { MuseLook } from "@/lib/muse-appearance";
import { fontSize, space } from "@/theme";

/**
 * Web's `BackStorySection`: the favourite quote, then the story in sections.
 *
 * Each section is an optional picture over a block of rich text — the same
 * documents the web editor writes, drawn by the same `@nw/richtext` parser. The
 * picture goes through `FeedMedia`, which already knows how to keep a
 * portrait's shape without letting it take the whole screen.
 *
 * The owner adds, edits and removes both the quote (a tray) and the sections
 * (the full-screen editor), where web sends them to separate pages.
 */
export const MuseStorySection = ({
  active,
  edit,
  isOwnMuse,
  look,
  motion,
  muse,
}: {
  /** Whether this section is the one on screen; the fetch waits for it. */
  active: boolean;
  edit: MuseEdit;
  isOwnMuse: boolean;
  look: MuseLook;
  motion: boolean;
  muse: Muse | null;
}) => {
  const { accent } = look;
  const api = useApi();
  const queryClient = useQueryClient();
  const query = useMuseAboutSections(muse?.id ?? undefined, active);
  const sections = query.data;

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteMenu, setNoteMenu] = useState(false);
  const [editor, setEditor] = useState<{
    section: MuseAboutSection | null;
  } | null>(null);
  const [sectionMenu, setSectionMenu] = useState<MuseAboutSection | null>(null);

  const removeNote = () => {
    setNoteMenu(false);
    Alert.alert(
      "Remove note?",
      "Are you sure you want to remove this note? This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const ok = await edit.removeNote();
            if (!ok) Alert.alert("Not removed", "Try again in a moment.");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );
  };

  const removeSection = (section: MuseAboutSection) => {
    setSectionMenu(null);
    if (!section.id || !muse?.id) return;
    Alert.alert(
      "Delete this section?",
      "This part of the story will be removed. This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const result = await deleteMuseAboutSection(api, section.id ?? "");
            if (
              !result ||
              ("message" in result && result.message !== "Success")
            ) {
              Alert.alert("Not deleted", "Try again in a moment.");
              return;
            }
            queryClient.setQueryData<MuseAboutSection[]>(
              queryKeys.museAboutSections(muse.id ?? ""),
              (list) => (list ?? []).filter((s) => s.id !== section.id),
            );
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const noteItems: ActionItem[] = [
    {
      icon: "create-outline",
      label: "Edit quote",
      onPress: () => {
        setNoteMenu(false);
        setNoteOpen(true);
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove quote",
      onPress: removeNote,
      variant: "danger",
    },
  ];

  const sectionItems = (section: MuseAboutSection): ActionItem[] => [
    {
      icon: "create-outline",
      label: "Edit section",
      onPress: () => {
        setSectionMenu(null);
        setEditor({ section });
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Delete section",
      onPress: () => removeSection(section),
      variant: "danger",
    },
  ];

  return (
    <>
      <MusePanel accent={accent} hideBackground={look.hideExpandedBackground}>
        <MiniHeader look={look} muse={muse} />
        <Divider accent={accent} />
        <SectionLabel
          trailing={
            isOwnMuse && sections && sections.length > 0 ? (
              <AddButton
                label="Add section"
                onPress={() => setEditor({ section: null })}
              />
            ) : undefined
          }
        >
          Story
        </SectionLabel>

        {!sections ? (
          <View style={styles.shimmer}>
            <Shimmer height={12} />
            <Shimmer height={12} width="88%" />
            <Shimmer height={12} width="74%" />
            <Shimmer height={56} />
            <Shimmer height={12} />
            <Shimmer height={12} width="92%" />
            <Shimmer height={12} width="65%" />
          </View>
        ) : (
          <>
            {muse?.note ? (
              <Pressable
                accessibilityHint={isOwnMuse ? "Edit or remove" : undefined}
                accessibilityLabel={`Favourite quote: ${muse.note}`}
                accessibilityRole={isOwnMuse ? "button" : "text"}
                disabled={!isOwnMuse}
                onPress={() => setNoteMenu(true)}
                style={({ pressed }) => [
                  styles.note,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.quote}>“{muse.note}”</Text>
                {isOwnMuse ? (
                  <Ionicons color={PANEL.faint} name="pencil" size={11} />
                ) : null}
              </Pressable>
            ) : isOwnMuse && muse ? (
              <View style={styles.noteAdd}>
                <AddButton
                  label={`Add ${muse.firstName}'s favourite quote`}
                  onPress={() => setNoteOpen(true)}
                />
              </View>
            ) : null}

            {sections.length === 0 ? (
              <SectionEmpty
                accent={accent}
                label="No story yet."
                motion={motion}
                scene="blank-scroll"
              >
                {isOwnMuse ? (
                  <AddButton
                    label="Add story section"
                    onPress={() => setEditor({ section: null })}
                  />
                ) : null}
              </SectionEmpty>
            ) : (
              sections.map((section, index) => (
                <View
                  key={section.id ?? `about-${index}`}
                  style={styles.section}
                >
                  {isOwnMuse ? (
                    <Pressable
                      accessibilityLabel="Section options"
                      accessibilityRole="button"
                      hitSlop={space.sm}
                      onPress={() => setSectionMenu(section)}
                      style={styles.sectionMore}
                    >
                      <Ionicons
                        color={PANEL.muted}
                        name="ellipsis-horizontal"
                        size={16}
                      />
                    </Pressable>
                  ) : null}
                  {section.image ? <FeedMedia url={section.image} /> : null}
                  <RichText html={section.text} />
                </View>
              ))
            )}
          </>
        )}
      </MusePanel>

      {isOwnMuse && muse ? (
        <>
          <NoteSheet
            edit={edit}
            firstName={muse.firstName}
            note={muse.note ?? ""}
            onClose={() => setNoteOpen(false)}
            visible={noteOpen}
          />
          <ActionMenu
            items={noteItems}
            onClose={() => setNoteMenu(false)}
            title="Favourite quote"
            visible={noteMenu}
          />
          <ActionMenu
            items={sectionMenu ? sectionItems(sectionMenu) : []}
            onClose={() => setSectionMenu(null)}
            title="Story section"
            visible={sectionMenu !== null}
          />
          <StorySectionEditor
            museId={muse.id ?? ""}
            onClose={() => setEditor(null)}
            section={editor?.section ?? null}
            sectionCount={sections?.length ?? 0}
            visible={editor !== null}
          />
        </>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  note: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    paddingBottom: space.md,
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
  },
  noteAdd: { alignItems: "center", paddingBottom: space.md },
  quote: {
    color: PANEL.secondary,
    flexShrink: 1,
    fontSize: fontSize.label,
    fontStyle: "italic",
    letterSpacing: 0.2,
    lineHeight: 22,
    textAlign: "left",
  },
  section: { gap: space.sm, paddingBottom: space.md, position: "relative" },
  sectionMore: {
    alignSelf: "flex-end",
    paddingBottom: space.xxs,
  },
  shimmer: { gap: space.sm, paddingTop: space.xs },
});
