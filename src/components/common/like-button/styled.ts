import styled from "styled-components";

const LikeRoot = styled.div`
  all: unset;
  display: inline-flex;
  align-items: center;
`;

const HeartButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border-radius: 50px;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.92);
  }

  @media (hover: hover) {
    &:hover {
      color: var(--tomato-9);
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  .heart-icon {
    width: 22px;
    height: 22px;
    color: var(--text-secondary);
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .heart-icon-filled {
    color: var(--tomato-9);
  }

  &.liked .heart-icon {
    animation: blink 0.5s ease-in-out;
    color: var(--tomato-9);
  }

  &.unliked .heart-icon {
    animation: wiggle 0.5s ease-in-out;
  }

  @media screen and (max-width: 430px) {
    .heart-icon {
      width: 20px;
      height: 20px;
    }
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-10deg);
    }
    50% {
      transform: rotate(10deg);
    }
    75% {
      transform: rotate(-10deg);
    }
  }

  @keyframes blink {
    0%,
    100% {
      scale: 1;
    }

    50% {
      scale: 1.2;
    }

    80% {
      scale: 0.9;
    }
  }
`;

const CountButton = styled.button`
  all: unset;
  box-sizing: border-box;
  padding: 7px 8px 7px 2px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  white-space: nowrap;
  transition: color 0.15s ease;

  &:hover {
    text-decoration: underline;
    color: var(--text);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const LikeButton = Object.assign(
  {},
  {
    CountButton,
    HeartButton,
    Root: LikeRoot,
  },
);
