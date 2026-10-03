import { styled } from "styled-components";
import { DEV_MODE_BORDER, PILL } from "@/theme";

export const Pill = styled.div`
  ${PILL}

  width: 100%;
  min-height: 80px;
  background-color: var(--bg-4);
  position: relative;
  color: var(--text);
  display: flex;
  justify-content: center;
  align-items: center;

  ${DEV_MODE_BORDER("voilet")}

  &::before {
    position: absolute;
    top: 25px;
    left: 35px;
    text-transform: uppercase;
    text-align: start;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;

    color: var(--text);
  }
`;
