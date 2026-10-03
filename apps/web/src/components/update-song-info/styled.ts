import { Form as RadixForm } from "radix-ui";
import styled from "styled-components";

export const FormRoot = styled(RadixForm.Root)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

export const FormField = styled(RadixForm.Field)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const FormControl = styled.input`
  width: 100%;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  font-size: var(--font-size);
  font-family: var(--font);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const FormTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  font-size: var(--font-size);
  font-family: var(--font);
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 24px;
`;

export const Tag = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: ${({ $color }) =>
    $color.replace("rgb(", "rgba(").replace(")", ", 0.15)")};
  color: var(--text);
  border: 1px solid ${(props) => props.$color};
  border-radius: 4px;
  font-size: var(--font-size-small);
  white-space: nowrap;
`;

export const RemoveTagButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export const AddTagContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const TagInput = styled.input`
  flex: 1;
  padding: 8px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  font-size: var(--font-size-small);
  font-family: var(--font);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const ColorPickerButton = styled.button`
  width: 36px;
  height: 36px;
  border: 2px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--accent);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--accent);
  border: 1px solid var(--bg-5);
  border-radius: 4px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ColorPickerContainer = styled.div`
  padding: 12px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  
  .react-colorful {
    max-width: 100%;
  }
`;

export const ErrorMessage = styled.span`
  font-size: var(--font-size-small);
  color: var(--error);
`;
