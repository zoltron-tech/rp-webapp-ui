import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.5em;
  gap: 0.5em;
`;

export const Button = styled.button`
  padding: 0.5em 1em;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--accent-hover);
  }
`;

export const ParentWrapperContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3em;
  width: 100%;
  overflow: hidden;
`;

export const LeftWrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 15cqw;

  container-name: left_wrapper;
  container-type: inline-size;

  @container (max-width: 1200px) {
    & {
      width: 70px;
    }
  }
`;

export const ListContainer = styled.div`
  height: 80dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${({ theme }: any) => theme.background};
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top: 1px solid var(--bg-6);
  border-right: 1px solid var(--bg-6);
  border-bottom: 1px solid var(--bg-6);

  @container left_wrapper (max-width: 200px) {
    & {
      width: 70px;
    }
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb,
  &::-webkit-scrollbar {
    visibility: hidden;
    width: 0.35em;
  }

  &:hover {
    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb,
    &::-webkit-scrollbar {
      visibility: visible;
    }
  }
`;

export const RightWrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  height: 93dvh;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 300;
  margin-bottom: 10px;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 14px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 200px) {
    & {
      font-size: 10px;
      font-weight: 600;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 84cqw;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  overflow-x: auto;

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }

  @container (max-width: 1200px) {
    & {
      width: 92cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 1000px) {
    & {
      width: 88cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 700px) {
    & {
      width: 88cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 88cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 550px) {
    & {
      width: 85cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 430px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 360px) {
    & {
      width: 75cqw;
      font-size: 18px;
    }
  }
`;
