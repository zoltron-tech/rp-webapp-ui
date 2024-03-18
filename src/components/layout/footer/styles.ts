import { setOpacity } from "@/utils/helpers";
import { styled } from "styled-components";

export const FooterContainer = styled.footer`
  --footer-height: 2.5rem;

  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
  height: var(--footer-height);

  background-color: ${({ theme }) =>
    setOpacity(theme.pillExpandedContentBackground, 0.5)};

  container-name: footer;
  container-type: size;
`;
