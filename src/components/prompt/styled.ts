import { Collapsible, Separator } from "radix-ui";
import { keyframes, styled } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

export const PromptRoot = styled.article<{ $noBorder?: boolean }>`
  background-color: var(--bg-2);
  width: 100%;
  max-width: 800px;
  margin-inline: auto;

  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  padding: 10px;
  padding-bottom: 20px;
  margin-top: 20px;
  border-radius: 8px;
  border: 0.85px solid var(--bg-6);

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-block: 10px;
    background-color: var(--bg-6);
  }

  @media screen and (max-width: 800px) {
    margin-block: 0px;
    padding-inline: 6px;
    ${({ $noBorder }) => $noBorder && "border: none;"}
  }
`;

export const PromptHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  position: relative;

  .avatar {
    width: 64px;
    height: 64px;
    cursor: pointer;
  }

  .privacyAvatar {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  @media screen and (max-width: 430px) {
    .avatar {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }

    .privacyAvatar {
    width: 22px;
    height: 22px;
    cursor: pointer;
  }
  }
`;

export const privacyAvatarMoreIcon = styled.div`
  display: flex;
  background-color: var(--bg-3);
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  width: 35px;
  height: 35px;
  cursor: pointer;
  justify-content: center;
  align-items: center;

    @media screen and (max-width: 430px) {
    width: 24px;
    height: 24px;
    cursor: pointer;
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

  @media screen and (max-width: 430px) {
    font-size: var(--font-size);
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const HeaderDropdownMenuContainer = styled.div`
  display: flex;
  gap: 6px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`;

export const PromptSubheader = styled.time`
  all: unset;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: default;

  display: flex;
  align-items: center;
  gap: 4px;
`;

const PromptContentFooter = styled.footer`
  display: flex;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--bg-4);
  padding: 6px 16px;
  margin-top: 12px;
`;

const PromptContentRoot = styled.section`
  padding-inline: 16px;
  padding-top: 20px;
`;

export const PromptContent = Object.assign(
  {},
  {
    Footer: PromptContentFooter,
    Root: PromptContentRoot,
  },
);

export const PromptMediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 10px;
  max-width: 350px;
  height: fit-content;
  display: flex;
  background-color: #000000;
`;

export const PromptSongContainer = styled.div`
  margin-top: 10px;
  max-width: 420px;

  & > * {
    width: 100%;
  }
`;

export const PromptImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const PromptVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const TextLine = styled.span`
  display: block;
  margin-bottom: 8px;
  min-height: 1em;
  overflow-wrap: break-word;
`;

const PromptThreadsRoot = styled.div`
  .comment-action {
    margin-bottom: 10px;
  }
`;

const PromptThreadsHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const PromptThreadsSeparator = styled(Separator.Root)`
  height: 1px;
  width: 100%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

export const PromptThreadsSeparatorPartialFirst = styled(Separator.Root)`
  height: 1px;
  width: 10%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

export const PromptThreadsSeparatorPartialMid = styled(Separator.Root)`
  height: 1px;
  width: 20%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

export const PromptThreadsSeparatorPartialPlaceholder = styled(Separator.Root)`
  height: 1px;
  width: 10%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

export const PromptThreadsSeparatorPartialLast = styled(Separator.Root)`
  height: 1px;
  width: 70%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

const PromptThreadsToggle = styled.button<{ $active: boolean }>`
  all: unset;
  cursor: pointer;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  color: ${({ $active }) => ($active ? "var(--accent)" : "var(--text-secondary)")};
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  padding: 7px 18px;
  border-radius: 50px;
  border: 1px solid ${({ $active }) => ($active ? "var(--accent)" : "var(--bg-6)")};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 10%, var(--bg-3))"
      : "var(--bg-3)"};
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;

  @media (hover: hover) {
    &:hover {
      color: var(--accent);
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, var(--bg-3));
    }
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-3));
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

const slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
`;

const slideUp = keyframes`
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
`;

const PromptThreadsContent = styled(Collapsible.Content)`
  overflow: hidden;

  &[data-state="open"] {
    animation: ${slideDown} 220ms ease;
  }

  &[data-state="closed"] {
    animation: ${slideUp} 220ms ease;
  }
`;

export const ThreadsCounter = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: any) => theme.unreadBadge};
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  line-height: 1;
`;

export const PromptThreadsAvatars = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-inline: 4px;
  max-width: 20%;
  gap: 0.25em;

  .avatar {
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 50%;

    @media screen and (max-width: 600px) {
      width: 24px;
      height: 24px;
    }
  }
`;

export const AddCommentButton = styled.button`
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

export const PromptThreads = Object.assign(
  {},
  {
    Avatars: PromptThreadsAvatars,
    Content: PromptThreadsContent,
    Header: PromptThreadsHeader,
    LeftMid: PromptThreadsSeparatorPartialMid,
    LeftPlaceholder: PromptThreadsSeparatorPartialPlaceholder,
    LeftPost: PromptThreadsSeparatorPartialLast,
    LeftPre: PromptThreadsSeparatorPartialFirst,
    Right: PromptThreadsSeparator,
    Root: PromptThreadsRoot,
    Toggle: PromptThreadsToggle,
  },
);

// ─── Share Prompt Dialog ──────────────────────────────────────────────────────

const dialogPopIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const ShareDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.2s ease both;
`;

export const ShareDialogContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 201;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
  border-radius: 14px;
  padding: 24px;
  width: min(460px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  animation: ${dialogPopIn} 0.2s ease both;
  outline: none;
`;

export const ShareDialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 32px;
`;

export const ShareDialogClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-5);
    color: var(--text);
  }
`;

export const ShareDialogTitle = styled.h2`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
`;

export const ShareDialogDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

export const SharePreviewCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 10px;

  .sharePreviewAvatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }
`;

export const SharePreviewBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SharePreviewMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`;

export const SharePreviewName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SharePreviewDate = styled.time`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

export const SharePreviewText = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

export const SharePreviewThumb = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--bg-6);
`;

export const ShareLinkRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
`;

export const ShareLinkBox = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  min-height: 38px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  color: var(--text-secondary);

  > svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const ShareLinkUrl = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ShareCopyButton = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0 14px;
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.5)" : "var(--bg-6)")};
  background: ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.12)" : "var(--bg-3)")};
  color: ${({ $copied }) => ($copied ? "#22c55e" : "var(--text)")};
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ $copied }) => ($copied ? "rgba(34, 197, 94, 0.12)" : "var(--bg-5)")};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const ShareActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const ShareDiscordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: #5865f2;
  color: #ffffff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #4752c4;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ShareSpinner = styled.span`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: ${spin} 0.7s linear infinite;
`;

export const ShareNativeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--bg-6);
  border-radius: 8px;
  background: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-5);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ShareErrorText = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  font-size: var(--font-size-small);
  color: #ef4444;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const ShareSrAnnounce = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const ShareTrayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px 8px;
  width: 100%;
`;

export const ShareResultState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  width: 100%;
  text-align: center;
`;

export const ShareResultIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const ShareResultTitle = styled.h3`
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  margin: 0;
`;

export const ShareResultSubtitle = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin: 0;
`;

export const ShareViewButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 8px;
  background: #5865f2;
  color: #ffffff;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #4752c4;
    color: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const ShareDoneButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--bg-6);
  background: var(--bg-3);
  color: var(--text);
  text-align: center;
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-5);
  }
`;
