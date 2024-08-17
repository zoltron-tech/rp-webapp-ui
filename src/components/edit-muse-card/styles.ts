import { styled } from "styled-components";

import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import { Container } from "@novelist-world/ui";

export const LocalContainer = styled(Container)`
  border: 1px solid slategray;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.text};
  border-radius: 16px;

  @container (min-width: 700px) {
    &.card {
      width: 60%;
      min-width: 700px;
      height: 950px;
      padding: 20px;
      margin: clamp(50px, 20cqw, 50px) auto 100px auto;
    }
  }

  @container (max-width: 700px) {
    &.card {
      width: 100%;
      height: 1000px;
      padding: 20px;
      margin: 0px;
      border-radius: 0px;
      border: none;
    }
  }

  container-name: card;
  container-type: inline-size;
`;

export const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100cqw;
  height: 100cqh;
  padding: 20px;
`;

export const Title = styled.div`
  font-size: clamp(20px, 4cqw, 36px);
  font-weight: 200;
  margin-left: clamp(0px, calc(120px - 20cqw), 120px);
  text-transform: uppercase;
  white-space: nowrap;

  @container (max-width: 300px) {
    & > span {
      display: none;
    }
  }
`;

export const UsernameContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding-left: clamp(0px, 20cqw, 400px);
  padding-top: 50px;

  & > span {
    padding-left: 20px;
    padding-right: 10px;
    font-weight: 200;
    font-size: clamp(16px, 4cqw, 20px);
  }

  & > div {
    font-weight: 400;
    font-size: clamp(24px, 4cqw, 32px);
  }

  @container (max-width: 350px) {
    padding-top: 70px;
  }
`;

export const FormGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  padding-left: clamp(0px, 20cqw, 400px);
  gap: 10px;

  @container (max-width: 600px) {
    & {
      padding-left: 0px;
    }
  }
`;

export const Name = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;

  @container (max-width: 600px) {
    & {
      flex-direction: column;
      justify-content: flex-start;
    }
  }
`;

export const ButtonGroup = styled.div`
  width: 100%;
  padding-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;

  & .sm-hide {
    display: inline-block;
  }

  @container (max-width: 440px) {
    & .sm-hide {
      display: none;
    }
  }
`;

export const SaveButton = styled(Common.Button)`
  /* max-width: 300px;
  margin-top: 20px;
  margin-left: clamp(0px, calc(120px - 20cqw), 120px);
  margin-bottom: 20px;

  @container (max-width: 440px) {
    & .sm-hide {
      display: none;
    }
  } */
`;

type ProfileBackgroundFilterProps = {
  banner: string;
};

export const ProfileBackgroundBlurFilter = styled.div<ProfileBackgroundFilterProps>`
  position: absolute;
  top: 0;
  left: 0px;
  width: 100cqw;
  height: 100%;
  max-height: 100vh;
  background-image: linear-gradient(
      ${({ theme }) => theme.cardBackgroundTint},
      ${({ theme }) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});
  background-position: center;
  background-size: cover;
  z-index: ${Z_INDEX.BACKGROUND};

  top: clamp(-300px, calc(-600px + 80cqw), 0px);

  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;
