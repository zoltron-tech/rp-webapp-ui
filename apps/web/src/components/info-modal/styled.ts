import { Dialog } from "radix-ui";
import { styled } from "styled-components";
import { GLASS_DIALOG } from "@/theme";

export const InfoModalRoot = styled(Dialog.Root)`
  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContent = styled(Dialog.Content)`
  button,
  fieldset,
  input,
  h2 {
    all: unset;
  }

  ${GLASS_DIALOG}
  border-radius: 22px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);

  &.warning {
    border-color: #ffcc00;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    background-color: var(--fill-hover, rgb(255 255 255 / 0.08));
    border: 1px solid var(--glass-edge, rgb(255 255 255 / 0.11));
    box-sizing: border-box;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);

    &:hover {
      background-color: var(--fill-pressed, rgb(255 255 255 / 0.12));
    }

    &:focus-visible {
      outline: 2px solid var(--accent-11, var(--accent));
      outline-offset: 2px;
    }
  }

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-h5);
    font-family: var(--font);
    font-weight: var(--font-weight-bold);

    .warning-icon {
      color: #ffcc00;
     font-size: var(--font-size-h4);
    }

    .error-icon {
      color: #ff0000;
       font-size: var(--font-size-h4);
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
