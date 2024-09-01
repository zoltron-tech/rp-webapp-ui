import { Pill } from "@/components/common/pill";
import { DEV_MODE_BORDER, NO_SCROLLBAR, PILL } from "@/theme";
import { css, styled } from "styled-components";

export const PillContinaer = styled(Pill)`
  --expanded-height: 500px;

  ${DEV_MODE_BORDER("green")}

  max-height: var(--expanded-height);
  max-width: min(800px, calc(90cqw - 40px));
  min-width: 300px;
  contain: paint;
  margin-inline: auto;
  border-bottom: 1px solid dimgray;
  border-right: 1px solid dimgray;

  @container profile-content (max-width: 600px) {
    & {
      max-width: 100%;
      border-radius: 0px;
      width: 100cqw;
    }
  }

  height: 80px;
  transition: height 0.2s ease-in-out;

  &.expanded {
    height: 500px;
    margin-bottom: 20px;
  }

  container-name: muses-pill;
  container-type: size;
  contain: paint;
`;

export const ScrollableContentContainer = styled.div`
  ${PILL}
  width: 70px;
  overflow-y: auto;
  padding: 0px 2px;
  margin: 0px 0px 0px 10px;
  position: absolute;
  left: 60px;
  height: calc(100cqw - 180px);
  background-color: ${({ theme }) => theme.pillExpandedContentBackground};
  transform: rotate(-90deg) translateY(calc(50%));
  scroll-snap-type: y mandatory;
  transition: opacity 0.1s ease-in-out;
  pointer-events: all;

  ${NO_SCROLLBAR}
  ${DEV_MODE_BORDER("lime")}
    
    @container profile-content (max-width: 1024px) {
    & {
      left: -50px;
      height: calc(100cqw - 120px);
    }
  }

  &.expanded {
    opacity: 0;
    pointer-events: none;
  }
`;

export const Searchbar = styled.div`
  background-color: ${({ theme }) => theme.pillExpandedContentBackground};
  height: 60px;
  border-radius: 30px;
  top: 10px;
  left: 110px;
  width: calc(100cqw - 185px);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity 0.1s ease-in-out;

  &.expanded {
    opacity: 1;
    pointer-events: all;
    cursor: text;
  }

  @container profile-content (max-width: 1024px) {
    & {
      left: 20px;
      width: calc(100cqw - 130px);
    }
  }
`;

export const MagnifyingGlass = styled.div`
  position: relative;
  top: 15px;
  left: 10px;
  height: 30px;
  width: 30px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s ease-in-out;

  & svg {
    height: 30px;
    width: 30px;
  }

  &.expanded {
    opacity: 1;
  }
`;

export const ExpandIcon = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  transition: background-color 0.1s ease-in-out;
  cursor: pointer;

  & svg {
    width: 20px;
    height: 15px;
    fill: ${({ theme }) => theme.text};
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hoverGrey};
  }
`;

const TagTypography = css`
  text-transform: uppercase;
  text-align: center;
  font-size: 16px;
  font-weight: 300;
  line-height: 24px;

  color: ${({ theme }) => theme.text};
`;

export const TagInline = styled.div`
  ${TagTypography}
  width: 80px;
  height: 80px;
  position: absolute;
  top: 0px;
  left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  @container profile-content (max-width: 1024px) {
    & {
      display: none;
    }
  }
`;

export const TagTop = styled.div`
  ${TagTypography}
  width: 100%;
  display: none;
  margin-top: 40px;
  margin-bottom: 20px;

  @container profile-content (max-width: 1024px) {
    & {
      display: block;
    }
  }
`;

export const ExpandedContent = styled.div`
  ${PILL}
  ${NO_SCROLLBAR}
  position: absolute;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  background: ${({ theme }) => theme.pillExpandedContentBackground};
  overflow-y: auto;

  top: 80px;
  left: 10px;
  width: calc(100cqw - 20px);
  height: calc(100cqh - 90px);

  container-name: muses-pill-expanded-content;
  container-type: size;

  &.expanded {
    opacity: 1;
    pointer-events: all;
  }
`;
