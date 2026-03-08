import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-block: 20px;
  padding-inline: 10px;
  display: flex;
  background-color: var(--bg-2);
  max-width: 700px;
  margin-inline: auto;
  border-radius: 8px;
  ${DEV_MODE_BORDER("red")}
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 40px;

  @media (max-width: 600px) {
    & {
      margin-top: unset;
    }
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  display: block;
`;

export const OrdinalInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  color: var(--text);
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--bg-5);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

export const SubmitButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--bg-4);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--bg-5);
    border-color: var(--bg-6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
