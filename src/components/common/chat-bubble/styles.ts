export const AttachmentFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  width: 100%;
  padding-inline: 10px;
  color: var(--text-secondary);
  background: var(--bg-4);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  font-size: var(--font-size-small);
  gap: 8px;
`;

import { keyframes, styled } from "styled-components";
import { savedMentionTagCss } from "@/components/rich-text-editor-input/mention-chip";
import { Pill } from "../pill";

const wiggle = keyframes`
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-6px); }
  40%  { transform: translateX(6px); }
  60%  { transform: translateX(-4px); }
  80%  { transform: translateX(4px); }
  100% { transform: translateX(0); }
`;

const flash = keyframes`
  0% {
    background: transparent;
    box-shadow: -10px 0 0 0 transparent, 10px 0 0 0 transparent;
  }
  15% {
    background: var(--accent-3);
    box-shadow: -10px 0 0 0 var(--accent-3), 10px 0 0 0 var(--accent-3);
  }
  100% {
    background: transparent;
    box-shadow: -10px 0 0 0 transparent, 10px 0 0 0 transparent;
  }
`;

export const ChatRow = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 8px;

  &.sender {
    justify-content: flex-end;
  }

  &.receiver {
    justify-content: flex-start;
  }

  &.activity {
    justify-content: center;
  }

  &.highlighted {
    animation: ${flash} 1.4s ease-out forwards;
  }
`;

export const SenderAvatarWrap = styled.div`
  display: flex;
  align-items: center;
  margin-right: 6px;
  margin-top: 10px;

  .avatar {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
`;

export const BubbleStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: min(72%, 430px);

  &.sender {
    align-items: flex-end;
  }

  &.receiver {
    align-items: flex-start;
  }
`;

export const ChatBubble = styled(Pill)`
  width: fit-content;
  font-size: 12px;
  max-width: 100%;
  min-height: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 10px;
  word-break: break-word;
  border-radius: 16px;
  white-space: pre-wrap;

  a {
    color: #3498DB;
    text-decoration: underline;
  }

  &.sender {
    background-color: var(--accent);

    .mention-tag {
      background: rgba(255, 255, 255, 0.25);
      color: var(--text);
      &:hover { background: rgba(255, 255, 255, 0.35); }
    }
  }

  &.receiver {
    background-color: ${({ theme }: any) => theme.modalBackground};
  }

  ${savedMentionTagCss}

  strong { font-weight: 700; }
  em { font-style: italic; }
`;

export const ChatBubbleContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: 4px;
  width: 100%;
`;

export const SenderNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  margin-inline: 8px;

  .avatar {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }
`;

export const SenderName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
`;

export const ActivityBubble = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  max-width: min(90%, 520px);
  font-size: var(--font-size-small);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 10%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 24%, var(--bg-6));
  text-align: center;
`;

export const ActivitySenderName = styled.span`
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
`;

export const AttachmentsGrid = styled.div<{ $multi?: boolean }>`
  display: flex;
  flex-direction: ${({ $multi }) => ($multi ? "row" : "column")};
  flex-wrap: ${({ $multi }) => ($multi ? "wrap" : "nowrap")};
  gap: ${({ $multi }) => ($multi ? "4px" : "6px")};
  width: 100%;
`;

export const AttachmentItem = styled.div<{ $half?: boolean }>`
  flex: ${({ $half }) => ($half ? "0 0 calc(50% - 2px)" : "0 0 100%")};
  min-width: 0;
  overflow: hidden;
`;

export const AttachmentImage = styled.img<{ $noBg?: boolean; $grid?: boolean }>`
  display: block;
  max-width: 100%;
  width: ${({ $grid }) => ($grid ? "100%" : "auto")};
  max-height: ${({ $grid }) => ($grid ? "160px" : "300px")};
  height: ${({ $grid }) => ($grid ? "160px" : "auto")};
  border-radius: 8px;
  border: ${({ $noBg }) => ($noBg ? "none" : "1px solid var(--bg-6)")};
  cursor: zoom-in;
  background: ${({ $noBg }) => ($noBg ? "transparent" : "var(--bg-1)")};
  object-fit: ${({ $grid }) => ($grid ? "cover" : "contain")};
`;

export const AttachmentVideo = styled.video`
  width: 100%;
  max-height: 210px;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: #000;
`;

export const AttachmentAudio = styled.audio`
  width: 100%;
  min-width: 200px;
  border-radius: 10px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
`;

export const HiddenAudio = styled.audio`
  display: none;
`;

export const AudioAttachmentCard = styled.div`
  width: 100%;
  min-width: 220px;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const AudioAttachmentTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AudioPlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  background: var(--accent);
  border: 1px solid var(--bg-5);
  border-radius: 50%;
  color: var(--text);
  font-size: var(--font-size-xxsmall);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-5);
    transform: scale(1.05);
  }
`;

export const AudioAttachmentLabel = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
`;

export const AudioProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

export const AudioTime = styled.span`
  font-size: var(--font-size-xxsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 32px;
  text-align: center;
`;

export const AudioProgressBar = styled.div`
  position: relative;
  flex: 1;
  height: 4px;
  background: var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
`;

export const AudioProgressFill = styled.div`
  height: 100%;
  width: 0%;
  border-radius: 4px;
  background: var(--accent, var(--accent-hover));
  transition: width 0.1s linear;
`;

export const VideoAttachmentCard = styled.div`
  width: 100%;
  min-width: 220px;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const VideoViewport = styled.div`
  width: 100%;
  max-height: 210px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--bg-6);
  background: #000;
`;

export const VideoElement = styled.video`
  width: 100%;
  max-height: 210px;
  display: block;
  object-fit: contain;
`;

export const FileAttachmentCard = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  background: var(--bg-2);
  text-decoration: none;
  color: var(--text);

  &:hover {
    background: var(--bg-3);
    border-color: color-mix(in srgb, var(--accent) 30%, var(--bg-6));
  }
`;

export const FileAttachmentIcon = styled.span`
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
`;

export const FileAttachmentInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const FileAttachmentName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: underline;
`;

export const FileDownloadButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  color: var(--text-secondary);
  flex-shrink: 0;
  border-radius: 4px;
`;

export const LinkAnchor = styled.a`
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  font-size: var(--font-size-small);
  color: var(--accent);
  text-decoration: underline;
  overflow-wrap: anywhere;
`;

export const LinkPreviewCard = styled.a`
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 10px;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  padding: 8px;
  background: var(--bg-2);
  text-decoration: none;
  color: var(--text);

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
  }
`;

export const LinkPreviewImage = styled.img`
  width: 100%;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
`;

export const LinkPreviewImageFallback = styled.div`
  width: 100%;
  height: 88px;
  border-radius: 10px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--accent) 30%, transparent),
    color-mix(in srgb, var(--accent) 10%, transparent)
  );
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 26px;
`;

export const LinkPreviewBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
`;

export const LinkPreviewTitle = styled.strong`
  font-size: 13px;
  line-height: 1.2;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const LinkPreviewDescription = styled.p`
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const LinkPreviewSite = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-secondary);
`;

export const YouTubeLinkCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-left: 4px solid #ff0000;
  border-radius: 4px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  background: var(--bg-2);

  &:hover {
    border-color: color-mix(in srgb, #ff0000 40%, var(--bg-6));
    border-left-color: #cc0000;
  }
`;

export const YouTubeThumbWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
`;

export const YouTubeThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const YouTubePlayBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  padding: 3px 7px;
`;

export const InstagramLinkCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-left: 4px solid #e1306c;
  border-radius: 4px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  background: var(--bg-2);

  &:hover {
    border-color: color-mix(in srgb, #e1306c 40%, var(--bg-6));
    border-left-color: #c0254f;
  }
`;

export const FacebookLinkCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-left: 4px solid #1877f2;
  border-radius: 4px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  background: var(--bg-2);

  &:hover {
    border-color: color-mix(in srgb, #1877f2 40%, var(--bg-6));
    border-left-color: #1460c4;
  }
`;

export const TwitterLinkCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-left: 4px solid #000;
  border-radius: 4px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  background: var(--bg-2);

  &:hover {
    border-color: color-mix(in srgb, #000 30%, var(--bg-6));
    border-left-color: #333;
  }

  @media (prefers-color-scheme: dark) {
    border-left-color: #e7e9ea;

    &:hover {
      border-left-color: #cfd3d8;
    }
  }
`;

export const SocialThumbWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-3);
`;

export const SocialThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const SocialThumbFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
`;

export const SocialBrandBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  padding: 3px 7px;
`;

export const EmojiOnlyMessage = styled.span`
  font-size: var(--font-size-h1);
  line-height: 1.2;
  display: block;
`;

export const TimeStamp = styled.span`
  font-size: var(--font-size-xxsmall);
  opacity: 0.7;
  margin-inline: 2px;
  color: var(--text-secondary);
`;

export const ReactionsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ReactionChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background: var(--bg-2);
  color: var(--text);
  font-size: 11px;

  &:hover {
    cursor: pointer;
    border-color: color-mix(in srgb, var(--accent) 40%, var(--bg-6));
    background: color-mix(in srgb, var(--accent) 10%, var(--bg-2));
  }
`;

export const ReactionUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ReactionUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .avatar {
    width: 26px;
    height: 26px;
    min-width: 26px;
  }
`;

export const ReactionUserName = styled.span`
  font-size: 13px;
  color: var(--text);
`;

export const RepliedToQuote = styled.div<{ $wiggling?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--bg-6));
  background: color-mix(in srgb, var(--accent) 5%, var(--bg-3));
  border-left: 3px solid var(--accent);
  max-width: 100%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  animation: ${({ $wiggling }) => ($wiggling ? wiggle : "none")} 0.4s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent) 8%, transparent) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

export const RepliedToBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

export const RepliedToSender = styled.span`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RepliedToText = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RepliedToThumb = styled.img`
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid var(--bg-6);
`;

export const RepliedToThumbLabel = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  font-style: italic;
`;

export const MessageMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
  margin-inline: -8px;

  ${ChatRow}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
  }
`;
