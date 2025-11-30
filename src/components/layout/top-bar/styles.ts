import styled, { keyframes } from "styled-components";
import { Avatar } from "@/components/common";
import {
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  NO_USER_SELECT,
  Z_INDEX,
} from "@/theme";

export const Container = styled.div`
  border: 1px solid ${({ theme }: any) => theme.background};
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  align-items: center;
  top: 0;
  margin-inline: auto;
  background-color: var(--bg-3);
  display: flex;
  justify-content: space-between;
  z-index: ${Z_INDEX.TOPBAR};
  transition-property: background-color, backdrop-filter,
    -webkit-backdrop-filter;
  ${BASE_TRANSITION}
`;

export const Bar = styled.div`
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

  @media screen and (max-width: 480px) {
    & {
      height: 45px;
    }
  }
`;
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
`;

export const Logo = styled.div`
  height: var(--font-size-h2);
  width: var(--font-size-h2);
  display: flex;
  align-items: center;
  ${NO_USER_SELECT}

  @media screen and (max-width: 480px) {
    height: var(--font-size-h3);
    width: var(--font-size-h3); 
  }
`;

export const LogoInner = styled.div`
  height: 100%;
  width: 100%;
  margin-inline: auto;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent);
  border: 1px solid var(--accent-hover);
  ${NO_USER_SELECT}

  & > svg {
    height: 100%;
    width: 100%;
    fill: ${({ theme }: any) => theme.textPrimary};
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  15.6% {
    opacity: 0.279;
  }
  27.6% {
    opacity: 0.99;
  }
  38.4% {
    opacity: 0.45;
  }
  48% {
    opacity: 0.997;
  }
  54.8% {
    opacity: 0.634;
  }
  62% {
    opacity: 0.999;
  }
  67.2% {
    opacity: 0.766;
  }
  73.2% {
    opacity: 0.99;
  }
  78% {
    opacity: 0.865;
  }
  83.2% {
    opacity: 1;
  }
  86.8% {
    opacity: 0.938;
  }
  100% {
    opacity: 1;
  }
`;

export const LogoImage = styled.img`
  height: 100%;
  width: 100%;
  opacity: 0;
  animation: ${fadeIn} 0.7s ease-in-out forwards 0.2s;
`;

export const LogoText = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 400;
  font-style: italic;
  ${NO_USER_SELECT}

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-h6);
    }
  }

      @container (max-width: 430px) {
    & {
    font-size: var(--font-size-input);
    }
  }

`;

export const LogoTextSuffix = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 24px;
  font-weight: 700;
  font-style: italic;
  color: var(--accent-8);
  ${NO_USER_SELECT}
  opacity: 0;
  animation: ${fadeIn} 0.75s ease-in-out forwards 0.6s;

  @container (max-width: 600px) {
    & {
    font-size: var(--font-size-h6);
    }
  }

    @container (max-width: 430px) {
    & {
    font-size: var(--font-size-input);
    }
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  ${DEV_MODE_BORDER("red")}

  @media (max-width: 700px) {
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
  width: 75px;
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
    border-bottom: 1px solid var(--text);
  }
`;
