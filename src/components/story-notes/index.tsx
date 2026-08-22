"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { StoryNote, StoryNoteType } from "@nw/types";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import {
  LuArchive,
  LuChartBar,
  LuNotebookPen,
  LuSearch,
  LuStickyNote,
} from "react-icons/lu";
import {
  deleteStoryNoteAction,
  getStoryNotesAction,
  reorderStoryNotesAction,
  retractStoryNotePollVoteAction,
  saveStoryNoteAction,
  setStoryNoteFlagsAction,
  voteOnStoryNotePollAction,
} from "@/app/rp/story/actions";
import { useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import { toPlainText } from "@/utils/rich-text";
import { NoteCard } from "./note-card";
import { NoteSheet } from "./note-sheet";
import * as S from "./styles";

/** A note that has come back from the server, so it has an id to sort by. */
type SavedNote = StoryNote & { id: string };

const hasId = (note: StoryNote): note is SavedNote => Boolean(note.id);

type Props = {
  storyboardId: string;
  /** Members-only view — the workspace never mounts it for anyone else. */
  canEdit: boolean;
};

/**
 * The storyboard's sticky notes — a shared corkboard for its co-authors, in
 * the spirit of Google Keep.
 *
 * The notes themselves are not part of the story: they are working material
 * (plot holes, continuity reminders, things owed to another author), so the
 * whole view is members-only, reads included. `notes` is held in board order,
 * which is what a drag rewrites.
 *
 * A sticky is either a note or a poll. A poll is the board asking rather than
 * telling — the same card, the same pin/archive/drag/delete, plus a ballot
 * every co-author gets exactly one vote on.
 */
export const StoryNotesView: FC<Props> = ({ storyboardId, canEdit }) => {
  const { errorToast, successToast } = useUIContext();

  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"board" | "archive">("board");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<{
    open: boolean;
    note: StoryNote | null;
    /** What a brand-new sticky starts as; ignored when a note is open. */
    type: StoryNoteType;
  }>({
    note: null,
    open: false,
    type: "NOTE",
  });
  /** Held while a vote is in flight, so a double tap can't race itself. */
  const [voting, setVoting] = useState(false);

  const closeSheet = useCallback(
    () => setSheet({ note: null, open: false, type: "NOTE" }),
    [],
  );

  const compose = useCallback(
    (type: StoryNoteType) => setSheet({ note: null, open: true, type }),
    [],
  );

  const load = useCallback(async () => {
    const result = await getStoryNotesAction(storyboardId);
    setLoading(false);
    if (!result || "message" in result) return;
    setNotes(result.filter(hasId));
  }, [storyboardId]);

  useEffect(() => {
    if (!canEdit) return;
    load();
  }, [canEdit, load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // A long-press starts the drag, so a plain tap still opens the note.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const archivedCount = useMemo(
    () => notes.filter((note) => note.isArchived).length,
    [notes],
  );

  const visible = useMemo(() => {
    const wanted = tab === "archive";
    const needle = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (note.isArchived !== wanted) return false;
      if (!needle) return true;
      // A poll's ballot is as searchable as a note's body — "the lighthouse"
      // should find the poll that offers it.
      const ballot = (note.pollOptions ?? [])
        .map((option) => option.label)
        .join(" ");
      const haystack = `${note.title ?? ""} ${toPlainText(note.content)} ${ballot}`;
      return haystack.toLowerCase().includes(needle);
    });
  }, [notes, tab, query]);

  const pinned = useMemo(
    () => visible.filter((note) => note.isPinned),
    [visible],
  );
  const others = useMemo(
    () => visible.filter((note) => !note.isPinned),
    [visible],
  );

  /**
   * Dragging is only offered when what is on screen *is* the board order.
   * While searching, or in the Archive tab, the cards on screen are a subset —
   * a drag there would silently reorder notes the author cannot see.
   */
  const sortable = tab === "board" && query.trim().length === 0;

  // ── Board order ──────────────────────────────────────────────────────────

  /**
   * Commits a drag. The server takes the board's *complete* order, so the
   * untouched halves — the other section, and everything archived — are
   * carried along in the order they already had.
   */
  const commitOrder = useCallback(
    async (nextPinned: SavedNote[], nextOthers: SavedNote[]) => {
      const previous = notes;
      const archived = notes.filter((note) => note.isArchived);
      const reordered = [...nextPinned, ...nextOthers, ...archived];
      // Restage locally so the card lands where it was dropped, at once.
      setNotes(reordered);

      const result = await reorderStoryNotesAction(
        storyboardId,
        reordered.map((note) => note.id),
      );
      if (!result || "message" in result) {
        setNotes(previous);
        errorToast("Could not save that order. Please try again.");
        return;
      }
      setNotes(result.filter(hasId));
    },
    [notes, storyboardId, errorToast],
  );

  const handleDragEnd = useCallback(
    (section: "pinned" | "others") =>
      ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        const list = section === "pinned" ? pinned : others;
        const from = list.findIndex((note) => note.id === active.id);
        const to = list.findIndex((note) => note.id === over.id);
        if (from < 0 || to < 0) return;
        const moved = arrayMove(list, from, to);
        commitOrder(
          section === "pinned" ? moved : pinned,
          section === "pinned" ? others : moved,
        );
      },
    [pinned, others, commitOrder],
  );

  // ── Notes ────────────────────────────────────────────────────────────────

  /** Folds a saved note back into the board, in place if it was already there. */
  const mergeSaved = useCallback((saved: StoryNote) => {
    if (!hasId(saved)) return;
    // An open sheet is reading this note — archiving from its header has to
    // show in the sheet too, not only on the card behind it.
    setSheet((current) =>
      current.open && current.note?.id === saved.id
        ? { ...current, note: saved }
        : current,
    );
    setNotes((current) => {
      const exists = current.some((note) => note.id === saved.id);
      // A new note goes to the head of the board, matching the ordinal the
      // server hands it.
      return exists
        ? current.map((note) => (note.id === saved.id ? saved : note))
        : [saved, ...current];
    });
  }, []);

  const handleSave = async (note: StoryNote) => {
    const isPoll = note.noteType === "POLL";
    const saved = await saveStoryNoteAction(storyboardId, note);
    if (!saved || "message" in saved) {
      errorToast(
        isPoll
          ? "Could not save that poll. Please try again."
          : "Could not save that note. Please try again.",
      );
      return;
    }
    mergeSaved(saved);
    closeSheet();
  };

  const handleDelete = async (note: StoryNote) => {
    if (!note.id) return;
    const isPoll = note.noteType === "POLL";
    const result = await deleteStoryNoteAction(note.id);
    if (result.message !== API_MESSAGE.Success) {
      errorToast(
        isPoll
          ? "Could not delete that poll. Please try again."
          : "Could not delete that note. Please try again.",
      );
      return;
    }
    setNotes((current) =>
      current.filter((candidate) => candidate.id !== note.id),
    );
    closeSheet();
    successToast(isPoll ? "Poll deleted." : "Note deleted.");
  };

  /** Pin, archive and closing a poll go through the flags route — a toggle
   *  never resends the note's rich-text body or its ballot. */
  const setFlags = async (
    note: StoryNote,
    flags: { isArchived?: boolean; isPinned?: boolean; isPollClosed?: boolean },
  ) => {
    if (!note.id) return;
    const saved = await setStoryNoteFlagsAction(note.id, flags);
    if (!saved || "message" in saved) {
      errorToast("Could not update that note. Please try again.");
      return;
    }
    mergeSaved(saved);
  };

  const handleTogglePin = (note: StoryNote) =>
    setFlags(note, { isPinned: !note.isPinned });

  const handleToggleArchive = (note: StoryNote) =>
    setFlags(note, { isArchived: !note.isArchived });

  const handleTogglePollClosed = (note: StoryNote) =>
    setFlags(note, { isPollClosed: !note.isPollClosed });

  // ── Voting ───────────────────────────────────────────────────────────────
  // Every co-author gets one vote, and the server keeps it that way: voting
  // again moves the vote they already have, so there is nothing to retract
  // first and nothing to reconcile here beyond folding the poll back in.

  const handleVote = async (note: StoryNote, optionId: string) => {
    if (!note.id || voting) return;
    setVoting(true);
    const saved = await voteOnStoryNotePollAction(note.id, optionId);
    setVoting(false);
    if (!saved || "message" in saved) {
      errorToast("Could not record that vote. Please try again.");
      return;
    }
    mergeSaved(saved);
  };

  const handleRetractVote = async (note: StoryNote) => {
    if (!note.id || voting) return;
    setVoting(true);
    const saved = await retractStoryNotePollVoteAction(note.id);
    setVoting(false);
    if (!saved || "message" in saved) {
      errorToast("Could not take that vote back. Please try again.");
      return;
    }
    mergeSaved(saved);
  };

  if (!canEdit) return null;

  const renderGrid = (section: "pinned" | "others", list: SavedNote[]) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd(section)}
    >
      <SortableContext
        items={list.map((note) => note.id)}
        strategy={rectSortingStrategy}
      >
        <S.Grid>
          {list.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              sortable={sortable}
              onOpen={(opened) =>
                setSheet({ note: opened, open: true, type: "NOTE" })
              }
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </S.Grid>
      </SortableContext>
    </DndContext>
  );

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Notes</S.Title>
        <S.Spacer />
        <S.ToolButton
          type="button"
          aria-pressed={tab === "archive"}
          title={
            tab === "archive"
              ? "Back to the board"
              : "Notes you have archived off the board"
          }
          onClick={() => setTab(tab === "archive" ? "board" : "archive")}
        >
          {tab === "archive" ? (
            <LuStickyNote size={14} />
          ) : (
            <LuArchive size={14} />
          )}
          {tab === "archive" ? "Board" : "Archive"}
          {tab === "board" && archivedCount > 0 && ` (${archivedCount})`}
        </S.ToolButton>
        <S.ToolButton
          type="button"
          $primary
          title="Add a note"
          onClick={() => compose("NOTE")}
        >
          <IoMdAdd size={16} />
          New note
        </S.ToolButton>
      </S.HeaderRow>

      <S.HeaderRow>
        <S.SearchRow>
          <LuSearch size={14} />
          <S.SearchInput
            type="search"
            value={query}
            placeholder="Search these notes"
            aria-label="Search these notes"
            onChange={(e) => setQuery(e.target.value)}
          />
        </S.SearchRow>
      </S.HeaderRow>

      {tab === "board" && (
        <S.ComposerRow>
          <S.Composer type="button" onClick={() => compose("NOTE")}>
            <LuNotebookPen size={15} />
            Take a note…
          </S.Composer>
          {/* A poll is the same sticky asking a question, so it starts from
              the same bar rather than a surface of its own. */}
          <S.ComposerAction
            type="button"
            aria-label="Ask the co-authors a poll"
            title="New poll"
            onClick={() => compose("POLL")}
          >
            <LuChartBar size={17} />
          </S.ComposerAction>
        </S.ComposerRow>
      )}

      {loading ? (
        <S.Grid aria-busy="true" aria-label="Loading the notes">
          <S.Skeleton />
          <S.Skeleton />
          <S.Skeleton />
        </S.Grid>
      ) : visible.length === 0 ? (
        <S.Empty>
          {query.trim().length > 0
            ? "No notes match that search."
            : tab === "archive"
              ? "Nothing archived. Notes you archive off the board land here."
              : "No notes yet. Anything you and your co-authors need to remember about this story goes here — it stays between you."}
          {query.trim().length === 0 && tab === "board" && (
            <S.HeaderRow>
              <S.ToolButton
                type="button"
                $primary
                onClick={() => compose("NOTE")}
              >
                <IoMdAdd size={16} />
                Write the first note
              </S.ToolButton>
              <S.ToolButton type="button" onClick={() => compose("POLL")}>
                <LuChartBar size={15} />
                Ask a poll
              </S.ToolButton>
            </S.HeaderRow>
          )}
        </S.Empty>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <S.SectionLabel>Pinned</S.SectionLabel>
              {renderGrid("pinned", pinned)}
            </>
          )}
          {others.length > 0 && (
            <>
              {pinned.length > 0 && <S.SectionLabel>Others</S.SectionLabel>}
              {renderGrid("others", others)}
            </>
          )}
        </>
      )}

      <NoteSheet
        open={sheet.open}
        note={sheet.note}
        initialType={sheet.type}
        voting={voting}
        onClose={closeSheet}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleArchive={handleToggleArchive}
        onTogglePollClosed={handleTogglePollClosed}
        onVote={handleVote}
        onRetractVote={handleRetractVote}
      />
    </S.Root>
  );
};
