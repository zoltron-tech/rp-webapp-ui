"use client";

import type { NWImage, StoryBoardEvent } from "@nw/types";
import { clamp, toCropFilter } from "@nw/utils";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BsArrowLeft } from "react-icons/bs";
import { HiOutlineCamera } from "react-icons/hi2";
import { MdEventNote } from "react-icons/md";
import { deleteMedia } from "@/app/rp/profile/actions";
import { SongPickerDialog } from "@/app/rp/profile/edit/song-picker-dialog";
import { updateStoryBoardEventAction } from "@/app/rp/story/actions";
import {
  DEFAULT_ASTERISM_STYLE,
  isAsterismStyle,
} from "@/components/asterism-styles";
import { AsterismStyleSelect } from "@/components/asterism-styles/asterism-style-select";
import { CoverUploadField } from "@/components/common/cover-upload-field";
import { DateTimePicker } from "@/components/date-time-picker";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { ProfileSongPlayer } from "@/components/profile-song";
import { RichTextEditor } from "@/components/rich-text-editor-input";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import {
  STORY_COVER_ASPECT_RATIO,
  STORY_COVER_ZOOM_MAX,
} from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { plainTextLength } from "@/utils/rich-text";
import {
  useStoryboardEventState,
  useStoryboardEventStoreSet,
} from "./storyboard-event.store";
import * as S from "./styled";

const MAX_DESCRIPTION_LENGTH = 4000;

/**
 * Descriptions predate the rich text editor and may still be stored as plain
 * text. Detect that case (no HTML tags) and escape + linebreak-convert it so
 * legacy text seeds correctly into the contentEditable surface instead of
 * being misread as markup.
 */
function toInitialDescriptionHtml(text: string): string {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => `<div>${line || "<br>"}</div>`)
    .join("");
}

export type EditStoryboardEventDataCardHandle = {
  /** Runs the same dirty-check as the back button; closes or prompts to discard. */
  requestClose: () => void;
};

type DataCardProps = {
  /** When true, the card renders inside an overlay (no page routing, tight layout). */
  embedded?: boolean;
  /** Called to dismiss the overlay once it is safe to leave. */
  onClose?: () => void;
  /** Called after a successful save with the persisted event. */
  onSaved?: (event: StoryBoardEvent) => void;
};

const EditStoryboardEventDataCard = forwardRef<
  EditStoryboardEventDataCardHandle,
  DataCardProps
>(function EditStoryboardEventDataCard({ embedded, onClose, onSaved }, ref) {
  const id = useStoryboardEventState("id");
  const storyBoardId = useStoryboardEventState("storyBoardId");
  const ordinal = useStoryboardEventState("ordinal");
  const name = useStoryboardEventState("name");
  const description = useStoryboardEventState("description");
  const image = useStoryboardEventState("image");
  const avatar = useStoryboardEventState("avatar");
  const location = useStoryboardEventState("location");
  const eventTime = useStoryboardEventState("eventTime");
  const overtureAsterism = useStoryboardEventState("overtureAsterism");
  const passageAsterism = useStoryboardEventState("passageAsterism");
  const song = useStoryboardEventState("song");
  const setEventState = useStoryboardEventStoreSet();

  const [songDialogOpen, setSongDialogOpen] = useState(false);

  const { routeToPage } = usePageRouter();
  const { uploadMedia } = useUploadMedia();
  const { successToast, errorToast } = useUIContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialSnapshot = useRef({
    avatar,
    description,
    eventTime,
    location,
    name,
    overtureAsterism,
    passageAsterism,
    song,
  });

  // RichTextEditor only seeds its `value` prop once, on mount, while empty —
  // bump this to force a remount (and re-seed) whenever Reset restores the
  // description to its last-saved snapshot.
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);
  const descriptionLength = plainTextLength(description);
  const descriptionTooLong = descriptionLength > MAX_DESCRIPTION_LENGTH;

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState("");
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropScale, setCropScale] = useState(1);
  const cropViewportRef = useRef<HTMLDivElement>(null);

  const isDirty =
    avatarChanged ||
    name !== initialSnapshot.current.name ||
    description !== initialSnapshot.current.description ||
    location !== initialSnapshot.current.location ||
    eventTime !== initialSnapshot.current.eventTime ||
    overtureAsterism !== initialSnapshot.current.overtureAsterism ||
    passageAsterism !== initialSnapshot.current.passageAsterism ||
    song !== initialSnapshot.current.song;

  const handleAvatarClick = () => {
    const existingSrc = avatar?.src || image;
    if (!existingSrc) {
      fileInputRef.current?.click();
      return;
    }
    setPendingCropSrc(existingSrc);
    setCropX(avatar?.crop.x ?? 50);
    setCropY(avatar?.crop.y ?? 50);
    setCropScale(avatar ? avatar.crop.width / 100 : 1);
    setCropDialogOpen(true);
  };

  const openCropDialog = (src: string) => {
    setPendingCropSrc(src);
    setCropX(50);
    setCropY(50);
    setCropScale(1);
    setCropDialogOpen(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type === "image/gif" || /\.gif$/i.test(file.name)) {
      setError(
        "GIFs can't be used as a cover. Please choose a JPG, PNG or WebP.",
      );
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      openCropDialog(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (tempUploadedImage) {
      await deleteMedia(tempUploadedImage);
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaBucket", "APP_MEDIA");
    // Store the event cover under app-media/<storyboardId>/<file> (no user-id
    // segment) so it sits alongside the storyboard's other media.
    formData.append("prefix", storyBoardId);
    formData.append("scoped", "false");
    const url = await uploadMedia(formData);
    setImageUploading(false);

    if (url === API_MESSAGE.MediaError) {
      setError("Failed to upload image. Please try again.");
      setCropDialogOpen(false);
      return;
    }

    setTempUploadedImage(url);
    setPendingCropSrc(url);
  };

  const handleCropPan = (nx: number, ny: number) => {
    setCropX(clamp(nx, 0, 100));
    setCropY(clamp(ny, 0, 100));
  };

  const handleCropScaleChange = (v: number) =>
    setCropScale(clamp(v, 1, STORY_COVER_ZOOM_MAX));

  const handleCropConfirm = useCallback(() => {
    const crop = toCropFilter(pendingCropSrc, cropX, cropY, cropScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCropSrc,
    };
    setEventState({ avatar: nwImage, image: pendingCropSrc });
    setAvatarChanged(true);
    setCropDialogOpen(false);
  }, [pendingCropSrc, cropX, cropY, cropScale, setEventState]);

  const handleCropCancel = useCallback(async () => {
    if (tempUploadedImage && tempUploadedImage === pendingCropSrc) {
      await deleteMedia(tempUploadedImage);
      setTempUploadedImage(null);
    }
    setCropDialogOpen(false);
  }, [tempUploadedImage, pendingCropSrc]);

  const resetCrop = useCallback(() => {
    setCropX(50);
    setCropY(50);
    setCropScale(1);
  }, []);

  const handleReset = () => {
    setEventState({ ...initialSnapshot.current });
    setAvatarChanged(false);
    setError(null);
    setDescriptionEditorKey((k) => k + 1);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (descriptionTooLong) {
      setError(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
      );
      return;
    }

    setError(null);
    setLoading(true);

    const payload: StoryBoardEvent = {
      avatar,
      createdAt: null,
      description,
      eventTime,
      id,
      image: avatar?.src ?? image,
      location,
      name: name.trim(),
      ordinal,
      overtureAsterism,
      passageAsterism,
      song,
      storyBoardId,
    };

    const response = await updateStoryBoardEventAction(payload).catch(
      () => null,
    );
    setLoading(false);

    if (!response || "message" in response) {
      errorToast(response?.reason ?? "Failed to save. Please try again.");
      return;
    }

    setEventState({
      avatar: response.avatar ?? null,
      description: response.description ?? "",
      eventTime: response.eventTime ?? null,
      id: response.id,
      image: response.image ?? null,
      location: response.location ?? null,
      name: response.name,
      ordinal: response.ordinal,
      overtureAsterism: response.overtureAsterism ?? DEFAULT_ASTERISM_STYLE,
      passageAsterism: response.passageAsterism ?? DEFAULT_ASTERISM_STYLE,
      song: response.song ?? null,
    });
    initialSnapshot.current = {
      avatar: response.avatar ?? null,
      description: response.description ?? "",
      eventTime: response.eventTime ?? null,
      location: response.location ?? null,
      name: response.name,
      overtureAsterism: response.overtureAsterism ?? DEFAULT_ASTERISM_STYLE,
      passageAsterism: response.passageAsterism ?? DEFAULT_ASTERISM_STYLE,
      song: response.song ?? null,
    };
    setAvatarChanged(false);
    setTempUploadedImage(null);
    successToast(
      id ? "Chapter updated successfully." : "Chapter created successfully.",
    );
    onSaved?.(response);
    // Saved: close the dialog / tray, or go back to the story from the page.
    if (onClose) {
      onClose();
    } else {
      routeToPage(ROUTES.Story.View(storyBoardId));
    }
  };

  const leave = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    routeToPage(ROUTES.Story.View(storyBoardId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, storyBoardId]);

  const handleBack = useCallback(() => {
    if (isDirty || imageUploading) {
      setDiscardDialogOpen(true);
      return;
    }
    leave();
  }, [isDirty, imageUploading, leave]);

  useImperativeHandle(ref, () => ({ requestClose: handleBack }), [handleBack]);

  const handleConfirmDiscard = async () => {
    if (tempUploadedImage) await deleteMedia(tempUploadedImage);
    setDiscardDialogOpen(false);
    leave();
  };

  const headerSubtitle = id ? "Editing chapter" : "New chapter draft";

  return (
    <S.Card $embedded={embedded}>
      <S.TopBar $embedded={embedded}>
        <S.TopBarLeft>
          <S.BackButton type="button" onClick={handleBack} title="Back">
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdEventNote />
            <div className="titles">
              <h1>{id ? "Edit chapter" : "Create a new chapter"}</h1>
              {embedded && <span className="subtitle">{headerSubtitle}</span>}
            </div>
          </S.FormHeading>
        </S.TopBarLeft>
        {!embedded && isDirty && (
          <S.TopBarActions>
            <S.ResetButton
              type="button"
              onClick={handleReset}
              disabled={loading || imageUploading}
            >
              Reset
            </S.ResetButton>
            <S.SaveButton
              type="button"
              onClick={handleSave}
              disabled={loading || imageUploading || descriptionTooLong}
            >
              {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
            </S.SaveButton>
          </S.TopBarActions>
        )}
      </S.TopBar>

      <S.Body $embedded={embedded}>
        {error && <S.ErrorBanner>{error}</S.ErrorBanner>}

        <S.CoverRow>
          <S.CoverThumb>
            <CoverUploadField
              src={avatar?.src || image || null}
              nwImage={avatar}
              onClick={handleAvatarClick}
            />
          </S.CoverThumb>
          <S.CoverMeta>
            <span className="t">Cover</span>
            <span className="s">Shown on the chapter card and header</span>
            <S.CoverMetaButton type="button" onClick={handleAvatarClick}>
              <HiOutlineCamera />
              {avatar?.src || image ? "Change cover" : "Upload cover"}
            </S.CoverMetaButton>
          </S.CoverMeta>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={handleAvatarChange}
          />
        </S.CoverRow>

        <S.Section>
          <S.SectionLabel htmlFor="event-name">Title</S.SectionLabel>
          <S.NameInput
            id="event-name"
            type="text"
            placeholder="Chapter name"
            value={name}
            onChange={(e) => setEventState({ name: e.target.value })}
            maxLength={50}
          />
        </S.Section>

        <S.Section>
          <S.DetailsRow>
            <S.Field>
              <S.FieldLabel htmlFor="event-location">
                Location <S.OptionalHint>(optional)</S.OptionalHint>
              </S.FieldLabel>
              <S.TextInput
                id="event-location"
                type="text"
                placeholder="Where does it take place..."
                value={location ?? ""}
                onChange={(e) => setEventState({ location: e.target.value })}
                maxLength={200}
              />
            </S.Field>
            <S.Field>
              <S.FieldLabel htmlFor="event-time">Date & time</S.FieldLabel>
              <DateTimePicker
                id="event-time"
                value={eventTime}
                onChange={(value) => setEventState({ eventTime: value })}
              />
            </S.Field>
          </S.DetailsRow>
        </S.Section>

        <S.Section>
          <S.SectionLabelRow>
            <S.SectionLabel as="span">Description</S.SectionLabel>
            <S.CharCount $full={descriptionTooLong}>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </S.CharCount>
          </S.SectionLabelRow>
          <S.DescriptionEditor>
            <RichTextEditor
              key={descriptionEditorKey}
              placeholder="What happens in this chapter..."
              value={toInitialDescriptionHtml(
                initialSnapshot.current.description,
              )}
              compact
              desktopRounded
              onChange={(html) => setEventState({ description: html })}
            />
          </S.DescriptionEditor>
        </S.Section>

        <S.Section>
          <S.SectionLabel as="span">Scene dividers</S.SectionLabel>
          <S.AsterismPickers>
            <AsterismStyleSelect
              id="event-overture-asterism"
              label="Opening divider"
              value={
                isAsterismStyle(overtureAsterism)
                  ? overtureAsterism
                  : DEFAULT_ASTERISM_STYLE
              }
              onChange={(next) => setEventState({ overtureAsterism: next })}
            />
            <AsterismStyleSelect
              id="event-passage-asterism"
              label="Between passages"
              value={
                isAsterismStyle(passageAsterism)
                  ? passageAsterism
                  : DEFAULT_ASTERISM_STYLE
              }
              onChange={(next) => setEventState({ passageAsterism: next })}
            />
          </S.AsterismPickers>
        </S.Section>

        <S.Section>
          <S.SectionLabel as="span">
            Chapter song <S.OptionalHint>(optional)</S.OptionalHint>
          </S.SectionLabel>
          {song && (
            <S.SongPreview>
              <ProfileSongPlayer
                key={song.spotifyTrackId ?? song.songId ?? song.title}
                song={song}
                block
              />
            </S.SongPreview>
          )}
          <S.SongButtons>
            <S.SongButton
              type="button"
              onClick={() => setSongDialogOpen(true)}
            >
              {song ? "Change song" : "Add a song"}
            </S.SongButton>
            {song && (
              <S.SongButton
                type="button"
                onClick={() => setEventState({ song: null })}
              >
                Remove
              </S.SongButton>
            )}
          </S.SongButtons>
        </S.Section>
      </S.Body>

      {embedded && (
        <S.Footer>
          <S.FooterCancelBtn
            type="button"
            onClick={handleBack}
            disabled={loading || imageUploading}
          >
            Cancel
          </S.FooterCancelBtn>
          <S.FooterPrimaryBtn
            type="button"
            onClick={handleSave}
            disabled={
              !name.trim() || loading || imageUploading || descriptionTooLong
            }
          >
            {loading
              ? "Saving…"
              : imageUploading
                ? "Uploading…"
                : id
                  ? "Save changes"
                  : "Create chapter"}
          </S.FooterPrimaryBtn>
        </S.Footer>
      )}

      <SongPickerDialog
        open={songDialogOpen}
        onOpenChange={setSongDialogOpen}
        commit={false}
        title="Add a chapter song"
        onSelected={(picked) => setEventState({ song: picked })}
      />

      <AppAlertDialog
        closeOnConfirm
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        heading="Discard unsaved changes?"
        text="You have unsaved changes that will be lost if you leave this page."
        actionButtonLabel="Discard"
        closeButtonText="Stay"
        actionColor="negative"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardDialogOpen(false)}
      />

      <AppAlertDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
          setCropDialogOpen(open);
        }}
        heading="Adjust chapter cover"
        text="Drag to reposition. Use the slider or scroll to zoom."
        showConfirm={false}
        isCancelHidden={true}
        body={
          <S.AvatarCropBody>
            <AvatarCropDialog
              open={cropDialogOpen}
              src={pendingCropSrc}
              x={cropX}
              y={cropY}
              scale={cropScale}
              shape="rect"
              aspectRatio={STORY_COVER_ASPECT_RATIO}
              onOpenChange={setCropDialogOpen}
              onPan={handleCropPan}
              onScaleChange={handleCropScaleChange}
              onReset={resetCrop}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
              onReplace={() => fileInputRef.current?.click()}
              isUploading={imageUploading}
              viewportRef={cropViewportRef}
            />
          </S.AvatarCropBody>
        }
      />
    </S.Card>
  );
});

export default EditStoryboardEventDataCard;
