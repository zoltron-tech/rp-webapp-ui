import { styled } from "styled-components";
import { Button } from "../common";

export const ListRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-2);
  max-width: 600px;
  margin-inline: auto;

  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  padding-top: 10px;
  margin-top: 40px;
  border: 0.85px solid var(--bg-6);

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-top: 10px;
    background-color: var(--bg-6);
  }

  @media screen and (max-width: 600px) {
    margin-top: 0px;
    margin-bottom: 0px;
  }
`;

export const NotificationsHeaderRoot = styled.header`
  display: flex;
  width: 100%;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 5px 20px;
`;

export const NotificationHeaderText = styled(Button)`
  max-width: 150px;
  height: 30px;
`;

export const NotificationsBoxRoot = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  padding-inline: 10px;
  white-space: nowrap;
  cursor: pointer;

  .avatar {
    width: 64px;
    height: 64px;
    cursor: pointer;
  }

  @media screen and (max-width: 430px) {
    .avatar {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }

  &:hover {
    background-color: var(--accent);
  }
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  gap: 1em;
`;

export const Text = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3em;
`;

export const Extras = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 1em;
`;

export const Title = styled.div`
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--text);
`;

export const Subtext = styled.div`
  font-size: var(--font-size-xsmall);
  color: var(--text);
  white-space: normal;
  word-wrap: break-word;
`;

export const StyledDate = styled.div`
  font-size: 8px;
  align-self: flex-end;
  justify-self: flex-end;
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
  z-index: 1;
`;
