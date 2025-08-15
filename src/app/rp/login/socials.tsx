import { FC, useCallback } from "react";
import * as S from "./styled";
import { GoogleLogo } from "@/assets/logos";
import { FaDiscord } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { loginViaProviderAction } from "@/app/actions";
import { LoginOAuthProvider } from "@/types";

export const Socials: FC = () => {
  const { push } = useRouter();

  const handleSocialClick = useCallback(
    (provider: LoginOAuthProvider) => () => {
      loginViaProviderAction(provider);
    },
    [push]
  );

  return (
    <S.SocialsList>
      <S.SocialButton
        className="social-button google"
        aria-label="continue with Google"
        onClick={handleSocialClick("google")}
      >
        <GoogleLogo />
        <span>Google</span>
      </S.SocialButton>
      <S.SocialButton
        className="social-button discord"
        aria-label="continue with Discord"
        onClick={handleSocialClick("discord")}
      >
        <FaDiscord />
        <span>Discord</span>
      </S.SocialButton>
    </S.SocialsList>
  );
};
