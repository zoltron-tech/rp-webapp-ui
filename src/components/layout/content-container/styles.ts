import { DEV_MODE_BORDER } from "@/theme";
import styled from "styled-components";

export const Container = styled.div`
  ${DEV_MODE_BORDER("aqua")}

  height: max-content;
  min-height: calc(100vh - 80px);
  position: relative;
  background-color: ${({ theme }) => theme.background};
  background-image: url(https://cli.github.com/assets/images/light-glow.svg);
  container-name: content-container;
  container-type: inline-size;
`;
