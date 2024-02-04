import * as Common from "@/components/common";
import {
  AVATAR_IMAGE,
  BORDER_RADIUS,
  BORDER_TOP,
  NO_SCROLLBAR,
  NO_USER_SELECT,
  Z_INDEX,
} from "@/theme";
import styled from "styled-components";

export const CardWrapper = styled.div`
  position: relative;
  height: 250px;
  border-radius: ${BORDER_RADIUS};
  transition: all 0.3s ease-in-out;
  contain: paint;
  z-index: ${Z_INDEX.CARD};

  container-name: novelist-card;
  container-type: size;

  &.expanded {
    height: 600px;
  }

  @container (max-width: 1200px) {
    & {
      height: 230px;
    }

    &.expanded {
      height: 500px;
    }
  }

  @container (max-width: 900px) {
    & {
      height: 150px;
    }

    &.expanded {
      height: 300px;
    }
  }
`;

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: linear-gradient(
      ${({ theme }) => theme.cardBackgroundTint},
      ${({ theme }) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});

  background-position: center;
  background-size: cover;

  filter: blur(20px);
  -webkit-filter: blur(20px);
  -moz-filter: blur(20px);
  -o-filter: blur(20px);
  -ms-filter: blur(20px);
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 20px 0px;
  position: relative;
  height: 100%;
  background: linear-gradient(
    ${({ theme }): string => theme.cardBackgroundGradient.join(", ")}
  );

  @container (max-width: 400px) {
    & {
      padding: 10px 10px 0px;
    }
  }

  @container (max-width: 300px) {
    & {
      padding: 5px 5px 0px;
    }
  }
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const ExpandButton = styled.div`
  position: absolute;
  top: 200px;
  right: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.CARD_EXPAND};
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;

  & svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGrey};
  }

  @container (max-width: 400px) {
    & {
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      background-color: transparent;
      box-shadow: none;
      & svg {
        width: 15px;
        height: 15px;
      }

      &:hover {
        background-color: transparent;
      }
    }
  }
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 10px;

  @container (max-width: 400px) {
    & {
      display: none;
    }
  }
`;

export const Avatar = styled.div`
  ${AVATAR_IMAGE}
  width: 200px;
  height: 200px;
  cursor: pointer;

  img {
    width: 200px;
    height: 200px;
  }

  @container (max-width: 400px) {
    & {
      width: 150px;
      height: 150px;
    }

    img {
      width: 150px;
      height: 150px;
    }
  }

  @container (max-width: 300px) {
    & {
      width: 100px;
      height: 100px;
    }

    img {
      width: 100px;
      height: 100px;
    }
  }
`;

export const NovelistInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  font-size: 14px;

  @container (max-width: 400px) {
    & {
      margin-left: 0px;
      position: absolute;
      top: 140px;
      padding: 20px;
    }
  }

  @container (max-width: 300px) {
    & {
      top: 100px;
      right: 0px;
      padding: 10px;
      font-size: 12px;
    }
  }
`;

export const username = styled(Common.Username)`
  font-size: 16px !important;

  @container (max-width: 400px) {
    & {
      font-size: 14px !important;
    }
  }

  @container (max-width: 300px) {
    & {
      font-size: 12px !important;
    }
  }
`;

export const Quote = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-top: 5px;
  word-break: break-all;

  &::before {
    content: "“";
    font-weight: 400;
    font-size: 16px;
  }

  &::after {
    content: "”";
    font-weight: 400;
    font-size: 16px;
  }

  @container (max-width: 400px) {
    & {
      font-size: 10px;
    }
  }

  @container (max-width: 300px) {
    & {
      display: none;
    }
  }
`;

export const MuseList = styled.div`
  ${BORDER_TOP};

  width: 100%;
  min-height: 100px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 40px;
  padding-bottom: 10px;
  scroll-snap-type: y mandatory;

  @container (max-width: 400px) {
    & {
      margin-top: 80px;
    }
  }

  @container (max-height: 400px) {
    & {
      margin-top: 40px;
    }
  }

  ${NO_SCROLLBAR}
`;

const MuseComponent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  border-radius: ${BORDER_RADIUS};
  padding: 10px;
  position: relative;
  ${NO_USER_SELECT}
  scroll-snap-align: center;

  @container (max-width: 400px) {
    & {
      padding: 5px;
    }
  }

  @container (max-width: 300px) {
    & {
      padding: 2px 8px;
    }
  }

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.hoverGreyAlpha};
  }
`;

const MuseAvatar = styled.div`
  ${AVATAR_IMAGE}

  width: 70px;
  height: 70px;

  & img {
    width: 100%;
    height: 100%;
  }

  @container (max-width: 400px) {
    & {
      width: 50px;
      height: 50px;
    }
  }

  @container (max-width: 300px) {
    & {
      width: 30px;
      height: 30px;
    }
  }
`;

const MuseName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};

  @container (max-width: 400px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 300px) {
    & {
      font-size: 10px;
      text-align: end;
    }
  }

  @container (max-width: 200px) {
    font-size: 8px;
    text-align: center;
    width: calc(100% - 30px);
    & .muse-last-name {
      display: none;
    }
  }
`;

export const Muse = Object.assign(MuseComponent, {
  Avatar: MuseAvatar,
  Name: MuseName,
});
