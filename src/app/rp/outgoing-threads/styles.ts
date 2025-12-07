import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 1rem;
`;

export const StoryListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-top: 20px;
  padding-inline: 30px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  width: 100%;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const Maintext = styled.div`
  margin-left: 5px;
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 22px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 18px;
    }
  }
`;

export const Subtext = styled.div`
  margin-left: 5px;
  font-size: 18px;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }
`;
