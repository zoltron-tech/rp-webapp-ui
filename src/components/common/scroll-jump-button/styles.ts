import styled from "styled-components";
import { Z_INDEX } from "@/theme";

export const Button = styled.button<{ $visible?: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 20px;
  min-width: 0;
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  z-index: ${Z_INDEX.SCROLL_JUMP};
  background-color: var(--bg-3);
  border: 1px solid var(--accent-4);
  color: var(--accent);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible === false ? 0 : 1)};
  pointer-events: ${({ $visible }) => ($visible === false ? "none" : "auto")};
  transition: opacity 0.25s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  @media (max-width: 600px) {
    right: 22px;
    bottom: 22px;
    width: 44px;
    height: 44px;
  }
`;
