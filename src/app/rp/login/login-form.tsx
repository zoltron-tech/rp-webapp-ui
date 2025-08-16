import { ShouldRender } from "@novelist-world/ui";
import { useRouter } from "next/navigation";
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
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { getUserNovelist } from "../novelists/actions";
import * as S from "./styled";

const ErrorKeys = [
  API_MESSAGE.BadPayload,
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
  const { push } = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      clearError();
      setLoading(true);

      const isEmail = username.includes("@");
      const loginPayload = isEmail
        ? { email: username, password }
        : { username, password };

      const response = await loginAction(loginPayload);
      if (ErrorKeys.includes(response.message as ErrorKey)) {
        setError(response.message as ErrorKey);
        setLoading(false);
        return;
      }

      const _novelist = await getUserNovelist();

      if ("message" in _novelist) {
        if (_novelist.message === API_MESSAGE.NotFound) {
          setLoading(false);
          push("/rp/profile/edit");
          setGlobalState({ authState: "UNINITIALIZED", user: response.user! });
          return;
        } else {
          setError(API_MESSAGE.UncategorizedError);
          setLoading(false);
          return;
        }
      }

      setGlobalState({
        user: response.user!,
        novelist: _novelist,
        authState: "LOGGED_IN",
      });
      push("/rp/home");
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
      <S.FrogotPasswordLink href="/rp/forgot-password" tabIndex={0}>
        Forgot Password?
      </S.FrogotPasswordLink>
    </Form.Root>
  );
};
