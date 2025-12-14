"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Separator, Tabs } from "radix-ui";
import { useCallback, useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { Socials } from "./socials";
import * as S from "./styled";
import { TermsAndConditions } from "./terms-and-conditions";

export default function LoginPage() {
  const authState = useGlobalState("authState");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRegister = searchParams?.get("register") === "1";
  const { routeToPage, stopPageLoading } = usePageRouter();
  const { push } = useRouter();

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      routeToPage(ROUTES.Home);
    }
  }, [authState]);

  const handleRegisterClick = useCallback(() => {
    push(`${pathname}?register=1`);
  }, [pathname, routeToPage]);

  const handleLoginClick = useCallback(() => {
    push(`${pathname}?register=0`);
  }, [pathname, routeToPage]);

  useEffect(() => {
    stopPageLoading();
  }, []);

  return (
    <S.LoginPageRoot>
      <Tabs.Root
        defaultValue={isRegister ? "register" : "login"}
        className="tabs"
        asChild
      >
        <S.FormContainer>
          <Tabs.List
            className="tabs-list"
            aria-label="Login and Registration"
            tabIndex={0}
          >
            <Tabs.Trigger
              className="tab"
              value="login"
              onClick={handleLoginClick}
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              className="tab"
              value="register"
              onClick={handleRegisterClick}
            >
              Register
            </Tabs.Trigger>
          </Tabs.List>
          <Separator.Root className="separator" orientation="horizontal" />

          <Tabs.Content className="tab-content" value="login" tabIndex={-1}>
            <LoginForm />
          </Tabs.Content>
          <Tabs.Content className="tab-content" value="register" tabIndex={-1}>
            <RegisterForm />
          </Tabs.Content>
          <S.OrHelper />
          <Socials />
          <TermsAndConditions />
        </S.FormContainer>
      </Tabs.Root>
    </S.LoginPageRoot>
  );
}
