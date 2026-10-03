import styled from "styled-components";

export const Card = styled.article`
  position: relative;
  width: 100%;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--material-edge);

  &:last-of-type {
    border-bottom: none;
  }

  &.unread {
    background: var(--accent-a2);
    border-left: 3px solid var(--accent-7);
  }

  @media (min-width: 680px) {
    &:hover {
      background: var(--fill-hover);
    }
  }
`;

export const Header = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 16px;

  .unread & {
    padding-left: 13px;
  }

  .avatar {
    width: 46px;
    height: 46px;
    min-width: 46px;
    margin-top: 1px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

export const ContentMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
`;

export const GroupTag = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 9999px;
  padding: 1px 5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.4;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  color: var(--text);
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.unread {
    font-weight: var(--font-weight-bold);
  }
`;

export const MessagePreview = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--font-weight-regular);
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.unread {
    color: var(--text);
    font-weight: var(--font-weight-medium);
  }

  @media (max-width: 680px) {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export const Sender = styled.span`
  font-weight: var(--font-weight-medium);

  &.unread {
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const Extras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 6px;
  padding-top: 1px;
  flex-shrink: 0;
`;

export const Timestamp = styled.time`
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.75;
  white-space: nowrap;

  &.unread {
    color: var(--accent-9);
    opacity: 1;
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-9);
  flex-shrink: 0;
  display: block;
`;
