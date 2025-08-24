"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoMdCheckmark } from "react-icons/io";
import { PiSpinnerGapLight } from "react-icons/pi";
import { getUser, setAuthCookie } from "@/app/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { validateJWTSync } from "@/utils/helpers";
import { getUserNovelist } from "../../novelists/actions";
import * as S from "./styled";

type OperationState = "LOADING" | "SUCCESS" | "ERROR";

type ContentType = {
  icon: React.ReactNode | null;
  headingText: React.ReactNode | null;
  descriptionText: React.ReactNode | null;
};

const Content: Record<OperationState, ContentType> = {
  ERROR: {
    descriptionText: "There was an error while logging you in.",
    headingText: "Error logging in",
    icon: <CgClose className="error" />,
  },
  LOADING: {
    descriptionText: "Please wait while we process your request.",
    headingText: "Loading...",
    icon: <PiSpinnerGapLight className="loading" />,
  },
  SUCCESS: {
    descriptionText:
      "You have successfully logged in. You will be redirected shortly.",
    headingText: "Login successful",
    icon: <IoMdCheckmark className="success" />,
  },
};

export default function LoginOAuthCallbackPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [operationState, setOperationState] =
    useState<OperationState>("LOADING");
  const setGlobalState = useGlobalStoreSet();
  const { push } = useRouter();

  const content = useMemo(() => {
    return Content[operationState];
  }, [operationState]);

  const validateToken = useCallback(async () => {
    if (!token) {
      setOperationState("ERROR");
      return;
    }
    const _validated = validateJWTSync(token);
    if (!_validated) {
      setOperationState("ERROR");
      return;
    }

    await setAuthCookie(token);

    const response = await getUser();
    if (response.message === API_MESSAGE.Unauthorized) {
      setOperationState("ERROR");
      return;
    }

    const _novelist = await getUserNovelist();

    if ("message" in _novelist) {
      if (_novelist.message === API_MESSAGE.NotFound) {
        setOperationState("SUCCESS");
        setGlobalState({ authState: "UNINITIALIZED", user: response.user! });
        push(ROUTES.Onboarding);
        return;
      } else {
        setOperationState("ERROR");
        return;
      }
    }

    setGlobalState({
      authState: _novelist.isOnboarded ? "LOGGED_IN" : "UNINITIALIZED",
      novelist: _novelist,
      user: response.user!,
    });
    push(ROUTES.Home);

    setOperationState("SUCCESS");
  }, [token, setOperationState]);

  useEffect(() => {
    validateToken();
  }, [token]);

  return (
    <S.PageRoot>
      <S.ContentCard>
        <S.Heading>
          {content.icon}
          <h1>{content.headingText}</h1>
        </S.Heading>
        <S.Description>{content.descriptionText}</S.Description>
      </S.ContentCard>
    </S.PageRoot>
  );
}
