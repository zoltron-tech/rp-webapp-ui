import { DEV_MODE_BORDER } from "@/theme";
import styled from "styled-components";

export const Container = styled.div`
  ${DEV_MODE_BORDER("aqua")}

  height: max-content;
  position: relative;
  background-color: transparent;
  container-name: content-container;
  container-type: inline-size;
`;
