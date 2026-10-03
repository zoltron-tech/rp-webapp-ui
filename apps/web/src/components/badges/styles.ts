import { styled } from "styled-components";

export const Row = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  line-height: 0;
  border-radius: 999px;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

/** Non-interactive variant, for surfaces that are themselves a link or an export. */
export const StaticRow = styled.span<{ $vertical?: boolean }>`
  display: inline-flex;
  flex-direction: ${(p) => (p.$vertical ? "column" : "row")};
  align-items: center;
  gap: 4px;
  line-height: 0;
`;

export const Overflow = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${(p) => p.$size}px;
  min-width: ${(p) => p.$size}px;
  padding-inline: 5px;
  border-radius: 999px;
  background: var(--fill-hover);
  border: 1px solid var(--material-edge);
  color: var(--text-secondary);
  font-size: ${(p) => Math.max(9, Math.round(p.$size * 0.46))}px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
`;

// ─── Dialog body ─────────────────────────────────────────────────────────────

export const DialogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* The dialog is capped by the 375 × 667 baseline, so a novelist with a long
     shelf of badges scrolls inside this list rather than pushing the dialog's
     own actions off the screen. */
  max-height: 46vh;
  overflow-y: auto;
  padding-right: 2px;
`;

export const DialogItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
`;

export const DialogItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const DialogItemTitle = styled.span`
  font-size: var(--font-size);
  font-weight: 600;
  color: var(--text);
`;

export const DialogItemDescription = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
`;

export const DialogEmpty = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
`;
