import { styled } from "styled-components";
import { Z_INDEX } from "@/theme";

export const Row = styled.div`
  position: relative;
  width: 100%;
  padding: 12px 16px 4px;
`;

export const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  display: flex;
  color: var(--text-secondary);
  pointer-events: none;
`;

export const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 40px 0 40px;
  background: var(--material-fill-strong);
  border: 1px solid var(--material-edge);
  border-radius: 999px;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  box-shadow: inset 0 1px 0 var(--material-highlight);

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 60%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  /* Hide the native search-input clear "x" — replaced by ClearButton below. */
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }
`;

export const Spinner = styled.span`
  position: absolute;
  right: 14px;
  display: flex;
  color: var(--text-secondary);
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const ClearButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-4);
    color: var(--text);
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  top: calc(100% + 6px);
  z-index: ${Z_INDEX.MODAL_CONTENT};
  max-height: 60vh;
  overflow-y: auto;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
`;

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-6);
  }

  &:hover {
    background: var(--bg-3);
  }

  .avatar {
    width: 44px;
    height: 44px;
  }
`;

export const AvatarNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

export const NameCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  & > div:first-child {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > div:nth-child(2) {
    font-size: 12px;
    font-weight: 300;
    color: var(--text-secondary);
  }
`;

export const TrailingCol = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const TypeChip = styled.span<{ $type: "novelist" | "muse" }>`
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  background: ${({ $type }) => ($type === "novelist" ? "var(--accent-soft, rgba(99,102,241,0.15))" : "var(--bg-6)")};
  color: ${({ $type }) => ($type === "novelist" ? "var(--accent)" : "var(--text-secondary)")};
`;

export const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 14px;
  color: var(--text-secondary);
  font-size: 13.5px;
`;
