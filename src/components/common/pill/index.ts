import { DEV_MODE_BORDER, PILL } from "@/theme";
import { styled } from "styled-components";

export const Pill = styled.div`
  ${PILL}

  width: 100%;
  min-height: 100px;
  background: ${({ theme }) => theme.inputBackground};
  position: relative;
  color: ${({ theme }) => theme.text};
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

    color: ${({ theme }) => theme.text};
  }
`;
