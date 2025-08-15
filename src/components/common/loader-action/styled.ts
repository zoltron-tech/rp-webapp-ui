import { styled } from "styled-components";

export const LoaderActionRoot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;

  svg.loader-icon {
    height: 24px;
    width: 24px;
    position: absolute;
    left: -28px;
    aspect-ratio: 1;
    margin-right: 8px;
    color: var(--accent-a8);
    animation-timing-function: steps(8, end);
    animation-name: spin;
    animation-duration: 800ms;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-play-state: running;
    animation-delay: 0s;
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
