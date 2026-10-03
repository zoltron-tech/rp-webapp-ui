import styled from "styled-components";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

export const SongListContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin-inline: auto;
  margin-top: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
    }
  }
`;

/** Empty state for a profile with no songs — art centred over the message,
 *  matching the treatment used by the other profile empty states. */
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
