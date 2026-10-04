import { Ionicons } from "@expo/vector-icons";
import type { NovelistNote } from "@nw/types/novelist";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { EmojiSlider } from "@/components/edit-profile/emoji-slider";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { getNoteEmojiRotate, NoteEmojiIcon } from "@/components/note-emoji";
import { TextField } from "@/components/text-field";
import type { ProfileEdit } from "@/hooks/use-profile-edit";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `NoteEditTray`: the status note beside your avatar, its colour and
 * its emoji.
 *
 * The emoji are web's hand-drawn set, ported by
 * `scripts/port-note-emoji.mjs`, and stored by key — so a note picked here
 * shows the same artwork on web, and the other way round. Tapping the chosen
 * emoji again clears it, as on web.
 */

export const NOTE_MAX = 100;

/** Web's `NOTE_COLORS`: deep tones that carry white text. */
const NOTE_COLORS = [
  "#6b1f1f",
  "#8b3a3a",
  "#a05252",
  "#7a3210",
  "#a0522d",
  "#b5712a",
  "#6b5010",
  "#8b6914",
  "#a08030",
  "#1e4d2b",
  "#2d6e45",
  "#4a7c59",
  "#5c6b3a",
  "#3d6b5e",
  "#2a5c3f",
  "#0f3d38",
  "#1e6b63",
  "#2c5f6e",
  "#1a5c6b",
  "#0f2d4a",
  "#1a5276",
  "#2a5a96",
  "#3b5e8a",
  "#2a4a7a",
  "#2d1f5e",
  "#4a3f8f",
  "#5a4a6b",
  "#6b3fa0",
  "#7a3f8f",
  "#6b1f4a",
  "#8b2d6b",
  "#a0305a",
  "#8b3a5a",
  "#7b5e6e",
];

export const NoteEditSheet = ({
  edit,
  note,
  onClose,
  visible,
}: {
  edit: ProfileEdit;
  note: NovelistNote | null;
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [text, setText] = useState(note?.text ?? "");
  const [color, setColor] = useState<string | null>(note?.color ?? null);
  const [emoji, setEmoji] = useState<string | null>(note?.emoji ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setText(note?.text ?? "");
    setColor(note?.color ?? null);
    setEmoji(note?.emoji ?? null);
    setError(null);
  }, [note, visible]);

  const trimmed = text.trim();
  const changed =
    trimmed !== (note?.text ?? "") ||
    color !== (note?.color ?? null) ||
    emoji !== (note?.emoji ?? null);

  const save = async () => {
    if (busy || !changed) return;
    setBusy(true);
    setError(null);
    const ok = trimmed
      ? await edit.setNote(trimmed, color, emoji)
      : await edit.removeNote();
    setBusy(false);
    if (!ok) {
      setError("Could not save your note. Try again.");
      return;
    }
    onClose();
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={changed}
      error={error}
      maxHeightRatio={0.88}
      onClose={onClose}
      onConfirm={() => void save()}
      title="Edit your note"
      visible={visible}
    >
      <View style={styles.previewRow}>
        <View
          style={[
            styles.preview,
            { backgroundColor: color ?? theme.accent.tintStrong },
          ]}
        >
          <Text
            numberOfLines={3}
            style={[
              styles.previewText,
              {
                color: color ? "#ffffff" : theme.text,
                opacity: trimmed ? 1 : 0.6,
              },
            ]}
          >
            {trimmed || "Your note preview"}
          </Text>
          {emoji ? (
            <View
              style={[
                styles.previewEmoji,
                getNoteEmojiRotate(emoji) && styles.tilted,
              ]}
            >
              <NoteEmojiIcon emojiKey={emoji} size={26} />
            </View>
          ) : null}
        </View>
      </View>

      <TextField
        autoFocus
        counterMax={NOTE_MAX}
        label="Note"
        maxLength={NOTE_MAX}
        multiline
        onChangeText={(value) => setText(value.replace(/\n/g, " "))}
        placeholder="What's on your mind?"
        style={{ minHeight: 64 }}
        value={text}
      />

      <EmojiSlider onChange={setEmoji} value={emoji} visible={visible} />

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.textGray }]}>
          Color
        </Text>
        <View style={styles.swatches}>
          <Pressable
            accessibilityLabel="Theme color"
            accessibilityState={{ selected: color === null }}
            onPress={() => setColor(null)}
            style={[
              styles.swatch,
              {
                backgroundColor: theme.accent.tintStrong,
                borderColor: color === null ? theme.text : "transparent",
              },
            ]}
          >
            {color === null ? (
              <Ionicons color={theme.text} name="checkmark" size={14} />
            ) : null}
          </Pressable>
          {NOTE_COLORS.map((swatch) => (
            <Pressable
              accessibilityLabel={`Color ${swatch}`}
              accessibilityState={{ selected: color === swatch }}
              key={swatch}
              onPress={() => setColor(swatch)}
              style={[
                styles.swatch,
                {
                  backgroundColor: swatch,
                  borderColor: color === swatch ? theme.text : "transparent",
                },
              ]}
            >
              {color === swatch ? (
                <Ionicons color="#ffffff" name="checkmark" size={14} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  field: { gap: space.sm },
  fieldLabel: { fontSize: fontSize.label },
  preview: {
    borderRadius: radius.lg,
    maxWidth: "88%",
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  /** Web's `NotePreviewEmoji`: over the bubble's top-right corner. */
  previewEmoji: { position: "absolute", right: -12, top: -16 },
  previewRow: { alignItems: "center", paddingTop: space.m },
  previewText: {
    fontSize: fontSize.label,
    lineHeight: 18,
    textAlign: "center",
  },
  swatch: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  tilted: { transform: [{ rotate: "45deg" }] },
});
