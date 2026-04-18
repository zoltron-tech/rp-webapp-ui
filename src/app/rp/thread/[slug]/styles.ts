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

export const ParentContainer = styled(Container)`
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
`;

export const RepliesContainer = styled.div`
  max-width: 800px;
  margin-top: 40px;
  width: 100%;
  padding: 10px 20px 20px;
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
`;

export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
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
  max-width: 90%;
  padding-left: 40px;

  @container (max-width: 700px) {
    & {
      padding-left: 32px;
    }
  }
`;

export const PromptContentFooter = styled.footer`
  width: 100%;
  padding-left: 40px;
  display: flex;
  align-items: flex-start;
  margin-top: 18px;
  padding-bottom: 8px;

  @container (max-width: 700px) {
    & {
      padding-left: 32px;
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
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
    color: var(--text);
  }
`;

export const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

export const LoadMoreButton = styled.button`
    background: none;
  border: none;
  color: var(--accent);
  font-size: var(--font-size-h6);
  margin-inline-start: 10px;
  font-style: italic;
  font-weight: 700;
    cursor: pointer;
      transition: opacity 0.2s ease;

  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
    text-decoration: underline;
  }

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-input);
    }
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
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
