import styled from "styled-components";

export const PageRoot = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-block: 100px;
`;

export const FormContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
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
        margin-left: 2px;
        font-weight: var(--font-weight-regular);
        margin-top: 4px;
        margin-bottom: 4px;
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

    button {
      margin-top: 8px;
      margin-bottom: 22px;
      padding: 10px;
      background-color: var(--accent);
      color: var(--text);
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: var(--accent-hover);
      }

      &:active {
        background-color: var(--accent-active);
      }

      &:focus {
        outline: 1.5px solid var(--accent);
        outline-offset: 2px;
      }
    }
  }
`;

export const FormHeading = styled.div`
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

    width: 28px;
    height: 28px;

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
`;

export const FormDescription = styled.p`
  font-size: var(--font-size);
  color: var(--text);
  margin-bottom: 24px;
`;

export const InfoBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border: 1px solid var(--blue-a6);
  padding: 12px;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--blue-12);
  background-color: var(--blue-a2);

  margin-bottom: 22px;

  div {
    display: flex;
    align-items: center;
    color: var(--blue-12);
    font-size: var(--font-size);
    font-weight: var(--font-weight-bold);
    margin-bottom: 8px;
  }

  svg {
    width: 22px;
    height: 22px;
    margin-right: 4px;
    fill: var(--blue-9);
  }

  p {
    margin: 0;
    margin-block: 8px;
    line-height: 1.4;
  }

  a {
    color: var(--accent-7);
    text-decoration: none;
    font-weight: var(--font-weight-bold);
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent-8);
      text-decoration: underline;
    }

    &:focus {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }

  strong {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size);
  }

  &.error {
    border-color: var(--tomato-a9);
    background-color: var(--tomato-a2);
    color: var(--tomato-12);

    svg {
      fill: var(--tomato-9);
    }
  }

  &.not_found {
    border-color: var(--amber-a9);
    background-color: var(--amber-a2);
    color: var(--amber-12);

    svg {
      fill: var(--amber-9);
    }
  }
`;

export const BackLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  a {
    color: var(--text-secondary);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    font-family: var(--font);
    text-decoration: none;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      margin-right: 4px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: transform 0.2s ease, color 0.2s ease;

      width: 16px;
      height: 16px;
    }

    &:hover {
      color: var(--text);

      svg {
        color: var(--accent-hover);
        transform: translateX(-2px);
      }
    }

    &:focus {
      outline: 1.5px solid var(--accent);
      outline-offset: 2px;
    }
  }
`;
