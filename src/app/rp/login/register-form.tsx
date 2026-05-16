import { ShouldRender } from "@novelist-world/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { checkUsernameAvailability, signupAction } from "@/app/actions";
import { LoaderAction } from "@/components/common/loader-action";
import { UpdatePasswordFields } from "@/components/common/update-password-fields";
import { ErrorBox } from "@/components/error-box";
import { useGlobalStoreSet } from "@/context/store/stores";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

const ErrorKeys = [
  API_MESSAGE.Conflict,
  API_MESSAGE.UncategorizedError,
] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.Conflict]: (
    <>
      <p>
        The email you entered is already in use. Please try&nbsp;
        <a href={`${ROUTES.Login}?register=0`}>logging in</a>&nbsp; if you
        already have an account.
      </p>
    </>
  ),
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

export const RegisterForm: FC = () => {
  const [usernameValidityLoader, setUsernameValidityLoader] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [passwordsValid, setPasswordsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const setGlobalState = useGlobalStoreSet();
  const { push } = useRouter();

  const valid = useMemo(() => {
    return passwordsValid && userConsent;
  }, [passwordsValid, userConsent]);

  const usernameCheck = useCallback(async (value: string) => {
    setUsernameValidityLoader(true);
    try {
      const available = await checkUsernameAvailability(value);
      setUsernameValidityLoader(false);
      if (!available) return true;
      return false;
    } catch (error) {
      console.error("Error checking username availability:", error);
      setUsernameValidityLoader(false);
      return false;
    }
  }, []);

  const onConsentChange = useCallback(() => {
    setUserConsent((prev) => !prev);
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const consent = formData.get("consent") as string;
      if (consent !== "on") {
        console.error("User must agree to the terms and conditions.");
        return;
      }
      setLoading(true);

      const response = await signupAction({
        email,
        password,
        username,
      });

      if (response.message !== API_MESSAGE.Success) {
        setError(response.message as ErrorKey);
        if (response.serverMessage)
          console.error("Server message:", response.serverMessage);
        setLoading(false);
        return;
      }

      setGlobalState({
        authState: "UNINITIALIZED",
        showInstallAppPrompt: true,
        user: response.user!,
      });
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Form.Root onChange={clearError} onSubmit={handleSubmit}>
      <ShouldRender if={Boolean(error)}>
        <ErrorBox className="error">
          {ERROR_MAP[error!] || <p>Unknown error occurred.</p>}
        </ErrorBox>
      </ShouldRender>
      <Form.Field className="field" name="username">
        <S.FieldHeader>
          <Form.Label>Username</Form.Label>
          <Form.Message className="label-message" match="valueMissing">
            username is required
          </Form.Message>
          <Form.Message className="label-message" match="tooShort">
            must be at least 3 characters
          </Form.Message>
          <Form.Message className="label-message" match="patternMismatch">
            only letters, numbers, . _ - allowed
          </Form.Message>
          <Form.Message className="label-message" match={usernameCheck}>
            username is taken
          </Form.Message>
          <Form.Message
            className="label-message"
            match={() => usernameValidityLoader}
          >
            Checking username availability...
          </Form.Message>
        </S.FieldHeader>
        <Form.Control
          aria-label="Username"
          name="username"
          type="text"
          disabled={loading}
          required
          autoFocus
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9_.\-]+"
        />
      </Form.Field>
      <Form.Field className="field" name="email">
        <S.FieldHeader>
          <Form.Label>Email</Form.Label>
          <Form.Message className="label-message" match={"typeMismatch"}>
            must be a valid email address
          </Form.Message>
        </S.FieldHeader>
        <Form.Control
          aria-label="email"
          name="email"
          type="email"
          disabled={loading}
          required
        />
      </Form.Field>
      <UpdatePasswordFields setValid={setPasswordsValid} disabled={loading} />
      <Form.Field className="field checkbox" name="consent">
        <Form.Control
          aria-label="Consent"
          type="checkbox"
          disabled={loading}
          checked={userConsent}
          onChange={onConsentChange}
          required
        />
        <Form.Label>
          I agree to the
          <Link href={ROUTES.Terms}>&nbsp;Terms of Service&nbsp;</Link>
          and
          <Link href={ROUTES.PrivacyPolicy}>&nbsp;Privacy Policy&nbsp;</Link>.
        </Form.Label>
      </Form.Field>
      <Form.Submit
        className="submit-button"
        type="submit"
        disabled={!valid || loading}
      >
        <LoaderAction
          text="Register"
          loadingText="Registering..."
          loading={loading}
        />
      </Form.Submit>
    </Form.Root>
  );
};
