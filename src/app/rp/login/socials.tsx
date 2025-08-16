import { useRouter } from "next/navigation";
import { type FC, useCallback } from "react";
import { FaDiscord } from "react-icons/fa6";
import { loginViaProviderAction } from "@/app/actions";
import { GoogleLogo } from "@/assets/logos";
import type { LoginOAuthProvider } from "@/types";
import * as S from "./styled";

export const Socials: FC = () => {
  const { push } = useRouter();

  const handleSocialClick = useCallback(
    (provider: LoginOAuthProvider) => () => {
      loginViaProviderAction(provider);
    },
    [push],
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
