import styled from "styled-components";

const LikeRoot = styled.div`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const LikeLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border-radius: 50px;
  border: 1px solid transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
      border-color: var(--bg-5);
    }
  }

  &:active {
    background-color: var(--bg-5);
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

const LabelText = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
`;

export const LikeButton = Object.assign(
  {},
  {
    Label: LikeLabel,
    Root: LikeRoot,
    Text: LabelText,
  },
);
