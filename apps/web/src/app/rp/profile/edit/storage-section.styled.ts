import styled from "styled-components";

/**
 * The Storage row (AWS_COST_SECURITY_PLAN.md §2.2): an account row that is one
 * button, since the whole row opens the explainer. Material, not glass — it
 * is content inside the settings page — and the same metrics as
 * `AccountRow`, so it sits in the list without standing out.
 */
export const StorageRowButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 12px 14px;
  background: var(--material-fill);
  border: 1px solid var(--material-edge);
  border-radius: 14px;
  cursor: pointer;

  &:hover {
    background: color-mix(in srgb, var(--bg-12) 7%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media screen and (max-width: 480px) {
    gap: 6px;
    padding: 8px 10px;
    border-radius: 12px;
  }
`;

export const StorageTopLine = styled.span`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

export const StorageLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    width: 14px;
    height: 14px;
  }

  @media screen and (max-width: 480px) {
    font-size: 11px;
    letter-spacing: 0.4px;
  }
`;

export const StorageValue = styled.span`
  font-size: var(--font-size);
  color: var(--text);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;

  @media screen and (max-width: 480px) {
    font-size: var(--font-size-small);
  }
`;

/** The thin bar: a quiet track, the accent fill, amber from 90 %. */
export const StorageTrack = styled.span`
  display: block;
  height: 6px;
  border-radius: 999px;
  background: var(--material-edge);
  overflow: hidden;
`;

export const StorageFill = styled.span<{ $warning: boolean }>`
  display: block;
  height: 100%;
  min-width: 3px;
  border-radius: inherit;
  background: ${({ $warning }) =>
    $warning ? "var(--amber-9)" : "var(--accent)"};
  transition: width 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const StorageDaily = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

/** The explainer's body: short paragraphs, readable at 375 px. */
export const ExplainerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(50vh, 360px);
  overflow-y: auto;
  font-size: var(--font-size);
  line-height: 1.45;
  color: var(--text);

  p {
    margin: 0;
  }

  @media screen and (max-width: 480px) {
    font-size: var(--font-size-small);
  }
`;
