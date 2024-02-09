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

type ModalType = "LOGIN" | "SIGNUP";

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
      },
      SIGNUP: {
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
  const { login, signup, state: authState } = useAuthContext();
  const { push } = useRouter();
  const initialRender = useRef(true);

  const checkError = ({
    username,
    email,
    password,
  }: InputValues): ErrorType<InputValues> => {
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
    } else {
      handleLogin();
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
      minHeight={is("SIGNUP") ? "480px" : "380px"}
    >
      <S.Container>
        <S.Header>
          {is("SIGNUP") ? "Already a user?" : "New user?"}
          <span
            className="link"
            onClick={() => transition(is("SIGNUP") ? "LOGIN" : "SIGNUP")}
          >
            {is("SIGNUP") ? "Login!" : "Sign up!"}
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
            label={is("SIGNUP") ? "Email" : "Email or Username"}
            name="email"
            type="text"
            onChange={update}
            value={values.email}
            maxLength={50}
            onEnter={submit}
          />
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

          <Button
            onClick={() => submit()}
            variant="primary"
            disabled={disabled}
            loading={authState === "LOADING"}
          >
            {is("SIGNUP") ? "Register" : "Login"}
          </Button>
        </S.Content>
      </S.Container>
    </Modal>
  );
});
