"use client";

import { useGlobalState } from "@/context/store/stores";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator, Tabs } from "radix-ui";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { Socials } from "./socials";

import * as S from "./styled";
import { TermsAndConditions } from "./terms-and-conditions";

export default function LoginPage() {
  const authState = useGlobalState("authState");
  const searchParams = useSearchParams();
  const isRegister = searchParams?.get("register");
  const [activeTab, setActiveTab] = useState(isRegister ? "register" : "login");
  const { push } = useRouter();

  useEffect(() => {
    if (authState === "LOGGED_IN") {
      push("/rp/home");
    }
  }, [authState]);

  return (
    <S.LoginPageRoot>
      <Tabs.Root
        defaultValue={activeTab}
        className="tabs"
        onValueChange={setActiveTab}
        asChild
      >
        <S.FormContainer>
          <Tabs.List
            className="tabs-list"
            aria-label="Login and Registration"
            tabIndex={0}
          >
            <Tabs.Trigger className="tab" value="login">
              Login
            </Tabs.Trigger>
            <Tabs.Trigger className="tab" value="register">
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
