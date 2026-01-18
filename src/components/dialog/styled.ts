import { AlertDialog } from "radix-ui";
import { keyframes, styled } from "styled-components";

const overlayShow = keyframes`
from { opacity: 0; }
to { opacity: 1; }
`;
const contentShow = keyframes`
from {
opacity: 0;
transform: translate(-50%, -48%) scale(0.96);
}
to {
opacity: 1;
transform: translate(-50%, -50%) scale(1);
}
`;

export const Overlay = styled(AlertDialog.Overlay)`
background-color: rgba(0, 0, 0, 0.66);
position: fixed;
inset: 0;
animation: ${overlayShow} 150ms ease-out;
`;

export const Content = styled(AlertDialog.Content)`
background-color: var(--bg-2);
border: 1px solid var(--bg-6);
border-radius: 4px;
box-shadow: 0px 0px 20px 4px rgba(0, 0, 0, 0.5);
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 95vw;
max-width: 450px;
padding: 25px;
animation: ${contentShow} 150ms ease-out;
color: var(--text);
font-family: var(--font);
`;

export const Title = styled(AlertDialog.Title)`
margin: 0;
font-size: var(--font-size-h4);
font-weight: var(--font-weight-semi-bold);
`;

export const Description = styled(AlertDialog.Description)`
margin-top: 30px;
font-size: var(--font-size-input);
margin-bottom: 20px;
line-height: 1.5;
`;

export const Actions = styled.div`
display: flex;
justify-content: flex-end;
gap: 12px;
margin-top: 20px;
`;

export const CancelButton = styled.button`
  all: unset;
  width: 100px;
  padding: 8px;
  text-align: center;
  background-color: var(--bg-3);
  color: var(--text-secondary);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    background-color: var(--bg-2);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

export const ActionButton = styled.button<{
  colorVariant?: "negative" | "neutral";
}>`
  min-width: 120px;
  padding: 8px;
  text-align: center;

  background-color: ${({ colorVariant, disabled }) =>
    disabled
      ? "var(--bg-4)" // or another lighter neutral color for disabled
      : colorVariant === "neutral"
        ? "var(--accent)"
        : "#922a2aff"};

  color: ${({ disabled }) => (disabled ? "var(--text-secondary)" : "var(--text-primary)")};
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  border: none;
  border-radius: 4px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ colorVariant, disabled }) =>
      disabled
        ? "var(--bg-4)" // keep same as disabled background
        : colorVariant === "neutral"
          ? "var(--accent)" // accent hover
          : "#d03c3cff"}; // red hover
  }
`;
