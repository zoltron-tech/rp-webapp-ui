import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import type { StoryNote, StoryNoteType } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListStatus } from "@/components/list-status";
import { SearchField } from "@/components/search-field";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { PillButton } from "@/components/settings";
import {
  Ballot,
  NoteEditor,
  PollSheet,
  votesLabel,
} from "@/components/story/note-sheets";
import { Text } from "@/components/text";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useStory } from "@/hooks/use-story";
import { useStoryNotes } from "@/hooks/use-story-notes";
import { asColor, withAlpha } from "@/lib/color";
import { isStoryMember, plainText } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The story's sticky notes — web's `StoryNotesView`, a shared corkboard for its
 * co-authors: plot holes, continuity, things owed to one another. The notes are
 * not part of the story, so the whole screen is members-only, reads included.
 *
 * A sticky is a note or a poll: the same card, plus a ballot on which every
 * co-author gets one vote.
 *
 * Moving a card along the board is an arrow in its sheet, because a long-press
 * drag across a scrolling grid fights the scroll. As on web, moving is offered
 * only when what is on screen is the board order: not while searching and not
 * in the Archive, where it would reorder notes the reader cannot see.
 */

type Tab = "archive" | "board";

export default function NotesScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const story = useStory(storyId);
  const { novelist, status } = useSession();
  const canEdit =
    status === "signed-in" && isStoryMember(story.data, novelist?.username);
  const board = useStoryNotes(storyId, canEdit);

  const [tab, setTab] = useState<Tab>("board");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{
    note: StoryNote | null;
    type: StoryNoteType;
  } | null>(null);
  const [poll, setPoll] = useState<StoryNote | null>(null);

  const visible = useMemo(() => {
    const wanted = tab === "archive";
    const needle = query.trim().toLowerCase();
    return board.notes.filter((note) => {
      if (note.isArchived !== wanted) return false;
      if (!needle) return true;
      const ballot = (note.pollOptions ?? [])
        .map((option) => option.label)
        .join(" ");
      return `${note.title ?? ""} ${plainText(note.content)} ${ballot}`
        .toLowerCase()
        .includes(needle);
    });
  }, [board.notes, query, tab]);

  const pinned = visible.filter((note) => note.isPinned);
  const others = visible.filter((note) => !note.isPinned);
  const sortable = tab === "board" && query.trim().length === 0;
  const archivedCount = board.notes.filter((note) => note.isArchived).length;

  /** One place along its own half; the rest of the board keeps its order. */
  const move = useCallback(
    (note: StoryNote, by: -1 | 1) => {
      const live = board.notes.find((item) => item.id === note.id) ?? note;
      const section = board.notes.filter(
        (item) => !item.isArchived && item.isPinned === live.isPinned,
      );
      const from = section.findIndex((item) => item.id === live.id);
      const to = from + by;
      if (from < 0 || to < 0 || to >= section.length) return;
      const moved = [...section];
      [moved[from], moved[to]] = [moved[to], moved[from]];
      const other = board.notes.filter(
        (item) => !item.isArchived && item.isPinned !== live.isPinned,
      );
      const archived = board.notes.filter((item) => item.isArchived);
      void board
        .reorder([
          ...(live.isPinned ? moved : other),
          ...(live.isPinned ? other : moved),
          ...archived,
        ])
        .then((ok) => {
          if (!ok) Alert.alert("Not saved", "Could not save that order.");
        });
    },
    [board],
  );

  const openNote = useCallback((note: StoryNote) => {
    if (note.noteType === "POLL") setPoll(note);
    else setEditor({ note, type: "NOTE" });
  }, []);

  const pull = usePullToRefresh(board.refetch);

  if (story.data && !canEdit) {
    return (
      <View style={[styles.fill, styles.denied]}>
        <Text style={[styles.empty, { color: theme.textGray }]}>
          Notes are for this story's co-authors.
        </Text>
      </View>
    );
  }

  const section = (title: string | null, list: StoryNote[]) =>
    list.length === 0 ? null : (
      <View style={styles.section}>
        {title ? (
          <Text style={[styles.sectionTitle, { color: theme.textGray }]}>
            {title}
          </Text>
        ) : null}
        <View style={styles.grid}>
          {list.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={openNote} />
          ))}
        </View>
      </View>
    );

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            onRefresh={pull.onRefresh}
            refreshing={pull.refreshing}
            tintColor={theme.accent.solid}
          />
        }
      >
        <SegmentedTabs<Tab>
          onChange={setTab}
          options={[
            { label: "Board", value: "board" },
            {
              label: archivedCount > 0 ? `Archive ${archivedCount}` : "Archive",
              value: "archive",
            },
          ]}
          value={tab}
        />
        <SearchField
          onChangeText={setQuery}
          placeholder="Search notes"
          value={query}
        />
        <View style={styles.tools}>
          <PillButton
            icon="add"
            label="New note"
            onPress={() => setEditor({ note: null, type: "NOTE" })}
            tone="accent"
          />
          <PillButton
            icon="stats-chart-outline"
            label="New poll"
            onPress={() => setEditor({ note: null, type: "POLL" })}
          />
        </View>

        {board.isPending || board.error ? (
          <ListStatus
            error={board.error}
            loading={board.isPending}
            onRetry={() => void board.refetch()}
          />
        ) : visible.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            {query.trim()
              ? "No notes match that."
              : tab === "archive"
                ? "Nothing archived."
                : "No notes yet. Plot holes, continuity, things owed to a co-author: they all go here."}
          </Text>
        ) : (
          <>
            {section(pinned.length > 0 ? "Pinned" : null, pinned)}
            {section(pinned.length > 0 ? "Others" : null, others)}
          </>
        )}
      </ScrollView>

      <NoteEditor
        board={board}
        initialType={editor?.type ?? "NOTE"}
        note={editor?.note ?? null}
        onClose={() => setEditor(null)}
        onMove={sortable ? move : undefined}
        storyId={storyId}
        visible={editor !== null}
      />
      <PollSheet
        board={board}
        note={poll}
        onClose={() => setPoll(null)}
        onEdit={(note) => {
          setPoll(null);
          setEditor({ note, type: "POLL" });
        }}
        onMove={sortable ? move : undefined}
      />
    </View>
  );
}

const NoteCard = ({
  note,
  onOpen,
}: {
  note: StoryNote;
  onOpen: (note: StoryNote) => void;
}) => {
  const theme = useAppTheme();
  const color = asColor(note.color);
  const body = plainText(note.content);
  const isPoll = note.noteType === "POLL";

  return (
    <Pressable
      accessibilityLabel={note.title || body || "Note"}
      accessibilityRole="button"
      onPress={() => onOpen(note)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: color
            ? withAlpha(color, pressed ? 0.22 : 0.15)
            : pressed
              ? theme.material.fillPressed
              : theme.material.fill,
          borderColor: color ? withAlpha(color, 0.42) : theme.material.edge,
        },
      ]}
    >
      <View style={styles.cardHead}>
        {note.title ? (
          <Text
            numberOfLines={2}
            style={[styles.cardTitle, { color: theme.text }]}
          >
            {note.title}
          </Text>
        ) : (
          <View style={styles.grow} />
        )}
        {note.isPinned ? (
          <Ionicons color={theme.accent.text} name="pin" size={14} />
        ) : null}
        {isPoll && note.isPollClosed ? (
          <Ionicons color={theme.textGray} name="lock-closed" size={14} />
        ) : null}
      </View>
      {body ? (
        <Text
          numberOfLines={isPoll ? 2 : 6}
          style={[styles.cardBody, { color: theme.textGray }]}
        >
          {body}
        </Text>
      ) : null}
      {isPoll ? (
        <>
          <Ballot limit={3} note={note} />
          <Text style={[styles.cardMeta, { color: theme.textGray }]}>
            {votesLabel(note.totalVotes ?? 0)}
          </Text>
        </>
      ) : null}
      {note.createdByName ? (
        <Text
          numberOfLines={1}
          style={[styles.cardMeta, { color: theme.textGray }]}
        >
          {note.createdByName}
          {note.modifiedAt ? ` · ${toFormattedDate(note.modifiedAt)}` : ""}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.xs,
    padding: space.m,
    width: "100%",
  },
  cardBody: { fontSize: fontSize.label, lineHeight: 19 },
  cardHead: { alignItems: "flex-start", flexDirection: "row", gap: space.xs },
  cardMeta: { fontSize: fontSize.meta },
  cardTitle: { flex: 1, fontSize: fontSize.body, fontWeight: "700" },
  content: { gap: space.m, padding: space.md },
  denied: { alignItems: "center", justifyContent: "center", padding: space.xl },
  empty: {
    fontSize: fontSize.body,
    lineHeight: 21,
    padding: space.md,
    textAlign: "center",
  },
  fill: { flex: 1 },
  grid: { gap: space.sm },
  grow: { flex: 1 },
  section: { gap: space.sm },
  sectionTitle: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  tools: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
