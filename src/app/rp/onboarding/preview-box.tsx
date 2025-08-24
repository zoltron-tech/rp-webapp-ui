import classNames from "classnames";
import type { FC } from "react";
import { AvatarNew } from "@/components/common/avatar-new";
import { ACCENT_MAP } from "@/types/theme";
import { useOnboardingState } from "./onboarding.store";
import * as S from "./styled";

export const PreviewBox: FC = () => {
  const image = useOnboardingState("image");
  const firstName = useOnboardingState("firstName");
  const lastName = useOnboardingState("lastName");
  const username = useOnboardingState("username");
  const about = useOnboardingState("about");
  const palette = useOnboardingState("palette");

  return (
    <S.Preview.Root>
      <h1>Preview</h1>
      <S.Preview.Container className={classNames(ACCENT_MAP[palette])}>
        <S.Preview.Cover />
        <AvatarNew
          src={image || ""}
          alt={firstName || username || "User Avatar"}
        />
        <span>{firstName || "Your Name"}</span>
        <span>{lastName}</span>
        <S.Preview.Username>{username || "your_username"}</S.Preview.Username>
        <S.Preview.AboutMe>{about || "your bio"}</S.Preview.AboutMe>
      </S.Preview.Container>
    </S.Preview.Root>
  );
};
