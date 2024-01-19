import { FC, useEffect, useState } from "react";
import { Button, Input, Modal, ShouldRender } from "@/components";
import { LoginPayload, LoginResponse } from "@/types";
import { login } from "@/app/actions";

import * as S from "./styles";
import { useTheme } from "styled-components";
import { generateToastError, generateToastSuccess } from "@/utils";
import { useAuth, useUIContext } from "@/hooks";
import classNames from "classnames";

export type LoginModalProps = {};
export const LoginModal: FC<LoginModalProps> = ({}) => {
  const { signupModalOpen, signupModal, setSignupModal, setSignupModalOpen } =
    useUIContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("example");
  const [email, setEmail] = useState<string>("example@gmail.com");
  const [password, setPassword] = useState<string>("12345678");
  const [error, setError] = useState<string>("");
  const theme = useTheme();
  const { verify } = useAuth();

  const checkError = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const validEmail = email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);

    if (!validEmail) {
      setError("Please enter a valid email");
      return;
    }

    const validPassword = password.match(/^(?=.*\d).{8,}$/);

    if (!validPassword) {
      setError(
        "Password must be at least 8 characters long and contain at least one number"
      );
      return;
    }

    setError("");
  };

  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);

    return;

    const response: LoginResponse = await login(payload);

    console.log(response);

    if (response.message === "Success.") {
      const verified = await verify();
      console.log("success", verified);
      if (verified) {
        generateToastSuccess("Logged in successfully", theme);
      } else {
        generateToastError("Something went wrong", theme);
      }
      setSignupModalOpen(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkError();
  }, [email, password]);

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
              label="Username"
              type="text"
              onChange={(value) => setUsername(value || "")}
              value={username}
              // message={error}
              messageType="error"
            />
          </ShouldRender>
          <Input
            label="Email"
            type="text"
            onChange={(value) => setEmail(value || "")}
            value={email}
            message={error}
            messageType="processing"
          />
          <Input
            label="Password"
            type="password"
            onChange={(value) => setPassword(value || "")}
            value={password}
            // message={error}
            messageType="success"
          />
          <S.Buttons>
            <Button
              onClick={() => handleLogin({ email, password })}
              variant="primary"
              disabled={!!error}
              loading={loading}
            >
              {signupModal ? "Register" : "Login"}
            </Button>
          </S.Buttons>
        </S.Content>
      </S.Container>
    </Modal>
  );
};
