import { styled } from "styled-components";

export const Breadcrumbs = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  align-self: center;

  svg {
 
    width: 20px;
    height: 20px;
    margin-right: 2px;

      fill: var(--text-secondary);
  }
`;

export const Maintext = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  font-style: italic;
  text-transform: capitalize;

`;

export const BreadcrumbDivider = styled.span`
   font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  pointer-events: none;
  margin-inline: 2px;
`;

/* A button (it was a clickable span) in the accent's text step: --accent is
   step 6, 2.4:1 on the page. */
export const UsernameLink = styled.button`
  all: unset;
  cursor: pointer;
  color: var(--accent-11, var(--accent));
  font-size: var(--font-size-input);
  font-style: inherit;
  font-weight: inherit;
  text-transform: inherit;
  border-radius: 4px;

  &:hover {
    color: var(--accent-12, var(--text));
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;
