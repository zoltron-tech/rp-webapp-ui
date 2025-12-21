import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
 
`;

export const MessageContainer = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;

    @container (max-width: 600px) {
        max-width: 300px;
    }
`;

export const MessageText = styled.div`
  font-size: 18px;
  font-weight: 300;
  margin-bottom: 10px;
  font-style: italic;
  text-align: center;

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }
`;

export const HyperLink = styled.span`
  font-size: 20px;
  margin-block: 20px;
  font-style: italic;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: var(--accent);
  gap: 0.3rem;



  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }
`;

export const StoryListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-inline: 30px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  width: 100%;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;
