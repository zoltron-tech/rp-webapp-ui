import styled from "styled-components";

export const Container = styled.div<{ $playerHeight: number }>`
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(100dvh - 60px - ${({ $playerHeight }) => $playerHeight}px);
  overflow: hidden;

  @media (max-width: 680px) {
    padding-top: 0px;
    height: calc(100dvh - 45px - ${({ $playerHeight }) => $playerHeight}px);
  }
`;

export const ChatWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;

  @media (max-width: 680px) {
    gap: 2px;
  }
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);

  @media (max-width: 680px) {
    border-radius: unset;
  }
`;

export const ChatPerson = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 42px;
    height: 42px;
    min-width: 42px;
  }
`;

export const ChatTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const ChatTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-h6);
  color: var(--text);
`;

export const ChatMeta = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
`;

export const MessagesContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--bg-3);
  border-radius: 8px;
  background: var(--bg-2);
  padding: 10px;

  @media (max-width: 680px) {
    border-radius: unset;
  }
`;

export const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  padding: 28px 10px;
`;
