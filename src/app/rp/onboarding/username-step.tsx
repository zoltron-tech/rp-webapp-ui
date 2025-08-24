import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { checkUsernameAvailability, updateUsernameAction } from "@/app/actions";
import { ErrorBox } from "@/components/error-box";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { User } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { checkUsernameInvalidity } from "@/utils/helpers";
import { useOnboardingState, useOnboardingStoreSet } from "./onboarding.store";
import * as S from "./styled";

type UsernameStepProps = {
  handleNext: () => void;
};

const ErrorKeys = [
  API_MESSAGE.Conflict,
  API_MESSAGE.UncategorizedError,
] as const;
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
  [API_MESSAGE.Conflict]: (
    <p>This username is already in use, please choose another one.</p>
  ),
};

export const UsernameStep: FC<UsernameStepProps> = ({ handleNext }) => {
  const user = useGlobalState("user");
  const username = useOnboardingState("username");
  const setOnboardingState = useOnboardingStoreSet();
  const setGlobalState = useGlobalStoreSet();
  const [error, setError] = useState<ErrorKey | null>(null);
  const [loading, setLoading] = useState(false);

  const setUsername = useCallback(
    (value: string) => {
      setOnboardingState((prev) => ({
        ...prev,
        username: value,
      }));
      setError(null);
    },
    [setOnboardingState],
  );

  const usernameCheck = useCallback(
    async (value: string) => {
      try {
        if (value === user?.username) return false; // No change, no error

        if (checkUsernameInvalidity(value)) return true; // Invalid username format

        setLoading(true);
        const available = await checkUsernameAvailability(value);
        setLoading(false);

        if (!available) return true;
        return false;
      } catch (error) {
        return false;
      }
    },
    [user],
  );

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    },
    [setUsername],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) return;
      const target = e.target as HTMLFormElement;
      const value = target.username.value.trim();
      setLoading(true);

      if (value !== user.username) {
        const response = await updateUsernameAction(value);

        if (response.message !== API_MESSAGE.Success) {
          setLoading(false);
          setError(response.message as ErrorKey);
          return;
        }

        const updatedUser = {
          authApp: user.authApp,
          email: user.email,
          palette: user.palette,
          theme: user.theme,
          username: value,
        } satisfies User;
        setGlobalState({
          user: updatedUser,
        });
      }

      handleNext();
    },
    [user, handleNext, setGlobalState],
  );

  const handleReset = useCallback(() => {
    setUsername(user?.username || "");
    setError(null);
    setLoading(false);
  }, [user, setUsername]);

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit} onReset={handleReset}>
        <Form.Field className="field" name="username">
          <S.FieldHeader>
            <Form.Label>Update your username</Form.Label>
          </S.FieldHeader>
          <Form.Control
            aria-label="Username"
            name="username"
            type="text"
            value={username ?? ""}
            onChange={handleUsernameChange}
            required
            autoFocus
          />
          <Form.Message
            className="label-message"
            match={checkUsernameInvalidity}
          >
            username must be 3-50 characters long and can only contain letters,
            numbers, and underscores
          </Form.Message>
          <Form.Message className="label-message" match={usernameCheck}>
            username is taken
          </Form.Message>
        </Form.Field>
        <ShouldRender if={Boolean(error)}>
          <ErrorBox className="error">
            {ERROR_MAP[error!] || <p>Unknown error occurred.</p>}
          </ErrorBox>
        </ShouldRender>
        <S.FormActions>
          <S.ResetButton type="reset" className="reset-button">
            Reset
          </S.ResetButton>
          <Form.Submit className="submit-button" disabled={loading}>
            Next
          </Form.Submit>
        </S.FormActions>
      </Form.Root>
    </S.FormContainer>
  );
};
