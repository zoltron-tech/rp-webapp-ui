import * as Common from "@/components/common";
import { BORDER_RADIUS, Z_INDEX } from "@/theme/geometry";
import { setOpacity } from "@/utils/helpers";
import { Container, Flex } from "@novelist-world/ui";
import styled from "styled-components";

export const DropdownContainer = styled(Container)`
  position: absolute;
  width: 300px;
  height: 200px;
  top: 15px;
  left: 58px;
  justify-content: flex-start;
  align-items: flex-start;
  padding-inline: 5px 0px;
  z-index: ${Z_INDEX.CARD_EXPAND};
  background-color: ${({ theme }) => theme.background};
  padding-top: 0px;

  transition: opacity 0.3s ease, visibility 0.3s ease;

  // Open state
  &.open {
    display: block;
    opacity: 1;
  }

  // Closed state
  &.closed {
    display: none;
    opacity: 0;
  }

  // Open state
  &.upward {
    top: -90px;
    left: 58px;
  }

  @container (max-width: 500px) {
    & {
      top: 10px;
      left: 47px;
    }
  }
`;

export const DropdownOption = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  padding-inline: 5px 0px;
  border-radius: ${BORDER_RADIUS};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.hoverGreyAlpha};
  }
`;

export const ScrollableContent = styled.div`
  margin-bottom: 20px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  height: inherit;
  padding-bottom: 20px;

  transition-property: scrollbar-color;
  transition-timing-function: ease-in-out;
  transition-duration: 200ms;

  &:hover {
    scrollbar-color: ${({ theme }) => setOpacity(theme.primary, 0.5)}
      transparent;
  }
`;

export const Avatar = styled(Common.Avatar)`
  margin-block: 10px;

  @container (max-width: 800px) {
    & {
      margin-block: 5px;
    }
  }
`;

export const SourceName = styled.div`
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  cursor: pointer;

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }
  }
`;
