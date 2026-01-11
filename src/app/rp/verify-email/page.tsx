"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FaFaceSadTear } from "react-icons/fa6";
import { SiBookstack } from "react-icons/si";
import { ShouldRender } from "@/components/common";
import { PageLoaderTypeWriter } from "@/components/layout/loader-2/PageLoaderTypewriter";
import {
  Bar,
  Logo,
  LogoContainer,
  LogoInner,
  LogoText,
} from "@/components/layout/top-bar/styles";
import { useAuthContext } from "@/hooks";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const jwt = searchParams?.get("token") || "";
  const [_disabled, _setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { verifyAccount } = useAuthContext();
  const { push } = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(
    null,
  );

  const getVerificationStatus = useCallback(async () => {
    setLoading(true);
    const response = await verifyAccount(jwt);
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
    push(ROUTES.Novelists);
  };

  return (
    <S.Container>
      <ShouldRender if={loading}>
        <PageLoaderTypeWriter />
      </ShouldRender>
      <ShouldRender if={!loading}>
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
