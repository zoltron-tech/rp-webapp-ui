import styled from "styled-components";
import { BORDER_RADIUS } from "@/theme";

export const Container = styled.div`
  height: 100vh;
  width: "90cqw";
  max-width: "500px";
  min-width: "300px";
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 10px;
  font-size: 22px;
  font-weight: 500;
  position: relative;
  color: var(--text);

  &::after {
    content: "";
    position: absolute;
    height: 1px;
    background-color: var(--accent);
    width: 100%;
    bottom: -4px;
  }

  & .link {
    color: ${({ theme }: any) => theme.textLink};
    cursor: pointer;
    font-weight: 600;

    &:hover {
      color: ${({ theme }: any) => theme.textLinkHover};
    }
  }
`;

export const Content = styled.div`
  margin-top: 8%;
  width: 40%;
  padding: 30px;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: ${({ theme }: any) => theme.modalBackground};
  border-radius: ${BORDER_RADIUS};
`;

export const Paragraph = styled.span`
  margin: 10px;
`;
