import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  ${DEV_MODE_BORDER("aqua")}

  height: max-content;
  min-height: calc(100vh - 80px);
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
