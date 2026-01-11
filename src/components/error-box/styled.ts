import { styled } from "styled-components";

export const ErrorBoxRoot = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--blue-a6);
  padding: 12px;
  font-family: var(--font);

  &.email_button {
    padding-inline: 30px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  @media (max-width: 700px) {
      padding-inline: 20px;
  }

  font-weight: var(--font-weight-regular);
  color: var(--blue-12);
  background-color: var(--blue-a2);
  margin-bottom: 18px;

  h1 {
    all: unset;
    display: flex;
    align-items: center;
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
    line-height: 1.4;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
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
