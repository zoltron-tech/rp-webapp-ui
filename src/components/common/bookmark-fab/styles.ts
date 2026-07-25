import styled, { keyframes } from "styled-components";
import { Z_INDEX } from "@/theme";

/* Stacks directly above the scroll-to-bottom button (right/bottom, 48px
   tall — see scroll-jump-button/styles.ts) with a gap; matches its edge
   margin so the two read as one column. */
export const Wrap = styled.div<{ $slideOut?: boolean }>`
  position: fixed;
  right: 36px;
  bottom: calc(36px + 48px + 18px);
  z-index: ${Z_INDEX.SCROLL_JUMP};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  /* Slides the whole group out past the edge — a manual show/hide toggle
     for the reader's side controls. */
  transform: translateX(${({ $slideOut }) => ($slideOut ? "150%" : "0")});
  pointer-events: ${({ $slideOut }) => ($slideOut ? "none" : "auto")};
  transition: transform 0.3s ease;

  @media (max-width: 600px) {
    right: 22px;
    bottom: calc(22px + 44px + 12px);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  35% { transform: scale(1.16); }
  100% { transform: scale(1); }
`;

export const SaveButton = styled.button<{ $pulse?: boolean }>`
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  background-color: var(--accent);
  border: 1px solid var(--accent-4);
  color: var(--bg-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--accent) 60%, transparent);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  ${({ $pulse }) => $pulse && `animation: ${pulse} 0.45s ease;`}

  &:hover {
    box-shadow: 0 4px 18px -2px color-mix(in srgb, var(--accent) 75%, transparent);
  }

  @media (max-width: 600px) {
    width: 46px;
    height: 46px;
  }
`;

export const ResumeChip = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px 7px 10px;
  border-radius: 999px;
  background-color: var(--bg-3);
  border: 1px solid var(--accent-4);
  color: var(--accent);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 3px 10px -4px rgba(0, 0, 0, 0.4);
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: var(--accent-hover);
    border-color: var(--accent-hover);
  }
`;
