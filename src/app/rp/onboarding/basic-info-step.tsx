import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { TbCameraUp } from "react-icons/tb";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import AvatarCropDialog from "@/components/dialog/avatar-crop-dialog";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { ImageCropFilter, NWImage, UpdateNovelistPayload } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { uploadMedia } from "@/utils/upload-media";
import { updateUserNovelist } from "../novelists/actions";
import { deleteMedia } from "../profile/actions";
import { useOnboardingState, useOnboardingStoreSet } from "./onboarding.store";
import * as S from "./styled";

type BasicInfoStepProps = {
  handleNext: () => void;
};

const ErrorKeys = [API_MESSAGE.UncategorizedError] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.UncategorizedError]: (
    <>
      <p>
        Something went wrong while logging you in, please try reloading the
        page.
      </p>
      <p>
        <strong>Tip:&nbsp;</strong>
        If this keeps happening, try&nbsp;
        <a href={SUPPORT_EMAIL_URL}>contacting support</a>.
      </p>
    </>
  ),
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Build an ImageCropFilter from background-position state.
 * x/y are CSS background-position percentages (0–100, 50 = centered).
 * width/height encode the zoom as scale*100 (100 = 1×, 300 = 3×).
 * This mirrors the Muse cardBackground encoding: a fit-by-width display that
 * is resolution- and aspect-ratio-independent.
 */
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

export const BasicInfoStep: FC<BasicInfoStepProps> = ({ handleNext }) => {
  const novelist = useGlobalState("novelist");
  const firstName = useOnboardingState("firstName");
  const lastName = useOnboardingState("lastName");
  const username = useOnboardingState("username");
  const image = useOnboardingState("image");
  const avatar = useOnboardingState("avatar");
  const setOnboardingState = useOnboardingStoreSet();
  const setGlobalState = useGlobalStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [tempUploadedImage, setTempUploadedImage] = useState<string | null>(
    null,
  );

  // Avatar crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState("");
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropScale, setCropScale] = useState(1);
  const cropViewportRef = useRef<HTMLDivElement>(null);

  const setFirstname = useCallback(
    (value: string) => {
      setOnboardingState({ firstName: value });
      setError(null);
    },
    [setOnboardingState],
  );

  const setLastname = useCallback(
    (value: string) => {
      setOnboardingState({ lastName: value });
      setError(null);
    },
    [setOnboardingState],
  );

  const handleFirstnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFirstname(e.target.value);
    },
    [setFirstname],
  );

  const handleLastnameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLastname(e.target.value);
    },
    [setLastname],
  );

  const openCropDialog = useCallback((src: string) => {
    setPendingCropSrc(src);
    setCropX(50);
    setCropY(50);
    setCropScale(1);
    setCropDialogOpen(true);
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setError(null);

      // Show a data URL immediately in the crop dialog so the user can adjust
      // position/zoom before the upload finishes.
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
        setError(API_MESSAGE.UncategorizedError);
        setCropDialogOpen(false);
        return;
      }

      setTempUploadedImage(url);
      // Replace the data URL in the pending crop source so the confirmed
      // NWImage points to the CDN URL rather than the base64 string.
      setPendingCropSrc(url);
    },
    [openCropDialog, tempUploadedImage],
  );

  // Dragging is handled imperatively inside AvatarCropDialog; it commits the
  // final position here once the gesture settles.
  const handleCropPan = (nx: number, ny: number) => {
    setCropX(clamp(nx, 0, 100));
    setCropY(clamp(ny, 0, 100));
  };

  const handleCropScaleChange = (v: number) => {
    setCropScale(clamp(v, 1, 3));
  };

  const handleCropConfirm = useCallback(() => {
    const crop = toCropFilter(pendingCropSrc, cropX, cropY, cropScale);
    const nwImage: NWImage = {
      crop,
      filterValues: { blur: 0, brightness: 100, greyscale: 0 },
      src: pendingCropSrc,
    };
    setOnboardingState({ avatar: nwImage, image: pendingCropSrc });
    setAvatarChanged(true);
    setCropDialogOpen(false);
  }, [pendingCropSrc, cropX, cropY, cropScale, setOnboardingState]);

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

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _firstName = target.firstName.value.trim();
      const _lastName = target.lastName.value.trim();

      if (
        _firstName !== novelist?.firstName ||
        _lastName !== novelist?.lastName ||
        avatarChanged ||
        image !== novelist?.image
      ) {
        const payload = {
          avatar: avatar ?? undefined,
          firstName: _firstName,
          image: avatar?.src ?? image ?? undefined,
          lastName: _lastName,
        } satisfies UpdateNovelistPayload;

        setLoading(true);
        const response = await updateUserNovelist(payload, !novelist?.id);
        setLoading(false);

        if ("message" in response) {
          setError(response.message as ErrorKey);
          return;
        }
        setGlobalState({
          novelist: response,
        });
        setOnboardingState({
          avatar: (response.avatar as NWImage | null) ?? null,
          firstName: response.firstName || "",
          image: response.image || "",
          lastName: response.lastName || "",
        });
        setAvatarChanged(false);
        setTempUploadedImage(null);
      }
      handleNext();
    },
    [novelist, image, avatar, avatarChanged, handleNext, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setFirstname(novelist?.firstName || "");
    setLastname(novelist?.lastName || "");
    setOnboardingState({
      avatar: novelist?.avatar ?? null,
      image: novelist?.image || "",
    });
    setAvatarChanged(false);
    setLoading(false);
    setError(null);
  }, [novelist, setFirstname, setLastname, setOnboardingState]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
        <S.BasicInfoFields>
          <Form.Field className="avatar-field" name="avatar">
            <Form.Label>
              <AvatarNew
                className="selectable"
                src={avatar?.src || image}
                alt={firstName || username || ""}
                nwImage={avatar}
              />
              <span className="camera-badge" aria-hidden>
                <TbCameraUp />
              </span>
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

          <div className="name-fields">
            <Form.Field className="field" name="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                aria-label="First Name"
                name="firstName"
                type="text"
                value={firstName ?? ""}
                onChange={handleFirstnameChange}
                required
                autoFocus
              />
            </Form.Field>
            <Form.Field className="field" name="lastName">
              <Form.Label>Last Name</Form.Label>

              <Form.Control
                aria-label="Last Name"
                name="lastName"
                type="text"
                value={lastName ?? ""}
                onChange={handleLastnameChange}
              />
            </Form.Field>
          </div>
        </S.BasicInfoFields>
        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            {ERROR_MAP[error!] || <p>Unknown error occurred.</p>}
          </ErrorBox>
        </ShouldRender>
        <S.FormActions>
          <S.ResetButton type="reset" className="reset-button">
            Reset
          </S.ResetButton>
          <Form.Submit
            className="submit-button"
            disabled={loading || imageUploading}
          >
            Next
          </Form.Submit>
        </S.FormActions>
      </Form.Root>

      {/* Avatar crop / adjust dialog */}
      <AppAlertDialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
          setCropDialogOpen(open);
        }}
        heading="Adjust avatar"
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
              onOpenChange={setCropDialogOpen}
              onPan={handleCropPan}
              onScaleChange={handleCropScaleChange}
              onReset={resetCrop}
              onCancel={handleCropCancel}
              onConfirm={handleCropConfirm}
              isUploading={imageUploading}
              viewportRef={cropViewportRef}
            />
          </S.AvatarCropBody>
        }
      />
    </S.FormContainer>
  );
};
