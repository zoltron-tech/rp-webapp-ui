import { Form } from "radix-ui";
import { styled } from "styled-components";

export const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    color: var(--text-secondary);
  }
`;

export const FormField = styled(Form.Field)`
  display: flex;
  flex-direction: column;

  width: 100%;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);

  label {
    padding: 2px;
    font-weight: var(--font-weight-regular);
    margin-block: 4px;
  }

  .password-field-inner {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    margin-bottom: 8px;

    .input {
      width: 100%;
      margin: 0;
    }

    .toggle {
      all: unset;
      position: absolute;
      right: 12px;

      height: 20px;
      cursor: pointer;

      svg {
        width: 20px;
        height: 20px;
        color: var(--text-secondary);
        transition: color 0.2s ease;
      }

      &:hover,
      &:focus {
        svg {
          color: var(--accent-8);
        }
      }

      &:focus {
        outline: 1.5px solid var(--accent);
        outline-offset: 2px;
      }
    }
  }

  input {
    border: 1px solid var(--bg-6);
    background-color: var(--bg-3);
    padding: 8px;
    border-radius: 4px;
    border: none;
    color: var(--text);
    border: 1px solid var(--bg-6);
    font-family: var(--font);

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.4;
    }

    &:hover {
      outline: 1px solid var(--accent);
    }

    &:focus {
      outline: 2px solid var(--accent);
    }

    &[data-invalid="true"] {
      outline: 1.5px solid var(--tomato-a9);
    }

    &:-internal-autofill-selected {
      background: var(--bg-3) !important;
      background-color: var(--bg-3) !important;
      color: var(--text) !important;
      appearance: none !important;
    }
  }
`;
