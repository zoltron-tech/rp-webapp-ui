"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BsArrowLeft, BsGlobe2, BsLockFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiOutlineCamera } from "react-icons/hi2";
import { LuBookOpen } from "react-icons/lu";
import { MdAutoStories, MdOutlineTheaters } from "react-icons/md";
import { deleteMedia } from "@/app/rp/profile/actions";
import {
  deleteStoryBoardAction,
  updateStoryBoardAction,
} from "@/app/rp/story/actions";
import { CoverUploadField } from "@/components/common/cover-upload-field";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { resolvePageSpec } from "@/lib/paginator";
import type { ImageCropFilter, NWImage, StoryBoard } from "@/types";
import type { Genre } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";
import {
  STORY_COVER_ASPECT_RATIO,
  STORY_COVER_ZOOM_MAX,
} from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { plainTextLength } from "@/utils/rich-text";
import { StoryboardMembersDialog } from "../storyboard-members-dialog";
import FandomPicker from "./fandom-picker";
import GenrePicker from "./genre-picker";
import { PageFormatPicker } from "./page-format-picker";
import { useStoryboardState, useStoryboardStoreSet } from "./storyboard.store";
import * as S from "./styled";

const genreKey = (genres: Genre[]) =>
  genres
    .map((g) => g.id)
    .sort((a, b) => a - b)
    .join(",");

const MAX_DESCRIPTION_LENGTH = 2000;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function toCropFilter(
  src: string,
  x: number,
  y: number,
  scale: number,
): ImageCropFilter {
  const scalePct = Math.round(scale * 100);
  return {
    height: scalePct,
    src,
    width: scalePct,
    x: Math.round(x),
    y: Math.round(y),
  };
}

export type EditStoryboardDataCardHandle = {
  /** Runs the same dirty-check as the back button; closes or prompts to discard. */
  requestClose: () => void;
};

type DataCardProps = {
  /** When true, the card renders inside an overlay (no page routing, tight layout). */
  embedded?: boolean;
  /** Called to dismiss the overlay once it is safe to leave. */
  onClose?: () => void;
  /** Called after a successful save with the persisted storyboard. */
  onSaved?: (storyBoard: StoryBoard) => void;
  /** Called after the storyboard is deleted from within the form. */
  onDeleted?: (storyBoardId: string) => void;
};

const EditStoryboardDataCard = forwardRef<
  EditStoryboardDataCardHandle,
  DataCardProps
>(function EditStoryboardDataCard(
  { embedded, onClose, onSaved, onDeleted },
  ref,
) {
  const id = useStoryboardState("id");
  const name = useStoryboardState("name");
  const description = useStoryboardState("description");
  const image = useStoryboardState("image");
  const avatar = useStoryboardState("avatar");
  const isPublic = useStoryboardState("isPublic");
  const tags = useStoryboardState("tags");
  const fandom = useStoryboardState("fandom");
  const genres = useStoryboardState("genres");
  const pageFormat = useStoryboardState("pageFormat");
  const members = useStoryboardState("members");
  const createdByUsername = useStoryboardState("createdByUsername");
  const setStoryboardState = useStoryboardStoreSet();

  const user = useGlobalState("user");
  const { routeToPage } = usePageRouter();
  const { uploadMedia } = useUploadMedia();
  const { successToast, errorToast } = useUIContext();

  const isCreator = !id || createdByUsername === user?.username;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionEditorRef = useRef<RichTextEditorHandle | null>(null);
  // Bumped on Reset to force the (otherwise uncontrolled) rich text editor to
  // remount with the reverted initial content.
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);
  const descriptionLength = plainTextLength(description);
  const descriptionTooLong = descriptionLength > MAX_DESCRIPTION_LENGTH;

  // Track "dirty" against the values this form loaded with.
  const initialSnapshot = useRef({
    avatar,
    description,
    fandom,
    genres,
    isPublic,
    name,
    pageFormat,
  });

  // Avatar crop dialog state
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
    isPublic !== initialSnapshot.current.isPublic ||
    (fandom?.id ?? null) !== (initialSnapshot.current.fandom?.id ?? null) ||
    pageFormat !== initialSnapshot.current.pageFormat ||
    genreKey(genres) !== genreKey(initialSnapshot.current.genres);

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
    // Store the cover under app-media/<storyboardId>/<file> (no user-id
    // segment). Only possible once the storyboard has an id; new drafts fall
    // back to the default per-user scoped path until first save.
    if (id) {
      formData.append("mediaBucket", "APP_MEDIA");
      formData.append("prefix", id);
      formData.append("scoped", "false");
    }
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
    setStoryboardState({ avatar: nwImage, image: pendingCropSrc });
    setAvatarChanged(true);
    setCropDialogOpen(false);
  }, [pendingCropSrc, cropX, cropY, cropScale, setStoryboardState]);

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
    setStoryboardState({
      avatar: initialSnapshot.current.avatar,
      description: initialSnapshot.current.description,
      fandom: initialSnapshot.current.fandom,
      genres: initialSnapshot.current.genres,
      isPublic: initialSnapshot.current.isPublic,
      name: initialSnapshot.current.name,
      pageFormat: initialSnapshot.current.pageFormat,
    });
    setDescriptionEditorKey((k) => k + 1);
    setAvatarChanged(false);
    setError(null);
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

    const payload: StoryBoard = {
      avatar,
      description: description || null,
      events: [],
      fandom,
      genres,
      id,
      image: avatar?.src ?? image,
      isPublic,
      members,
      name: name.trim(),
      pageFormat,
      tags,
    };

    const response = await updateStoryBoardAction(payload);
    setLoading(false);

    if ("message" in response) {
      errorToast(response.reason ?? "Failed to save. Please try again.");
      return;
    }

    setStoryboardState({
      avatar: response.avatar ?? null,
      createdByUsername: response.createdBy?.username ?? user?.username ?? null,
      description: response.description ?? "",
      fandom: response.fandom ?? null,
      genres: response.genres ?? [],
      id: response.id,
      image: response.image ?? null,
      isPublic: response.isPublic,
      members: response.members ?? [],
      name: response.name,
      pageFormat: resolvePageSpec(response.pageFormat).value,
      tags: response.tags ?? [],
    });
    initialSnapshot.current = {
      avatar: response.avatar ?? null,
      description: response.description ?? "",
      fandom: response.fandom ?? null,
      genres: response.genres ?? [],
      isPublic: response.isPublic,
      name: response.name,
      pageFormat: resolvePageSpec(response.pageFormat).value,
    };
    setAvatarChanged(false);
    setTempUploadedImage(null);
    successToast(
      id ? "Story updated successfully." : "Story created successfully.",
    );
    onSaved?.(response);
  };

  const leave = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    routeToPage(ROUTES.Profile.View(user?.username || "").Storyboards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, user?.username]);

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

  const handleDelete = async () => {
    if (!id) return;
    const response = await deleteStoryBoardAction(id);
    setDeleteDialogOpen(false);

    if (response.message === API_MESSAGE.Success) {
      successToast("Story deleted.");
      if (onDeleted) {
        onDeleted(id);
        onClose?.();
      } else {
        routeToPage(ROUTES.Profile.View(user?.username || "").Storyboards);
      }
    } else {
      errorToast("Could not delete the story. Please try again.");
    }
  };

  const headerSubtitle = id
    ? isPublic
      ? "Published · anyone can view"
      : "Members only"
    : "Draft · not yet published";

  return (
    <S.Card $embedded={embedded}>
      <S.TopBar $embedded={embedded}>
        <S.TopBarLeft>
          <S.BackButton type="button" onClick={handleBack} title="Back">
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdAutoStories />
            <div className="titles">
              <h1>{id ? "Edit your story" : "Create a new story"}</h1>
              {embedded && <span className="subtitle">{headerSubtitle}</span>}
            </div>
          </S.FormHeading>
        </S.TopBarLeft>
        {embedded
          ? isCreator &&
            id && (
              <S.HeaderDangerButton
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete story"
                aria-label="Delete story"
              >
                <FaRegTrashCan />
              </S.HeaderDangerButton>
            )
          : isDirty && (
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
                  {loading
                    ? "Saving..."
                    : imageUploading
                      ? "Uploading..."
                      : "Save"}
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
            <span className="s">Shown on story cards and the header</span>
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
          <S.SectionLabel as="span">Visibility</S.SectionLabel>
          <S.VisibilitySeg aria-label="Visibility">
            <S.VisibilitySegOption
              type="button"
              aria-pressed={!isPublic}
              $active={!isPublic}
              onClick={() => setStoryboardState({ isPublic: false })}
            >
              <BsLockFill />
              Members only
            </S.VisibilitySegOption>
            <S.VisibilitySegOption
              type="button"
              aria-pressed={isPublic}
              $active={isPublic}
              onClick={() => setStoryboardState({ isPublic: true })}
            >
              <BsGlobe2 />
              Public
            </S.VisibilitySegOption>
          </S.VisibilitySeg>
          <S.VisibilityHint>
            {isPublic
              ? "Anyone can view this story. You can switch it back to members-only anytime."
              : "Only members can view and post. You can publish it later."}
          </S.VisibilityHint>
        </S.Section>

        <S.Section>
          <S.SectionLabel htmlFor="story-name">Title</S.SectionLabel>
          <S.NameInput
            id="story-name"
            type="text"
            placeholder="Story name"
            value={name}
            onChange={(e) => setStoryboardState({ name: e.target.value })}
            maxLength={50}
          />

          {createdByUsername && (
            <S.CreatorRow>
              <span className="label">Author:</span>
              <span>@{createdByUsername}</span>
            </S.CreatorRow>
          )}
        </S.Section>

        <S.Section>
          <S.SectionLabelRow>
            <S.SectionLabel as="span">Description (optional)</S.SectionLabel>
            <S.GenreCount $full={descriptionTooLong}>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </S.GenreCount>
          </S.SectionLabelRow>
          <S.EditorArea>
            <RichTextEditor
              key={descriptionEditorKey}
              ref={descriptionEditorRef}
              placeholder="Set the scene for your story…"
              value={description}
              compact
              desktopRounded
              onChange={(next) => setStoryboardState({ description: next })}
            />
          </S.EditorArea>
        </S.Section>

        <S.Section>
          <S.SectionLabelRow>
            <S.SectionLabel as="span">Fandom</S.SectionLabel>
            {fandom?.id && (
              <S.PickerClear
                type="button"
                onClick={() => setStoryboardState({ fandom: null })}
              >
                Clear
              </S.PickerClear>
            )}
          </S.SectionLabelRow>
          <FandomPicker
            value={fandom}
            onChange={(next) => setStoryboardState({ fandom: next })}
          />
        </S.Section>

        <S.Section>
          <S.SectionLabelRow>
            <S.SectionLabel as="span">
              <MdOutlineTheaters
                style={{ marginRight: 4, verticalAlign: "-2px" }}
              />
              Genres
            </S.SectionLabel>
            <S.GenreCount $full={genres.length >= 5}>
              {genres.length}/5
            </S.GenreCount>
          </S.SectionLabelRow>
          <GenrePicker
            value={genres}
            onChange={(next) => setStoryboardState({ genres: next })}
          />
        </S.Section>

        <S.Section>
          <S.SectionLabel as="span">
            <LuBookOpen style={{ marginRight: 4, verticalAlign: "-2px" }} />
            Page format
          </S.SectionLabel>
          <PageFormatPicker
            value={pageFormat}
            onChange={(next) => setStoryboardState({ pageFormat: next })}
          />
          <S.VisibilityHint>
            Sets the page size the book layout paginates against. It applies to
            everyone reading or writing this story, so co-authors see the same
            page breaks.
          </S.VisibilityHint>
        </S.Section>

        {id && (
          <S.Section>
            <S.SectionLabel as="span">Members</S.SectionLabel>
            <S.MembersRow
              type="button"
              onClick={() => setMembersDialogOpen(true)}
            >
              <S.MemberStack>
                {members.slice(0, 4).map((member) => (
                  <img
                    key={member.username}
                    className="avatar"
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                    src={member.image || undefined}
                    alt={member.username}
                  />
                ))}
              </S.MemberStack>
              <S.MembersRowText>
                <span className="title">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
                <span className="subtitle">Manage roles & invites</span>
              </S.MembersRowText>
            </S.MembersRow>
          </S.Section>
        )}

        {isCreator && id && (
          <S.DangerZone>
            <S.DangerZoneText>
              <span className="title">Delete this story</span>
              <span className="subtitle">
                Permanently removes the story, its chapters and all threads.
              </span>
            </S.DangerZoneText>
            <S.DeleteButton
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <FaRegTrashCan />
              Delete story
            </S.DeleteButton>
          </S.DangerZone>
        )}
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
                  : "Create story"}
          </S.FooterPrimaryBtn>
        </S.Footer>
      )}

      {id && (
        <StoryboardMembersDialog
          storyBoardId={id}
          members={members}
          creatorUsername={createdByUsername}
          open={membersDialogOpen}
          onClose={() => setMembersDialogOpen(false)}
          onMembersChange={(next) => setStoryboardState({ members: next })}
        />
      )}

      <AppAlertDialog
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
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        heading={`Delete ${name || "story"}?`}
        text="This permanently removes the story, its chapters and all threads. Are you sure?"
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <AppAlertDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
          setCropDialogOpen(open);
        }}
        heading="Adjust story cover"
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

export default EditStoryboardDataCard;
