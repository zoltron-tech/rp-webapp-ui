import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
 
`;

export const PromptListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-inline: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  gap: 0rem;
  width: 100%;

  @container (max-width: 800px) {
    & {
      padding-inline: 5px;
      gap: 0.5rem;
    }
  }
`;
