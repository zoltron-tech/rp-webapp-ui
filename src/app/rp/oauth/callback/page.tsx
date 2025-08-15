"use client";

import { InfoModal } from "@/components/info-modal";
import { useRouter, useSearchParams } from "next/navigation";
import * as S from "./styled";
import { PiSpinnerGapLight } from "react-icons/pi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { CgClose } from "react-icons/cg";
import { validateJWTSync } from "@/utils/helpers";
import { authenticateAction, getUser, setAuthCookie } from "@/app/actions";
import { API_MESSAGE } from "@/utils/constants";
import { useGlobalStoreSet } from "@/context/store/stores";
import { getUserNovelist } from "../../novelists/actions";

type OperationState = "LOADING" | "SUCCESS" | "ERROR";

type ContentType = {
  icon: React.ReactNode | null;
  headingText: React.ReactNode | null;
  descriptionText: React.ReactNode | null;
};

const Content: Record<OperationState, ContentType> = {
  LOADING: {
    icon: <PiSpinnerGapLight className="loading" />,
    headingText: "Loading...",
    descriptionText: "Please wait while we process your request.",
  },
  SUCCESS: {
    icon: <IoMdCheckmark className="success" />,
    headingText: "Login successful",
    descriptionText:
      "You have successfully logged in. You will be redirected shortly.",
  },
  ERROR: {
    icon: <CgClose className="error" />,
    headingText: "Error logging in",
    descriptionText: "There was an error while logging you in.",
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
        push("/rp/profile/edit");
        setGlobalState({ authState: "UNINITIALIZED", user: response.user! });
        return;
      } else {
        setOperationState("ERROR");
        return;
      }
    }

    setGlobalState({
      user: response.user!,
      novelist: _novelist,
      authState: "LOGGED_IN",
    });
    push("/rp/home");

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
