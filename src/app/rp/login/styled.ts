import Link from "next/link";
import { Form } from "radix-ui";
import styled from "styled-components";

export const LoginPageRoot = styled.main``;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-block: 100px;
  margin-inline: auto;
  max-width: 480px;
  border: 0.85px solid var(--bg-6);
  background-color: var(--bg-2);
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  padding: 20px;

  @media screen and (max-width: 430px) {
    margin-block: 0px;
    min-height: calc(100vh - 48px);
    padding-inline: 10px;
    padding-block: 30px;
    border: none;
  }

  .tabs-list {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    .tab {
      all: unset;
      padding: 10px 20px;
      cursor: pointer;
      font-size: var(--font-size-large);
      font-weight: var(--font-weight-medium);
      color: var(--bg-10);
      min-width: 100px;
      text-align: center;
      border-bottom: 2px solid transparent;
      border-radius: 2px;
      background-color: var(--bg-1);

      &:hover {
        background-color: var(--bg-3);
        border-color: var(--accent-3);
        color: var(--text);
      }

      &:focus {
        outline: 1.5px solid var(--accent);
        outline-offset: 2px;
        z-index: 1;
      }

      &[aria-selected="true"] {
        background-color: var(--bg-4);
        color: var(--text);
        border-bottom: 2px solid var(--accent);
      }
    }
  }

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 80%;
    margin-bottom: 10px;
    background-color: var(--bg-6);
  }

  .tab-content {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    &[data-state="inactive"] {
      display: none;
    }

    form {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 400px;

      .field {
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

        &.checkbox {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          margin-top: 12px;
          margin-bottom: 8px;
          font-size: var(--font-size-small);
          font-weight: var(--font-weight-medium);
          font-family: var(--font);
          color: var(--text-secondary);

          input[type="checkbox"] {
            all: unset;
            width: 20px;
            height: 20px;
            aspect-ratio: 1;
            border-radius: 4px;
            margin: 0;
            cursor: pointer;
            overflow: hidden;
            accent-color: var(--accent);
            /* Set unchecked background color */
            background-color: var(--bg-3);
            border: 1px solid var(--bg-6);

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
          }

          label {
            font-weight: var(--font-weight-regular);
            color: var(--text);

            a {
              color: var(--accent-9);
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }

              &:focus {
                outline: 1.5px solid var(--accent);
                outline-offset: 2px;
              }
            }
          }
        }
      }

      input {
        margin-bottom: 8px;
        border: 1px solid var(--bg-6);
        background-color: var(--bg-3);
        padding: 8px;
        border-radius: 4px;
        border: none;
        color: var(--text);
        border: 1px solid var(--bg-6);
        font-family: var(--font);
        outline-offset: 2px;

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

      input[required] + label::before {
        content: "*";
        color: var(--tomato-a9);
        font-weight: var(--font-weight-bold);
        margin-right: 2px;
      }

      .submit-button {
        margin-top: 12px;
        padding: 10px;
        background-color: var(--accent);
        color: var(--text);
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &[disabled] {
          background-color: var(--bg-6);
          cursor: not-allowed;
          color: var(--text-secondary);
        }

        &:not([disabled]):hover {
          background-color: var(--accent-hover);
        }

        &:not([disabled]):active {
          background-color: var(--accent-active);
        }

        &:focus {
          outline: 1.5px solid var(--accent);
          outline-offset: 2px;
        }
      }
    }
  }
`;

export const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label-message {
    color: var(--tomato-a9);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    font-family: var(--font);

    &::before {
      content: "*";
      color: var(--tomato-a9);
      font-weight: var(--font-weight-bold);
      margin-right: 2px;
    }
  }
`;

export const FrogotPasswordLink = styled(Link)`
  color: var(--text-secondary);
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  margin-top: 8px;
  align-self: flex-end;

  &:hover {
    color: var(--text);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const OrHelper = styled.div`
  display: inline-block;
  margin: 10px 0;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  text-align: center;
  width: 80%;
  border-bottom: 1px solid var(--bg-6);
  padding-bottom: 10px;
  position: relative;

  @media screen and (max-width: 430px) {
    margin-bottom: 20px;
  }

  &::before {
    content: "or continue with";
    position: absolute;
    white-space: nowrap;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--bg-2);
    padding: 0 10px;
    color: var(--text);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size);
  }
`;

export const SocialsList = styled.ul`
  display: flex;
  justify-content: center;
  gap: 10px;
  list-style: none;
  padding: 20px;
  width: 100%;
  max-width: 400px;
`;

export const SocialButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: var(--bg-4);
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  border: 1px solid var(--bg-6);

  &:hover {
    background-color: var(--bg-3);
  }
  &:active {
    background-color: var(--bg-2);
  }
  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  span {
    color: var(--text);
    font-size: var(--font-size);
    font-family: var(--font);
    margin-left: 8px;
    font-weight: var(--font-weight-medium);
  }

  svg {
    width: 24px;
    height: 24px;
  }

  &.google {
    svg {
      width: 20px;
      height: 20px;
    }
  }

  &.discord {
    svg {
      fill: #5865f2;
    }
  }

  &.facebook {
    svg {
      fill: #1877f2;
    }
  }

  &.instagram {
    svg {
      fill: #c13584;
    }
  }

  /* &.google {
    background-color: var(--text);
  }

  &:not(.google) {
    svg {
      fill: var(--text);
      path {
        fill: currentColor;
      }
    }

    &.discord {
      background-color: #5865f2;
    }

    &.facebook {
      background-color: #1877f2;
    }

    &.instagram {
      background-color: #c13584;
    }
  } */
`;

export const TermsAndConditions = styled.div`
  margin-top: 20px;
  margin-inline: 20px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;

  a {
    color: var(--accent-9);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }

  p {
    margin: 0;
  }

  strong {
    font-weight: var(--font-weight-bold);
  }

  span {
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
  }
`;
