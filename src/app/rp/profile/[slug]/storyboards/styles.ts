import { DEV_MODE_BORDER } from "@/theme";
import styled, { css } from "styled-components";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  padding-top: 20px;
  padding-inline: 10px;
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  gap: 1rem;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const Maintext = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
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
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 300;
  font-style: italic;
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
