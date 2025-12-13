import styled from "styled-components";
import { pSBC } from "@/lib/pSBC";
import { Z_INDEX } from "@/theme";
import { setOpacity } from "@/utils/helpers";

export const CardWrapper = styled.div`
  position: relative;
  min-width: 250px;
  width: max-content;
  height: 60px;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
  z-index: ${Z_INDEX.CARD};
  padding: 5px;

  container-name: muse-card;
  container-type: size;

  &:hover {
    background-color: var(--accent);
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

  .avatar {
    height: 40px;
    width: 40px;
  }
`;

export const unReadBadge = styled.div`
  background-color: ${({ theme }: any) => theme.unreadMark};
  border-radius: 100%;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

export const Button = styled.div`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.CARD_EXPAND};
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;

  & svg {
    width: 15px;
    height: 15px;
    fill: var(--text);
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.hoverGrey};
  }
`;

export const AcceptButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.success, 0.8))};
  }
`;

export const RemoveButton = styled(Button)`
  &:hover {
    background-color: ${({ theme }: any) =>
      pSBC(-0.5, setOpacity(theme.error, 0.8))};
  }
`;

export const Title = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
`;

export const Subtext = styled.div`
  font-size: 10px;
  color: var(--text);
  white-space: normal;
  word-wrap: break-word;
`;

export const StyledDate = styled.div`
  font-size: 8px;
  align-self: flex-end;
  justify-self: flex-end;
`;

export const NotificationBox = styled.div`
  width: 100%;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  margin-left: 10px;
  margin-top: 10px;
`;

export const NotificationActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  padding-right: 3px;
  gap: 0.3rem;
`;
