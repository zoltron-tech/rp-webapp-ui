import { FC, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { LoginPayload, LoginResponse } from "@/types";
import { Button, Input, Modal, ShouldRender } from "@/components/common";
import {
  checkUsernameAvailability,
  login,
  register,
  reroute,
} from "@/app/actions";
import {
  generateToastError,
  generateToastSuccess,
  verifyEmailPattern,
  verifyUsernamePattern,
} from "@/utils/helpers";
import { useAuth, useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";

import * as S from "./styles";
import { WithMessage } from "@/types/common";
import { SignUpPayload } from "@/types/register";

export type LoginModalProps = {};

export const LoginModal: FC<LoginModalProps> = ({}) => {
  const { signupModalOpen, signupModal, setSignupModal, setSignupModalOpen } =
    useUIContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyUsernameLoading, setVerifyUsernameLoading] =
    useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<boolean>(false);
  const [username, setusername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const theme = useTheme();
  const { verify } = useAuth();
  const usernameAvailableDebounceTimer = useRef<any>(null);

  const checkError = (force?: boolean): boolean => {
    if (!force && !buttonClicked) {
      Logger.log("check error: --");
      return false;
    }

    if (!email || !password || (signupModal && !username)) {
      setError("Please fill in all fields");
      return true;
    }

    const validEmail = verifyEmailPattern(email);

    if (!validEmail) {
      setError("Please enter a valid email");
      return true;
    }

    const validPassword = password.match(/^(?=.*\d).{8,}$/);

    if (!validPassword) {
      setError(
        "Password must be at least 8 characters long and contain at least one number"
      );
      return true;
    }

    if (signupModal && !verifyUsernamePattern(username)) {
      setError(
        "Username must be at least 3 characters long and contain only alphanumeric characters"
      );
      return true;
    }

    setError("");
    return false;
  };

  const clearError = () => {
    setButtonClicked(false);
    if (error) setTimeout(() => setError(""), 1000);
  };

  const handleUsernameChange = async (value: string) => {
    setusername(value);
    clearError();
    if (!value) return;

    const validUsername = verifyUsernamePattern(value);

    if (!validUsername) {
      return;
    }

    setVerifyUsernameLoading(true);
    if (usernameAvailableDebounceTimer.current) {
      clearTimeout(usernameAvailableDebounceTimer.current);
    }
    usernameAvailableDebounceTimer.current = setTimeout(async () => {
      const response = await checkUsernameAvailability(value);
      if (response === true) {
        setIsUsernameAvailable(true);
      } else {
        setIsUsernameAvailable(false);
      }
      setVerifyUsernameLoading(false);
    }, 500);
  };

  const getUsernameMessage = () => {
    const validUsername = verifyUsernamePattern(username);
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
    if (!username) return;

    if (verifyUsernameLoading) {
      return "processing";
    }

    return isUsernameAvailable ? "success" : "error";
  };

  const handleLogin = async () => {
    setLoading(true);

    const payload: LoginPayload = {
      email,
      password,
    };

    try {
      const response: LoginResponse = await login(payload);

      Logger.log(response);

      if (response.message === "success") {
        const verified = await verify();
        Logger.log("success", verified);
        if (verified) {
          generateToastSuccess("Logged in successfully", theme);
          reroute("/rp/profile");
          setSignupModalOpen(false);
        }
      } else {
        generateToastError(response.message, theme);
      }
      setLoading(false);
    } catch (e) {
      Logger.log("error dekho bhai ->", e);
      generateToastError("Something went wrong", theme);
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);

    const payload: SignUpPayload = {
      username,
      email,
      password,
    };

    try {
      const response: WithMessage = await register(payload);

      Logger.log(response);

      if (response.message === "success") {
        generateToastSuccess("Registered successfully", theme);
        setSignupModalOpen(false);
      }

      if (response.message === "error") {
        generateToastError("Something went wrong", theme);
      }

      setSignupModalOpen(false);
    } catch (e) {
      Logger.log("error dekho bhai ->", e);
      generateToastError("Something went wrong", theme);
    }

    setLoading(false);
  };

  const handleSubmit = () => {
    setButtonClicked(true);
    const isError = checkError(true);
    if (isError) return;

    if (signupModal) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  useEffect(() => {
    checkError();
  }, [email, password, username]);

  useEffect(() => {
    if (!signupModalOpen) {
      setButtonClicked(false);
      setusername("");
      setEmail("");
      setPassword("");
      setError("");
      setLoading(false);
    }
  }, [signupModalOpen]);

  return (
    <Modal
      width={"400px"}
      open={signupModalOpen}
      onClose={() => setSignupModalOpen(false)}
    >
      <S.Container>
        <S.Header>
          {signupModal ? "Already a user?" : "New user?"}
          <span
            className="link"
            onClick={() => setSignupModal((current) => !current)}
          >
            {signupModal ? "Login!" : "Sign up!"}
          </span>
        </S.Header>
        <S.Content>
          <ShouldRender if={signupModal}>
            <Input
              label="username"
              type="text"
              onChange={(value) => handleUsernameChange(value || "")}
              value={username}
              message={getUsernameMessage()}
              messageType={getUsernameMessageType()}
              maxLength={30}
            />
          </ShouldRender>
          <Input
            label="Email"
            type="text"
            onChange={(value) => {
              clearError();
              setEmail(value || "");
            }}
            value={email}
            maxLength={50}
          />
          <Input
            label="Password"
            type="password"
            onChange={(value) => {
              clearError();
              setPassword(value || "");
            }}
            value={password}
            message={error}
            messageType="warning"
            maxLength={50}
          />
          <S.Buttons>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={
                !!error ||
                (signupModal && (verifyUsernameLoading || !isUsernameAvailable))
              }
              loading={loading}
              size="lg"
            >
              {signupModal ? "Register" : "Login"}
            </Button>
          </S.Buttons>
        </S.Content>
      </S.Container>
    </Modal>
  );
};
