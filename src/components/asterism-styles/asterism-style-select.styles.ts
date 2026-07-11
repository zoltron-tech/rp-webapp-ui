import { Select } from "radix-ui";
import styled from "styled-components";

/* Defers layout to the parent so multiple selects can share one grid — their
   labels line up in one column and their triggers in another (equal width). */
export const Wrap = styled.div`
  display: contents;
`;

export const Label = styled.label`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
`;

export const Trigger = styled(Select.Trigger)`
  all: unset;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  height: 32px;
  padding: 0 8px 0 10px;
  border-radius: 6px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  font-family: var(--font);
  cursor: pointer;

  &:hover {
    border-color: var(--bg-8);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
  }

  svg {
    /* Pin the chevron to the right edge so both triggers read identically. */
    margin-left: auto;
    opacity: 0.7;
    flex-shrink: 0;
  }
`;

export const TriggerLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Content = styled(Select.Content)`
  /* Both this popper and the chapter editor's tray/dialog portal to
     document.body, so their z-indexes compete directly. The mobile tray sits at
     99999 (see edit-storyboard-event-card/overlay.styled.ts); sit above it so
     the divider dropdown paints over the tray instead of behind it. */
  z-index: 100000;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
`;

export const Viewport = styled(Select.Viewport)`
  padding: 4px;
`;

export const Item = styled(Select.Item)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: var(--font-size-small);
  font-family: var(--font);
  color: var(--text);
  cursor: pointer;
  outline: none;
  user-select: none;

  &[data-highlighted] {
    background-color: var(--bg-4);
  }

  &[data-state="checked"] {
    color: var(--accent);
  }
`;

export const ItemPreview = styled.div`
  flex-shrink: 0;
  min-width: 64px;
  display: flex;
  justify-content: center;
`;

export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

/** Radix's text slot — its content is mirrored into the closed trigger. */
export const ItemLabel = styled(Select.ItemText)`
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
`;

export const ItemDescription = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
`;
