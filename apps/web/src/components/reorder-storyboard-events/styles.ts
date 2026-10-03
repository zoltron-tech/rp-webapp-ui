import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: 4px 0 14px;
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Heading = styled.h2`
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const SubHeading = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const CloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-4);
  }
`;

export const ListContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--bg-5);
    border-radius: 3px;
  }
`;

export const Row = styled.div<{ $dragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;
  opacity: ${(p) => (p.$dragging ? 0.5 : 1)};
`;

export const Thumbnail = styled.div`
  width: 40px;
  height: 60px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;

  .cover-image {
    width: 100%;
    height: 100%;
  }
`;

export const Title = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DragHandleButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: grab;
  touch-action: none;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }

  &:active {
    cursor: grabbing;
  }
`;

export const EmptyText = styled.p`
  margin: 0;
  padding: 20px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 10px;
  padding-top: 14px;
`;

export const CancelButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--bg-6);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--bg-4);
    color: var(--text);
    border-color: var(--bg-8);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DoneButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 8px 18px;
  border-radius: 6px;
  background-color: var(--accent);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:disabled {
    background-color: var(--bg-6);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;
