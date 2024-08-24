import { BORDER_RADIUS, CARD_BORDER } from "@/theme";
import { styled } from "styled-components";

export const ParentWrapperContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 800px;
  justify-content: start;
  align-items: flex-start;

    @container (max-width: 800px) {
    & {
      height: 90dvh;
    }
  }

  @container (max-width: 600px) {
    & {
      height: 85dvh;
    }
  }
`;

export const LeftWrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 18cqw;

  container-name: left_wrapper;
  container-type: size;

  @container (max-width: 1200px) {
    & {
      width: 70px;
    }
  }
`;

export const ListContainer = styled.div`
  height: 720px;
  width: 100%;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.background};
  border-radius: ${BORDER_RADIUS};
  ${CARD_BORDER}

  @container left_wrapper (max-width: 200px) {
    & {
      width: 70px;
      height: 75dvh;
      font-size: 18px;
    }
  }
`;

export const RightWrapperContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: flex-start;
  height: 100%;
  overflow-y: auto;
  align-items: flex-start;

  @container (max-width: 800px) {
    & {
      height: 80dvh;
    }
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const ContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: 10px;
  margin-top: 30px;
`;

export const SubText = styled.div`
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 300;
  margin-bottom: 20px;
  font-style: italic;
  text-align: center;

  @container (max-width: 1000px) {
    & {
      font-size: 18px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 16px;
    }
  }

  @container (max-width: 300px) {
    & {
      font-size: 12px;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 80cqw;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;

  @container (max-width: 1200px) {
    & {
      width: 90cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 1000px) {
    & {
      width: 87cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 800px) {
    & {
      width: 85cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 500px) {
    & {
      width: 80cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 400px) {
    & {
      width: 75cqw;
      font-size: 18px;
    }
  }

  @container (max-width: 300px) {
    & {
      width: 65cqw;
      font-size: 18px;
    }
  }
`;
