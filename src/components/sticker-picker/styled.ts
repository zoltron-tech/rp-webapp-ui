import styled from "styled-components";

export const PickerBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 480px;
`;

export const SearchRow = styled.div`
  padding: 10px 10px 8px;
  flex-shrink: 0;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  padding: 0 12px;
  font-size: 13px;
  font-family: var(--font);
  transition: border-color 0.15s ease;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--accent) 60%, var(--bg-6));
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 0 8px 8px;
`;

export const GridScroller = styled.div`
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const StickerCell = styled.button`
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  background: var(--bg-3);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, transform 0.12s ease;

  &:hover {
    background: var(--bg-4);
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
`;

export const StickerThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const StatusText = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 24px 0;
  margin: 0;
`;
