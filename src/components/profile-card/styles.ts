import { styled } from "styled-components";

import * as Common from "@/components/common";

export const Profile = styled.div`
  position: static;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100cqw;
  height: 100cqh;
  padding: 20px;
`;

export const ProfileImage = styled.div`
  position: absolute;
  top: 0;
  left: 0px;
  width: clamp(150px, 30cqw, 400px);
  height: clamp(150px, 30cqw, 400px);
  overflow: hidden;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.cardBackgroundColor};
  z-index: 2;
  scale: 0.6;
  transform: translate(-20%, 0%);
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
  font-size: clamp(18px, 4cqw, 32px);
  padding-left: clamp(0px, 20cqw, 400px);
  padding-top: 50px;

  & > label {
    margin-right: 5px;
    font-size: clamp(14px, 3cqw, 28px);
    color: ${({ theme }) => theme.textGray};
  }

  @container (max-width: 350px) {
    padding-top: 70px;
  }
`;

export const Username = styled(Common.Username)`
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.primary};
`;

export const Name = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding-left: clamp(0px, 20cqw, 400px);
  padding-top: 20px;

  @container (max-width: 600px) {
    & {
      padding-left: clamp(0px, 10cqw, 200px);
      flex-direction: column;
      justify-content: flex-start;
    }
  }
`;

export const Note = styled.div`
  font-size: clamp(12px, 2cqw, 24px);
  font-weight: 400;
  width: 100%;
  font-style: italic;
  color: ${({ theme }) => theme.textGray};
  margin-top: 5px;
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

  top: clamp(-300px, calc(-600px + 80cqw), 0px);

  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;
