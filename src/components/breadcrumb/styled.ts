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

export const UsernameLink = styled.span`
  cursor: pointer;
  color: var(--accent);
   font-size: var(--font-size-input);


  &:hover {
     color: var(--accent-7);
  }
`;
