import Link from "next/link";
import styled from "styled-components";

export const LoginPageRoot = styled.main``;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  margin-inline: auto;
  max-width: 600px;
  border: 0.85px solid var(--bg-6);
  background-color: var(--bg-2);
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text);
  padding: 20px;

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

      input {
        margin-bottom: 10px;
        border: 1px solid var(--bg-6);
        background-color: var(--bg-3);
        padding: 8px;
        border-radius: 4px;
        border: none;
        color: var(--text-color-dark);

        font-family: var(--font);

        &:focus {
          outline: 1.5px solid var(--accent);
        }

        &[data-invalid="true"] {
          outline: 1.5px solid var(--tomato-9-e);
        }
      }

      button {
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
  }
`;

export const FrogotPasswordLink = styled(Link)`
  color: var(--bg-11);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  text-decoration: none;
  margin-top: 8px;
  align-self: flex-end;
  &:hover {
    text-decoration: underline;
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

  &::before {
    content: "continue with socials";
    position: absolute;
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
  padding: 10px;
  border-radius: 50%;
  background-color: var(--bg-4);
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1.5px solid var(--bg-6);
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
  svg {
    width: 20px;
    height: 20px;
  }
`;
