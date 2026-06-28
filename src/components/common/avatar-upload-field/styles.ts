import styled from "styled-components";
import { AvatarNew } from "../avatar-new";

export const Avatar = styled(AvatarNew)`
  width: 100%;
  height: 100%;
`;

export const Wrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  cursor: pointer;
`;

export const CameraOverlay = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  border: 4px solid var(--bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 2;
  pointer-events: none;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    right: -4px;
    bottom: -4px;
  }
`;

export const AvatarButton = styled.button`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

export const NoteBubble = styled.button<{ $color?: string | null }>`
  all: unset;
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);
  right: auto;
  transform: translateY(-50%);
  width: unset;
  background: ${({ $color }) =>
    $color ? $color : "linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%)"};
  color: ${({ $color }) => ($color ? "#ffffff" : "var(--text)")};
  border: 1.5px dashed ${({ $color }) => ($color ? "rgba(255,255,255,0.35)" : "var(--accent-6)")};
  opacity: 95%;
  border-radius: 20px;
  padding: 5px 10px;
  z-index: 3;
  font-size: var(--font-size-small);
  cursor: pointer;
  display: block;
  overflow: visible;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 160px;
  width: max-content;
  transition: opacity 0.18s ease, border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;

  &:hover {
    opacity: 100%;
    border: 1.5px solid ${({ $color }) => ($color ? "rgba(255,255,255,0.6)" : "var(--accent)")};
    transform: translateY(calc(-50% - 2px));
    background: ${({ $color }) =>
      $color ? $color : "linear-gradient(135deg, var(--accent-5) 0%, var(--accent-4) 100%)"};
  }

  &:active {
    transform: translateY(-50%);
  }

  /* Thought bubble tail – points left toward the avatar */
  &::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 0;
    bottom: auto;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 20px solid ${({ $color }) => $color ?? "var(--accent-4)"};
    border-bottom: 20px solid ${({ $color }) => $color ?? "var(--accent-4)"};
  }

  &::after {
    content: "";
    position: absolute;
    top: 24px;
    left: -12px;
    bottom: auto;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 12px solid ${({ $color }) => $color ?? "var(--accent-3)"};
    border-bottom: 12px solid ${({ $color }) => $color ?? "var(--accent-3)"};
  }

  &[data-placeholder="true"] {
    color: var(--text-secondary);
  }
`;

export const NoteBubbleEmoji = styled.span`
  position: absolute;
  top: -14px;
  right: -14px;
  font-size: 1.4rem;
  display: inline-block;
  transform: rotate(15deg);
  line-height: 1;
  pointer-events: none;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.18));
`;

export const NoteEditBadge = styled.span`
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-2);
  border: 1.5px solid var(--bg-6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  pointer-events: none;
  z-index: 1;
  transition: background 0.18s ease, border-color 0.18s ease;

  svg {
    width: 13px;
    height: 13px;
  }

  ${NoteBubble}:hover & {
    background: var(--bg-4);
    border-color: var(--bg-8);
  }
`;
