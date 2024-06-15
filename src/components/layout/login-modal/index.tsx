"use client";
import { checkUsernameAvailability } from "@/app/actions";
import { Button, Input, Modal, ShouldRender } from "@/components/common";
import {
  ErrorType,
  useAuthContext,
  useForm,
  useStateMachine,
  useUIContext,
  useVisibility,
} from "@/hooks";
import { LoginPayload } from "@/types";
import { SignUpPayload } from "@/types/register";
import { verifyEmailPattern, verifyUsernamePattern } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FC, memo, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import * as S from "./styles";

type ModalType = "LOGIN" | "SIGNUP" | "FORGOTPASS";

export interface LoginModalProps {
  type?: ModalType;
}

type InputValues = {
  username: string;
  email: string;
  password: string;
};

export const LoginModal: FC<LoginModalProps> = memo(({ type = "LOGIN" }) => {
  const { hide } = useVisibility("login-modal");
  const { state, is, transition } = useStateMachine<ModalType>({
    initial: type,
    transitions: {
      LOGIN: {
        SIGNUP: true,
        FORGOTPASS: true,
      },
      SIGNUP: {
        LOGIN: true,
        FORGOTPASS: true,
      },
      FORGOTPASS: {
        SIGNUP: true,
        LOGIN: true,
      },
    },
  });
  const [verifyUsernameLoading, setVerifyUsernameLoading] =
    useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const usernameAvailableDebounceTimer = useRef<any>(null);
  const { successToast, errorToast } = useUIContext();
  const { login, signup, forgotPassword, state: authState } = useAuthContext();
  const { push } = useRouter();
  const initialRender = useRef(true);

  const checkError = ({
    username,
    email,
    password,
  }: InputValues): ErrorType<InputValues> => {
    if (is("FORGOTPASS")) return null;

    const isSignup = is("SIGNUP");
    if (!email || !password || (isSignup && !username)) {
      return { password: "Please fill in all fields" };
    }
    if (!isSignup) {
      const validEmailOrUsername =
        verifyEmailPattern(email) || verifyUsernamePattern(email);
      if (!validEmailOrUsername) {
        return { password: "Please enter a valid email or username" };
      }
    } else {
      const validEmail = verifyEmailPattern(email);
      if (!validEmail) {
        return { password: "Please enter a valid email" };
      }
    }
    if (isSignup) {
      const validPassword = password.match(/^(?=.*\d).{8,}$/);
      if (!validPassword) {
        return {
          password:
            "Password must be at least 8 characters long and contain at least one number",
        };
      }
      if (!verifyUsernamePattern(username)) {
        return {
          password:
            "Username must be at least 3 characters long and contain only alphanumeric characters",
        };
      }
    }
    return null;
  };

  const beforeUpdate = (
    values: InputValues,
    name: keyof InputValues,
    _prev: InputValues
  ) => {
    if (is("FORGOTPASS")) return values[name];

    if (name !== "username") return values[name];
    const validUsername = verifyUsernamePattern(values.username);
    if (!validUsername) {
      return values[name];
    }
    setVerifyUsernameLoading(true);
    if (usernameAvailableDebounceTimer.current) {
      clearTimeout(usernameAvailableDebounceTimer.current);
    }
    usernameAvailableDebounceTimer.current = setTimeout(async () => {
      const response = await checkUsernameAvailability(values.username);
      if (response === true) {
        setIsUsernameAvailable(true);
      } else {
        setIsUsernameAvailable(false);
      }
      setVerifyUsernameLoading(false);
    }, 500);

    return values[name];
  };

  const handleForgotPassword = async () => {
    const email = values.email;
    try {
      const response = await forgotPassword(email);
      Logger.debug(response);
      if (response.message === "success") {
        Logger.debug("success");
        hide();
        transition("LOGIN");
        clearValues();
        successToast("email sent successfully");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      Logger.debug("error dekho bhai ->", e);
      errorToast("Something went wrong");
    }
  };

  const handleLogin = async () => {
    const payload: LoginPayload = {
      email: values.email,
      password: values.password,
    };
    try {
      const isUsername =
        verifyUsernamePattern(values.email) &&
        !verifyEmailPattern(values.email);
      if (isUsername) {
        payload.username = values.email;
        delete payload.email;
      }
      const response = await login(payload);
      Logger.debug(response);
      if (response.message === "success") {
        Logger.debug("success");
        hide();
        successToast("Logged in successfully");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      Logger.debug("error dekho bhai ->", e);
      errorToast("Something went wrong");
    }
  };

  const handleSignup = async () => {
    const payload: SignUpPayload = {
      username: values.username,
      email: values.email,
      password: values.password,
    };
    try {
      const response = await signup(payload);
      Logger.debug(response);
      if (response.message === "success") {
        successToast("Registered successfully");
        hide();
        push("/rp/profile/edit");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      Logger.debug("error dekho bhai ->", e);
      errorToast("Something went wrong");
    }
  };

  const onSubmit = () => {
    if (disabled) return;
    if (is("SIGNUP")) {
      handleSignup();
    } else if (is("LOGIN")) {
      handleLogin();
    } else {
      handleForgotPassword();
    }
  };

  const getModelHeight = () => {
    if (is("SIGNUP")) {
      return "480px";
    } else if (is("LOGIN")) {
      return "380px";
    } else {
      return "280px";
    }
  };

  const getHeaderPreText = () => {
    if (is("SIGNUP")) {
      return "Already a user?";
    } else if (is("LOGIN")) {
      return "New user?";
    } else {
      return "";
    }
  };

  const getHeaderLink = () => {
    if (is("SIGNUP")) {
      return "Login!";
    } else if (is("LOGIN")) {
      return "Sign Up!";
    } else {
      return "Back";
    }
  };

  const getButtonText = () => {
    if (is("SIGNUP")) {
      return "Register";
    } else if (is("LOGIN")) {
      return "Login";
    } else {
      return "Request Reset Link";
    }
  };

  const { values, submit, update, errors, clearValues } = useForm<InputValues>({
    initialValues: { username: "", email: "", password: "" },
    onSubmit,
    beforeUpdate,
    checkError,
  });

  const getUsernameMessage = () => {
    const validUsername = verifyUsernamePattern(values.username);
    if (!validUsername) return "";

    if (verifyUsernameLoading) {
      return "Verifying username...";
    }

    return isUsernameAvailable ? "Username is available" : "Username is taken";
  };

  const getUsernameMessageType = ():
    | "success"
    | "error"
    | "processing"
    | undefined => {
    if (!values.username) return;

    if (verifyUsernameLoading) {
      return "processing";
    }

    return isUsernameAvailable ? "success" : "error";
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      clearValues();
      return;
    }

    setDisabled(
      !!errors ||
        (is("SIGNUP") && (verifyUsernameLoading || !isUsernameAvailable))
    );
  }, [errors, verifyUsernameLoading, isUsernameAvailable, state]);

  Logger.info("LoginModal rendered");

  return (
    <Modal
      name="login-modal"
      width={"90cqw"}
      maxWidth="500px"
      minWidth="300px"
      minHeight={getModelHeight()}
    >
      <S.Container>
        <S.Header>
          {getHeaderPreText()}
          <span
            className="link"
            onClick={() => transition(is("LOGIN") ? "SIGNUP" : "LOGIN")}
          >
            {getHeaderLink()}
          </span>
        </S.Header>
        <S.Content>
          <ShouldRender if={is("SIGNUP")}>
            <Input
              label="Username"
              name="username"
              type="text"
              onChange={update}
              value={values.username}
              message={getUsernameMessage()}
              messageType={getUsernameMessageType()}
              maxLength={30}
              onEnter={submit}
            />
          </ShouldRender>
          <Input
            label={is("LOGIN") ? "Email or Username" : "Email"}
            name="email"
            type="text"
            onChange={update}
            value={values.email}
            maxLength={50}
            onEnter={submit}
          />
          <ShouldRender if={is("LOGIN", "SIGNUP")}>
            <Input
              label="Password"
              name="password"
              type="password"
              onChange={update}
              value={values.password}
              message={errors?.password}
              messageType="warning"
              maxLength={50}
              onEnter={submit}
            />
          </ShouldRender>
          <ShouldRender if={is("LOGIN")}>
            <S.Hyperlink
              onClick={() => {
                transition("FORGOTPASS");
                console.log(transition);
              }}
            >
              Forgot password?
            </S.Hyperlink>
          </ShouldRender>
          <Button
            onClick={() => submit()}
            variant="primary"
            disabled={disabled}
            loading={authState === "LOADING"}
          >
            {getButtonText()}
          </Button>
        </S.Content>
      </S.Container>
    </Modal>
  );
});
