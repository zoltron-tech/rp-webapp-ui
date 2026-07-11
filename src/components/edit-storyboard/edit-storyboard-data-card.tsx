"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BsArrowLeft, BsLockFill, BsUnlockFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdAutoStories, MdOutlineTheaters } from "react-icons/md";
import { deleteMedia } from "@/app/rp/profile/actions";
import {
  deleteStoryBoardAction,
  updateStoryBoardAction,
} from "@/app/rp/story/actions";
import { CoverUploadField } from "@/components/common/cover-upload-field";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { ImageCropFilter, NWImage, StoryBoard } from "@/types";
import type { Genre } from "@/types/common";
import { API_MESSAGE } from "@/utils/constants";
import { STORY_COVER_ASPECT_RATIO } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { StoryboardMembersDialog } from "../storyboard-members-dialog";
import FandomPicker from "./fandom-picker";
import GenrePicker from "./genre-picker";
import { useStoryboardState, useStoryboardStoreSet } from "./storyboard.store";
import * as S from "./styled";

const genreKey = (genres: Genre[]) =>
  genres
    .map((g) => g.id)
    .sort((a, b) => a - b)
    .join(",");

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
  const image = useStoryboardState("image");
  const avatar = useStoryboardState("avatar");
  const isPublic = useStoryboardState("isPublic");
  const tags = useStoryboardState("tags");
  const fandom = useStoryboardState("fandom");
  const genres = useStoryboardState("genres");
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

  // Track "dirty" against the values this form loaded with.
  const initialSnapshot = useRef({ avatar, fandom, genres, isPublic, name });

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
    isPublic !== initialSnapshot.current.isPublic ||
    (fandom?.id ?? null) !== (initialSnapshot.current.fandom?.id ?? null) ||
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

  const handleCropScaleChange = (v: number) => setCropScale(clamp(v, 1, 3));

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
      fandom: initialSnapshot.current.fandom,
      genres: initialSnapshot.current.genres,
      isPublic: initialSnapshot.current.isPublic,
      name: initialSnapshot.current.name,
    });
    setAvatarChanged(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setError(null);
    setLoading(true);

    const payload: StoryBoard = {
      avatar,
      events: [],
      fandom,
      genres,
      id,
      image: avatar?.src ?? image,
      isPublic,
      members,
      name: name.trim(),
      tags,
    };

    const response = await updateStoryBoardAction(payload);
    setLoading(false);

    if ("message" in response) {
      errorToast("Failed to save. Please try again.");
      return;
    }

    setStoryboardState({
      avatar: response.avatar ?? null,
      createdByUsername: response.createdBy?.username ?? user?.username ?? null,
      fandom: response.fandom ?? null,
      genres: response.genres ?? [],
      id: response.id,
      image: response.image ?? null,
      isPublic: response.isPublic,
      members: response.members ?? [],
      name: response.name,
      tags: response.tags ?? [],
    });
    initialSnapshot.current = {
      avatar: response.avatar ?? null,
      fandom: response.fandom ?? null,
      genres: response.genres ?? [],
      isPublic: response.isPublic,
      name: response.name,
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

  return (
    <S.Card $embedded={embedded}>
      <S.TopBar>
        <S.TopBarLeft>
          <S.BackButton type="button" onClick={handleBack} title="Back">
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdAutoStories />
            <h1>{id ? "Edit your story" : "Create a new story"}</h1>
          </S.FormHeading>
        </S.TopBarLeft>
        {isDirty && (
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
              disabled={loading || imageUploading}
            >
              {loading ? "Saving..." : imageUploading ? "Uploading..." : "Save"}
            </S.SaveButton>
          </S.TopBarActions>
        )}
      </S.TopBar>

      {error && <S.ErrorBanner>{error}</S.ErrorBanner>}

      <S.Hero>
        <S.CoverColumn>
          <CoverUploadField
            src={avatar?.src || image || null}
            nwImage={avatar}
            onClick={handleAvatarClick}
          />
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={handleAvatarChange}
          />
        </S.CoverColumn>

        <S.VisibilityColumn>
          <S.SectionLabel as="span">Visibility</S.SectionLabel>
          <S.VisibilityToggle
            type="button"
            $active={isPublic}
            onClick={() => setStoryboardState({ isPublic: !isPublic })}
            aria-pressed={isPublic}
            aria-label={
              isPublic
                ? "Published. Tap to make members-only."
                : "Members only. Tap to publish."
            }
          >
            <S.VisibilityIcon $active={isPublic}>
              {isPublic ? <BsUnlockFill /> : <BsLockFill />}
            </S.VisibilityIcon>
            <S.VisibilityLabel>
              <span className="title">
                {isPublic ? "Published" : "Members only"}
              </span>
              <span className="subtitle">
                {isPublic
                  ? "Anyone can view (read-only)"
                  : "Only members can view"}
              </span>
            </S.VisibilityLabel>
          </S.VisibilityToggle>
        </S.VisibilityColumn>
      </S.Hero>

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
