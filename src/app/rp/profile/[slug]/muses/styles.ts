import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

// Background container
export const BackgroundContainer = styled.div`
--navbar-width: 80px;
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
    overflow: hidden;
    min-height: calc(100dvh - var(--navbar-width));

    @media screen and (min-width: 480px) {
       --navbar-width: 60px;
    }
`;

// Each blurred background tile
export const BackgroundTile = styled.div<{
  image: string;
  top: number;
  left: number;
  rotation: number;
  scale: number;
}>`
  position: absolute;
  width: 100px;
  height: 100px;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  background-image: url(${(props) => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  transform: rotate(${(props) => props.rotation}deg) scale(${(props) => props.scale});
  filter: blur(25px) brightness(1);
  opacity: 0.5;
`;

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin-inline: auto;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 14px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text);
  font-size: var(--font-size-input);
  font-family: var(--font);
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: var(--text-secondary);
  }

  &:focus {
    border-color: var(--accent);
  }

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    appearance: none;
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--text-secondary);
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 8px;
  max-width: 800px;
  margin-inline: auto;
  padding-inline: 10px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  font-family: var(--font);
  color: var(--text-secondary);

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-size: var(--font-size);
    font-weight: var(--font-weight-regular);
    font-family: var(--font);
    line-height: 1.4;
    color: var(--text);
  }

  input[type="checkbox"] {
    all: unset;
    width: 20px;
    height: 20px;
    aspect-ratio: 1;
    border-radius: 4px;
    margin: 0;
    overflow: hidden;
    accent-color: var(--accent);
    outline-offset: 2px;
    background-color: var(--bg-3);
    border: 1px solid var(--bg-6);
    cursor: pointer;

    &:checked {
      background-color: var(--accent);
      border: 1px solid var(--accent-hover);

      &::before {
        content: "✓";
        display: block;
        color: var(--text);
        text-align: center;
        line-height: 20px;
        font-weight: var(--font-weight-bold);
      }
    }

    &:not(:checked) {
      background-color: var(--bg-5);
      border: 1px solid var(--bg-6);
    }

    &:hover {
      outline: 1px solid var(--accent);
    }

    &:focus {
      outline: 2px solid var(--accent);
    }

    &[disabled] {
      background-color: var(--bg-6);
      cursor: not-allowed;
      color: var(--text-secondary);
    }
  }
`;

export const MuseListContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  display: flex;
  flex-wrap: wrap;
  margin-inline: auto;
  justify-content: center;
  margin-top: 10px;
  gap: 0.3rem;
  max-width: 800px;

  @container (max-width: 800px) {
    & {
      padding-inline: 10px;
      gap: 0.2rem;
    }
  }
`;

export const UsernameLink = styled.span`
  font-size: var(--font-size-h5);
  cursor: pointer;
  color: var(--accent);

  &:hover {
    opacity: 0.8;
  }
`;

export const Maintext = styled.span`
  font-size: var(--font-size-h6);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  font-style: italic;
  text-align: center;

  @media (max-width: 800px) {
      font-size: var(--font-size-h6);
      padding-left: 20px;
      text-align: left;
      font-size: 22px;
  }
`;
