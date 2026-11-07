import styled from "styled-components";

/** Body copy of the disable sheet. Material only: the sheet itself is the glass. */
export const Lead = styled.p`
  margin: 0;
  font-size: var(--font-size-body, 0.95rem);
  line-height: 1.5;
  color: var(--text);
`;

export const Bullets = styled.ul`
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-secondary);
`;

/** A fieldset, so the prompt is the group's legend for screen readers. */
export const ReasonGroup = styled.fieldset`
  border: 0;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
`;

export const ReasonPrompt = styled.legend`
  padding: 0;
  margin: 0 0 0.4rem;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const RadioDot = styled.span<{ $active?: boolean }>`
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 2px solid ${(p) => (p.$active ? "var(--accent)" : "var(--bg-8, var(--bg-6))")};
  background: ${(p) => (p.$active ? "radial-gradient(circle, var(--accent) 0 3px, transparent 4px)" : "transparent")};
`;

export const FooterActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media screen and (max-width: 800px) {
    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }
`;

const FooterButton = styled.button`
  padding: 0.55rem 1rem;
  border-radius: 999px;
  font-size: var(--font-size-small);
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const KeepButton = styled(FooterButton)`
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
`;

export const ConfirmButton = styled(FooterButton)`
  background: var(--tomato-9, #e5484d);
  color: #fff;
  border: 1px solid var(--tomato-9, #e5484d);
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--tomato-11, #e5484d);
`;

export const Farewell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  text-align: center;

  p:first-child {
    margin: 0;
    font-size: var(--font-size-body, 0.95rem);
    line-height: 1.5;
    color: var(--text);
  }
`;
