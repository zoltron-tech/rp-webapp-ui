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

export const NoteBubble = styled.button`
  all: unset;
  position: absolute;
  top: -14px;
  right: -14px;
  width: unset;
  background: linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%);
  opacity: 95%;
  border-radius: 20px;
  padding: 5px 10px;
  z-index: 3;
  font-size: var(--font-size-small);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 160px;
  width: max-content;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 100%;
  }

  /* Thought bubble tail */
  &::before {
    content: "";
    position: absolute;
    bottom: -20px;
    left: 18px;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 20px solid var(--accent-4);
    border-top: 20px solid var(--accent-4);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -12px;
    left: 5px;
    width: 0;
    height: 0;
    border-radius: 50%;
    border-left: 12px solid var(--accent-3);
    border-top: 12px solid var(--accent-3);
  }

  svg {
    flex-shrink: 0;
    align-self: center;
    width: 16px;
    height: 16px;
  }

  &[data-placeholder="true"] {
    color: var(--text-secondary);

    svg {
      color: var(--text);
    }
  }
`;
