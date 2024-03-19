import * as Common from "@/components/common";
import { pSBC } from "@/lib/pSBC";
import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";
import styled from "styled-components";

export const CardWrapper = styled.div`
  position: relative;
  min-width: 250px;
  width: max-content;
  height: 70px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  padding: 5px;

  container-name: muse-card;
  container-type: size;

  &:hover {
    background-color: ${({ theme }) => theme.primary};
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  height: 100%;
`;

export const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
`;

export const Button = styled.div`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.CARD_EXPAND};
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;

  & svg {
    width: 15px;
    height: 15px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGrey};
  }
`;

export const AcceptButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
  }
`;

export const RemoveButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }
`;

export const username = styled(Common.Username)`
  font-size: 13px;
`;

export const Title = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text};
`;

export const Subtext = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.text};
`;

export const Avatar = styled(Common.Avatar)``;

export const NotificationBox = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  margin-left: 10px;
  font-size: 14px;
`;

export const NotificationActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  padding-right: 3px;
  gap: 0.3rem;
`;
