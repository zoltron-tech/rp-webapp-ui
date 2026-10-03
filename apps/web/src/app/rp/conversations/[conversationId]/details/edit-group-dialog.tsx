"use client";

import type { Conversation } from "@nw/types";
import type React from "react";
import { useEffect, useState } from "react";
import { TbCameraUp } from "react-icons/tb";
import { Input } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { uploadMedia } from "@/utils/upload-media";
import { updateGroupAction } from "../actions";
import * as S from "./edit-group-dialog.styles";

type EditGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  /** Called with the updated conversation after a successful update. */
  onUpdated: (conversation: Conversation) => void;
};

export function EditGroupDialog({
  open,
  onOpenChange,
  conversation,
  onUpdated,
}: EditGroupDialogProps) {
  const { errorToast } = useUIContext();
  const [name, setName] = useState(conversation.name ?? "");
  const [avatarFile, setAvatarFile] = useState<FormData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Re-seed the fields whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setName(conversation.name ?? "");
      setAvatarFile(null);
      setPreviewUrl(null);
    }
  }, [open, conversation.name]);

  // Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.includes("image")) {
      errorToast("File type is not a valid image!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setAvatarFile(formData);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const reset = () => {
    setName(conversation.name ?? "");
    setAvatarFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      errorToast("Group name must not be blank.");
      return;
    }

    setLoading(true);

    let imageUrl: string | undefined;
    if (avatarFile) {
      const uploaded = await uploadMedia(avatarFile);
      if (uploaded === API_MESSAGE.MediaError) {
        setLoading(false);
        errorToast("Failed to upload image. Please try again.");
        return;
      }
      imageUrl = uploaded;
    }

    const payload: { name?: string; image?: string } = {};
    if (trimmedName !== (conversation.name ?? "")) payload.name = trimmedName;
    if (imageUrl) payload.image = imageUrl;

    if (!payload.name && !payload.image) {
      setLoading(false);
      onOpenChange(false);
      return;
    }

    const result = await updateGroupAction(conversation.id, payload);
    setLoading(false);

    if (!result || "message" in result) {
      errorToast("Failed to update group. Please try again.");
      return;
    }

    onOpenChange(false);
    onUpdated(result);
  };

  return (
    <AppAlertDialog
      heading="Edit group"
      text="Edit group"
      body={
        <S.Body>
          <S.AvatarUpload>
            <S.Avatar
              src={previewUrl || conversation.image || null}
              alt={conversation.name || "Group avatar"}
            />
            <S.CameraBadge>
              <TbCameraUp />
            </S.CameraBadge>
            <S.HiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </S.AvatarUpload>
          <Input
            label="Group name"
            name="groupName"
            placeholder=""
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </S.Body>
      }
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      actionButtonLabel={loading ? "Saving..." : "Save"}
      actionColor="neutral"
      closeButtonText="Cancel"
      isConfirmDisabled={loading || !name.trim()}
    />
  );
}
