"use client";

import type { CreateUpdateMuse, Fandom, Muse } from "@nw/types";
import { type FC, useCallback, useState } from "react";
import { FaMasksTheater } from "react-icons/fa6";
import { TbCameraUp } from "react-icons/tb";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { AvatarNew } from "@/components/common/avatar-new";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { uploadMedia } from "@/utils/upload-media";
import * as S from "./styles";

interface Props {
  /** Called after the character is created and merged into the global
   *  novelist store — callers don't need to select it themselves, the
   *  composer that mounts next will pick it up as the default sender. */
  onCreated?: (muse: Muse) => void;
}

/**
 * Replaces the composer for forced in-character (dropdownSelection="MUSE")
 * contexts when the novelist has no characters yet — an in-character post
 * or reply has nowhere to come from. Collects just enough to start (first
 * name, last name, avatar), creates the character, and merges it into the
 * global novelist store so the composer swaps in automatically.
 */
export const IcMuseRequiredForm: FC<Props> = ({ onCreated }) => {
  const novelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const { errorToast } = useUIContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadMedia(formData);
      setImageUploading(false);

      if (url === API_MESSAGE.MediaError) {
        errorToast("Couldn't upload the avatar. Please try again.");
        return;
      }
      setImage(url);
    },
    [errorToast],
  );

  const handleCreate = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    if (!trimmedFirst || creating) return;

    const payload: CreateUpdateMuse = {
      accent: null,
      cardBackground: null,
      connections: [],
      extraAttributes: null,
      fandom: "FANDOMLESS" as unknown as Fandom,
      firstName: trimmedFirst,
      image,
      lastName: lastName.trim(),
      nicknames: [],
      note: null,
      privacy: "PUBLIC",
      song: null,
      story: null,
      tags: null,
      useAccent: false,
      useExtraImages: false,
      video: null,
      wallpaper: null,
    };

    setCreating(true);
    setError(null);
    const result = await updateMuseAction(null, payload);
    setCreating(false);

    if ("message" in result) {
      setError("Failed to create character. Please try again.");
      return;
    }

    if (novelist) {
      setGlobalState({
        novelist: {
          ...novelist,
          museCount: novelist.museCount + 1,
          muses: [...novelist.muses, result],
        },
      });
    }

    onCreated?.(result);
  }, [
    firstName,
    lastName,
    image,
    creating,
    novelist,
    setGlobalState,
    onCreated,
  ]);

  return (
    <S.IcRequiredWrap>
      <S.IcRequiredHeader>
        <FaMasksTheater />
        <S.IcRequiredHeaderText>
          <S.IcRequiredTitle>
            Create a character to post in character
          </S.IcRequiredTitle>
          <S.IcRequiredDesc>
            In-character posts and replies come from one of your characters —
            you don&apos;t have one yet. Create one now to continue.
          </S.IcRequiredDesc>
        </S.IcRequiredHeaderText>
      </S.IcRequiredHeader>

      <S.IcRequiredBody>
        <S.IcRequiredAvatarLabel>
          <AvatarNew src={image} alt={firstName || "Character avatar"} />
          <span className="camera-badge" aria-hidden>
            <TbCameraUp />
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={imageUploading || creating}
            hidden
          />
        </S.IcRequiredAvatarLabel>

        <S.IcRequiredFields>
          <S.NovelistConfirmCreateInput
            placeholder="First name"
            value={firstName}
            maxLength={40}
            disabled={creating}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <S.NovelistConfirmCreateInput
            placeholder="Last name (optional)"
            value={lastName}
            maxLength={40}
            disabled={creating}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
        </S.IcRequiredFields>
      </S.IcRequiredBody>

      {error && <S.IcRequiredError role="alert">{error}</S.IcRequiredError>}

      <S.IcRequiredSubmitButton
        type="button"
        disabled={!firstName.trim() || creating || imageUploading}
        onClick={handleCreate}
      >
        {creating
          ? "Creating..."
          : imageUploading
            ? "Uploading avatar..."
            : "Create character & continue"}
      </S.IcRequiredSubmitButton>
    </S.IcRequiredWrap>
  );
};

export default IcMuseRequiredForm;
