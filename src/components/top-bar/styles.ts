import { pSBC } from "@/lib/pSBC";
import { DEV_MODE_BORDER, NO_USER_SELECT, Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";
import { Avatar } from "../common";

export const Container = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.navbar};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.TOPBAR};

  @media (max-width: 650px) {
    & {
      height: 60px;
    }
  }
`;

export const Bar = styled.div`
  position: sticky;
  top: 0px;
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  container-name: top-bar;
  container-type: size;
  z-index: ${Z_INDEX.TOPBAR};

  @media (max-width: 800px) {
    & {
      padding: 0 20px;
    }
  }

  @media (max-width: 650px) {
    & {
      /* padding: 0px; */
      height: 60px;
    }
  }
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
  height: 80cqh;
  width: 80cqh;
  border-radius: 40cqh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) =>
    setOpacity(pSBC(-0.2, theme.primary) as string, 0.5)};
  border: 2px solid ${({ theme }) => theme.primary};
  ${NO_USER_SELECT}

  & > svg {
    height: 40cqh;
    width: 40cqh;
    fill: ${({ theme }) => theme.textPrimary};
  }
`;

export const LogoText = styled.div`
  margin-left: 20px;
  text-transform: uppercase;
  font-size: 28px;
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
  /* width: 100%; */

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
  --size: 35px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
