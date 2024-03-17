import { Pill } from "@/components/common/pill";
import { DEV_MODE_BORDER, NO_SCROLLBAR, PILL } from "@/theme";
import { css, styled } from "styled-components";

export const PillContinaer = styled(Pill)`
  --expanded-height: 500px;

  ${DEV_MODE_BORDER("green")}

  max-height: var(--expanded-height);
  max-width: min(800px, calc(100cqw - 40px));
  min-width: 300px;
  contain: paint;
  margin-inline: auto;

  @container profile-content (max-width: 600px) {
    & {
      max-width: 100%;
      border-radius: 0px;
      width: 100cqw;
    }
  }

  height: 100px;
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
  width: 100px;
  overflow-y: auto;
  padding: 0px 10px;
  position: absolute;
  left: 60px;
  height: calc(95cqw - 190px);
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
  border-radius: 50px;
  top: 20px;
  left: 120px;
  width: calc(100cqw - 240px);
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
  left: 20px;
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
  top: 15px;
  right: 20px;
  border-radius: 50%;
  height: 70px;
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.2s ease-in-out;

  & svg {
    height: 70px;
    width: 70px;
    transition: transform 0.2s linear;
    transform: rotate(0deg);
    fill: ${({ theme }) => theme.text};
  }

  &.expanded svg {
    transform: rotate(135deg);
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
  height: 100px;
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

  top: 100px;
  left: 20px;
  width: calc(100cqw - 40px);
  height: calc(100cqh - 140px);

  container-name: muses-pill-expanded-content;
  container-type: size;

  &.expanded {
    opacity: 1;
    pointer-events: all;
  }
`;
