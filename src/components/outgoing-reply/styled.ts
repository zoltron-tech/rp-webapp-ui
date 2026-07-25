import { Separator } from "radix-ui";
import { styled } from "styled-components";

export const ThreadRoot = styled.article`
  background-color: var(--bg-2);
  width: 100%;
  max-width: 800px;
  margin-inline: auto;

  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  padding: 10px;
  margin-block: 10px;
  border: 0.85px solid var(--bg-6);
  border-radius: 8px;

  &[data-has-replies] {
    border-color: var(--accent);
  }

  &[data-has-replies] {
    border-left: 4px solid var(--accent);
  }

  &[data-concluded] {
    opacity: 0.72;
  }

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-block: 10px;
    background-color: var(--bg-6);
  }

  @media screen and (max-width: 800px) {
    margin-block: 5px;
    padding-inline: 6px;
  }
`;

export const PromptHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding-inline: 8px;
`;

export const AvatarGroup = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;

  @media screen and (max-width: 430px) {
    width: 40px;
    height: 40px;
  }
`;

export const PrimaryAvatarSlot = styled.div`
  width: 100%;
  height: 100%;

  .avatar {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

export const TargetAvatarSlot = styled.div`
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  background-color: var(--bg-2);

  .avatar {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  @media screen and (max-width: 430px) {
    width: 28px;
    height: 28px;
    bottom: -2px;
    right: -2px;
  }
`;

export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
`;

export const SourceNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
`;

export const SourceName = styled.h1`
  all: unset;

  line-height: 1.5;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media(max-width: 600px) {
    max-width: 140px;
    font-size: var(--font-size-input);
  }
`;

export const TypeTag = styled.span`
  flex-shrink: 0;
  font-family: var(--font);
  font-size: 10px;
  font-weight: var(--font-weight-semi-bold);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  padding: 2px 6px;

  @media (max-width: 430px) {
    display: none;
  }
`;

export const PromptSubheader = styled.div`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: default;

  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;

  time {
    white-space: nowrap;
    flex-shrink: 0;
  }

  @media(max-width: 600px) {
    font-size: var(--font-size-xsmall);
  }
`;

export const MetaDivider = styled.span`
  flex-shrink: 0;
`;

export const MetaTarget = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PromptThreadsSeparator = styled(Separator.Root)`
  height: 1px;
  width: 100%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

export const TextLine = styled.div`
  margin-bottom: 8px;
    min-height: 1em;
    overflow-wrap: break-word;
`;

export const PromptImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: zoom-in;
`;

export const CommentMediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 6px;

  max-width: 200px;
  height: fit-content;
  display: flex;
  background-color: #000000;
`;

export const PromptVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PromptContentRoot = styled.div`
  padding-top: 12px;
  padding-inline: 12px;
  padding-bottom: 8px;
  margin-left: 48px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-5);
  border-radius: 8px;
`;

export const PromptContent = Object.assign(
  {},
  {
    Image: PromptImage,
    MediaContainer: CommentMediaContainer,
    Root: PromptContentRoot,
    TextLine: TextLine,
  },
);

export const PromptMediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 10px;
  max-width: 200px;
  height: fit-content;
  display: flex;
  background-color: #000000;
`;

const CommentFooterRoot = styled.footer`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 14px;
  padding-bottom: 4px;
  gap: 8px;

  @media screen and (max-width: 430px) {
    padding-top: 2px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CommentFooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 48px;
`;

const CommentFooterRight = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  gap: 8px;

  @media screen and (max-width: 430px) {
    padding-left: 48px;
    width: 100%;
    justify-content: space-between;
  }
`;

const ReplyCount = styled.a`
  all: unset;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }

  .replies-icon {
    display: none;
  }

  @media screen and (max-width: 430px) {
    color: var(--text);
    margin-left: 4px;

    .replies-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
  }
`;

export const UnreadBadge = styled.a`
  flex-shrink: 0;
  align-self: flex-start;
  background-color: ${({ theme }: any) => theme.unreadBadge};
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  min-width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 0 10px ${({ theme }: any) => theme.unreadBadge};
  }

  @media (max-width: 430px) {
    width: 22px;
    height: 22px;
    min-width: 22px;
    font-size: var(--font-size-xsmall);
  }
`;

export const ConcludedBadge = styled.span`
  flex-shrink: 0;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: color-mix(in srgb, var(--ok, #4fb477) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--ok, #4fb477) 35%, transparent);
  color: var(--ok, #4fb477);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  border-radius: 12px;
  padding-inline: 8px;
  padding-block: 4px;
  white-space: nowrap;

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  @media (max-width: 430px) {
    padding-inline: 6px;
    font-size: var(--font-size-xsmall);

    span {
      display: none;
    }
  }

  @media (max-width: 600px) {
    top: 10px;
    right: 5px;
    font-size: var(--font-size-xsmall);
  }
`;

const OpenThreadButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-bold);
  padding: 7px 12px;
  border-radius: 50px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  .icon {
    width: 13px;
    height: 13px;
    transition: transform 0.1s ease;
  }

  @media (hover: hover) {
    &:hover {
      color: var(--text);
      background-color: var(--bg-4);
      .icon {
        transform: translateX(2px);
      }
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

export const CommentFooter = Object.assign(
  {},
  {
    Left: CommentFooterLeft,
    OpenThreadButton: OpenThreadButton,

    ReplyCount: ReplyCount,
    Right: CommentFooterRight,
    Root: CommentFooterRoot,
  },
);
