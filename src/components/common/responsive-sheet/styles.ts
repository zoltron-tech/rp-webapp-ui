import styled, { keyframes } from "styled-components";
import { fadeIn as overlayFadeIn, slideInUp } from "@/theme/animations";

/**
 * Chrome and form primitives for [ResponsiveSheet] — a centred dialog on
 * desktop, a bottom-sheet tray on mobile. Shared by the storyboard workspace
 * views (timeline, codex) so their editors look and behave identically.
 */

const popIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

export const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
  animation: ${overlayFadeIn} 0.2s ease both;
`;

export const Sheet = styled.div<{ $wide?: boolean }>`
  position: fixed;
  z-index: 301;
  display: flex;
  flex-direction: column;
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${(p) => (p.$wide ? "min(94vw, 560px)" : "min(92vw, 420px)")};
  max-height: 85vh;
  animation: ${popIn} 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;

  /* Mobile: slide up as a bottom sheet — it has to fit and scroll inside a
     375×667 viewport. */
  @media (max-width: 700px) {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    transform: none;
    max-height: 88svh;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    animation: ${slideInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
`;

/** Title on the left, circular cancel/confirm on the right. */
export const SheetHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--bg-4);
`;

export const SheetTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SheetActionButton = styled.button<{
  $variant?: "confirm" | "cancel" | "danger";
}>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid
    ${(p) =>
      p.$variant === "confirm"
        ? "var(--accent)"
        : p.$variant === "danger"
          ? "var(--tomato-9, #e5484d)"
          : "var(--bg-5)"};
  background: ${(p) =>
    p.$variant === "confirm" ? "var(--accent)" : "var(--bg-3)"};
  color: ${(p) =>
    p.$variant === "confirm"
      ? "#fff"
      : p.$variant === "danger"
        ? "var(--tomato-9, #e5484d)"
        : "var(--text-secondary)"};

  &:hover:not(:disabled) {
    color: ${(p) => (p.$variant === "confirm" ? "#fff" : "var(--text)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const SheetBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.9rem;
`;

// ── Form primitives ────────────────────────────────────────────────────────

export const Hint = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const TextInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  /* Storyboard inputs use the shared input size. */
  font-size: var(--font-size-input);
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

export const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  input[type="range"] {
    flex: 1;
    min-width: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }
`;

export const RangeValue = styled.span`
  flex-shrink: 0;
  width: 3.25rem;
  text-align: right;
  font-size: var(--font-size-small);
  color: var(--text);
`;

export const ChoiceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

export const Choice = styled.button<{
  $active?: boolean;
  $color?: string | null;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  color: ${(p) => (p.$active ? "var(--text)" : "var(--text-secondary)")};
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--accent) 14%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};

  &::before {
    content: "";
    display: ${(p) => (p.$color === undefined ? "none" : "block")};
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => p.$color || "var(--accent)"};
  }
`;

export const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

export const Swatch = styled.button<{ $color: string; $active?: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  background: ${(p) => p.$color};
  border: 2px solid
    ${(p) => (p.$active ? "var(--text)" : "rgba(255, 255, 255, 0.18)")};
`;

export const ToggleRow = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.55rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-small);
  color: var(--text);
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--accent) 14%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};
`;

export const NoteRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  background: var(--bg-3);
  font-size: var(--font-size-small);
  color: var(--text-secondary);

  b {
    color: var(--text);
  }
`;

export const DangerButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  background: transparent;
  color: var(--tomato-9, #e5484d);
  border: 1px solid var(--tomato-9, #e5484d);

  &:hover {
    background: color-mix(in srgb, var(--tomato-9, #e5484d) 14%, transparent);
  }
`;
