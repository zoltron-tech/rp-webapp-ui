import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  ${DEV_MODE_BORDER("aqua")}
  min-height: auto;
  height: auto;
  position: relative;
  background-color: transparent;
  container-name: content-container;
  container-type: inline-size;

  @media (max-width: 700px) {
    & {
      min-height: 0px;
    }
  }
`;
