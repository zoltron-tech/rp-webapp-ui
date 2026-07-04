"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import { Form, Separator } from "radix-ui";
import {
  type FormEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import { ImProfile } from "react-icons/im";
import { setMuseAvatarAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useUploadMedia } from "@/hooks/use-upload-media";
import type { Fandom, NWImage } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { AvatarUploadField } from "../common/avatar-upload-field";
import { AppAlertDialog } from "../dialog";
import AvatarCropDialog from "../dialog/avatar-crop-dialog";
import { ErrorBox } from "../error-box";
import { PromptPrivacySelect } from "../prompt-input/privacy-select";
import { FandomSelect } from "./fandom-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";
import { useMuseSave } from "./use-muse-save";

const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

import { FiArrowLeft } from "react-icons/fi";

type Props = {
  onContinue: (savedId: string) => void;
  onBack?: () => void;
};

export function CreateInitialSection({ onContinue, onBack }: Props) {
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const image = useMuseState("image");
  const avatar = useMuseState("avatar");
  const fandom = useMuseState("fandom");
  const privacy = useMuseState("privacy");
  const setMuseState = useMuseStoreSet();
  const { save, loading } = useMuseSave();
  const { uploadMedia } = useUploadMedia();

  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUpload, setTempUpload] = useState<string | null>(null);

  // ── Avatar crop dialog ──────────────────────────────────────────────────────
  const avatarViewportRef = useRef<HTMLDivElement>(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState("");
  const [avatarX, setAvatarX] = useState(50);
  const [avatarY, setAvatarY] = useState(50);
  const [avatarScale, setAvatarScale] = useState(1);

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

  const openAvatarCropDialog = (src: string) => {
    setPendingAvatarSrc(src);
    setAvatarX(50);
    setAvatarY(50);
    setAvatarScale(1);
    setAvatarCropOpen(true);
  };

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setError("File type not supported. Allowed: .png, .jpg, .gif");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File too large (max 50 MB).");
        return;
      }

      setError(null);

      // Show a data URL immediately in the crop dialog while S3 uploads in parallel
      const reader = new FileReader();
      reader.onloadend = () => openAvatarCropDialog(reader.result as string);
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
        setAvatarCropOpen(false);
        return;
      }

      setTempUpload(s3Url);
      setPendingAvatarSrc(s3Url);
    },
    [tempUpload, uploadMedia],
  );

  // Dragging is handled imperatively inside AvatarCropDialog; it commits the
  // final position here once the gesture settles.
  const handleAvatarPan = (nx: number, ny: number) => {
    setAvatarX(clamp(nx, 0, 100));
    setAvatarY(clamp(ny, 0, 100));
  };

  const handleAvatarScaleChange = (v: number) => {
    setAvatarScale(clamp(v, 1, 3));
  };

  const resetAvatarCrop = useCallback(() => {
    setAvatarX(50);
    setAvatarY(50);
    setAvatarScale(1);
  }, []);

  // The muse doesn't exist yet, so the adjusted avatar is only stored locally;
  // handleSubmit persists it via setMuseAvatarAction once the save returns an id.
  const handleAvatarCropConfirm = useCallback(() => {
    const scalePct = Math.round(avatarScale * 100);
    const nwImage: NWImage = {
      crop: {
        height: scalePct,
        src: pendingAvatarSrc,
        width: scalePct,
        x: Math.round(avatarX),
        y: Math.round(avatarY),
      },
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingAvatarSrc,
    };
    setMuseState({ avatar: nwImage, image: pendingAvatarSrc });
  }, [pendingAvatarSrc, avatarX, avatarY, avatarScale, setMuseState]);

  const handleAvatarCropCancel = useCallback(async () => {
    if (tempUpload && tempUpload === pendingAvatarSrc) {
      await deleteMedia(tempUpload);
      setTempUpload(null);
    }
    setAvatarCropOpen(false);
  }, [tempUpload, pendingAvatarSrc]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const firstNameValue = form.firstName.value.trim();
      const lastNameValue = form.lastName.value.trim();
      if (!firstNameValue) return;
      setMuseState({ firstName: firstNameValue, lastName: lastNameValue });

      const privacyValue = (e.target as HTMLFormElement).privacy?.value;
      setMuseState({ privacy: privacyValue });
      const result = await save(privacyValue);
      if (!result.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      // The avatar adjustment was captured before the muse existed; persist it
      // now that we have an id. Failure is non-fatal — the appearance step can
      // redo the avatar.
      if (avatar) {
        const avatarResult = await setMuseAvatarAction(result.id, avatar);
        if (avatarResult && !("message" in avatarResult)) {
          setMuseState({ avatar: avatarResult as NWImage });
        }
      }

      setTempUpload(null);
      onContinue(result.id);
    },
    [save, setMuseState, onContinue, avatar],
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
          <PromptPrivacySelect
            className="muse-privacy-select"
            initial={privacy}
            blockedOptions={["CUSTOM"]}
          />
        </S.TopBar>
        <Separator.Root className="separator" orientation="horizontal" />

        <S.BasicInfoFields>
          <S.MediaUploadSectionContainer>
            <Form.Field className="avatar-field" name="avatar">
              <Form.Label className="media-label">
                <AvatarUploadField
                  src={avatar?.src || image}
                  alt={firstName || "Avatar"}
                  nwImage={avatar}
                />
                <span>Avatar</span>
              </Form.Label>
              <Form.Control
                aria-label="Avatar"
                name="avatar"
                type="file"
                onChange={handleAvatarChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={imageUploading}
                hidden
              />
            </Form.Field>
          </S.MediaUploadSectionContainer>
        </S.BasicInfoFields>

        {/* Avatar crop dialog */}
        <AppAlertDialog
          open={avatarCropOpen}
          onOpenChange={(open) => {
            if (!open) handleAvatarCropCancel();
            setAvatarCropOpen(open);
          }}
          heading="Adjust avatar"
          text="Drag to reposition. Use the slider or scroll to zoom."
          showConfirm={false}
          isCancelHidden={true}
          body={
            <S.AvatarCropBody>
              <AvatarCropDialog
                open={avatarCropOpen}
                src={pendingAvatarSrc}
                x={avatarX}
                y={avatarY}
                scale={avatarScale}
                onOpenChange={setAvatarCropOpen}
                onPan={handleAvatarPan}
                onScaleChange={handleAvatarScaleChange}
                onReset={resetAvatarCrop}
                onCancel={handleAvatarCropCancel}
                onConfirm={handleAvatarCropConfirm}
                isUploading={imageUploading}
                viewportRef={avatarViewportRef}
              />
            </S.AvatarCropBody>
          }
        />

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
