import { Dialog } from "radix-ui";
import { styled } from "styled-components";

export const InfoBoxRoot = styled(Dialog.Root)`
  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const InfoBoxContent = styled(Dialog.Content)`
  button,
  fieldset,
  input,
  h2 {
    all: unset;
  }

  background-color: #151515;
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.25);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  border: 0.85px solid #333;

  font-family: var(--font);
  color: var(--text);

  &.warning {
    border-color: #ffcc00;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    background-color: #333;

    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &:hover {
      background-color: #444;
    }

    &:active {
      background-color: #555;
    }

    &:focus {
      outline: 1.5px solid var(--accent);
    }
  }

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-large);
    font-family: var(--font);
    font-weight: var(--font-weight-bold);

    .warning-icon {
      color: #ffcc00;
      font-size: 1.5em;
    }

    .error-icon {
      color: #ff0000;
      font-size: 1.5em;
    }
  }

  .description {
    font-size: var(--font-size);
    font-family: var(--font);
    margin-top: 12px;
  }

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;
