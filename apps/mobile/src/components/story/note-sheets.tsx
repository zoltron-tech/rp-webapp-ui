import { Ionicons } from "@expo/vector-icons";
import type { StoryNote, StoryNotePollOption, StoryNoteType } from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { IconButton } from "@/components/icon-button";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import {
  Choice,
  DangerRow,
  FieldLabel,
  Hint,
  useFieldStyle,
} from "@/components/story/form-bits";
import { RichFieldEditor } from "@/components/story/rich-field-editor";
import { StoryProse } from "@/components/story/story-prose";
import { Text, TextInput } from "@/components/text";
import type { StoryNotes } from "@/hooks/use-story-notes";
import { withAlpha } from "@/lib/color";
import { plainText } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A sticky, read and written — web's `NoteSheet` and `Ballot`.
 *
 * A note opens straight in its editor. A poll opens as its ballot, because
 * voting is what most people came to do, and its editor is one step further.
 * Web's reader and editor share one sheet; two are simpler here.
 */

/** Web's `NOTE_COLORS`. Null is the plain sticky. */
export const NOTE_COLORS: { hex: string | null; label: string }[] = [
  { hex: null, label: "Plain" },
  { hex: "#e5484d", label: "Coral" },
  { hex: "#f76b15", label: "Peach" },
  { hex: "#ffb224", label: "Sand" },
  { hex: "#46a758", label: "Fern" },
  { hex: "#12a594", label: "Sage" },
  { hex: "#0091ff", label: "Tide" },
  { hex: "#6e56cf", label: "Dusk" },
  { hex: "#e93d82", label: "Blossom" },
];

const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 10;
const MAX_POLL_OPTION_LABEL = 120;

export const inBallotOrder = (options: StoryNotePollOption[] | undefined) =>
  [...(options ?? [])].sort((a, b) => a.ordinal - b.ordinal);

export const votesLabel = (total: number) =>
  total === 1 ? "1 vote" : `${total} votes`;

const confirmDelete = (isPoll: boolean, run: () => void) =>
  Alert.alert(
    isPoll ? "Delete this poll?" : "Delete this note?",
    "It is removed for everyone in this story.",
    [
      { style: "cancel", text: "Cancel" },
      { onPress: run, style: "destructive", text: "Delete" },
    ],
  );

/** A poll's choices, each filled to its share. The count is always in words. */
export const Ballot = ({
  disabled,
  limit,
  note,
  onVote,
}: {
  disabled?: boolean;
  /** The card has room for a few rows, not a long ballot. */
  limit?: number;
  note: StoryNote;
  /** Omitted where the ballot is only being shown. */
  onVote?: (optionId: string) => void;
}) => {
  const theme = useAppTheme();
  const ordered = inBallotOrder(note.pollOptions);
  const shown = limit ? ordered.slice(0, limit) : ordered;
  const hidden = ordered.length - shown.length;
  const total = note.totalVotes ?? 0;

  return (
    <View style={styles.ballot}>
      {shown.map((option) => {
        const mine = Boolean(option.id) && option.id === note.myVoteOptionId;
        const share = total > 0 ? option.voteCount / total : 0;
        return (
          <Pressable
            accessibilityLabel={`${option.label}, ${votesLabel(option.voteCount)}${
              mine ? ", your vote" : ""
            }`}
            accessibilityRole={onVote ? "radio" : undefined}
            accessibilityState={{ checked: mine }}
            disabled={disabled || !onVote || !option.id}
            key={option.id ?? option.label}
            onPress={() => option.id && onVote?.(option.id)}
            style={[
              styles.choice,
              {
                backgroundColor: theme.material.fill,
                borderColor: mine ? theme.accent.solid : theme.material.edge,
              },
            ]}
          >
            <View
              style={[
                styles.choiceBar,
                {
                  backgroundColor: withAlpha(
                    theme.accent.solid,
                    mine ? 0.3 : 0.16,
                  ),
                  width: `${share * 100}%`,
                },
              ]}
            />
            {mine ? (
              <Ionicons color={theme.accent.text} name="checkmark" size={14} />
            ) : null}
            <Text
              numberOfLines={2}
              style={[styles.choiceLabel, { color: theme.text }]}
            >
              {option.label}
            </Text>
            {onVote
              ? option.voters
                  .slice(0, 3)
                  .map((voter) => (
                    <Avatar
                      key={voter.id}
                      name={voter.name}
                      size={18}
                      uri={voter.image}
                    />
                  ))
              : null}
            <Text style={[styles.choiceCount, { color: theme.textGray }]}>
              {option.voteCount}
            </Text>
          </Pressable>
        );
      })}
      {hidden > 0 ? (
        <Text style={[styles.more, { color: theme.textGray }]}>
          {`+${hidden} more ${hidden === 1 ? "choice" : "choices"}`}
        </Text>
      ) : null}
    </View>
  );
};

/** Pin, archive, and move along the board: what every sticky can do. */
const NoteActions = ({
  board,
  note,
  onMove,
}: {
  board: StoryNotes;
  note: StoryNote;
  /** Absent where the board order is not on screen. */
  onMove?: (note: StoryNote, by: -1 | 1) => void;
}) => {
  const flag = (flags: Parameters<StoryNotes["setFlags"]>[1]) => {
    if (!note.id) return;
    void board.setFlags(note.id, flags).then((saved) => {
      if (!saved) Alert.alert("Not saved", "Could not update that. Try again.");
    });
  };

  return (
    <View style={styles.actions}>
      {note.isArchived ? null : (
        <PillButton
          icon={note.isPinned ? "pin" : "pin-outline"}
          label={note.isPinned ? "Unpin" : "Pin"}
          onPress={() => flag({ isPinned: !note.isPinned })}
        />
      )}
      <PillButton
        icon="archive-outline"
        label={note.isArchived ? "Unarchive" : "Archive"}
        onPress={() => flag({ isArchived: !note.isArchived })}
      />
      {onMove ? (
        <>
          <IconButton
            accessibilityLabel="Move earlier on the board"
            icon="arrow-back"
            onPress={() => onMove(note, -1)}
            size={36}
          />
          <IconButton
            accessibilityLabel="Move later on the board"
            icon="arrow-forward"
            onPress={() => onMove(note, 1)}
            size={36}
          />
        </>
      ) : null}
    </View>
  );
};

/** A poll, to vote on. */
export const PollSheet = ({
  board,
  note,
  onClose,
  onEdit,
  onMove,
}: {
  board: StoryNotes;
  /** Null closes the sheet. */
  note: StoryNote | null;
  onClose: () => void;
  onEdit: (note: StoryNote) => void;
  onMove?: (note: StoryNote, by: -1 | 1) => void;
}) => {
  const theme = useAppTheme();
  const [shown, setShown] = useState(note);
  useEffect(() => {
    if (note) setShown(note);
  }, [note]);

  const live = board.notes.find((item) => item.id === shown?.id) ?? shown;
  const open = live && !live.isPollClosed && !live.isArchived;

  const vote = (optionId: string) => {
    if (!live?.id) return;
    void board.vote(live.id, optionId).then((saved) => {
      if (!saved) Alert.alert("Not saved", "Could not record that vote.");
    });
  };

  const retract = () => {
    if (!live?.id) return;
    void board.retractVote(live.id).then((saved) => {
      if (!saved) Alert.alert("Not saved", "Could not take that vote back.");
    });
  };

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      subtitle={live ? votesLabel(live.totalVotes ?? 0) : undefined}
      title={live?.title || "Poll"}
      visible={note !== null}
    >
      {live ? (
        <ScrollView contentContainerStyle={styles.pollBody}>
          {live.content ? <StoryProse html={live.content} /> : null}
          <Ballot
            disabled={board.pending}
            note={live}
            onVote={open ? vote : undefined}
          />
          {live.isPollClosed ? (
            <Hint>This poll is closed. The results stay readable.</Hint>
          ) : null}
          {open && live.myVoteOptionId ? (
            <Pressable accessibilityRole="button" onPress={retract}>
              <Text style={[styles.retract, { color: theme.accent.text }]}>
                Take my vote back
              </Text>
            </Pressable>
          ) : null}
          <NoteActions board={board} note={live} onMove={onMove} />
          <View style={styles.actions}>
            <PillButton
              icon={
                live.isPollClosed ? "lock-open-outline" : "lock-closed-outline"
              }
              label={live.isPollClosed ? "Reopen poll" : "Close poll"}
              onPress={() =>
                live.id &&
                void board.setFlags(live.id, {
                  isPollClosed: !live.isPollClosed,
                })
              }
            />
            <PillButton
              icon="create-outline"
              label="Edit poll"
              onPress={() => onEdit(live)}
            />
          </View>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

interface DraftOption {
  id: string | null;
  key: string;
  label: string;
}

let seed = 0;
const draftOption = (label = "", id: string | null = null): DraftOption => {
  seed += 1;
  return { id, key: `option-${seed}`, label };
};

/** Write a note or a poll. Ids go back untouched: they keep cast votes. */
export const NoteEditor = ({
  board,
  initialType,
  note,
  onClose,
  onMove,
  storyId,
  visible,
}: {
  board: StoryNotes;
  /** What a brand-new sticky starts as. */
  initialType: StoryNoteType;
  /** Null when creating. */
  note: StoryNote | null;
  onClose: () => void;
  onMove?: (note: StoryNote, by: -1 | 1) => void;
  /** The story, where pictures in the note are stored. */
  storyId: string | undefined;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const noteType = note ? (note.noteType ?? "NOTE") : initialType;
  const isPoll = noteType === "POLL";

  useEffect(() => {
    if (!visible) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setColor(note?.color ?? null);
    setOptions(
      note?.pollOptions?.length
        ? inBallotOrder(note.pollOptions).map((option) =>
            draftOption(option.label, option.id),
          )
        : [draftOption(), draftOption()],
    );
    setError(null);
  }, [note, visible]);

  const trimmed = title.trim();
  const preview = plainText(content);

  // Blank lines drop, and no two choices worded the same: they split the vote.
  const labels = useMemo(
    () =>
      options
        .map((option) => option.label.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    [options],
  );
  const distinct = new Set(labels.map((label) => label.toLowerCase())).size;
  const ballotReady =
    distinct >= MIN_POLL_OPTIONS && distinct <= MAX_POLL_OPTIONS;
  const isBlank = isPoll
    ? !trimmed || !ballotReady
    : !trimmed && !preview && !content.includes("<img");

  const live = board.notes.find((item) => item.id === note?.id) ?? note;

  const save = async () => {
    const saved = await board.save({
      color,
      content: preview || content.includes("<img") ? content : null,
      id: note?.id ?? null,
      isArchived: live?.isArchived ?? false,
      isPinned: live?.isPinned ?? false,
      isPollClosed: live?.isPollClosed ?? false,
      noteType,
      pollOptions: isPoll
        ? options
            .map((option) => ({
              ...option,
              label: option.label.trim().replace(/\s+/g, " "),
            }))
            .filter((option) => option.label.length > 0)
            .map((option, index) => ({
              id: option.id,
              label: option.label,
              ordinal: index,
              // Server-derived; sent only to satisfy the shape.
              voteCount: 0,
              voters: [],
            }))
        : [],
      title: trimmed || null,
    });
    if (saved) onClose();
    else
      setError(
        `Could not save that ${isPoll ? "poll" : "note"}. Please try again.`,
      );
  };

  const remove = () => {
    if (!note?.id) return;
    const id = note.id;
    confirmDelete(isPoll, () => {
      onClose();
      void board.remove(id).then((ok) => {
        if (!ok) Alert.alert("Not deleted", "Please try again.");
      });
    });
  };

  return (
    <FormSheet
      busy={board.pending}
      canConfirm={!isBlank}
      error={error}
      fill
      maxHeightRatio={0.88}
      onClose={onClose}
      onConfirm={() => void save()}
      title={
        note
          ? isPoll
            ? "Edit poll"
            : "Edit note"
          : isPoll
            ? "New poll"
            : "New note"
      }
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel>{isPoll ? "Question" : "Title"}</FieldLabel>
        <TextInput
          accessibilityLabel={isPoll ? "Question" : "Title"}
          maxLength={120}
          onChangeText={setTitle}
          placeholder={
            isPoll
              ? "Which ending do we write?"
              : "Optional: Continuity, Mira's scar"
          }
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={title}
        />

        {isPoll ? (
          <>
            <FieldLabel>Choices</FieldLabel>
            {options.map((option, index) => (
              <View key={option.key} style={styles.option}>
                <TextInput
                  accessibilityLabel={`Choice ${index + 1}`}
                  maxLength={MAX_POLL_OPTION_LABEL}
                  onChangeText={(label) =>
                    setOptions((current) =>
                      current.map((item) =>
                        item.key === option.key ? { ...item, label } : item,
                      ),
                    )
                  }
                  placeholder={`Choice ${index + 1}`}
                  placeholderTextColor={theme.textGray}
                  style={[fieldStyle, styles.optionField]}
                  value={option.label}
                />
                <IconButton
                  accessibilityLabel={`Remove choice ${index + 1}`}
                  disabled={options.length <= MIN_POLL_OPTIONS}
                  icon="close"
                  onPress={() =>
                    setOptions((current) =>
                      current.filter((item) => item.key !== option.key),
                    )
                  }
                  size={32}
                />
              </View>
            ))}
            {options.length < MAX_POLL_OPTIONS ? (
              <PillButton
                icon="add"
                label="Add a choice"
                onPress={() =>
                  setOptions((current) => [...current, draftOption()])
                }
              />
            ) : null}
          </>
        ) : null}

        <FieldLabel>{isPoll ? "Context" : "Note"}</FieldLabel>
        <Pressable
          accessibilityLabel="Edit the text"
          accessibilityRole="button"
          onPress={() => setWriting(true)}
          style={({ pressed }) => [
            styles.prose,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text
            numberOfLines={3}
            style={[
              styles.proseText,
              { color: preview ? theme.text : theme.textGray },
            ]}
          >
            {preview ||
              (isPoll
                ? "Anything your co-authors need in order to answer…"
                : "Anything your co-authors should know…")}
          </Text>
          <Ionicons color={theme.textGray} name="create-outline" size={18} />
        </Pressable>

        <FieldLabel>Colour</FieldLabel>
        <View style={styles.colors}>
          {NOTE_COLORS.map((option) => (
            <Choice
              active={color === option.hex}
              color={option.hex ?? undefined}
              key={option.label}
              label={option.label}
              onPress={() => setColor(option.hex)}
            />
          ))}
        </View>

        {note && live && !isPoll ? (
          <NoteActions board={board} note={live} onMove={onMove} />
        ) : null}
        {note ? (
          <DangerRow
            label={isPoll ? "Delete poll" : "Delete note"}
            onPress={remove}
          />
        ) : null}
      </ScrollView>

      <RichFieldEditor
        html={content}
        onClose={() => setWriting(false)}
        onDone={(html) => {
          setContent(html);
          setWriting(false);
        }}
        placeholder="Anything your co-authors should know…"
        storyboardId={storyId}
        title={isPoll ? "Context" : "Note"}
        visible={writing}
      />
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  ballot: { gap: space.xs },
  choice: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    minHeight: 40,
    overflow: "hidden",
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  choiceBar: { bottom: 0, left: 0, position: "absolute", top: 0 },
  choiceCount: { fontSize: fontSize.caption, fontWeight: "700" },
  choiceLabel: { flex: 1, fontSize: fontSize.label },
  colors: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  form: { gap: space.sm, paddingBottom: space.xl },
  more: { fontSize: fontSize.caption },
  option: { alignItems: "center", flexDirection: "row", gap: space.xs },
  optionField: { flex: 1, minWidth: 0 },
  pollBody: {
    gap: space.m,
    paddingBottom: space.xl,
    paddingHorizontal: space.md,
  },
  prose: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 64,
    padding: space.m,
  },
  proseText: { flex: 1, fontSize: fontSize.label, lineHeight: 19 },
  retract: { fontSize: fontSize.label, fontWeight: "700" },
});
