import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

export const StoryListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}


  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  /* justify-content: center; */
  gap: 0.3rem;
    max-width: 800px;

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

/** Empty state for a profile with no stories — art centred over the message,
 *  matching the treatment used by the other profile and muse empty states. */
export const EmptyStateWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  padding-block: 24px;
`;

export const EmptyStateTitle = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
`;

export const EmptyStateSubtitle = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  max-width: 270px;
  line-height: 1.55;
`;
