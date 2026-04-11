import styled from "styled-components";

export const Card = styled.article`
  position: relative;
  width: 100%;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;

  &.unread {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
    background: color-mix(in srgb, var(--accent) 8%, var(--bg-3));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent)
      inset;
  }

  &:hover {
    border-color: var(--grey-200, #b9c1cc);
    background: var(--bg-2);
  }
`;

export const Header = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;

  .avatar {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: var(--font-size-small);
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

export const Timestamp = styled.time`
  position: absolute;
  bottom: 6px;
  right: 8px;
  z-index: 1;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;

  &.unread {
    color: color-mix(in srgb, var(--accent) 60%, var(--text));
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-width: 0;

  @media (max-width: 680px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
`;

export const MessagePreview = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.unread {
    color: var(--text);
    font-weight: var(--font-weight-bold);
  }

  @media (max-width: 680px) {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export const Sender = styled.span`
  color: var(--text);
  font-weight: var(--font-weight-medium);

    &.unread {
    font-weight: var(--font-weight-bold);
  }
`;

export const MetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 4px 8px;
  color: var(--text);
  background: var(--bg-2);
  border: 1px solid var(--bg-9);
  white-space: nowrap;
`;

export const UnreadBadge = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 4px 8px;
  color: var(--white, #fff);
  background: var(--accent);
  white-space: nowrap;
`;

export const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--grey-100);

  @media (max-width: 680px) {
    font-size: 12px;
  }
`;
