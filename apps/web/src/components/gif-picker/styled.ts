import styled from "styled-components";

export const PickerBody = styled.div<{ $fill?: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: ${({ $fill }) => ($fill ? "100%" : "480px")};
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
  font-size: var(--font-size-input);
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

export const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 0 8px 8px;
  width: 100%;
`;

export const GridOuterScroller = styled.div`
  overflow-y: auto;
  flex: 1;
`;

export const GifCell = styled.button`
  margin-bottom: 6px;
  border: none;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  background: var(--bg-4);
  transition: opacity 0.12s ease, transform 0.12s ease;

  &:hover {
    opacity: 0.82;
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
`;

export const GifThumb = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-radius: 6px;
`;

export const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 8px 8px;
`;

export const LoadMoreButton = styled.button`
  all: unset;
  box-sizing: border-box;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  font-family: var(--font);
  font-size: var(--font-size-small);
  padding: 8px 16px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-4);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const StatusText = styled.p`
  column-span: all;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-input);
  padding: 28px 0;
  margin: 0;
`;
