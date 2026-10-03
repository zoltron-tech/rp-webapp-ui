import styled from "styled-components";
import { FOCUS_RING } from "@/theme";

const THUMB_LIFT =
  "inset 0 1px 0 var(--material-highlight), 0 4px 12px -6px rgb(0 0 0 / 0.6)";
const GLIDE = "0.32s cubic-bezier(0.32, 0.72, 0, 1)";

/* One material track with a lifted thumb under the selected option. */
export const Track = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  max-width: 100%;
  padding: 4px;
  border-radius: 999px;
  background: var(--material-fill-strong);
  border: 1px solid var(--material-edge);
  box-shadow: inset 0 1px 0 var(--material-highlight);
`;

/** Position and width are set inline from the measured tab. */
export const Thumb = styled.span<{ $animate: boolean }>`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  border-radius: 999px;
  background: var(--fill-pressed);
  box-shadow: ${THUMB_LIFT};
  pointer-events: none;
  will-change: transform, width;
  transition: ${({ $animate }) =>
    $animate ? `transform ${GLIDE}, width ${GLIDE}` : "none"};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Tab = styled.button<{ $active: boolean; $thumbReady: boolean }>`
  all: unset;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  min-height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $active }) => ($active ? "var(--text)" : "var(--text-secondary)")};
  /* Until the thumb is measured the active tab paints its own fill. */
  background: ${({ $active, $thumbReady }) =>
    $active && !$thumbReady ? "var(--fill-pressed)" : "transparent"};
  box-shadow: ${({ $active, $thumbReady }) =>
    $active && !$thumbReady ? THUMB_LIFT : "none"};
  transition: background-color 0.15s ease, color 0.2s ease;

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: ${({ $active }) =>
      $active ? "var(--accent-11, var(--accent))" : "currentColor"};
    transition: color 0.2s ease;
  }

  &:hover {
    color: var(--text);
    ${({ $active }) => !$active && "background: var(--fill-hover);"}
  }

  ${FOCUS_RING}

  @media (max-width: 600px) {
    gap: 6px;
    padding: 0 14px;
  }

  /* iPhone SE: three icon+label tabs must still fit the 375px row. */
  @media (max-width: 380px) {
    gap: 5px;
    padding: 0 11px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;
