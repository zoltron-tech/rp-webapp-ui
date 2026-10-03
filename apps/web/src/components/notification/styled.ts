import { styled } from "styled-components";
import { Button } from "../common";

export const ListRoot = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 580px;
  margin-inline: auto;
  margin-top: 40px;
  background-color: var(--bg-2);
  border: 1px solid var(--bg-5);
  border-radius: 12px;
  overflow: hidden;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  @media screen and (max-width: 600px) {
    margin-top: 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`;

export const NotificationsHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--bg-4);
  flex-shrink: 0;
`;

export const NotificationsHeaderTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  font-family: var(--font);
`;

export const NotificationHeaderText = styled(Button)`
  max-width: 150px;
  height: 30px;
  font-size: 12px;
`;

export const NotificationsBoxRoot = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-bottom: 1px solid var(--bg-4);
  position: relative;

  &[data-unread] {
    background-color: var(--accent-a2);
    border-left: 3px solid var(--accent-7);
    padding-left: 13px;
  }

  &:hover {
    background-color: var(--bg-3);
  }

  &:last-of-type {
    border-bottom: none;
  }

  .avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  @media screen and (max-width: 430px) {
    padding: 10px 12px;
    gap: 10px;

    &[data-unread] {
      padding-left: 9px;
    }

    .avatar {
      width: 36px;
      height: 36px;
    }
  }
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 2px;
`;

export const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const Extras = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 6px;
  padding-top: 2px;
  flex-shrink: 0;
`;

export const Title = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
`;

export const Subtext = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const StyledDate = styled.time`
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.65;
  margin-top: 2px;
`;

export const unReadBadge = styled.div`
  background-color: var(--accent-9);
  border-radius: 50%;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;

  .button {
    font-size: 12px !important;
    padding: 6px 12px !important;
  }

  .button.messaging {
    background-color: var(--accent-hover);
    cursor: wait;
    pointer-events: none;
  }
`;

/** Empty state for the full notifications page — art over a title and a line,
 *  the same shape the other page-level empty states use. */
export const EmptyState = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 10px;
  padding-block: 24px;
`;

export const EmptyStateTitle = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
`;

export const EmptyStateBody = styled.p`
  margin: 0;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  max-width: 280px;
  line-height: 1.55;
`;
