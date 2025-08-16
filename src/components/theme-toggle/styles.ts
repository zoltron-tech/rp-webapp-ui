import styled from "styled-components";
import { Z_INDEX } from "@/theme";

export const THEME_SWITCHER = {
  BACKGROUND: "#6B728E",
  FRONT: {
    NIGHT: "#042b52",
    DAY: "#72aae2",
  },
  MOON_COLOR: "#fcea4b",
  SUN_COLOR: "#fbfd87",
  OPTION_DISABLED: "#6B728E",
};

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const ThemeSwitcher = styled.div`
  width: 50px;
  height: 25px;
  background-color: ${THEME_SWITCHER.BACKGROUND};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* margin-right: 20px; */
  position: relative;
  box-shadow: inset 0px 0px 1px 0px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  contain: paint;
`;

export const ThemeSwitchInner = styled.div<{ theme: string }>`
  width: 50%;
  height: 100%;
  border-radius: 20px;
  position: absolute;
  left: 0;
  z-index: ${Z_INDEX.BACKGROUND};
  display: flex;
  align-items: center;
  justify-content: center;
  contain: paint;

  & svg {
    width: 12px;
    height: 12px;
    transition: all 0.2s ease-in;
    z-index: ${Z_INDEX.AVATAR};
    opacity: 0;
  }

  @keyframes lightModeToDarkMode {
    0% {
      width: 50%;
      transform: translateX(0);
      background-color: ${THEME_SWITCHER.FRONT.DAY};
    }
    50% {
      width: 100%;
      transform: translateX(0%);
      background-color: ${THEME_SWITCHER.FRONT.DAY};
    }
    100% {
      width: 50%;
      transform: translateX(100%);
      background-color: ${THEME_SWITCHER.FRONT.NIGHT};
    }
  }

  @keyframes darkModeToLightMode {
    0% {
      width: 50%;
      transform: translateX(100%);
      background-color: ${THEME_SWITCHER.FRONT.NIGHT};
    }
    50% {
      width: 100%;
      transform: translateX(0%);
      background-color: ${THEME_SWITCHER.FRONT.NIGHT};
    }
    100% {
      width: 50%;
      transform: translateX(0%);
      background-color: ${THEME_SWITCHER.FRONT.DAY};
    }
  }

  &.dark {
    animation: lightModeToDarkMode 0.3s ease-out forwards;

    & .moon {
      opacity: 1;
    }

    & .sun {
      width: 0px;
    }
  }

  &.light {
    animation: darkModeToLightMode 0.3s ease-out forwards;

    & .sun {
      opacity: 1;
    }

    & .moon {
      width: 0px;
    }
  }
`;
