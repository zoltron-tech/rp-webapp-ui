import { FC } from "react";
import * as S from "./styled";
import { GoogleLogo } from "@/assets/logos";
import { FaDiscord } from "react-icons/fa6";

export const Socials: FC = () => {
  return (
    <S.SocialsList>
      <S.SocialButton
        className="social-button google"
        aria-label="continue with Google"
      >
        <GoogleLogo />
        <span>Google</span>
      </S.SocialButton>
      <S.SocialButton
        className="social-button discord"
        aria-label="continue with Discord"
      >
        <FaDiscord />
        <span>Discord</span>
      </S.SocialButton>
    </S.SocialsList>
  );
};
