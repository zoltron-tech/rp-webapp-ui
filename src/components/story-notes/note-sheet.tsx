"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import {
  LuArchive,
  LuArchiveRestore,
  LuChartBar,
  LuLock,
  LuLockOpen,
  LuPencil,
  LuPin,
  LuStickyNote,
  LuX,
} from "react-icons/lu";
import { MdGif } from "react-icons/md";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import type { StoryNote, StoryNoteType } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { toFormattedDate } from "@/utils/helpers";
import { toPlainText } from "@/utils/rich-text";
import { Ballot, inBallotOrder, votesLabel } from "./ballot";
import { NOTE_COLORS } from "./colors";
import * as S from "./styles";

/** Matches the other in-editor attachment flows (codex, muse about, profile). */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** Mirrors the server's ballot rules, so the save button matches the backend. */
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 10;
const MAX_POLL_OPTION_LABEL = 120;

/** Whether a body carries nothing a reader would see. Mirrors the server's
 *  own check, so the save button matches what the backend would accept. */
const isEmptyContent = (html: string) => {
  if (!html.trim()) return true;
  // A note that is only a GIF is a perfectly good note.
  if (/<(img|video|iframe)\b/i.test(html)) return false;
  return toPlainText(html).length === 0;
};

/**
 * A ballot line being written. [key] only exists to keep React's rows stable
 * while they are reordered and removed — a brand-new choice has no id until
 * the server gives it one.
 */
type DraftOption = { key: string; id: string | null; label: string };

let draftKeySeed = 0;
const blankOption = (): DraftOption => ({
  id: null,
  key: `draft-${(draftKeySeed += 1)}`,
  label: "",
});

/** An existing poll's ballot, or two empty lines to start one. */
const toDraftOptions = (note: StoryNote | null): DraftOption[] => {
  const existing = inBallotOrder(note?.pollOptions).map((option) => ({
    id: option.id,
    key: option.id ?? `draft-${(draftKeySeed += 1)}`,
    label: option.label,
  }));
  return existing.length > 0 ? existing : [blankOption(), blankOption()];
};

type Props = {
  open: boolean;
  /** Null when composing a new note. */
  note: StoryNote | null;
  /** What a brand-new sticky starts as. */
  initialType?: StoryNoteType;
  onClose: () => void;
  onSave: (note: StoryNote) => void;
  onDelete?: (note: StoryNote) => void;
  /** Archive/restore from the read-only header — goes through the flags route,
   *  so it never resends the body. */
  onToggleArchive?: (note: StoryNote) => void;
  /** Close/reopen a poll's ballot. Also the flags route. */
  onTogglePollClosed?: (note: StoryNote) => void;
  /** Casts or moves the reader's own vote. Voting again simply moves it. */
  onVote?: (note: StoryNote, optionId: string) => void;
  onRetractVote?: (note: StoryNote) => void;
  /** Held while a vote is in flight, so a double tap can't race itself. */
  voting?: boolean;
};

/**
 * The sticky note sheet — a dialog on desktop, a bottom tray on mobile.
 *
 * An existing note opens read-only: the note as written, on its own colour,
 * with edit / archive / delete in the header. Editing is the deliberate second
 * step, and a new note starts there.
 *
 * A poll is the same sheet with a ballot instead of a body: reading one *is*
 * voting on it, which is why the read-only mode is the interactive one here.
 */
export const NoteSheet: FC<Props> = ({
  open,
  note,
  initialType = "NOTE",
  onClose,
  onSave,
  onDelete,
  onToggleArchive,
  onTogglePollClosed,
  onVote,
  onRetractVote,
  voting,
}) => {
  const [mode, setMode] = useState<"view" | "edit">("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [noteType, setNoteType] = useState<StoryNoteType>("NOTE");
  const [options, setOptions] = useState<DraftOption[]>([]);
  // The rich-text editor is uncontrolled; remount it whenever the sheet opens
  // on a different note so it starts from that note's body.
  const [editorKey, setEditorKey] = useState(0);

  const { uploadMedia } = useUploadMedia();
  const { width } = useWindowDimensions();
  const isNarrow = (width ?? 1024) <= 700;
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleGifSelect = useCallback((gifUrl: string) => {
    setShowGifPicker(false);
    editorRef.current?.insertGif(gifUrl);
  }, []);

  /**
   * Attach an image into the note: a local placeholder goes in at once so the
   * author keeps writing, and the storage URL replaces it when the upload
   * lands.
   */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      input.value = "";
      if (!file) return;
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setMediaError("That file is over 10 MB.");
        return;
      }
      setMediaError(null);

      const objectUrl = URL.createObjectURL(file);
      editorRef.current?.insertUploadingImage(objectUrl);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      formData.append("prefix", "story-note");

      const url = await uploadMedia(formData);
      setUploading(false);

      if (url === API_MESSAGE.MediaError) {
        setMediaError("That attachment could not be uploaded.");
        editorRef.current?.removeImageBySrc(objectUrl);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      editorRef.current?.replaceImageSrc(objectUrl, url);
      URL.revokeObjectURL(objectUrl);
    },
    [uploadMedia],
  );

  // A saved note is read first; only a brand-new one opens in the editor.
  // Keyed on the note's id, not the object, so a flag toggle from the
  // read-only header does not knock the sheet out of the mode it is in.
  const noteId = note?.id ?? null;
  useEffect(() => {
    if (!open) return;
    setMode(noteId ? "view" : "edit");
  }, [open, noteId]);

  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setColor(note?.color ?? null);
    setIsPinned(note?.isPinned ?? false);
    setIsArchived(note?.isArchived ?? false);
    setNoteType(note ? (note.noteType ?? "NOTE") : initialType);
    setOptions(toDraftOptions(note));
    setEditorKey((key) => key + 1);
    setMediaError(null);
    setUploading(false);
    setShowGifPicker(false);
    setConfirmDelete(false);
  }, [open, note, initialType]);

  const trimmedTitle = title.trim();
  const isPollDraft = noteType === "POLL";

  // The ballot the server would actually store: blank lines dropped, and no
  // two choices worded the same (identical lines only split the vote).
  const ballotLabels = options
    .map((option) => option.label.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const distinctLabels = new Set(
    ballotLabels.map((label) => label.toLowerCase()),
  );
  const ballotReady =
    distinctLabels.size >= MIN_POLL_OPTIONS &&
    distinctLabels.size <= MAX_POLL_OPTIONS;

  // An empty sticky is not a note, and a poll needs both its question and a
  // ballot — the server discards either, so don't offer to save one.
  const isBlank = isPollDraft
    ? trimmedTitle.length === 0 || !ballotReady
    : trimmedTitle.length === 0 && isEmptyContent(content);

  const setOptionLabel = (key: string, label: string) =>
    setOptions((current) =>
      current.map((option) =>
        option.key === key ? { ...option, label } : option,
      ),
    );

  const removeOption = (key: string) =>
    setOptions((current) => current.filter((option) => option.key !== key));

  const addOption = () =>
    setOptions((current) =>
      current.length >= MAX_POLL_OPTIONS
        ? current
        : [...current, blankOption()],
    );

  /** Shared by both modes — delete is offered from the reader and the editor. */
  const deleteDialog = (
    <AppAlertDialog
      heading={isPollDraft ? "Delete this poll?" : "Delete this note?"}
      text={
        isPollDraft
          ? "It disappears for every co-author on this storyboard, votes and all. This cannot be undone."
          : "It disappears for every co-author on this storyboard. This cannot be undone."
      }
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      actionButtonLabel="Delete"
      actionColor="negative"
      onConfirm={() => {
        setConfirmDelete(false);
        if (note) onDelete?.(note);
      }}
    />
  );

  if (mode === "view" && note) {
    const written = toFormattedDate(
      note.modifiedAt ?? note.createdAt ?? undefined,
    );
    const isPoll = note.noteType === "POLL";
    const totalVotes = note.totalVotes ?? 0;
    // A settled poll keeps its results readable; so does an archived one, but
    // neither takes another answer.
    const ballotOpen = isPoll && !note.isPollClosed && !note.isArchived;

    return (
      <ResponsiveSheet
        open={open}
        wide
        title={isPoll ? "Poll" : "Note"}
        onClose={onClose}
        headerActions={
          <>
            <F.SheetActionButton
              type="button"
              aria-label={isPoll ? "Edit this poll" : "Edit this note"}
              title="Edit"
              onClick={() => setMode("edit")}
            >
              <LuPencil size={16} />
            </F.SheetActionButton>
            {isPoll && onTogglePollClosed && (
              <F.SheetActionButton
                type="button"
                aria-label={
                  note.isPollClosed
                    ? "Reopen this poll for voting"
                    : "Close this poll"
                }
                title={note.isPollClosed ? "Reopen" : "Close"}
                onClick={() => onTogglePollClosed(note)}
              >
                {note.isPollClosed ? (
                  <LuLockOpen size={16} />
                ) : (
                  <LuLock size={16} />
                )}
              </F.SheetActionButton>
            )}
            {onToggleArchive && (
              <F.SheetActionButton
                type="button"
                aria-label={
                  note.isArchived ? "Restore this note" : "Archive this note"
                }
                title={note.isArchived ? "Restore" : "Archive"}
                onClick={() => onToggleArchive(note)}
              >
                {note.isArchived ? (
                  <LuArchiveRestore size={16} />
                ) : (
                  <LuArchive size={16} />
                )}
              </F.SheetActionButton>
            )}
            {onDelete && (
              <F.SheetActionButton
                type="button"
                $variant="danger"
                aria-label={isPoll ? "Delete this poll" : "Delete this note"}
                title="Delete"
                onClick={() => setConfirmDelete(true)}
              >
                <FaRegTrashCan size={14} />
              </F.SheetActionButton>
            )}
          </>
        }
      >
        <S.ViewCard $color={note.color}>
          {note.title && <S.ViewTitle>{note.title}</S.ViewTitle>}

          {note.content ? (
            <S.ViewBody>
              {/* The note is short by nature — show all of it, no "Read more". */}
              <RichTextRenderer savedText={note.content} disableCollapse />
            </S.ViewBody>
          ) : (
            !isPoll && <S.ViewEmpty>This note has a title only.</S.ViewEmpty>
          )}

          {/* Reading a poll *is* voting on it — the ballot is live right here,
              rather than behind an edit step. */}
          {isPoll && (
            <>
              <Ballot
                options={note.pollOptions ?? []}
                totalVotes={totalVotes}
                myVoteOptionId={note.myVoteOptionId}
                showVoters
                pending={voting}
                onVote={
                  ballotOpen && onVote
                    ? (optionId) => onVote(note, optionId)
                    : undefined
                }
              />

              <S.BallotFoot>
                {votesLabel(totalVotes)}
                {note.isPollClosed && (
                  <>
                    ·
                    <LuLock size={11} />
                    Closed
                  </>
                )}
                {ballotOpen && note.myVoteOptionId && onRetractVote && (
                  <>
                    ·
                    <S.LinkAction
                      type="button"
                      disabled={voting}
                      onClick={() => onRetractVote(note)}
                    >
                      Take my vote back
                    </S.LinkAction>
                  </>
                )}
                {ballotOpen &&
                  !note.myVoteOptionId &&
                  "· You have not voted yet"}
              </S.BallotFoot>
            </>
          )}

          {(note.isPinned || note.isArchived) && (
            <S.ViewTags>
              {note.isPinned && (
                <S.ViewTag>
                  <LuPin size={12} />
                  Pinned
                </S.ViewTag>
              )}
              {note.isArchived && (
                <S.ViewTag>
                  <LuArchive size={12} />
                  Archived
                </S.ViewTag>
              )}
            </S.ViewTags>
          )}

          {(note.createdByName || written) && (
            <S.ViewByline>
              {note.createdByImage && (
                <S.BylineAvatar src={note.createdByImage} alt="" />
              )}
              {note.createdByName && (
                <>
                  {isPoll ? "Asked by" : "Written by"} {note.createdByName}
                </>
              )}
              {note.modifiedByName &&
                note.modifiedByName !== note.createdByName &&
                `, edited by ${note.modifiedByName}`}
              {note.createdByName && written ? " · " : ""}
              {written}
            </S.ViewByline>
          )}
        </S.ViewCard>

        {deleteDialog}
      </ResponsiveSheet>
    );
  }

  const editorTitle = note
    ? isPollDraft
      ? "Edit poll"
      : "Edit note"
    : isPollDraft
      ? "New poll"
      : "New note";

  return (
    <ResponsiveSheet
      open={open}
      wide
      title={editorTitle}
      // Saving mid-upload would store the local blob: URL, which dies with the
      // page — hold the save until the attachment has a real one.
      confirmDisabled={isBlank || uploading}
      onConfirm={() =>
        onSave({
          color,
          content: isEmptyContent(content) ? null : content,
          id: note?.id ?? null,
          // Archiving un-pins, exactly as the server does.
          isArchived,
          isPinned: isArchived ? false : isPinned,
          isPollClosed: note?.isPollClosed ?? false,
          noteType,
          pollOptions: isPollDraft
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
          title: trimmedTitle || null,
        })
      }
      // Backing out of an edit returns to the note as saved; a new note has
      // nothing to go back to, so it closes.
      onClose={() => (note ? setMode("view") : onClose())}
    >
      {/* What a sticky *is* is settled when it is written. Switching an
          existing poll to a plain note would throw its votes away, so that
          door stays shut. */}
      {!note && (
        <F.Field as="div">
          Kind
          <F.ChoiceRow>
            <F.Choice
              type="button"
              $active={!isPollDraft}
              aria-pressed={!isPollDraft}
              onClick={() => setNoteType("NOTE")}
            >
              <LuStickyNote size={14} />
              Note
            </F.Choice>
            <F.Choice
              type="button"
              $active={isPollDraft}
              aria-pressed={isPollDraft}
              onClick={() => setNoteType("POLL")}
            >
              <LuChartBar size={14} />
              Poll
            </F.Choice>
          </F.ChoiceRow>
        </F.Field>
      )}

      <F.Field>
        {isPollDraft ? "Question" : "Title"}
        <F.TextInput
          value={title}
          maxLength={120}
          placeholder={
            isPollDraft
              ? "e.g. Which ending do we write?"
              : "Optional — e.g. Continuity: Mira's scar"
          }
          onChange={(e) => setTitle(e.target.value)}
        />
      </F.Field>

      {isPollDraft && (
        <F.Field as="div">
          Choices
          <S.Ballot>
            {options.map((option, index) => (
              <S.OptionRow key={option.key}>
                <S.OptionInput
                  value={option.label}
                  maxLength={MAX_POLL_OPTION_LABEL}
                  placeholder={`Choice ${index + 1}`}
                  aria-label={`Choice ${index + 1}`}
                  onChange={(e) => setOptionLabel(option.key, e.target.value)}
                />
                <S.OptionRemove
                  type="button"
                  aria-label={`Remove choice ${index + 1}`}
                  title="Remove"
                  disabled={options.length <= MIN_POLL_OPTIONS}
                  onClick={() => removeOption(option.key)}
                >
                  <LuX size={15} />
                </S.OptionRemove>
              </S.OptionRow>
            ))}
          </S.Ballot>
          {options.length < MAX_POLL_OPTIONS && (
            <S.EditorTool type="button" onClick={addOption}>
              <IoMdAdd size={14} />
              Add a choice
            </S.EditorTool>
          )}
          {/* Editing a ballot people have already answered is where votes get
              lost, so say exactly how before it happens. */}
          {(note?.totalVotes ?? 0) > 0 && (
            <S.BallotWarning>
              {votesLabel(note?.totalVotes ?? 0)} already cast. Rewording a
              choice keeps its votes; removing one gives them back, and those
              co-authors will need to answer again.
            </S.BallotWarning>
          )}
        </F.Field>
      )}

      <F.Field as="div">
        <S.EditorLabelRow>
          {isPollDraft ? "Context (optional)" : "Note"}
          <S.EditorTools>
            <S.EditorTool
              as="label"
              htmlFor="story-note-attach"
              title="Attach an image"
            >
              <GrAttachment size={13} />
              Attach
              <input
                id="story-note-attach"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </S.EditorTool>
            <S.EditorTool
              type="button"
              onClick={() => setShowGifPicker(true)}
              title="Insert a GIF"
            >
              <MdGif size={18} />
              GIF
            </S.EditorTool>
          </S.EditorTools>
        </S.EditorLabelRow>

        <S.EditorArea>
          <RichTextEditor
            key={editorKey}
            ref={editorRef}
            placeholder={
              isPollDraft
                ? "Anything your co-authors need in order to answer…"
                : "Anything your co-authors should know…"
            }
            value={content}
            compact
            desktopRounded
            onChange={setContent}
          />
        </S.EditorArea>

        {uploading && <F.Hint>Uploading the attachment…</F.Hint>}
        {mediaError && <S.EditorError>{mediaError}</S.EditorError>}
      </F.Field>

      <F.Field as="div">
        Colour
        <F.SwatchRow>
          {NOTE_COLORS.map((swatch) =>
            swatch.hex === null ? (
              <S.PlainSwatch
                key="plain"
                type="button"
                $active={color === null}
                aria-label="Colour Plain"
                aria-pressed={color === null}
                title="Plain"
                onClick={() => setColor(null)}
              />
            ) : (
              <F.Swatch
                key={swatch.hex}
                type="button"
                $color={swatch.hex}
                $active={color === swatch.hex}
                aria-label={`Colour ${swatch.label}`}
                aria-pressed={color === swatch.hex}
                title={swatch.label}
                onClick={() => setColor(swatch.hex)}
              />
            ),
          )}
        </F.SwatchRow>
      </F.Field>

      {/* Pin and archive are things you do to a note that exists — a new one
          is written first, and lands on the board plain. */}
      {note && (
        <>
          <F.ToggleRow
            type="button"
            $active={isPinned}
            aria-pressed={isPinned}
            disabled={isArchived}
            onClick={() => setIsPinned((current) => !current)}
          >
            <LuPin size={15} />
            {isPinned ? "Pinned to the top of the board" : "Pin to the top"}
          </F.ToggleRow>

          <F.ToggleRow
            type="button"
            $active={isArchived}
            aria-pressed={isArchived}
            onClick={() =>
              setIsArchived((current) => {
                // Archiving un-pins: a note cannot be both stashed away and
                // held at the top of the board.
                if (!current) setIsPinned(false);
                return !current;
              })
            }
          >
            {isArchived ? (
              <LuArchiveRestore size={15} />
            ) : (
              <LuArchive size={15} />
            )}
            {isArchived ? "Archived — restore to the board" : "Archive"}
          </F.ToggleRow>
        </>
      )}

      {note?.createdByName && (
        <F.NoteRow>
          <span>
            {isPollDraft ? "Asked by" : "Written by"}{" "}
            <b>{note.createdByName}</b>
          </span>
          {note.modifiedByName &&
            note.modifiedByName !== note.createdByName && (
              <span>
                Last edited by <b>{note.modifiedByName}</b>
              </span>
            )}
        </F.NoteRow>
      )}

      {note && onDelete && (
        <F.DangerButton type="button" onClick={() => setConfirmDelete(true)}>
          <FaRegTrashCan size={13} />
          {isPollDraft ? "Delete poll" : "Delete note"}
        </F.DangerButton>
      )}

      {deleteDialog}

      <AppAlertDialog
        heading="Insert GIF"
        text=""
        size="lg"
        body={
          <GifPicker
            onSelect={handleGifSelect}
            // On a phone the sheet is already up and the picker sits over it;
            // autofocus would raise the keyboard over the GIF grid.
            autoFocus={!isNarrow}
          />
        }
        open={showGifPicker}
        onOpenChange={setShowGifPicker}
        showConfirm={false}
        closeButtonText="Close"
      />
    </ResponsiveSheet>
  );
};
