import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_FONT } from "@nw/fonts";
import type { CharacterRefType } from "@nw/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { FontSheet } from "@/components/editor/font-sheet";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text, TextInput } from "@/components/text";
import { nativeFace } from "@/lib/editor-fonts";
import {
  type LineMark,
  readDialogLine,
  writeDialogLine,
} from "@/lib/passage";
import { type DialogEmbed, speakerAvatarUrl } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * One character's line, written or rewritten — web's inline dialog editing
 * and its floating control bar, as a tray.
 *
 * On web a dialog is edited where it sits: tap it, and a bar floats over it
 * with the speaker, the font, bold / italic / underline, the side and delete.
 * On a phone a field inside the page's field is two keyboards' worth of
 * confusion about which one is typing, and a floating bar is under the thumb
 * that summoned it. So the dialog comes up in a tray with all of that in it:
 * who speaks along the top, the line, and one row of controls — and the page
 * shows it afterwards in the design the passage uses.
 *
 * Who can speak is web's rule: the novelist's own muses, the story's shared
 * characters, or nobody ("Anonymous"). A speaker already on the line who is
 * neither — somebody else's muse, in a passage being edited — stays offered,
 * so opening a dialog never quietly changes who said it.
 *
 * The line's marks apply to the whole line (`lib/passage`). A line that came
 * with its own mixed formatting is written back untouched unless its words or
 * marks are changed here.
 */

export interface DialogSpeaker {
  id: string;
  name: string;
  source: CharacterRefType;
}

const ANONYMOUS = "Anonymous";

const MARKS: { label: string; mark: LineMark; name: string }[] = [
  { label: "B", mark: "bold", name: "Bold" },
  { label: "I", mark: "italic", name: "Italic" },
  { label: "U", mark: "underline", name: "Underline" },
];

const EMPTY: DialogEmbed = {
  font: null,
  html: "",
  orientation: "left",
  source: "MUSE",
  speakerId: null,
  storedName: ANONYMOUS,
};

export const DialogSheet = ({
  dialog,
  onClose,
  onDelete,
  onSave,
  speakerName,
  speakers,
  visible,
}: {
  /** The dialog being edited, or null for a new one. */
  dialog: DialogEmbed | null;
  onClose: () => void;
  /** Given when the dialog is already in the passage. */
  onDelete?: () => void;
  onSave: (dialog: DialogEmbed) => void;
  /** The name of the speaker already on the dialog, as the reader shows it. */
  speakerName?: string;
  speakers: DialogSpeaker[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const input = useRef<TextInput>(null);

  const [draft, setDraft] = useState<DialogEmbed>(dialog ?? EMPTY);
  const [text, setText] = useState("");
  const [marks, setMarks] = useState<LineMark[]>([]);
  /** Whether the words or marks moved; until then the line's HTML is kept. */
  const [rewritten, setRewritten] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);

  // Each opening starts from the dialog it was opened for.
  useEffect(() => {
    if (!visible) return;
    const from = dialog ?? EMPTY;
    const line = readDialogLine(from.html);
    setDraft(from);
    setText(line.text);
    setMarks(line.marks);
    setRewritten(false);
    setFontOpen(false);
    // A field focused while the tray's window is still arriving does not
    // raise a keyboard on Android; a beat later it does.
    const timer = setTimeout(() => input.current?.focus(), 320);
    return () => clearTimeout(timer);
    // biome-ignore lint/correctness/useExhaustiveDependencies: read on open
  }, [visible]);

  const offered = useMemo(() => {
    const id = dialog?.speakerId;
    if (!id || speakers.some((speaker) => speaker.id === id)) return speakers;
    return [
      {
        id,
        name: speakerName || dialog.storedName,
        source: dialog.source,
      },
      ...speakers,
    ];
  }, [dialog, speakerName, speakers]);

  const bold = marks.includes("bold");
  const italic = marks.includes("italic");
  const face = nativeFace(draft.font ?? undefined, bold, italic);
  const canSave = text.trim().length > 0;

  const toggleMark = (mark: LineMark) => {
    setRewritten(true);
    setMarks((current) =>
      current.includes(mark)
        ? current.filter((entry) => entry !== mark)
        : [...current, mark],
    );
  };

  const save = () => {
    if (!canSave) return;
    onSave({
      ...draft,
      html: rewritten ? writeDialogLine(text, marks) : draft.html,
    });
  };

  const closeFont = () => {
    setFontOpen(false);
    // The font tray's window took the focus with it.
    setTimeout(() => input.current?.focus(), 240);
  };

  return (
    <BottomSheet
      headerAction={
        <View style={styles.actions}>
          {onDelete ? (
            <IconButton
              accessibilityLabel="Delete dialog"
              hitSlop={space.xs}
              icon="trash-outline"
              onPress={onDelete}
              size={36}
              tone="danger"
            />
          ) : null}
          <IconButton
            accessibilityLabel={dialog ? "Save dialog" : "Insert dialog"}
            disabled={!canSave}
            hitSlop={space.xs}
            icon="checkmark"
            iconSize={20}
            onPress={save}
            size={36}
            tone="primary"
          />
        </View>
      }
      maxHeightRatio={0.82}
      onClose={onClose}
      title={dialog ? "Edit dialog" : "New dialog"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView
          contentContainerStyle={styles.speakers}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
        >
          <SpeakerChip
            active={!draft.speakerId}
            name={ANONYMOUS}
            onPress={() =>
              setDraft((current) => ({
                ...current,
                source: "MUSE",
                speakerId: null,
                storedName: ANONYMOUS,
              }))
            }
          />
          {offered.map((speaker) => (
            <SpeakerChip
              active={draft.speakerId === speaker.id}
              key={`${speaker.source}-${speaker.id}`}
              name={speaker.name}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  source: speaker.source,
                  speakerId: speaker.id,
                  storedName: speaker.name,
                }))
              }
              story={speaker.source === "CHARACTER"}
              uri={speakerAvatarUrl(speaker.id, speaker.source)}
            />
          ))}
        </ScrollView>

        <TextInput
          accessibilityLabel="The spoken line"
          multiline
          onChangeText={(next) => {
            setRewritten(true);
            setText(next);
          }}
          placeholder="What do they say?"
          placeholderTextColor={theme.textGray}
          ref={input}
          style={[
            styles.line,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.glass.fieldEdge,
              color: theme.text,
              textAlign: draft.orientation === "right" ? "right" : "left",
            },
            face ? { fontFamily: face.fontFamily } : null,
            bold && !face?.baked ? styles.bold : null,
            italic && !face?.baked ? styles.italic : null,
            marks.includes("underline") ? styles.underline : null,
          ]}
          value={text}
        />

        <View style={styles.controls}>
          {MARKS.map((entry) => {
            const on = marks.includes(entry.mark);
            return (
              <Pressable
                accessibilityLabel={entry.name}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                hitSlop={space.xs}
                key={entry.mark}
                onPress={() => toggleMark(entry.mark)}
                style={({ pressed }) => [
                  styles.mark,
                  {
                    backgroundColor: on
                      ? theme.accent.surfaceActive
                      : pressed
                        ? theme.glass.fillPressed
                        : theme.glass.fillHover,
                    borderColor: on ? theme.accent.solid : theme.glass.edge,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.markLabel,
                    { color: on ? theme.accent.textStrong : theme.text },
                    entry.mark === "bold" && styles.bold,
                    entry.mark === "italic" && styles.italic,
                    entry.mark === "underline" && styles.underline,
                  ]}
                >
                  {entry.label}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.spacer} />

          <Chip
            icon="swap-horizontal"
            label={draft.orientation === "right" ? "Right" : "Left"}
            name={`Side: ${draft.orientation === "right" ? "right" : "left"}`}
            onPress={() =>
              setDraft((current) => ({
                ...current,
                orientation: current.orientation === "right" ? "left" : "right",
              }))
            }
          />
          <Chip
            icon="text"
            label={draft.font ?? DEFAULT_FONT}
            name={`Font: ${draft.font ?? DEFAULT_FONT}`}
            onPress={() => setFontOpen(true)}
          />
        </View>
      </ScrollView>

      <FontSheet
        active={draft.font ?? undefined}
        onClose={closeFont}
        onSelect={(family) => {
          setDraft((current) => ({ ...current, font: family ?? null }));
          closeFont();
        }}
        visible={fontOpen}
      />
    </BottomSheet>
  );
};

const SpeakerChip = ({
  active,
  name,
  onPress,
  story = false,
  uri,
}: {
  active: boolean;
  name: string;
  onPress: () => void;
  /** One of the story's own characters, rather than a muse. */
  story?: boolean;
  uri?: string | null;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`Spoken by ${name}${story ? ", story character" : ""}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.speaker}
    >
      <View
        style={[
          styles.speakerRing,
          { borderColor: active ? theme.accent.solid : "transparent" },
        ]}
      >
        {uri ? (
          <Avatar name={name} size={40} uri={uri} />
        ) : (
          <View
            style={[
              styles.anonymous,
              {
                backgroundColor: theme.glass.fillHover,
                borderColor: theme.glass.edge,
              },
            ]}
          >
            <Ionicons color={theme.textGray} name="person-outline" size={18} />
          </View>
        )}
        {story ? (
          <View
            style={[
              styles.storyBadge,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.accent.text} name="book" size={9} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.speakerName,
          { color: active ? theme.accent.text : theme.textGray },
          active && styles.speakerNameActive,
        ]}
      >
        {name}
      </Text>
    </Pressable>
  );
};

const Chip = ({
  icon,
  label,
  name,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  name: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="button"
      hitSlop={space.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: pressed
            ? theme.glass.fillPressed
            : theme.glass.fillHover,
          borderColor: theme.glass.edge,
        },
      ]}
    >
      <Ionicons color={theme.textGray} name={icon} size={14} />
      <Text numberOfLines={1} style={[styles.chipLabel, { color: theme.text }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  anonymous: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  body: { gap: space.sm, paddingBottom: space.md },
  bold: { fontWeight: "700" },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    flexShrink: 1,
    gap: space.xs,
    height: 36,
    maxWidth: 124,
    paddingHorizontal: space.ms,
  },
  chipLabel: { flexShrink: 1, fontSize: fontSize.caption, fontWeight: "600" },
  controls: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.md,
  },
  italic: { fontStyle: "italic" },
  line: {
    borderRadius: radius.field,
    borderWidth: border.edge,
    fontSize: fontSize.input,
    marginHorizontal: space.md,
    maxHeight: 132,
    minHeight: 72,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
    textAlignVertical: "top",
  },
  mark: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  markLabel: { fontSize: fontSize.body },
  spacer: { flex: 1 },
  speaker: { alignItems: "center", gap: space.xxs, width: 60 },
  speakerName: { fontSize: fontSize.eyebrow, maxWidth: 60 },
  speakerNameActive: { fontWeight: "700" },
  speakerRing: {
    borderRadius: radius.full,
    borderWidth: 2,
    padding: 2,
  },
  speakers: { gap: space.xs, paddingHorizontal: space.ms },
  storyBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    bottom: -1,
    height: 16,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    width: 16,
  },
  underline: { textDecorationLine: "underline" },
});
