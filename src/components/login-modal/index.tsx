/* eslint-disable react-hooks/exhaustive-deps */
import { checkUsernameAvailability } from "@/app/actions";
import { Button, Input, Modal, ShouldRender } from "@/components/common";
import { ErrorType, useAuthContext, useForm, useUIContext } from "@/hooks";
import { LoginPayload, LoginResponse } from "@/types";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";
import {
  toggleState,
  verifyEmailPattern,
  verifyUsernamePattern,
} from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { FC, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import * as S from "./styles";

export type LoginModalProps = {};

type InputValues = {
  username: string;
  email: string;
  password: string;
};

export const LoginModal: FC<LoginModalProps> = ({}) => {
  const { signupModalOpen, signupModal, setSignupModal, setSignupModalOpen } =
    useUIContext();
  const [verifyUsernameLoading, setVerifyUsernameLoading] =
    useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const usernameAvailableDebounceTimer = useRef<any>(null);
  const { successToast, errorToast } = useUIContext();
  const { login, signup, loading } = useAuthContext();
  const { push } = useRouter();
  const initialRender = useRef(true);

  const checkError = ({
    username,
    email,
    password,
  }: InputValues): ErrorType<InputValues> => {
    if (!email || !password || (signupModal && !username)) {
      return { password: "Please fill in all fields" };
    }
    const validEmail = verifyEmailPattern(email);
    if (!validEmail) {
      return { password: "Please enter a valid email" };
    }
    if (signupModal) {
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
      const response: LoginResponse = await login(payload);
      Logger.log(response);
      if (response.message === "success") {
        Logger.log("success");
        setSignupModalOpen(false);
        successToast("Logged in successfully");
        push("/rp/profile");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      Logger.log("error dekho bhai ->", e);
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
      const response: WithMessage = await signup(payload);
      Logger.log(response);
      if (response.message === "success") {
        successToast("Registered successfully");
        setSignupModalOpen(false);
        push("/rp/profile");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      Logger.log("error dekho bhai ->", e);
      errorToast("Something went wrong");
    }
  };

  const onSubmit = () => {
    if (disabled) return;
    if (signupModal) {
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
        (signupModal && (verifyUsernameLoading || !isUsernameAvailable))
    );
  }, [errors, verifyUsernameLoading, isUsernameAvailable, signupModal]);

  return (
    <Modal
      width={"90cqw"}
      maxWidth="500px"
      minWidth="300px"
      open={signupModalOpen}
      onClose={() => setSignupModalOpen(false)}
      minHeight={signupModal ? "480px" : "380px"}
    >
      <S.Container>
        <S.Header>
          {signupModal ? "Already a user?" : "New user?"}
          <span className="link" onClick={toggleState(setSignupModal)}>
            {signupModal ? "Login!" : "Sign up!"}
          </span>
        </S.Header>
        <S.Content>
          <ShouldRender if={signupModal}>
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
            label="Email"
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
            onClick={submit}
            variant="primary"
            disabled={disabled}
            loading={loading}
            size="lg"
          >
            {signupModal ? "Register" : "Login"}
          </Button>
        </S.Content>
      </S.Container>
    </Modal>
  );
};
