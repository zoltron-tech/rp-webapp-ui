import styled from "styled-components";

export const PageRoot = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-block: 100px;
`;

export const ContentCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  margin-inline: auto;
  min-width: 480px;
  border: 0.85px solid var(--bg-6);
  background-color: var(--bg-2);
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  padding: 20px;
  padding-top: 32px;

  @media screen and (max-width: 480px) {
    padding: 20px;
    border: none;
    background-color: var(--bg-1);
    min-width: unset;
  }
`;

export const Heading = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  h1 {
    all: unset;
    font-size: var(--font-size-large);
    font-weight: var(--font-weight-bold);
    color: var(--text);
  }

  svg {
    margin-right: 8px;

    width: 32px;
    height: 32px;

    border-radius: 4px;

    padding: 4px;
    color: var(--accent-8);

    &.with-background {
      background-color: var(--bg-1);
      border: 0.85px solid var(--bg-4);
    }

    &.loading {
      width: 32px;
      height: 32px;
      color: var(--accent-8);
      animation-timing-function: steps(8, end);
      animation-name: spin;
      animation-duration: 1s;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
      animation-play-state: running;
      animation-delay: 0s;
    }

    &.success {
      color: var(--grass-9);
    }

    &.error {
      color: var(--tomato-9);
    }

    &.warning {
      color: var(--amber-9);
    }
  }

  @keyframes octa-spinner {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

export const Description = styled.p`
  font-size: var(--font-size);
  color: var(--text);
  margin-bottom: 24px;
`;
