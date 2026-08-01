import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;

  /* iPhone SE baseline: two columns still fit, but the cards go single-line. */
  @media (min-width: 700px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const Option = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem;
  border-radius: 0.6rem;
  cursor: pointer;
  text-align: left;
  background: ${(p) =>
    p.$active
      ? "color-mix(in srgb, var(--accent) 12%, var(--bg-3))"
      : "var(--bg-3)"};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-6)")};
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: var(--accent);
  }
`;

/** A proportional page thumbnail — the aspect ratio is the real preset's. */
export const Thumb = styled.span<{ $ratio: number }>`
  position: relative;
  flex-shrink: 0;
  width: 1.6rem;
  aspect-ratio: ${(p) => p.$ratio};
  border-radius: 2px;
  background: var(--bg-1);
  border: 1px solid var(--bg-6);
  overflow: hidden;
`;

export const ThumbLines = styled.span`
  position: absolute;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--text-secondary) 0,
    var(--text-secondary) 1px,
    transparent 1px,
    transparent 4px
  );
  opacity: 0.5;
`;

export const OptionBody = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`;

export const OptionLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
`;

export const OptionDescription = styled.span`
  font-size: 0.7rem;
  line-height: 1.35;
  color: var(--text-secondary);
`;
