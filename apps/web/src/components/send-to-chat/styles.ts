import styled from "styled-components";
import { FOCUS_RING } from "@/theme";

/* The share dialogs' own buttons are 8px-radius, full-width, 16px icons;
 * the open button matches them in the accent, the dialog's own colour. */
export const OpenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  ${FOCUS_RING}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* Clear of the dialog's close button in the corner. */
  padding-right: 32px;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--fill-hover);
  }

  ${FOCUS_RING}

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 32px;
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
`;

export const SearchWrap = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--field-edge);
  background: var(--field-fill);
  color: var(--text-secondary);
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--accent);
  }

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 9px 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font);
  font-size: var(--font-size-input);
  color: var(--text);

  &::placeholder {
    color: var(--text-secondary);
  }
`;

/* Its own scroller: a long inbox must not push the dialog off the screen.
 * On a 375×667 phone the tray keeps the header, the search and about four
 * rows in view. */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 340px;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin-inline: -4px;
  padding-inline: 4px;

  @media screen and (max-width: 800px) {
    max-height: min(320px, 46vh);
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);

  .avatar,
  > span:first-child {
    flex-shrink: 0;
  }
`;

export const RowText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

export const RowName = styled.span`
  overflow: hidden;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowDetail = styled.span`
  overflow: hidden;
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SendButton = styled.button<{ $sent?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 68px;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $sent }) => ($sent ? "var(--success, #22c55e)" : "var(--accent)")};
  background: ${({ $sent }) =>
    $sent
      ? "color-mix(in srgb, var(--success, #22c55e) 12%, transparent)"
      : "var(--accent)"};
  color: ${({ $sent }) => ($sent ? "var(--success, #22c55e)" : "#ffffff")};
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: filter 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  &:disabled {
    cursor: default;
    opacity: ${({ $sent }) => ($sent ? 1 : 0.55)};
  }

  ${FOCUS_RING}

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const Status = styled.p`
  margin: 0;
  padding: 24px 8px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
`;

export const ErrorText = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--error, #ef4444);

  svg {
    flex-shrink: 0;
  }
`;
