import styled from "styled-components";

/* An inset, rounded row on the notifications glass panel. Unread is carried by
   the dot and a faint accent tint; the 3px accent bar on the left edge went
   with the full-bleed rows it was drawn for. */
export const Item = styled.button<{ $unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border: none;
  border-radius: 12px;
  font-family: var(--font);
  color: inherit;
  transition: background-color 0.15s ease;
  background-color: ${({ $unread }) =>
    $unread ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent"};

  &:hover {
    background-color: ${({ $unread }) =>
      $unread
        ? "color-mix(in srgb, var(--accent) 18%, transparent)"
        : "var(--fill-hover)"};
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11);
    outline-offset: -2px;
  }

  .avatar {
    width: 40px;
    height: 40px;
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
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Text = styled.div`
  font-size: 12px;
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

/* 11px at full secondary colour: it was 9px at 65% opacity. */
export const Timestamp = styled.time`
  font-size: 11px;
  color: var(--text-secondary);
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
    font-size: 12px !important;
    padding: 6px 12px !important;
    border-radius: 999px;
  }

  .button.messaging {
    background-color: var(--accent-hover);
    cursor: wait;
    pointer-events: none;
  }
`;
