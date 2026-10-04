import { styled } from "styled-components";
import { FOCUS_RING, MATERIAL_CARD, NO_SCROLLBAR } from "@/theme";

/* The notifications page: one material card holding inset, rounded rows.
   The rows themselves are in row.styles.ts, shared with the bell's dropdown. */

export const ListRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 580px;
  min-width: 0;
  margin-inline: auto;
  margin-top: 40px;
  ${MATERIAL_CARD}
  border-radius: 18px;
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
    box-shadow: none;
  }
`;

export const NotificationsHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 10px;
  flex-shrink: 0;

  @media screen and (max-width: 800px) {
    padding: 12px 14px 8px;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const NotificationsHeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  font-family: var(--font);
`;

export const HeaderSummary = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
`;

export const MarkAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 6px 10px;
  border: none;
  border-radius: 999px;
  background: none;
  cursor: pointer;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-11);
  white-space: nowrap;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--fill-hover);
  }

  ${FOCUS_RING}

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

/* One line of chips that scrolls sideways rather than wrapping: six of them
   do not fit across 375px, and a second line would cost a whole row. */
export const Filters = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px 14px 10px;
  overflow-x: auto;
  flex-shrink: 0;
  ${NO_SCROLLBAR}
`;

export const FilterChip = styled.button`
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--material-edge);
  border-radius: 999px;
  background-color: var(--material-fill);
  cursor: pointer;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: var(--fill-hover);
  }

  &[aria-pressed="true"] {
    border-color: transparent;
    background-color: var(--accent-9, var(--accent));
    color: var(--accent-contrast, #fff);
  }

  ${FOCUS_RING}
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 6px 6px;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  padding: 8px 12px 4px;
  font-family: var(--font);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const FilterEmpty = styled.p`
  margin: 0;
  padding: 28px 20px;
  font-family: var(--font);
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
  text-align: center;
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
