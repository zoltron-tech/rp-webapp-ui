import styled from "styled-components";

const LikeRoot = styled.div`
  all: unset;
  display: flex;
  align-items: center;

  .heart-icon {
    width: 28px;
    height: 28px;
  }

  @media screen and (max-width: 430px) {
    .heart-icon {
      width: 20px;
      height: 20px;
    }
  }
`;

const LikeLabel = styled.label`
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &.unliked {
    pointer-events: none;
  }

  &.liked .heart-icon {
    animation: blink 0.5s ease-in-out;
    color: var(--tomato-9);
  }

  &.unliked .heart-icon {
    animation: wiggle 0.5s ease-in-out;
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
  margin-left: 4px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text);
`;

export const LikeButton = Object.assign(
  {},
  {
    Root: LikeRoot,
    Label: LikeLabel,
    Text: LabelText,
  }
);
