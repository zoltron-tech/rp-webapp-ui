import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
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
  /* Prevent scroll chaining to the body when the mixed feed scroll reaches
     its end — otherwise the whole page scrolls and scroll-to-top breaks. */
  overscroll-behavior: contain;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const ActivityContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding-block: 20px;
  background-color: var(--bg-2);
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

export const AddFriendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px dashed var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 10px;
  flex-shrink: 0;
  align-self: center;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--bg-4);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 600px) 
    {
      margin-left: 10px;
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

/** Placeholder card at the end of a horizontal carousel that loads the next page. */
export const NextPageCard = styled.button<{ $height?: string }>`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 169px;
  min-width: 169px;
  height: ${({ $height }) => $height ?? "300px"};
  border-radius: var(--border-radius, 8px);
  border: 1.5px dashed var(--bg-6);
  background: var(--bg-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--bg-3);
    }
  }

  &:active:not(:disabled) {
    background: var(--bg-4);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  @media (max-width: 600px) {
    width: 113px;
    min-width: 113px;
    height: ${({ $height }) => $height ?? "200px"};
  }
`;

/** Same shape as NovelistPreviewCard (~220 × 280 px). */
export const NextPageNovelistCard = styled(NextPageCard)`
  width: 220px;
  min-width: 220px;
  height: 280px;

  @media (max-width: 600px) {
    width: 155px;
    min-width: 155px;
    height: 230px;
  }
`;
