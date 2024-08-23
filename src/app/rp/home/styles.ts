import { styled } from "styled-components";

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 100px;
  margin-top: 30px;
  border-bottom: 1px solid dimgray;
`;

export const ContentHeader = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  margin-bottom: 30px;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 22px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 18px;
    }
  }
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 300;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 22px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 18px;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  padding-inline: 100px;
  padding-block: 30px;
  gap: 1rem;
  overflow-x: auto;

  @container (max-width: 600px) {
    & {
      width: 95cqw;
      font-size: 18px;
      padding-inline: 0px;
    }
  }
`;
