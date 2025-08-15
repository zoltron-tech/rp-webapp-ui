import { styled } from "styled-components";

export const PasswordChecksRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px;
  background-color: var(--tomato-a2);
  border: 1px solid var(--tomato-a9);
  border-radius: 4px;
  margin-top: 4px;

  animation: fade-in 0.3s ease-in-out forwards;

  &.valid {
    background-color: var(--grass-a2);
    border: 1px solid var(--grass-a9);
    animation: fade-out 0.3s ease-in-out forwards 0.3s;
  }

  &.hide {
    display: none;
  }

  .error-message {
    color: var(--tomato-a9);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    font-family: var(--font);
    margin-bottom: 2px;

    &::before {
      content: "✗";
      display: inline-block;
      width: 10px;
      text-align: center;
      vertical-align: middle;
      line-height: 1;
      margin-right: 4px;
      font-weight: var(--font-weight-bold);
    }

    &.valid {
      &::before {
        content: "✓";
      }
      color: var(--grass-a9);
    }
  }

  @keyframes fade-in {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      grid-template-rows: 1fr;
      opacity: 1;
    }
    to {
      grid-template-rows: 0;
      opacity: 0;
    }
  }
`;
