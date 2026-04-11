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

export const GifGrid = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px 8px;
  gap: 4px;
`;

export const GridOuterScroller = styled.div`
  overflow-y: auto;
  display: flex;
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
  object-fit: cover;


`;

export const StatusText = styled.p`
  column-span: all;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 28px 0;
  margin: 0;
`;
