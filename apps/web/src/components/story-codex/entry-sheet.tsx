"use client";

import type { CodexCategory, CodexEntry, StoryBoardEvent } from "@nw/types";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";
import { MdGif } from "react-icons/md";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { API_MESSAGE } from "@/utils/constants";
import {
  CODEX_COLORS,
  CODEX_ICON_KEYS,
  DEFAULT_CODEX_ICON,
  resolveCodexIcon,
} from "./icons";
import * as S from "./styles";

/** Matches the other in-editor attachment flows (muse about, profile about). */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

type Props = {
  open: boolean;
  /** Null when creating; the category it lands in comes from `defaultCategoryId`. */
  entry: CodexEntry | null;
  defaultCategoryId: string | null;
  categories: CodexCategory[];
  /** Every chapter of the story, for the "appears in" multi-select. */
  chapters: StoryBoardEvent[];
  onClose: () => void;
  onSave: (entry: CodexEntry) => unknown;
  onDelete?: (entry: CodexEntry) => unknown;
};

/**
 * The codex entry editor — a dialog on desktop, a bottom tray on mobile.
 *
 * Chapter links are picked here by hand: auto-detecting an entry from the
 * prose is a later enhancement, in the spirit of the derived cast.
 */
export const EntrySheet: FC<Props> = ({
  open,
  entry,
  defaultCategoryId,
  categories,
  chapters,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>(DEFAULT_CODEX_ICON);
  const [color, setColor] = useState<string | null>(null);
  const [chapterIds, setChapterIds] = useState<string[]>([]);
  // The rich-text editor is uncontrolled; remount it whenever the sheet opens
  // on a different entry so it starts from that entry's description.
  const [editorKey, setEditorKey] = useState(0);

  const { uploadMedia } = useUploadMedia();
  const { width } = useWindowDimensions();
  const isNarrow = (width ?? 1024) <= 700;
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Held while a delete is in flight: no second delete, no save, no closing.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!entry || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(entry);
    } finally {
      setDeleting(false);
    }
  };

  const handleGifSelect = useCallback((gifUrl: string) => {
    setShowGifPicker(false);
    editorRef.current?.insertGif(gifUrl);
  }, []);

  /**
   * Attach an image into the description: a local placeholder goes in at once
   * so the author keeps writing, and the storage URL replaces it when the
   * upload lands.
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
      formData.append("prefix", "story-codex");

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

  useEffect(() => {
    if (!open) return;
    setName(entry?.name ?? "");
    setCategoryId(
      entry?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? null,
    );
    setDescription(entry?.description ?? "");
    setIcon(entry?.icon ?? DEFAULT_CODEX_ICON);
    setColor(entry?.color ?? CODEX_COLORS[0]);
    setChapterIds(entry?.chapterIds ?? []);
    setEditorKey((key) => key + 1);
    setMediaError(null);
    setUploading(false);
    setShowGifPicker(false);
    setConfirmDelete(false);
  }, [open, entry, defaultCategoryId, categories]);

  const trimmed = name.trim();

  const toggleChapter = (chapterId: string) =>
    setChapterIds((current) =>
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    );

  return (
    <ResponsiveSheet
      open={open}
      wide
      title={entry ? "Edit entry" : "New entry"}
      // Saving mid-upload would store the local blob: URL, which dies with the
      // page — hold the save until the attachment has a real one.
      confirmDisabled={
        trimmed.length === 0 || !categoryId || uploading || deleting
      }
      onConfirm={() => {
        if (!categoryId) return;
        return onSave({
          categoryId,
          chapterIds,
          color,
          description: description || null,
          icon,
          id: entry?.id ?? null,
          name: trimmed,
        });
      }}
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      <F.Field>
        Name
        <F.TextInput
          value={name}
          maxLength={80}
          placeholder="The Drowned Coast"
          onChange={(e) => setName(e.target.value)}
        />
      </F.Field>

      <F.Field as="div">
        Category
        <F.ChoiceRow>
          {categories.map((category) => (
            <F.Choice
              key={category.id}
              type="button"
              $active={categoryId === category.id}
              aria-pressed={categoryId === category.id}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </F.Choice>
          ))}
        </F.ChoiceRow>
      </F.Field>

      <F.Field as="div">
        Icon
        <F.ChoiceRow>
          {CODEX_ICON_KEYS.map((key) => {
            const Icon = resolveCodexIcon(key);
            return (
              <F.Choice
                key={key}
                type="button"
                $active={icon === key}
                aria-label={`Icon ${key}`}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
              >
                <Icon size={15} />
              </F.Choice>
            );
          })}
        </F.ChoiceRow>
      </F.Field>

      <F.Field as="div">
        Colour
        <F.SwatchRow>
          {CODEX_COLORS.map((swatch) => (
            <F.Swatch
              key={swatch}
              type="button"
              $color={swatch}
              $active={color === swatch}
              aria-label={`Colour ${swatch}`}
              aria-pressed={color === swatch}
              onClick={() => setColor(swatch)}
            />
          ))}
        </F.SwatchRow>
      </F.Field>

      <F.Field as="div">
        <S.EditorLabelRow>
          Description
          <S.EditorTools>
            <S.EditorTool
              as="label"
              htmlFor="codex-entry-attach"
              title="Attach an image"
            >
              <GrAttachment size={13} />
              Attach
              <input
                id="codex-entry-attach"
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
            placeholder="What is it, and why does it matter?"
            value={description}
            compact
            desktopRounded
            onChange={setDescription}
          />
        </S.EditorArea>

        {uploading && <F.Hint>Uploading the attachment…</F.Hint>}
        {mediaError && <S.EditorError>{mediaError}</S.EditorError>}
      </F.Field>

      <F.Field as="div">
        Appears in
        <F.ChoiceRow>
          {chapters.length === 0 && (
            <F.Hint>This story has no chapters yet.</F.Hint>
          )}
          {chapters.map((chapter) => (
            <F.Choice
              key={chapter.id}
              type="button"
              $active={chapterIds.includes(chapter.id ?? "")}
              aria-pressed={chapterIds.includes(chapter.id ?? "")}
              onClick={() => chapter.id && toggleChapter(chapter.id)}
            >
              {chapter.name}
            </F.Choice>
          ))}
        </F.ChoiceRow>
      </F.Field>

      {entry && onDelete && (
        <F.DangerButton
          type="button"
          disabled={deleting}
          onClick={() => setConfirmDelete(true)}
        >
          <FaRegTrashCan size={13} />
          Delete entry
        </F.DangerButton>
      )}

      <AppAlertDialog
        heading="Delete this entry?"
        text="It disappears from the codex for every co-author on this story. This cannot be undone."
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleDelete}
      />

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
