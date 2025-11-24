import { AlertDialog } from "radix-ui";
import { keyframes, styled } from "styled-components";
import { setOpacity } from "@/utils/helpers/theme";

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
background-color: rgba(0, 0, 0, 0.45);
position: fixed;
inset: 0;
animation: ${overlayShow} 150ms ease-out;
`;

export const Content = styled(AlertDialog.Content)`
background-color: var(--bg-3);
border: 1px solid var(--bg-6);
border-radius: 4px;
box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2);
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 90vw;
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

export const ActionButton = styled.button`
  width: 100px;
  padding: 8px;
  text-align: center;
  background-color: ${({ theme }: any) => setOpacity(theme.error, 0.8)};
  color: var(--text-primary);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }: any) => theme.error};
  }
`;
