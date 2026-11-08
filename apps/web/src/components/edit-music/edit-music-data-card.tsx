"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Tag } from "@nw/types/common";
import type { Song } from "@nw/types/music";
import { fileTooLargeMessage } from "@nw/utils";
import { Form } from "radix-ui";
import {
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { HexColorPicker } from "react-colorful";
import { FaPlus, FaXmark } from "react-icons/fa6";
import {
  createSongAction,
  updateSongAction,
} from "@/app/rp/profile/[slug]/music/action";
import { deleteMedia } from "@/app/rp/profile/actions";
import { syncMyBadgesAction } from "@/app/rp/profile/badges/actions";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import { ErrorBox } from "../error-box";
import { Spinner } from "../mention-dropdown/styled";
import { useMusicState, useMusicStoreSet } from "./music.store";
import * as S from "./styled";

const ErrorKeys = [
  API_MESSAGE.UncategorizedError,
  API_MESSAGE.FileTooLarge,
  API_MESSAGE.MediaError,
] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const VALID_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  // "audio/wav",
  // "audio/ogg",
  // "audio/aac",
  // "audio/mp4",
  // "audio/x-m4a",
  // "audio/flac",
];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.UncategorizedError]: (
    <>
      <p>Something went wrong, please try reloading the page.</p>
      <p>
        <strong>Tip:&nbsp;</strong>
        If this keeps happening, try&nbsp;
        <a href={SUPPORT_EMAIL_URL}>contacting support</a>.
      </p>
    </>
  ),
  // The number, when known, is added where this renders (the service's cap).
  [API_MESSAGE.FileTooLarge]: <p>The selected file is too large.</p>,
  [API_MESSAGE.MediaError]: (
    <p>
      File type is not supported. Allowed file types are{" "}
      <strong>(.mp3, .wav, .ogg, .aac, .m4a, .flac)</strong>.
    </p>
  ),
};

export default function EditMusicDataCard() {
  // The service's audio cap (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();
  const novelist = useGlobalState("novelist");
  const id = useMusicState("id");
  const name = useMusicState("name");
  const description = useMusicState("description");
  const url = useMusicState("url");
  const tags = useMusicState("tags");
  const setMusicState = useMusicStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [mediaError, setMediaError] = useState<ErrorKey | null>(null);
  const [mediaTypeError, setMediaTypeError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileBlobUrl, setFileBlobUrl] = useState("");
  const [tempUpload, setTempUpload] = useState<string | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { successToast } = useUIContext();
  const { routeToPage } = usePageRouter();
  const { uploadMedia } = useUploadMedia();

  //File management
  const checkFileSize = (file: File | undefined): boolean => {
    if (!file) return false;
    if (file.size > capFor(file.type)) {
      setMediaError(API_MESSAGE.FileTooLarge);
      return true;
    }
    return false;
  };

  const checkFileType = (file: File | undefined): boolean => {
    if (!file) return false;

    // File type validation
    if (!VALID_AUDIO_TYPES.includes(file.type)) {
      setMediaTypeError(API_MESSAGE.MediaError);
      return true;
    }

    return false;
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (checkFileSize(file) || checkFileType(file)) {
        return;
      }

      setMediaTypeError(null);
      setMediaError(null);

      setFileName(file.name);
      setFileBlobUrl(URL.createObjectURL(file));

      // Delete previous temp upload
      if (tempUpload) {
        await deleteMedia(tempUpload);
      }

      // Upload to S3
      setAudioUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      // Only append prefix if id exists
      if (id) {
        formData.append("prefix", id);
      }
      const s3Url = await uploadMedia(formData);
      setAudioUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setError(API_MESSAGE.UncategorizedError);
        return;
      }

      // Track new temp upload
      setTempUpload(s3Url);

      // Update music state with S3 URL
      setMusicState({ url: s3Url });
    },
    [tempUpload, id, uploadMedia, setMusicState],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  // Tag management state
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const setName = useCallback(
    (value: string) => {
      setMusicState({ name: value });
      setError(null);
    },
    [setMusicState],
  );

  const setDescription = useCallback(
    (value: string) => {
      setMusicState({ description: value });
      setError(null);
    },
    [setMusicState],
  );

  const setUrl = useCallback(
    (value: string) => {
      setMusicState({ url: value });
      setError(null);
    },
    [setMusicState],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    [setName],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
    },
    [setDescription],
  );

  const handleAddTag = useCallback(() => {
    if (!newTagLabel.trim()) return;
    if (tags.length >= 5) {
      setErrors((prev) => ({ ...prev, tags: "Maximum 5 tags allowed" }));
      return;
    }

    const newTag: Tag = {
      color: newTagColor,
      id: `temp-${Date.now()}`,
      label: newTagLabel.trim(),
    };

    setMusicState({ tags: [...tags, newTag] });
    setNewTagLabel("");
    setNewTagColor("#3b82f6");
    setShowColorPicker(false);
    setErrors((prev) => {
      const { tags: _, ...rest } = prev;
      return rest;
    });
  }, [newTagLabel, newTagColor, tags, setMusicState]);

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      setMusicState({ tags: tags.filter((tag) => tag.id !== tagId) });
    },
    [tags, setMusicState],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(API_MESSAGE.UncategorizedError);
      return;
    }

    if (!url.trim()) {
      setError(API_MESSAGE.UncategorizedError);
      return;
    }

    setLoading(true);

    const songData = {
      description: description.trim() || null,
      name: name.trim(),
      tags: tags.map((tag) => ({
        color: tag.color,
        label: tag.label,
      })),
      url: url.trim(),
    };

    try {
      let result: Song | typeof API_MESSAGE.UncategorizedError;
      if (id) {
        result = await updateSongAction(id, songData);
      } else {
        result = await createSongAction(songData);
      }

      if (result === API_MESSAGE.UncategorizedError) {
        setError(API_MESSAGE.UncategorizedError);
        setLoading(false);
        return;
      }

      // Success: clear temp upload because it's now used in the final state
      setTempUpload(undefined);

      successToast(
        id ? "Song updated successfully!" : "Song created successfully!",
      );

      // A first upload is what earns the Musician badge, and the novelist is
      // right here when it happens. Editing an existing song cannot change the
      // answer, so only a create is worth the call. Fire and forget: the badge
      // is not what this screen is about, and the throttled check on the next
      // profile load would catch it anyway.
      if (!id) void syncMyBadgesAction();

      // Navigate to music page
      if (novelist?.username) {
        routeToPage(ROUTES.Profile.View(novelist.username).Music);
      }
    } catch (err) {
      setError(API_MESSAGE.UncategorizedError);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleReset = useCallback(async () => {
    if (tempUpload) {
      await deleteMedia(tempUpload);
    }

    if (novelist?.username) {
      routeToPage(ROUTES.Profile.View(novelist.username).Music);
    }
  }, [tempUpload, novelist?.username, routeToPage]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit}>
        <S.FormSection>
          <S.FormLabel htmlFor="name">
            Song Name <S.Required>*</S.Required>
          </S.FormLabel>
          <S.Input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter song name"
            disabled={loading}
            required
          />
        </S.FormSection>

        <S.FormSection>
          <S.FormLabel htmlFor="description">Description</S.FormLabel>
          <S.TextArea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter a description for this song..."
            disabled={loading}
            rows={4}
          />
        </S.FormSection>

        <S.FormSection>
          <S.FormLabel htmlFor="url">
            Audio File <S.Required>*</S.Required>
            <ShouldRender if={audioUploading}>
              {" "}
              <Spinner />
            </ShouldRender>
          </S.FormLabel>
          <S.DropZone
            $dragging={dragging}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac,.wma,.aiff,.opus,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4,audio/x-m4a,audio/flac"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
            {fileName
              ? `Selected: ${fileName}`
              : "Drag & drop an audio file or click to browse"}
          </S.DropZone>

          <S.FileButtonWrapper>
            <S.FileButton
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              Choose Audio File
            </S.FileButton>
            {fileName && <S.FileName>{fileName}</S.FileName>}
          </S.FileButtonWrapper>

          <S.RightsNotice>
            Only upload music you made or have the rights to share. Songs that
            infringe someone's rights can be reported and removed.
          </S.RightsNotice>

          <ShouldRender if={!!errors.source}>
            <S.ErrorMessage>{errors.source}</S.ErrorMessage>
          </ShouldRender>
        </S.FormSection>

        <ShouldRender if={mediaError != null}>
          <ErrorBox>
            {mediaError === API_MESSAGE.FileTooLarge &&
            Number.isFinite(capFor("audio/mpeg")) ? (
              <p>{fileTooLargeMessage(capFor("audio/mpeg"))}</p>
            ) : (
              ERROR_MAP[mediaError!]
            )}
          </ErrorBox>
        </ShouldRender>

        <ShouldRender if={mediaTypeError != null}>
          <ErrorBox>{ERROR_MAP[mediaTypeError!]}</ErrorBox>
        </ShouldRender>

        <S.FormSection>
          <S.FormLabel>
            Tags {tags.length > 0 && `(${tags.length}/5)`}
          </S.FormLabel>
          <S.TagsContainer>
            {tags.map((tag) => (
              <S.TagItem key={tag.id} $color={tag.color}>
                {tag.label}
                <S.RemoveTagButton
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={loading}
                  aria-label="Remove tag"
                >
                  <FaXmark />
                </S.RemoveTagButton>
              </S.TagItem>
            ))}
          </S.TagsContainer>

          <S.AddTagSection>
            <S.Input
              type="text"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              placeholder="Tag name"
              disabled={loading || tags.length >= 5}
            />
            <S.ColorPickerWrapper>
              <S.ColorInput
                type="button"
                $color={newTagColor}
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={loading || tags.length >= 5}
                aria-label="Pick color"
              />
              <ShouldRender if={showColorPicker}>
                <S.ColorPickerPopover>
                  <HexColorPicker
                    color={newTagColor}
                    onChange={setNewTagColor}
                  />
                </S.ColorPickerPopover>
              </ShouldRender>
            </S.ColorPickerWrapper>
            <S.AddTagButton
              type="button"
              onClick={handleAddTag}
              disabled={loading || !newTagLabel.trim() || tags.length >= 5}
              aria-label="Add tag"
            >
              <FaPlus />
            </S.AddTagButton>
          </S.AddTagSection>

          <ShouldRender if={!!errors.tags}>
            <S.ErrorMessage>{errors.tags}</S.ErrorMessage>
          </ShouldRender>
        </S.FormSection>

        <ShouldRender if={error != null}>
          <ErrorBox>{ERROR_MAP[error!]}</ErrorBox>
        </ShouldRender>

        <S.ButtonGroup>
          <S.Button
            type="button"
            $variant="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </S.Button>
          <S.Button
            type="submit"
            $variant="primary"
            disabled={loading || !name.trim() || (id ? !url.trim() : !fileName)}
          >
            <ShouldRender if={loading}>
              <Spinner />
            </ShouldRender>
            <ShouldRender if={!loading}>
              {id ? "Update Song" : "Create Song"}
            </ShouldRender>
          </S.Button>
        </S.ButtonGroup>
      </Form.Root>
    </S.FormContainer>
  );
}
