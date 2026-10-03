import { Form as RadixForm } from "radix-ui";
import styled from "styled-components";

export const FormRoot = styled(RadixForm.Root)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

export const FormField = styled(RadixForm.Field)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FormControl = styled(RadixForm.Control)`
  width: 100%;
  min-height: 200px;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  resize: vertical;
  font-size: var(--font-size);
  font-family: var(--font);
`;

export const FormTextArea = styled.textarea`
    font-size: var(--font-size-input);
`;
