"use client";

import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { LuCrop, LuX } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { NWImage, StoryCharacter } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { CODEX_COLORS } from "./icons";
import * as S from "./styles";

/** Matches the other in-editor attachment flows (codex entry, muse about). */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** The zoom range the crop dialog offers. Mirrors the muse avatar's. */
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

/** Centred and unzoomed — where a fresh portrait starts. */
const DEFAULT_CROP = { scale: 1, x: 50, y: 50 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * The stored framing of an existing portrait, read back into the dialog.
 *
 * `crop.width` is the zoom encoded as scale × 100 — the same encoding the muse
 * avatar uses, so a character's portrait and a muse's are the same picture in
 * the same frame at every size.
 */
const cropOf = (avatar: NWImage | null | undefined) =>
  avatar?.crop
    ? {
        scale: clamp((avatar.crop.width || 100) / 100, ZOOM_MIN, ZOOM_MAX),
        x: clamp(avatar.crop.x, 0, 100),
        y: clamp(avatar.crop.y, 0, 100),
      }
    : DEFAULT_CROP;

/** A character sheet, not a database. Mirrors the server's own caps. */
const MAX_EXTRA_ATTRIBUTES = 30;

/** One of the authors' own fields, while it is being edited. */
type DraftAttribute = { key: string; name: string; value: string };

let draftKeySeed = 0;
const blankAttribute = (): DraftAttribute => ({
  key: `attr-${(draftKeySeed += 1)}`,
  name: "",
  value: "",
});

const toDraftAttributes = (
  attributes: Record<string, string> | undefined,
): DraftAttribute[] =>
  Object.entries(attributes ?? {}).map(([name, value]) => ({
    key: `attr-${(draftKeySeed += 1)}`,
    name,
    value,
  }));

type Props = {
  open: boolean;
  /** Null when creating a new character. */
  character: StoryCharacter | null;
  onClose: () => void;
  onSave: (character: StoryCharacter) => void;
  onDelete?: (character: StoryCharacter) => void;
};

/**
 * The in-story character editor — a dialog on desktop, a bottom tray on mobile.
 *
 * This is not the muse editor and deliberately does not try to be. A muse
 * carries a fandom, privacy, verses and points because it belongs to a novelist
 * and travels between stories. A character here belongs to *this* story, is
 * written by every co-author, and needs only enough to be somebody: a name, a
 * face, and whatever fields the authors decide matter in their world.
 */
export const CharacterSheet: FC<Props> = ({
  open,
  character,
  onClose,
  onSave,
  onDelete,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  /** The committed portrait, framing and all. */
  const [avatar, setAvatar] = useState<NWImage | null>(null);
  /**
   * Whether the portrait was touched at all this session.
   *
   * The server reads a null avatar as "unchanged", so re-sending an untouched
   * one would mint a new image row on every save. Only a real change travels.
   */
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [accent, setAccent] = useState<string | null>(null);
  const [useAccent, setUseAccent] = useState(false);
  const [gender, setGender] = useState("");
  const [nicknames, setNicknames] = useState("");
  const [about, setAbout] = useState("");
  const [attributes, setAttributes] = useState<DraftAttribute[]>([]);
  // The rich-text editor is uncontrolled; remount it whenever the sheet opens
  // on a different character so it starts from that character's about.
  const [editorKey, setEditorKey] = useState(0);

  const { uploadMedia } = useUploadMedia();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Framing the portrait ─────────────────────────────────────────────────
  // The same adjustable avatar a muse has: drag to reposition, scroll or slide
  // to zoom. A face is rarely centred in the photo it came from, and a fixed
  // centre crop is how you end up with a character who is all forehead.
  const [cropOpen, setCropOpen] = useState(false);
  /** What the dialog is framing — a local data URL first, the storage URL once
   *  the upload lands, so the author starts adjusting immediately. */
  const [cropSrc, setCropSrc] = useState("");
  const [cropX, setCropX] = useState(DEFAULT_CROP.x);
  const [cropY, setCropY] = useState(DEFAULT_CROP.y);
  const [cropScale, setCropScale] = useState(DEFAULT_CROP.scale);
  /** The framing viewport, so a drag can measure itself against it. */
  const cropViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName(character?.firstName ?? "");
    setLastName(character?.lastName ?? "");

    const stored =
      character?.avatar ??
      // A character saved before the portrait was adjustable has only a flat
      // url; frame it centred rather than showing nothing.
      (character?.image
        ? {
            crop: {
              height: 100,
              src: character.image,
              width: 100,
              x: DEFAULT_CROP.x,
              y: DEFAULT_CROP.y,
            },
            filterValues: { blur: 0, brightness: 100, greyscale: 0 },
            src: character.image,
          }
        : null);
    setAvatar(stored);
    setAvatarDirty(false);
    const framing = cropOf(stored);
    setCropX(framing.x);
    setCropY(framing.y);
    setCropScale(framing.scale);
    setCropOpen(false);
    setCropSrc(stored?.src ?? "");
    setAccent(character?.accent ?? null);
    setUseAccent(character?.useAccent ?? false);
    setGender(character?.gender ?? "");
    setNicknames((character?.nicknames ?? []).join("\n"));
    setAbout(character?.about ?? "");
    setAttributes(toDraftAttributes(character?.extraAttributes));
    setEditorKey((key) => key + 1);
    setMediaError(null);
    setUploading(false);
    setConfirmDelete(false);
  }, [open, character]);

  /**
   * Picks a portrait and opens the framing dialog.
   *
   * The dialog opens on a local data URL the instant the file is read, while
   * the upload runs in parallel — so the author frames the face rather than
   * watching a spinner, and the storage URL simply takes over underneath.
   */
  const handlePortraitChange = useCallback(
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

      const reader = new FileReader();
      reader.onloadend = () => {
        setCropSrc(reader.result as string);
        // A new photo starts centred and unzoomed, never inheriting the
        // framing of the face it replaced.
        setCropX(DEFAULT_CROP.x);
        setCropY(DEFAULT_CROP.y);
        setCropScale(DEFAULT_CROP.scale);
        setCropOpen(true);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      formData.append("prefix", "story-character");

      const url = await uploadMedia(formData);
      setUploading(false);

      if (url === API_MESSAGE.MediaError) {
        setMediaError("That portrait could not be uploaded.");
        setCropOpen(false);
        return;
      }
      // Swap the placeholder for the real one; the framing is untouched, so an
      // adjustment already in progress survives the handover.
      setCropSrc(url);
    },
    [uploadMedia],
  );

  /** Commits the framing as the character's avatar. */
  const handleCropConfirm = useCallback(() => {
    if (!cropSrc) return;
    const scalePct = Math.round(cropScale * 100);
    setAvatar({
      // width/height carry the zoom; x/y are background-position percentages,
      // so the same numbers frame the face at any rendered size.
      crop: {
        height: scalePct,
        src: cropSrc,
        width: scalePct,
        x: Math.round(cropX),
        y: Math.round(cropY),
      },
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: cropSrc,
    });
    setAvatarDirty(true);
    setCropOpen(false);
  }, [cropSrc, cropScale, cropX, cropY]);

  /** Re-opens the dialog on the portrait already stored, to adjust it again. */
  const handleReframe = useCallback(() => {
    if (!avatar) return;
    const framing = cropOf(avatar);
    setCropSrc(avatar.src);
    setCropX(framing.x);
    setCropY(framing.y);
    setCropScale(framing.scale);
    setCropOpen(true);
  }, [avatar]);

  const trimmedFirst = firstName.trim();
  // A character is somebody; a nameless one is a blank row on the sheet. The
  // server discards these, so don't offer to save one.
  const isBlank = trimmedFirst.length === 0;

  const setAttribute = (key: string, patch: Partial<DraftAttribute>) =>
    setAttributes((current) =>
      current.map((attr) => (attr.key === key ? { ...attr, ...patch } : attr)),
    );

  return (
    <ResponsiveSheet
      open={open}
      wide
      title={character ? "Edit character" : "New character"}
      // Saving mid-upload would store nothing where the face should be.
      confirmDisabled={isBlank || uploading}
      onConfirm={() =>
        onSave({
          about: about.trim() ? about : null,
          accent,
          // Only a real change travels: a null avatar means "unchanged", and
          // removing one has to be said outright.
          avatar: avatarDirty ? avatar : null,
          clearAvatar: avatarDirty && avatar === null,
          extraAttributes: Object.fromEntries(
            attributes
              .map((attr) => [attr.name.trim(), attr.value.trim()] as const)
              .filter(([name]) => name.length > 0)
              .slice(0, MAX_EXTRA_ATTRIBUTES),
          ),
          firstName: trimmedFirst,
          gender: gender.trim() || null,
          id: character?.id ?? null,
          image: avatar?.src ?? null,
          lastName: lastName.trim() || null,
          nicknames: nicknames
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          useAccent,
        })
      }
      onClose={onClose}
    >
      <S.CharacterPortraitRow>
        {/* Drawn from the stored framing rather than the raw file, so what the
            author adjusted is what they see here and everywhere else. */}
        {avatar ? (
          <S.CharacterPortraitFramed
            $src={avatar.src}
            $x={avatar.crop.x}
            $y={avatar.crop.y}
            $scale={(avatar.crop.width || 100) / 100}
            aria-hidden
          />
        ) : (
          <S.CharacterPortraitFallback>
            {(trimmedFirst || "?").charAt(0).toUpperCase()}
          </S.CharacterPortraitFallback>
        )}
        <S.CharacterPortraitActions>
          <S.ToolButton as="label" htmlFor="story-character-portrait">
            <GrAttachment size={13} />
            {avatar ? "Replace portrait" : "Add a portrait"}
            <input
              id="story-character-portrait"
              type="file"
              accept="image/*"
              hidden
              onChange={handlePortraitChange}
            />
          </S.ToolButton>
          {avatar && (
            <>
              <S.ToolButton type="button" onClick={handleReframe}>
                <LuCrop size={13} />
                Adjust
              </S.ToolButton>
              <S.ToolButton
                type="button"
                onClick={() => {
                  setAvatar(null);
                  setAvatarDirty(true);
                }}
              >
                <LuX size={13} />
                Remove
              </S.ToolButton>
            </>
          )}
          {uploading && <F.Hint>Uploading the portrait…</F.Hint>}
          {mediaError && <S.SheetError>{mediaError}</S.SheetError>}
        </S.CharacterPortraitActions>
      </S.CharacterPortraitRow>

      <S.CharacterNameRow>
        <F.Field>
          First name
          <F.TextInput
            value={firstName}
            maxLength={60}
            placeholder="e.g. Maren"
            onChange={(e) => setFirstName(e.target.value)}
          />
        </F.Field>
        <F.Field>
          Last name
          <F.TextInput
            value={lastName}
            maxLength={60}
            placeholder="Optional"
            onChange={(e) => setLastName(e.target.value)}
          />
        </F.Field>
      </S.CharacterNameRow>

      <F.Field>
        Gender
        <F.TextInput
          value={gender}
          maxLength={30}
          placeholder="Optional — however this story words it"
          onChange={(e) => setGender(e.target.value)}
        />
      </F.Field>

      <F.Field>
        Also known as
        <F.TextInput
          as="textarea"
          rows={2}
          value={nicknames}
          placeholder="One nickname per line"
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => setNicknames(e.target.value)}
        />
      </F.Field>

      <F.Field as="div">
        About
        <S.SheetEditorArea>
          <RichTextEditor
            key={editorKey}
            ref={editorRef}
            placeholder="Who are they in this story?"
            value={about}
            compact
            desktopRounded
            onChange={setAbout}
          />
        </S.SheetEditorArea>
      </F.Field>

      {/* The authors' own fields. What describes a character is theirs to
          decide — "House", "Weapon", "Debt owed to" — so this is a list of
          key/value rows rather than a form somebody else designed. */}
      <F.Field as="div">
        Attributes
        {attributes.map((attr, index) => (
          <S.AttributeRow key={attr.key}>
            <F.TextInput
              value={attr.name}
              maxLength={40}
              placeholder="Field"
              aria-label={`Attribute ${index + 1} name`}
              onChange={(e) => setAttribute(attr.key, { name: e.target.value })}
            />
            <F.TextInput
              value={attr.value}
              maxLength={400}
              placeholder="Value"
              aria-label={`Attribute ${index + 1} value`}
              onChange={(e) =>
                setAttribute(attr.key, { value: e.target.value })
              }
            />
            <S.AttributeRemove
              type="button"
              aria-label={`Remove attribute ${index + 1}`}
              title="Remove"
              onClick={() =>
                setAttributes((current) =>
                  current.filter((candidate) => candidate.key !== attr.key),
                )
              }
            >
              <LuX size={15} />
            </S.AttributeRemove>
          </S.AttributeRow>
        ))}
        {attributes.length < MAX_EXTRA_ATTRIBUTES && (
          <S.ToolButton
            type="button"
            onClick={() =>
              setAttributes((current) => [...current, blankAttribute()])
            }
          >
            <IoMdAdd size={14} />
            Add a field
          </S.ToolButton>
        )}
      </F.Field>

      {/* The accent tints this character's embedded dialogs, exactly as a
          muse's does — which is why it is opt-in the same way. */}
      <F.Field as="div">
        Dialog accent
        <F.SwatchRow>
          {CODEX_COLORS.map((hex) => (
            <F.Swatch
              key={hex}
              type="button"
              $color={hex}
              $active={accent === hex}
              aria-label={`Accent ${hex}`}
              aria-pressed={accent === hex}
              onClick={() => {
                setAccent(hex);
                setUseAccent(true);
              }}
            />
          ))}
        </F.SwatchRow>
      </F.Field>

      <F.ToggleRow
        type="button"
        $active={useAccent}
        aria-pressed={useAccent}
        disabled={!accent}
        onClick={() => setUseAccent((current) => !current)}
      >
        {useAccent
          ? "Their dialogs use this accent"
          : "Use the story's accent for their dialogs"}
      </F.ToggleRow>

      {character?.createdByName && (
        <F.NoteRow>
          <span>
            Added by <b>{character.createdByName}</b>
          </span>
          {character.modifiedByName &&
            character.modifiedByName !== character.createdByName && (
              <span>
                Last edited by <b>{character.modifiedByName}</b>
              </span>
            )}
        </F.NoteRow>
      )}

      {character && onDelete && (
        <F.DangerButton type="button" onClick={() => setConfirmDelete(true)}>
          <FaRegTrashCan size={13} />
          Delete character
        </F.DangerButton>
      )}

      {/* Same framing surface as the muse avatar — drag to reposition, scroll
          or slide to zoom — so the two behave identically. */}
      <AppAlertDialog
        open={cropOpen}
        onOpenChange={(next) => {
          if (!next) setCropOpen(false);
        }}
        heading="Adjust portrait"
        text="Drag to reposition. Use the slider or scroll to zoom."
        showConfirm={false}
        isCancelHidden
        body={
          <S.CharacterCropBody>
            <AvatarCropDialog
              open={cropOpen}
              src={cropSrc}
              x={cropX}
              y={cropY}
              scale={cropScale}
              isUploading={uploading}
              viewportRef={cropViewportRef}
              onOpenChange={setCropOpen}
              onPan={(nx, ny) => {
                setCropX(clamp(nx, 0, 100));
                setCropY(clamp(ny, 0, 100));
              }}
              onScaleChange={(value) =>
                setCropScale(clamp(value, ZOOM_MIN, ZOOM_MAX))
              }
              onReset={() => {
                setCropX(DEFAULT_CROP.x);
                setCropY(DEFAULT_CROP.y);
                setCropScale(DEFAULT_CROP.scale);
              }}
              onCancel={() => setCropOpen(false)}
              onConfirm={handleCropConfirm}
            />
          </S.CharacterCropBody>
        }
      />

      <AppAlertDialog
        heading="Delete this character?"
        text="Their relationships go with them. Dialogs they have already spoken stay in the story, but lose their name and face. This cannot be undone."
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={() => {
          setConfirmDelete(false);
          if (character) onDelete?.(character);
        }}
      />
    </ResponsiveSheet>
  );
};
