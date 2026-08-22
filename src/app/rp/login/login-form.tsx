import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  type FormEventHandler,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { loginAction } from "@/app/actions";
import { LoaderAction } from "@/components/common/loader-action";
import { PasswordField } from "@/components/common/password-field";
import { ErrorBox } from "@/components/error-box";
import { useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { usePostLogin } from "@/hooks/use-post-login";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { syncE2EKeyBackup } from "@/utils/e2e-crypto";
import { UNCATEGORIZED_ERROR_MESSAGE } from "@/utils/form-errors";
import { getUserNovelist } from "../novelists/actions";
import * as S from "./styled";

const ErrorKeys = [
  API_MESSAGE.BadPayload,
  API_MESSAGE.UncategorizedError,
] as const;
type ErrorKey = (typeof ErrorKeys)[number];

const ERROR_MAP: Record<ErrorKey, ReactNode> = {
  [API_MESSAGE.UncategorizedError]: UNCATEGORIZED_ERROR_MESSAGE,
  [API_MESSAGE.BadPayload]: (
    <>
      <p>Invalid username or password. Please try again.</p>
      <p>
        <strong>Tip:&nbsp;</strong>
        You can also sign in using your email if you forgot your username.
      </p>
    </>
  ),
};

export const LoginForm: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const setGlobalState = useGlobalStoreSet();
  const { routeToPage } = usePageRouter();
  const { handlePostLogin } = usePostLogin();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = (formData.get("username") as string).trim();
      const password = formData.get("password") as string;

      clearError();
      setLoading(true);

      const isEmail = username.includes("@");
      const loginPayload = isEmail
        ? { email: username, password }
        : { password, username };

      console.log(loginPayload);

      const response = await loginAction(loginPayload);
      if (ErrorKeys.includes(response.message as ErrorKey)) {
        setError(response.message as ErrorKey);
        setLoading(false);
        return;
      }

      // Restore (or create) the E2E chat key backup with the password the
      // user just proved is current. Fire-and-forget — must not block login.
      void syncE2EKeyBackup(password, { replaceOnMismatch: true });

      console.log(response);

      const _novelist = await getUserNovelist();

      console.log(_novelist);

      if ("message" in _novelist) {
        if (_novelist.message === API_MESSAGE.NotFound) {
          setLoading(false);
          setGlobalState({
            authState: "UNINITIALIZED",
            showInstallAppPrompt: true,
            user: response.user!,
          });
          return;
        } else {
          setError(API_MESSAGE.UncategorizedError);
          setLoading(false);
          return;
        }
      }

      // handlePostLogin sets novelist/user, fetches unread counts, then sets
      // authState — which triggers LoginPage's useEffect to navigate to Home.
      const onboarded = await handlePostLogin(_novelist, response.user!);
      if (!onboarded) {
        setGlobalState({ showInstallAppPrompt: true });
      }
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
        <Form.Label>Username</Form.Label>
        <Form.Control
          name="username"
          type="text"
          placeholder="Username or email"
          disabled={loading}
          autoComplete="username"
          spellCheck
          autoFocus
          required
        />
      </Form.Field>
      <PasswordField disabled={loading} placeholder="If you remember it..." />
      <Form.Submit className="submit-button" type="submit" disabled={loading}>
        <LoaderAction
          text="Login"
          loadingText="Retrieving account..."
          loading={loading}
        />
      </Form.Submit>
      <S.FrogotPasswordLink href={ROUTES.ForgotPassword} tabIndex={0}>
        Forgot Password?
      </S.FrogotPasswordLink>
    </Form.Root>
  );
};
