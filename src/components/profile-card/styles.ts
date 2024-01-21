import { css, styled } from "styled-components";

import * as Common from "@/components/common";

export const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100cqw;
  height: 100cqh;
  padding: 20px;
`;

export const AvatarPositionStyle = css`
  position: absolute;
  top: 0;
  left: 0px;
  width: clamp(150px, 30cqw, 400px);
  height: clamp(150px, 30cqw, 400px);
  overflow: hidden;
  border-radius: 50%;
  scale: 0.6;
  transform: translate(-20%, 0%);
`;

export const ProfileImage = styled.div`
  ${AvatarPositionStyle}

  background-color: ${({ theme }) => theme.cardBackgroundColor};
  z-index: 1;
  opacity: 1;
  box-shadow: 0px 3px 10px 5px ${({ theme }) => theme.cardBoxShadowColor};

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Title = styled.div`
  font-size: clamp(20px, 4cqw, 36px);
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
  font-size: clamp(24px, 4cqw, 32px);
  padding-left: clamp(0px, 20cqw, 400px);
  padding-top: 50px;
  cursor: copy;

  @container (max-width: 350px) {
    padding-top: 70px;
  }
`;

export const Username = styled(Common.Username)`
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.primary};
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

export const Note = styled.div`
  /* width: 100%; */
  /* color: ${({ theme }) => theme.textGray}; */
`;

export const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`;

export const SaveButton = styled(Common.Button)`
  width: 100%;
  max-width: 300px;
  margin-top: 20px;
  margin-left: clamp(0px, calc(120px - 20cqw), 120px);
  margin-bottom: 20px;
`;

type ProfileBackgroundFilterProps = {
  banner: string;
};

export const ProfileBackgroundBlurFilter = styled.div<ProfileBackgroundFilterProps>`
  position: absolute;
  top: 0;
  left: 0px;
  width: 100vw;
  height: 100%;
  max-height: 100vh;
  background-image: linear-gradient(
      ${({ theme }) => theme.cardBackgroundTint},
      ${({ theme }) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});
  background-position: center;
  background-size: cover;
  z-index: -1;

  top: clamp(-300px, calc(-600px + 80cqw), 0px);

  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;
