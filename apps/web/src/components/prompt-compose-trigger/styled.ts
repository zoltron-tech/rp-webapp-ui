import styled from "styled-components";

/* No surface of its own: it sits on the page (explore) or inside a prompt
   card (threads), so a full-width --bg-2 strip read as a band across both.
   The field below carries the shape. */
export const Root = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  cursor: pointer;

  .trigger-avatar {
    width: 40px !important;
    height: 40px !important;
    flex-shrink: 0;
  }

  &:hover > div {
    border-color: color-mix(in srgb, var(--bg-12) 18%, transparent);
  }

  &:focus-visible > div {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;

export const FakeInput = styled.div`
  flex: 1;
  min-width: 0;
  height: 42px;
  display: flex;
  align-items: center;
  background-color: var(--field-fill, var(--bg-3));
  border: 1px solid var(--field-edge, var(--bg-6));
  border-radius: 21px;
  box-shadow: inset 0 1px 0 var(--material-highlight, transparent);
  padding: 0 16px;
  overflow: hidden;
  transition: border-color 0.15s ease;
`;

export const Placeholder = styled.span<{ $visible: boolean }>`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  user-select: none;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
