import { Container } from "@novelist-world/ui";
import { Form as RadixForm } from "radix-ui";
import styled from "styled-components";
import * as Common from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { CARD_BORDER, DEV_MODE_BORDER, Z_INDEX } from "@/theme";

export const FormRoot = styled(RadixForm.Root)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

export const FormControl = styled(RadixForm.Control)`
  width: 100%;
  min-height: 200px;
  padding: 10px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  resize: vertical;
  font-size: var(--font-size);
  font-family: var(--font);
`;

export const FormTextArea = styled.textarea`
    font-size: var(--font-size-input);
`;

export const ReplyWrapper = styled.div<{ $highlight?: boolean }>`
  border-radius: 20px;
  transition: background-color 0.4s ease;

  background-color: ${({ $highlight }) =>
    $highlight
      ? "color-mix(in srgb, var(--accent) 25%, transparent)"
      : "transparent"};
`;

export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  z-index: ${Z_INDEX.CARD};
  background-color: transparent;
  border-radius: unset !important;
  border: none !important;

  @container content-container (max-width: 800px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 0px;
    padding: 0px;
    border: none;
  }

  /* On mobile the page stops scrolling and becomes a fixed-height flex column.
     RepliesContainer scrolls internally; MobileReplyComposer sits at the bottom.

     NOTE: We intentionally do NOT use position: fixed here. Ancestors with
     a container-type (page-container = size, content-container = inline-size)
     become the containing block for fixed-positioned descendants, so on real
     iOS Safari/Chrome a fixed element anchors to content-container (which sits
     below the sticky top bar) instead of the viewport — causing a top gap and
     a non-scrollable column. A viewport-relative dvh height in normal flow
     (the column already renders right below the sticky top bar) is immune to
     that quirk. */
  @media screen and (max-width: 800px) {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: calc(100dvh - var(--topbar-height));
    margin: 0;
    padding: 0;
    overflow: hidden;
    justify-content: flex-start;
    align-items: stretch;
    background-color: var(--bg-2);
  }
`;

export const RepliesContainer = styled.div`
  max-width: 800px;
  margin-top: 40px;
  width: 100%;
  padding: 0px;
  z-index: ${Z_INDEX.CARD_EXPAND};
  background-color: var(--bg-2);
  border: 0.85px solid var(--bg-6);

    .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-block: 10px;
    background-color: var(--bg-6);
  }

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

  @container content-container (max-width: 800px) {
    max-width: 100%;
    margin-top: unset;
    margin-left: unset;
    border: none;
    border-radius: unset;
  }

  /* On mobile: fill remaining height and scroll internally */
  @media screen and (max-width: 800px) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 16px;
    margin-top: 0;
    padding-top: 0px;
  }
`;

export const CommentsHeader = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-block: 10px;
  margin-left: 100px;
  text-align: left;
  width: 100%;

  @container content-container (max-width: 1400px) {
    font-size: 16px;
    font-weight: 400;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  padding-block: 8px;
  border-bottom: 1px solid var(--bg-6);
  padding-inline: 10px;
  gap: 8px;

  /* Stick to the top while scrolling on mobile so the "To" info is always visible */
  @media screen and (max-width: 800px) {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg-2);
  }
`;

export const BackButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: background-color 0.15s ease, color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
    }
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 6px;
`;

export const SourceName = styled.h1`
  all: unset;

  line-height: 1.5;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);

  @media(max-width: 600px) {
    max-width: 200px;
    font-size: var(--font-size-input);
  }
`;

export const PromptSubheader = styled.time`
  all: unset;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: default;

  display: flex;
  align-items: center;
  gap: 8px;

    @media(max-width: 600px) {
    font-size: var(--font-size-xsmall);
  }
`;

export const PromptTextContainer = styled.div`
  max-width: 95%;
  margin-top: 20px;
  padding-inline: 20px;

  @container (max-width: 700px) {
    & {
      /* padding-left: 28px; */
    }
  }
`;

export const PromptContentFooter = styled.footer`
  width: 100%;
  padding-inline: 20px;
  display: flex;
  align-items: flex-start;
  margin-top: 18px;
  padding-bottom: 8px;

  @container (max-width: 700px) {
    & {
      /* padding-left: 28px; */
    }
  }
`;

export const AddReplyButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size);
  margin-bottom: 20px;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
    color: var(--text);
  }
`;

export const ConcludedChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent-8);
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
`;

export const ConcludedNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 16px;
  margin-block: 12px;
  border: 1px dashed var(--bg-6);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: var(--font-size-small);
  text-align: center;
`;

export const MediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 6px;

  max-width: 400px;
  height: fit-content;
  display: flex;
  background-color: #000000;

  @media (max-width: 500px) {
    max-width: 200px;
  }
`;

export const PromptImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: zoom-in;
`;

export const PromptVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const StyledDate = styled.div`
  font-size: 12px;
  font-weight: 200;

  @container (max-width: 1400px) {
    & {
      font-size: 10px;
      font-weight: 300;
    }
  }
`;

type CardProps = {
  banner: string;
};

export const CardBackground = styled.div<CardProps>`
  position: absolute;
  width: 100%;
  height: 100%;

  background-image: url(${(props): string => props.banner});
  background-size: cover;
  transition-timing-function: ease-out;
  transition-duration: 300ms;
  transition-property: scale;
  background-repeat: no-repeat;
  background-position: center center;
`;

export const CardWrapper = styled.div`
  position: relative;
  width: 450px;
  height: 450px;
  margin-inline: 20px;
  border-radius: 3%;
  margin-block: 10px;
  ${CARD_BORDER};

  transition: all 0.3s ease-in-out;
  contain: paint;
  cursor: zoom-in;
  z-index: ${Z_INDEX.CARD};

  container-name: card;
  container-type: size;

  @container (max-width: 800px) {
    & {
      width: 400px;
      height: 400px;
    }
  }

  @container (max-width: 600px) {
    & {
      width: 350px;
      height: 350px;
    }
  }

  @container (max-width: 500px) {
    & {
      width: 250px;
      height: 250px;
    }
  }

  &:hover {
    & ${CardBackground} {
      scale: 1.03;
    }
  }
`;

export const ReplyHeaderContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  width: 100%;
  padding-top: 20px;
  padding-inline: 20px;
`;

export const DropdownMenuContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  gap: 6px;
  position: absolute;
  right: 0px;
  top: 20px
`;

export const HeaderDropdownMenuContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  gap: 6px;
  position: absolute;
  right: 0px;
  top: 10px
`;

/**
 * Wraps the LoadMore component with horizontal rule lines on each side,
 * matching the AddNewButton divider style used on muses/music pages.
 */
export const LoadMoreDivider = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block: 6px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
    opacity: 0.8;
  }

  /* Dissolve the intermediate container so the button sits between the lines */
  & > div {
    display: contents;
  }

  button {
    width: auto;
    padding: 4px 8px;
    font-size: var(--font-size-small);
  }
`;

export const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px 60px;
  text-align: center;
`;

export const NotFoundAnimation = styled.div`
  width: 280px;
  height: 280px;

  /* Blend the animation's dominant colors toward the app accent */
  filter: hue-rotate(
      calc(var(--animation-hue-shift, 0deg))
    )
    saturate(0.85) brightness(0.92);

  @media (max-width: 480px) {
    width: 200px;
    height: 200px;
  }
`;

export const NotFoundTitle = styled.h2`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--accent-8);
  letter-spacing: 0.02em;
  gap: 12px;
`;

export const NotFoundMessage = styled.p`
  all: unset;
  display: block;
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  max-width: 320px;
  line-height: 1.6;
`;
