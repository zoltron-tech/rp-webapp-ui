"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import { Form, Separator } from "radix-ui";
import { type FormEventHandler, useCallback, useState } from "react";
import { ImProfile } from "react-icons/im";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { Fandom } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { ErrorBox } from "../error-box";
import { FandomSelect } from "./fandom-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

import { FiArrowLeft } from "react-icons/fi";

type Props = {
  onContinue: (savedId: string) => void;
  onBack?: () => void;
};

export function CreateInitialSection({ onContinue, onBack }: Props) {
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const fandom = useMuseState("fandom");
  const setMuseState = useMuseStoreSet();
  const { save, loading } = useMuseSave();
  const { uploadMedia } = useUploadMedia();

  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUpload, setTempUpload] = useState<string | null>(null);

  const handleFirstNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMuseState({ firstName: e.target.value });
      setError(null);
    },
    [setMuseState],
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMuseState({ lastName: e.target.value });
      setError(null);
    },
    [setMuseState],
  );

  const handleFandomChange = useCallback(
    (value: Fandom) => {
      setMuseState({ fandom: value });
    },
    [setMuseState],
  );

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setError("File type not supported. Allowed: .png, .jpg, .gif");
        e.target.value = "";
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File too large (max 50 MB).");
        e.target.value = "";
        return;
      }

      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => setMuseState({ image: reader.result as string });
      reader.readAsDataURL(file);

      if (tempUpload) await deleteMedia(tempUpload);

      setImageUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      const s3Url = await uploadMedia(formData);
      setImageUploading(false);

      if (s3Url === API_MESSAGE.MediaError) {
        setError("Failed to upload avatar. Please try again.");
        return;
      }

      setTempUpload(s3Url);
      setMuseState({ image: s3Url });
    },
    [setMuseState, tempUpload, uploadMedia],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const firstNameValue = form.firstName.value.trim();
      const lastNameValue = form.lastName.value.trim();
      if (!firstNameValue) return;
      setMuseState({ firstName: firstNameValue, lastName: lastNameValue });

      const result = await save();
      if (!result.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      setTempUpload(null);
      onContinue(result.id);
    },
    [save, setMuseState, onContinue],
  );

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit}>
        <S.TopBar>
          <Flex>
            {onBack && (
              <S.BackButton
                type="button"
                aria-label="Back"
                onClick={onBack}
                style={{ marginRight: 12 }}
              >
                <FiArrowLeft />
              </S.BackButton>
            )}
            <S.FormHeading>
              <ImProfile />
              <h1>Add a new character</h1>
            </S.FormHeading>
          </Flex>
          <div style={{ width: 32 }} /> {/* Placeholder for spacing */}
        </S.TopBar>
        <Separator.Root className="separator" orientation="horizontal" />

        <S.BasicInfoFields>
          <S.MediaUploadSectionContainer>
            <Form.Field className="avatar-field" name="avatar">
              <Form.Label className="media-label">
                <AvatarUploadField src={image} alt={firstName || "Avatar"} />
                <span>Avatar</span>
              </Form.Label>
              <Form.Control
                aria-label="Avatar"
                name="avatar"
                type="file"
                onChange={handleAvatarChange}
                accept="image/*"
                hidden
              />
            </Form.Field>
          </S.MediaUploadSectionContainer>
        </S.BasicInfoFields>

        <Separator.Root className="separator" orientation="horizontal" />

        <S.BasicInfoFields>
          <div className="name-fields">
            <Form.Field className="field" name="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                aria-label="First Name"
                name="firstName"
                type="text"
                value={firstName ?? ""}
                onChange={handleFirstNameChange}
                required
              />
            </Form.Field>

            <Form.Field className="field" name="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                aria-label="Last Name"
                name="lastName"
                type="text"
                value={lastName ?? ""}
                onChange={handleLastNameChange}
              />
            </Form.Field>
          </div>
        </S.BasicInfoFields>

        <Separator.Root className="separator" orientation="horizontal" />

        <S.FandomSelectWrapper>
          <FandomSelect value={fandom} onChange={handleFandomChange} />
        </S.FandomSelectWrapper>

        <Separator.Root className="separator" orientation="horizontal" />

        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            <p>{error}</p>
          </ErrorBox>
        </ShouldRender>

        <S.FormActions>
          <Form.Submit
            className="submit-button"
            disabled={loading || imageUploading}
          >
            {loading || imageUploading ? "Saving..." : "Continue →"}
          </Form.Submit>
        </S.FormActions>
      </Form.Root>
    </S.FormContainer>
  );
}
