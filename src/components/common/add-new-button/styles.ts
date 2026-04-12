import styled from "styled-components";

export const Button = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    border: 1px solid var(--accent);
    border-radius: 50px;
    background: color-mix(in srgb, var(--accent) 14%, var(--bg-1));
    font-size: var(--font-size-h6);
    font-weight: 700;
    font-style: italic;
    color: var(--accent);
    white-space: nowrap;
    transition: all 0.2s ease;
    cursor: pointer;

    svg {
      display: block;
    }

    &:hover {
      color: var(--accent-hover);
      border-color: var(--accent-hover);
      background: color-mix(in srgb, var(--accent) 20%, var(--bg-1));
      box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
    }
`;

export const Wrapper = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block: 8px;
  max-width: 700px;
  margin-inline: auto;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
    opacity: 0.8;
  }
`;
