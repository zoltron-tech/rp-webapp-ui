import styled from "styled-components";

export const Item = styled.button<{ $unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 16px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-family: var(--font);
  transition: background-color 0.15s ease;
  background-color: ${({ $unread }) =>
    $unread ? "var(--accent-a2)" : "transparent"};
  border-left: 3px solid
    ${({ $unread }) => ($unread ? "var(--accent-7)" : "transparent")};

  &:hover {
    background-color: ${({ $unread }) =>
      $unread ? "var(--accent-a3)" : "var(--bg-3)"};
  }

  .avatar {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Name = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Text = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

export const Timestamp = styled.time`
  font-size: 9px;
  color: var(--text-secondary);
  opacity: 0.65;
`;

export const UnreadDot = styled.div`
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--accent-9);
  margin-top: 5px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;

  .button {
    font-size: 11px !important;
    padding: 5px 10px !important;
  }

  .button.messaging {
    background-color: var(--accent-hover);
    cursor: wait;
    pointer-events: none;
  }
`;
