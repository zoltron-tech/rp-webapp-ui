import { Form as RadixForm } from "radix-ui";
import styled from "styled-components";
import {
  BACKGROUND_BLUR,
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  Z_INDEX,
} from "@/theme";

export const PositionContainer = styled.div`
  ${DEV_MODE_BORDER("red")}
  position: absolute;
  right: 1rem;
`;

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

export const FormLabel = styled(RadixForm.Label)`
  margin-bottom: 10px;
  font-size: var(--font-size);
  color: var(--text-secondary);

  span {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semi-bold);
    font-style: italic;
    color: var(--accent);
  }
`;

export const FormControl = styled(RadixForm.Control)`
  width: 100%;
  min-height: 120px;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  resize: vertical;
  font-size: var(--font-size);
  font-family: var(--font);
`;

export const FormMessage = styled(RadixForm.Message)`
  margin-top: 10px;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--accent);
`;

export const FormTextArea = styled.textarea`
    font-size: var(--font-size-input);
`;

export const Menu = styled.div`
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 60px;
  right: 0px;
  padding: 8px 0px 8px;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--bg-3);

  z-index: ${Z_INDEX.MODAL};

  width: 15rem;
  height: max-content;
  opacity: 0;
  pointer-events: none;
  transition-property: opacity, width, height;
  ${BASE_TRANSITION}
  /* ${BACKGROUND_BLUR()} */

  border-radius: 5px;

  &.open {
    opacity: 1;
    pointer-events: all;
  }

  hr {
    height: 1px;
    opacity: 0.6;
  }

  @media (max-width: 700px) {
    & {
      top: 50px;
    }
  }
`;

export const ContentContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}

  position: relative;
  width: max-content;
  height: max-content;

  .avatar {
    width: var(--font-size-h2);
    height: var(--font-size-h2);
  }

  @media screen and (max-width: 480px) {
  .avatar {
    width: var(--font-size-h3);
    height: var(--font-size-h3);
  }
  }
`;

export const Separator = styled.div`
  border-top: 1px solid #61626bff;
`;

export const List = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0px 4px;
`;

export const Element = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 600;
  color: rgba(209, 216, 226, 1);
  gap: 10px;
  padding: 10px;
  padding-left: 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease-out;

  svg {
    width: 19px;
    height: 19px;
    transition: all 0.3s ease-out;
  }

  &:hover {
    background-color: var(--accent);
    color: #ffffff;

    svg {
      stroke: #ffffff;
    }
  }
`;

export const DeleteElement = styled(Element)`
  color: #b23636ff;
  
  &:hover {
    color: #ffffff;
    background-color: #8e2a2a;
  }
`;

export const LastSectionElement = styled(Element)`
  color: ${({ theme }: any) => theme.primaryLoading};

  svg {
    stroke: #bd89ff;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.primaryAlpha};

    svg {
      stroke: #bd89ff;
    }
  }
`;
