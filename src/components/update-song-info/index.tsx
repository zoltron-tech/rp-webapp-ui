"use client";

import { type FC, useCallback, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { FaPlus, FaXmark } from "react-icons/fa6";
import { updateSongAction } from "@/app/rp/profile/[slug]/music/action";
import { useCustomEvents, useUIContext } from "@/hooks";
import type { Tag } from "@/types/common";
import type { Song } from "@/types/music";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { AppAlertDialog } from "../dialog";
import * as S from "./styled";

export type UpdateSongInfoProps = {
  payload: Song | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const UpdateSongInfoForm: FC<UpdateSongInfoProps> = ({
  payload,
  open = false,
  setOpen,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { successToast, errorToast } = useUIContext();
  const { emit } = useCustomEvents(EVENTS.SONG.base);

  const handleClose = useCallback(
    (_newValue: boolean) => {
      setName("");
      setDescription("");
      setTags([]);
      setNewTagLabel("");
      setNewTagColor("#3b82f6");
      setShowColorPicker(false);
      setErrors({});
      setOpen(false);
    },
    [setOpen],
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

    setTags([...tags, newTag]);
    setNewTagLabel("");
    setNewTagColor("#3b82f6");
    setShowColorPicker(false);
    setErrors((prev) => {
      const { tags: _, ...rest } = prev;
      return rest;
    });
  }, [newTagLabel, newTagColor, tags]);

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      setTags(tags.filter((tag) => tag.id !== tagId));
    },
    [tags],
  );

  const handleUpdateSongInfo = async () => {
    if (!payload?.id || !name.trim()) {
      errorToast("Song name is required");
      return;
    }

    const response = await updateSongAction(payload.id, {
      description: description.trim() || null,
      name: name.trim(),
      tags: tags.map((tag) => ({ color: tag.color, label: tag.label })),
    });

    if (response && typeof response === "object" && "id" in response) {
      successToast("Song info updated successfully");
      emit(EVENTS.SONG.UPDATED, {
        description,
        id: payload.id,
        name,
        tags,
      });
      handleClose(false);
    } else {
      errorToast("There was an issue while updating this song.");
    }
  };

  useEffect(() => {
    if (payload) {
      setName(payload.name);
      setDescription(payload.description || "");
      setTags(payload.tags || []);
    }
  }, [payload]);

  const isChanged =
    name !== payload?.name ||
    description !== (payload?.description || "") ||
    JSON.stringify(tags) !== JSON.stringify(payload?.tags || []);

  return (
    <AppAlertDialog
      heading="Edit Song Info"
      text="Update your song's name, description, and tags"
      body={
        <S.FormRoot
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <S.FormField name="song_name">
            <S.Label>Song Name *</S.Label>
            <S.FormControl
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter song name"
            />
          </S.FormField>

          <S.FormField name="description">
            <S.Label>Description</S.Label>
            <S.FormTextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={4}
            />
          </S.FormField>

          <S.FormField name="tags">
            <S.Label>Tags (Max 5)</S.Label>
            <S.TagsContainer>
              {tags.map((tag) => (
                <S.Tag key={tag.id} $color={tag.color}>
                  {tag.label}
                  <S.RemoveTagButton
                    onClick={() => handleRemoveTag(tag.id)}
                    aria-label={`Remove tag ${tag.label}`}
                  >
                    <FaXmark size={12} />
                  </S.RemoveTagButton>
                </S.Tag>
              ))}
            </S.TagsContainer>

            {errors.tags && <S.ErrorMessage>{errors.tags}</S.ErrorMessage>}

            <S.AddTagContainer>
              <S.TagInput
                type="text"
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder="Add new tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <S.ColorPickerButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                style={{ backgroundColor: newTagColor }}
                aria-label="Toggle color picker"
              />
              <S.AddButton onClick={handleAddTag} aria-label="Add tag">
                <FaPlus />
              </S.AddButton>
            </S.AddTagContainer>

            {showColorPicker && (
              <S.ColorPickerContainer>
                <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
              </S.ColorPickerContainer>
            )}
          </S.FormField>
        </S.FormRoot>
      }
      open={open}
      onOpenChange={handleClose}
      onConfirm={handleUpdateSongInfo}
      actionButtonLabel="Update"
      actionColor="neutral"
      isConfirmDisabled={!isChanged}
    />
  );
};
