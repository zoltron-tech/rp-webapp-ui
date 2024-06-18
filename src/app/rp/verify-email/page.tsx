"use client";
import { Button, Input, ShouldRender } from "@/components/common";
import {
  ErrorType,
  useAuthContext,
  useForm,
  useUIContext,
  useVisibility,
} from "@/hooks";
import { Logger } from "@/utils/services";
import { useCallback, useEffect, useRef, useState } from "react";

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
import { FaCheckCircle } from "react-icons/fa";
import { verifyAccountAction } from "@/app/actions";
import { FaFaceSadTear } from "react-icons/fa6";
import { PageLoader } from "@/components/layout";

export default function ResetPassword() {
  const [cookies, _setCookie] = useCookies(["theme"]);

  const getTheme = () => {
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  };
  const searchParams = useSearchParams();
  const jwt = searchParams?.get("token") || "";
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { verifyAccount, state: authState } = useAuthContext();
  const { push } = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(
    null
  );

  const getVerificationStatus = useCallback(async () => {
    console.log(jwt);
    setLoading(true);
    const response = await verifyAccount(jwt);
    console.log("yahan hain but " + response);
    if (response.message === "success") {
      setVerificationStatus(true);
    } else {
      setVerificationStatus(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verificationStatus !== null) return;
    getVerificationStatus();
  }, []);

  const onLogoClick = () => {
    push("/rp/novelists");
  };

  return (
    <S.Container>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <ShouldRender if={!loading}>
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
          <ShouldRender if={verificationStatus === true}>
            <S.Header>
              <span>{"Account Verified"}</span>
              <FaCheckCircle color="green" />
            </S.Header>
            <S.Paragraph>Welcome to Novelist World!</S.Paragraph>
            <S.Paragraph>
              Thank you for joining our community of passionate writers and
              readers. Your account is now activated.
            </S.Paragraph>
            <S.Paragraph>
              We hope you have a fantastic time exploring, creating, and
              connecting with fellow novelists.
            </S.Paragraph>
            <S.Paragraph>Happy writing!</S.Paragraph>
          </ShouldRender>
          <ShouldRender if={verificationStatus !== true}>
            <S.Header>
              <span>{"Account Verification Failed"}</span>
              <FaFaceSadTear color="indianred"></FaFaceSadTear>
            </S.Header>
            <S.Paragraph>There was a problem with verification</S.Paragraph>
            <S.Paragraph>
              Maybe the link has already expired? Please log in and generate a
              new link.
            </S.Paragraph>
            <S.Paragraph>
              If you have any questions, feel free to contact support.
            </S.Paragraph>
            <S.Paragraph>Team Zoltron Tech.</S.Paragraph>
          </ShouldRender>
        </S.Content>
      </ShouldRender>
    </S.Container>
  );
}
