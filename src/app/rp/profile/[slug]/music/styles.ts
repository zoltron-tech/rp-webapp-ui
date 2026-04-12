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
