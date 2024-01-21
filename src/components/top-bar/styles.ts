import styled from "styled-components";
import { NO_USER_SELECT } from "@/theme";
import Link from "next/link";

export const Bar = styled.div`
  position: sticky;
  top: 0px;
  width: 100%;
  height: 80px;
  width: 100cqw;
  background-color: ${({ theme }) => theme.navbar};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  container-name: top-bar;
  container-type: size;
  z-index: 5;

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
export const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
`;

export const Logo = styled.div`
  height: 100cqh;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.6); */
  background-color: ${({ theme }) => theme.primary};
  ${NO_USER_SELECT}

  -moz-transform: skew(30deg, 0deg);
  -webkit-transform: skew(30deg, 0deg);
  -o-transform: skew(30deg, 0deg);
  -ms-transform: skew(30deg, 0deg);
  transform: skew(30deg, 0deg);

  @container (max-width: 650px) {
    & {
      margin-left: 20px;
    }
  }
`;

export const LogoInner = styled.div`
  height: 80cqh;
  width: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary};
  background-color: ${({ theme }) => theme.primary};
  -webkit-text-stroke: 1px #66666689; /* width and color */
  ${NO_USER_SELECT}

  -moz-transform: skew(-45deg, 0deg);
  -webkit-transform: skew(-45deg, 0deg);
  -o-transform: skew(-45deg, 0deg);
  -ms-transform: skew(-45deg, 0deg);
  transform: skew(-45deg, 0deg);
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

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
