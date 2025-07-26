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
  border: 1px solid ${({ theme }: any) => theme.background};
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  position: sticky;
  align-items: center;
  top: 0;
  margin-inline: auto;
  background-color: ${({ theme }: any) => setOpacity(theme.navbar, 0.95)};
  display: flex;
  justify-content: space-between;
  z-index: ${Z_INDEX.TOPBAR};
  transition-property: background-color, backdrop-filter,
    -webkit-backdrop-filter;
  ${BASE_TRANSITION}
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
  color: ${({ theme }: any) => theme.text};
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
  height: 75cqh;
  width: 75cqh;
  margin-inline: auto;
  border-radius: 40cqh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: any) =>
    setOpacity(pSBC(-0.8, theme.primary) as string, 0.5)};
  border: 1px solid ${({ theme }: any) => theme.primary};
  transition-property: width, height, transform;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  ${NO_USER_SELECT}

  & > svg {
    height: 40cqh;
    width: 40cqh;
    fill: ${({ theme }: any) => theme.textPrimary};
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

  @container (max-width: 1000px) {
    & {
      font-size: 20px;
    }
  }

  @container (max-width: 800px) {
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
  width: 100px;
  gap: 10px;

  @container (max-width: 800px) {
    & {
      width: 100px;
    }
  }
`;

export const ButtonsContainerLoggedInDesktop = styled(ButtonsContainerDesktop)`
  width: 130px;
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
    border-bottom: 1px solid ${({ theme }: any) => theme.text};
  }
`;
