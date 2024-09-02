"use client";
import { Button, Input } from "@/components/common";
import { ErrorType, useAuthContext, useForm, useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import * as S from "./styles";
import { LoginPayload } from "@/types";
import { ThemeProvider } from "styled-components";
import { useCookies } from "react-cookie";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { useSearchParams } from "next/navigation";
import {
  Bar,
  Logo,
  LogoContainer,
  LogoInner,
  LogoText,
} from "@/components/layout/top-bar/styles";
import { SiBookstack } from "react-icons/si";
import { AuthProvider, UIContextProvider } from "@/context";

type InputValues = {
  password: string;
  confirm: string;
};

export default function ResetPassword() {
  const [cookies, _setCookie] = useCookies(["theme"]);

  const getTheme = () => {
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  };
  const searchParams = useSearchParams();
  const jwt = searchParams?.get("token") || "";
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { resetPassword, state: authState } = useAuthContext();
  const { successToast, errorToast } = useUIContext();
  const { push } = useRouter();
  const initialRender = useRef(true);

  const checkError = ({
    confirm,
    password,
  }: InputValues): ErrorType<InputValues> => {
    if (!confirm || !password) {
      return { confirm: "Please fill in all fields" };
    }
    if (confirm !== password) {
      return { confirm: "Passwords do not match" };
    }
    const validPassword = password.match(/^(?=.*\d).{8,}$/);
    if (!validPassword) {
      return {
        password:
          "Password must be at least 8 characters long and contain at least one number",
      };
    }
    return null;
  };

  const onSubmit = async () => {
    const payload: LoginPayload = {
      password: values.password,
    };
    try {
      setLoading(true);

      const response = await resetPassword(payload, jwt);
      Logger.debug(response);

      if (response.message === "success") {
        Logger.debug("success");
        clearValues();
        successToast("Password updated successfully");
      } else {
        errorToast(response.message);
      }
    } catch (e) {
      errorToast("Something went wrong");
    }
    setLoading(false);
  };

  const onLogoClick = () => {
    push("/rp/novelists");
  };

  const { values, submit, update, errors, clearValues } = useForm<InputValues>({
    initialValues: { confirm: "", password: "" },
    onSubmit,
    checkError,
  });

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      clearValues();
      return;
    }

    setDisabled(!!errors || values.confirm !== values.password);
  }, [errors]);

  return (
    <S.Container>
      <Bar>
        <LogoContainer onClick={onLogoClick}>
          <Logo>
            <LogoInner>
              <SiBookstack />
            </LogoInner>
          </Logo>
          <LogoText>Novelist World</LogoText>
        </LogoContainer>
      </Bar>
      <S.Content>
        <S.Header>
          <span>{"Reset Password"}</span>
        </S.Header>
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
        <Input
          label="Confirm Password"
          name="confirm"
          type="password"
          onChange={update}
          value={values.confirm}
          message={errors?.confirm}
          messageType="warning"
          maxLength={50}
          onEnter={submit}
        />
        <Button
          onClick={() => submit()}
          variant="primary"
          disabled={disabled}
          loading={loading}
        >
          Update Password
        </Button>
      </S.Content>
    </S.Container>
  );
}
