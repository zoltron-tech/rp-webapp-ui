import styled from "styled-components";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

export const SongListContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin-inline: auto;
  margin-top: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
    }
  }
`;

export const SeeMoreLink = styled.div`
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

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 6px 16px;
    border: 1px solid var(--accent);
    border-radius: 50px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: var(--font-size-h6);
    font-weight: 700;
    font-style: italic;
    color: var(--accent);
    white-space: nowrap;
    transition: all 0.2s ease;

    svg {
      display: block;
    }
  }

  span:hover {
    cursor: pointer;
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  @container (max-width: 600px) {
    span {
      font-size: var(--font-size-input);
    }
  }
`;
