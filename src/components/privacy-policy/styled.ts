import { styled, keyframes } from "styled-components";
import { Accordion } from "radix-ui";
import { SlArrowDown } from "react-icons/sl";

/* --- container + header --- */
export const PrivacyRoot = styled.article`
  background-color: var(--bg-3);
  max-width: 800px;
  margin-inline: auto;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);
  padding: 20px;
  margin-top: 40px;
  margin-bottom: 40px;
  border: 0.85px solid var(--bg-6);

  position: relative;

  .intro {
    margin-block: 20px;
    line-height: 1.6;
    padding-inline: 20px;

    a {
      font-size: var(--font-size);
      font-weight: var(--font-weight-bold);
      color: var(--accent-7);
      cursor: pointer;
      text-decoration: none;

      &:hover {
        color: var(--accent-8);
      }
    }

    ul {
      margin: 10px 0;
      padding-left: 20px;

      li {
        margin: 8px 0;

        ul {
          margin: 5px 0;
          padding-left: 20px;

          li {
            margin: 5px 0;
          }
        }
      }
    }
  }

  @media screen and (max-width: 700px) {
    padding-inline: 12px;
    margin-block: unset;
    min-height: calc(100vh - 48px);
  }
`;

export const PrivacyHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;

  h1 {
    font-size: var(--font-size-xlarge);
    font-weight: var(--font-weight-bold);
    color: var(--accent-8);
  }

  .icon {
    font-size: 1.85rem;
    color: var(--accent-8);
  }
`;

/* --- animations --- */
const slideDown = keyframes`
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
`;

const slideUp = keyframes`
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
`;

/* --- accordion primitives (Radix) --- */
export const AccordionRoot = styled(Accordion.Root)`
  border-radius: 6px;
  width: 100%;
  margin-bottom: 30px;
  background-color: var(--bg-3);
`;

export const AccordionItem = styled(Accordion.Item)`
  overflow: hidden;
  margin-top: 1px;
  background-color: var(--bg-2);

  &:first-child {
    margin-top: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  &:focus-within {
    position: relative;
    z-index: 1;
  }
`;

export const AccordionHeader = styled(Accordion.Header)`
  display: flex;
`;

export const AccordionTrigger = styled(Accordion.Trigger)`
  all: unset;
  width: 100%;
  padding: 0 20px;
  height: 48px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
  color: var(--accent-8);

  background-color: var(--bg-2);

  transition: background-color 180ms ease, color 180ms ease;

  &:hover {
    background-color: var(--bg-4);
    color: var(--accent-8);
  }

  &[data-state="open"] .chevron {
    transform: rotate(180deg);
  }
`;

export const Chevron = styled(SlArrowDown).attrs({ className: "chevron" })`
  color: var(--accent-8);
  transition: transform 300ms cubic-bezier(0.87, 0, 0.13, 1), color 180ms ease;
  flex: 0 0 auto;
`;

export const AccordionContent = styled(Accordion.Content)`
  overflow: hidden;
  font-size: var(--font-size);
  color: var(--text);
  background-color: var(--bg-3);

  &[data-state="open"] {
    animation: ${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  &[data-state="closed"] {
    animation: ${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
`;

export const AccordionContentInner = styled.div`
  padding: 20px;
  line-height: 1.6;
  border-bottom: 1px solid var(--bg-6);

  a {
    font-size: var(--font-size);
    font-weight: var(--font-weight-bold);
    color: var(--accent-7);
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: var(--accent-8);
    }
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;

    li {
      margin: 8px 0;

      ul {
        margin: 5px 0;
        padding-left: 20px;

        li {
          margin: 5px 0;
        }
      }
    }
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ValidFrom = styled.div`
  width: auto;
  margin-top: 2px;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-regular);
  color: var(--bg-11);
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: auto;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--bg-10);

  strong {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size);
  }

  a {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--accent-7);
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: var(--accent-8);
    }
  }
`;
