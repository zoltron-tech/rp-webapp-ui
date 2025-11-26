import { styled } from "styled-components";

export const ParentWrapperContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 90dvh;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3em;
`;

export const LeftWrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20cqw;
  margin-right: 2px;

  container-name: left_wrapper;
  container-type: inline-size;

  @container (max-width: 1200px) {
    & {
      width: 70px;
    }
  }
`;

export const ListContainer = styled.div`
  height: 78dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${({ theme }: any) => theme.background};
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
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
  height: 88dvh;
  overflow-y: auto;
  overflow-x: hidden;
  align-items: flex-start;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 10px;
  margin-top: 30px;

  @container (max-width: 600px) {
    & {
      padding-inline: 0px;
    }
  }
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 300;
  margin-bottom: 20px;
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

  @container (max-width: 200px) {
    & {
      font-size: 10px;
      font-weight: 600;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 81cqw;
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
