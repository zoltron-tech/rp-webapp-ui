import { styled } from "styled-components";
import { Pill } from "../pill";

export const ChatBubble = styled(Pill)`
  width: fit-content;
  font-size: 12px;
  max-width: 300px;
  min-height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  word-break: break-word;
  border-radius: 20px;
`;

export const ChatBubbleContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: 5px;
  width: 100%;

  &.sender {
    align-items: end;

    & > ${ChatBubble} {
      background-color: ${({ theme }) => theme.primary};
    }
  }

  &.receiver {
    align-items: start;

    & > ${ChatBubble} {
      background-color: ${({ theme }) => theme.modalBackground};
    }
  }
`;

export const TimeStamp = styled.span`
  font-size: 10px;
  opacity: 0.7;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.text};
`;
