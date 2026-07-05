import { styled } from "styled-components";

export const MuseContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid var(--bg-4);
  background-color: var(--bg-2);
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-3);
    }
  }

  &:active {
    background-color: var(--bg-4);
  }

  .avatar {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    /* Slim layout on small screens */
    padding: 8px 12px;
    gap: 8px;

    .avatar {
      width: 36px;
      height: 36px;
    }
  }
`;

export const MuseInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

export const MuseName = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MuseSubname = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MuseFandom = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xxsmall);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  background: ${(p) => p.$color ?? "var(--bg-4)"};
  padding: 2px 6px;
  border-radius: 999px;
  margin-top: 2px;
  align-self: flex-start; /* ensure chip sizes to content */
  width: auto;

  &::before {
    content: "";
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    font-size: var(--font-size-xxxsmall);
    padding: 1px 6px;
    &::before {
      width: 4px;
      height: 4px;
    }
  }
`;

export const VerseBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
`;

export const VerseBadge = styled.button<{ $active?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: var(--font-size-xxxsmall);
  font-weight: 700;
  cursor: ${(p) => (p.$active ? "default" : "pointer")};
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-4)")};
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  border: 1px solid var(--bg-5);
  transition: background-color 0.15s ease;

  &:hover {
    background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-5)")};
    color: ${(p) => (p.$active ? "#fff" : "var(--text)")};
  }
`;

export const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const IconBtn = styled.button`
  background: var(--bg-3);
  border: 1px solid var(--bg-5);
  color: var(--text);
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
  }

  &:active {
    background: var(--bg-5);
  }
`;
