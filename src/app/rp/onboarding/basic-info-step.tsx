import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { AvatarNew } from "@/components/common/avatar-new";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { UpdateNovelistPayload } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { updateUserNovelist } from "../novelists/actions";
import { uploadMedia } from "../profile/actions";
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

export const BasicInfoStep: FC<BasicInfoStepProps> = ({ handleNext }) => {
  const novelist = useGlobalState("novelist");
  const firstName = useOnboardingState("firstName");
  const lastName = useOnboardingState("lastName");
  const username = useOnboardingState("username");
  const image = useOnboardingState("image");
  const setOnboardingState = useOnboardingStoreSet();
  const setGlobalState = useGlobalStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        setOnboardingState({ image: reader.result as string });
        const formData = new FormData();
        formData.append("file", file);
        setImageUploading(true);
        const response = await uploadMedia(formData);
        setImageUploading(false);
        if (response === API_MESSAGE.MediaError) {
          setError(API_MESSAGE.UncategorizedError);
          return;
        }
        setOnboardingState({ image: response });
      };
      reader.readAsDataURL(file);
    },
    [setOnboardingState],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      const target = e.target as HTMLFormElement;
      const _firstName = target.firstName.value.trim();
      const _lastName = target.lastName.value.trim();

      if (
        _firstName !== novelist?.username ||
        _lastName !== novelist?.lastName ||
        image !== novelist?.image
      ) {
        const payload = {
          firstName: _firstName,
          image: image ?? undefined,
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
          firstName: response.firstName || "",
          image: response.image || "",
          lastName: response.lastName || "",
        });
      }
      handleNext();
    },
    [novelist, image, handleNext, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setFirstname(novelist?.firstName || "");
    setLastname(novelist?.lastName || "");
    setLoading(false);
    setError(null);
  }, [novelist, setFirstname, setLastname, setLoading, setError]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
        <S.BasicInfoFields>
          <Form.Field className="avatar-field" name="avatar">
            <Form.Label>
              <AvatarNew
                className="selectable"
                src={image}
                alt={firstName || username || ""}
              />
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
    </S.FormContainer>
  );
};
