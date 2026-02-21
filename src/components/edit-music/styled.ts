import styled from "styled-components";

export const AddEditMusicPageRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

export const FormContainer = styled.div`
  width: 100%;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  padding: 24px;
`;

export const FormSection = styled.div`
  margin-bottom: 20px;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: var(--font-size);
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
`;

export const Required = styled.span`
  color: var(--accent);
`;

export const Label = styled.label`
  display: block;
  font-size: var(--font-size);
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size);
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DropZone = styled.div<{ $dragging?: boolean }>`
  border: 2px dashed var(--accent);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: ${(p) => (p.$dragging ? "var(--accent)11" : "transparent")};

  &:hover {
    border-color: var(--accent);
  }

  input {
    display: none;
  }
`;

export const FileButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

export const FileButton = styled.button`
  padding: 10px 20px;
  background: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: var(--font-size);
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-hover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FileName = styled.span`
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size);
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

export const TagItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${(props) => `${props.$color}20`};
  border: 1px solid ${(props) => props.$color};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: var(--font-size-small);
`;

export const RemoveTagButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--text);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AddTagButton = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background: var(--accent-hover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TagInputContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const TagInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-small);
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

export const ColorInput = styled.button<{ $color: string }>`
  width: 30px;
  height: 30px;
  border: 1px solid var(--bg-6);
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  background: ${(props) => props.$color};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ColorPickerWrapper = styled.div`
  position: relative;
`;

export const ColorPickerPopover = styled.div`
  position: absolute;
  bottom: 45px;
  right: 0;
  z-index: 1000;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const AddTagSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: var(--font-size);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${(props) =>
    props.$variant === "primary"
      ? `
    background: var(--accent);
    color: var(--text);
    
    &:hover {
      background: var(--accent-hover);
    }
  `
      : `
    background: var(--bg-4);
    color: var(--text-secondary);
    border: 1px solid var(--bg-6);
    
    &:hover {
      background: var(--bg-5);
      color: var(--text);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: var(--error);
  font-size: var(--font-size-small);
  margin-top: 8px;
`;
