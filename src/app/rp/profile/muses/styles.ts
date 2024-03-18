import { DEV_MODE_BORDER } from "@/theme";
import styled, { css } from "styled-components";

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  gap: 1rem;
`;
