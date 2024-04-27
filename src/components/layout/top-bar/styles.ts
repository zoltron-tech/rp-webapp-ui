import { Avatar } from "@/components/common";
import { pSBC } from "@/lib/pSBC";
import {
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  NO_USER_SELECT,
  Z_INDEX,
} from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";

export const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.background};
  border-radius: 60px;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  position: sticky;
  align-items: center;
  top: 0;
  max-width: 1080px;
  margin-inline: auto;
  margin-top: 10px;
  background-color: ${({ theme }) => setOpacity(theme.navbar, 0.95)};
  display: flex;
  justify-content: space-between;
  z-index: ${Z_INDEX.TOPBAR};
  transition-property: background-color, backdrop-filter,
    -webkit-backdrop-filter;
  ${BASE_TRANSITION}

  @container (max-width: 1080px) {
    border-radius: 0px;
    margin-top: 0px;
  }
`;

export const Bar = styled.div`
  position: sticky;
  top: 0px;
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  container-name: top-bar;
  container-type: size;
  z-index: ${Z_INDEX.TOPBAR};
`;
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  cursor: pointer;
`;

export const Logo = styled.div`
  height: 100cqh;
  width: 80cqh;
  display: flex;
  align-items: center;
  ${NO_USER_SELECT}

  @container (max-width: 650px) {
    & {
      margin-left: 20px;
    }
  }
`;

export const LogoInner = styled.div`
  height: 70cqh;
  width: 70cqh;
  margin-inline: auto;
  border-radius: 40cqh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) =>
    setOpacity(pSBC(-0.2, theme.primary) as string, 0.5)};
  border: 2px solid ${({ theme }) => theme.primary};
  transition-property: width, height, transform;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  ${NO_USER_SELECT}

  & > svg {
    height: 40cqh;
    width: 40cqh;
    fill: ${({ theme }) => theme.textPrimary};
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

export const LogoText = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  ${NO_USER_SELECT}

  @container (max-width: 800px) {
    & {
      font-size: 24px;
    }
  }

  @container (max-width: 650px) {
    & {
      display: none;
    }
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  ${DEV_MODE_BORDER("red")}

  @container (max-width: 650px) {
    & {
      display: none;
    }
  }
`;

export const SearchDropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 10px 20px;
  cursor: pointer;
  ${NO_USER_SELECT}
`;

export const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const NameContainer = styled.div`
  display: flex;
  align-items: start;
  justify-content: center;
  gap: 5;
  flex-direction: column;

  & > div:nth-child(1) {
    font-size: 14px;
    font-weight: 500;
  }

  & > div:nth-child(2) {
    font-size: 12px;
    font-weight: 300;
  }
`;

export const SearchAvatar = styled(Avatar)`
  --size: 50px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-right: 1rem;
`;

export const ButtonsContainerDesktop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  gap: 10px;

  @container (max-width: 800px) {
    & {
      width: 100px;
    }
    & > div:nth-child(2) {
      display: none;
    }
  }
`;

export const ButtonsContainerLoggedInDesktop = styled(ButtonsContainerDesktop)`
  width: 140px;

  @container (max-width: 800px) {
    & {
      width: 50px;
    }
  }
`;

export const ButtonsContainerMobile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  width: 100px;

  @container (min-width: 800px) {
    & {
      display: none;
    }
  }

  & > .button:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.text};
  }
`;
