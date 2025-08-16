"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

export default function OnboardingPage() {
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const { push } = useRouter();

  useEffect(() => {
    if (authState === "LOGGED_OUT" || authState === "LOGGED_IN") {
      push(ROUTES.Novelists);
    }
  }, [authState]);

  return (
    <S.OnboardingPageRoot>
      <h1>Onboarding Page</h1>
      <p>Welcome to the onboarding process!</p>
    </S.OnboardingPageRoot>
  );
}
