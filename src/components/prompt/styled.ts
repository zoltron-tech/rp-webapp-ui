import { Collapsible } from "radix-ui";
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

  padding: 16px 16px 8px;
  margin-top: 20px;
  border-radius: 18px;
  border: 1px solid var(--bg-5);
  box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.85);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 26px 52px -26px rgba(0, 0, 0, 0.95);
      border-color: color-mix(in srgb, var(--accent) 30%, var(--bg-5));
    }
  }

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-block: 12px;
    background-color: var(--bg-5);
  }

  @media screen and (max-width: 800px) {
    margin-block: 0px;
    border-radius: 14px;
    padding-inline: 12px;
    ${({ $noBorder }) => $noBorder && "border: none; box-shadow: none;"}
  }
`;

export const PromptHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  position: relative;

  .avatar {
    width: 52px;
    height: 52px;
    cursor: pointer;
  }

  .privacyAvatar {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  @media screen and (max-width: 600px) {
    gap: 10px;

    .avatar {
      width: 44px;
      height: 44px;
      cursor: pointer;
    }

    .privacyAvatar {
    width: 20px;
    height: 20px;
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
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

export const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;

  @media screen and (max-width: 600px) {
    gap: 6px;
  }
`;

export const SourceName = styled.h1`
  all: unset;

  line-height: 1.2;
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
  color: var(--text);
  font-family: var(--font);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 600px) {
    font-size: var(--font-size);
    font-weight: var(--font-weight-semi-bold);
  }
`;

export const RoleTag = styled.span<{ $muse?: boolean }>`
  flex-shrink: 0;
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 5px;
  line-height: 1.4;
  color: ${({ $muse }) => ($muse ? "var(--accent)" : "var(--text-secondary)")};
  background: ${({ $muse }) =>
    $muse
      ? "color-mix(in srgb, var(--accent) 16%, transparent)"
      : "var(--bg-5)"};
  border: 1px solid
    ${({ $muse }) =>
      $muse
        ? "color-mix(in srgb, var(--accent) 34%, transparent)"
        : "var(--bg-6)"};

  @media screen and (max-width: 600px) {
    font-size: 8px;
    padding: 1px 5px;
    letter-spacing: 0.06em;
  }
`;

export const HeaderDropdownMenuContainer = styled.div`
  display: flex;
  gap: 6px;
  align-self: flex-start;
  margin-left: auto;
  color: var(--text-secondary);
`;

export const PromptSubheader = styled.time`
  all: unset;
  font-size: var(--font-size-small);
  color: var(--text-muted, var(--text-secondary));
  cursor: default;

  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;

  @media screen and (max-width: 600px) {
    gap: 5px;
    font-size: var(--font-size-xsmall);
  }
`;

export const DotSep = styled.span`
  width: 2.5px;
  height: 2.5px;
  border-radius: 50%;
  background: var(--bg-7);
  flex-shrink: 0;
`;

export const PrivacyChip = styled.span<{ $clickable?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px 2px 7px;
  border-radius: 20px;
  background: var(--bg-4);
  border: 1px solid var(--bg-6);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: background 0.15s ease, border-color 0.15s ease;

  .privacy-icon {
    width: 12px;
    height: 12px;
  }

  ${({ $clickable }) =>
    $clickable &&
    `@media (hover: hover) { &:hover { background: var(--bg-5); border-color: var(--bg-7); } }`}

  @media screen and (max-width: 600px) {
    gap: 0;
    padding: 4px;

    .privacy-label {
      display: none;
    }

    .privacy-icon {
      width: 11px;
      height: 11px;
    }
  }
`;

export const OOCEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 14px 0 2px;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);

  &::before {
    content: "";
    width: 14px;
    height: 1.5px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--accent) 50%, transparent);
  }
`;

const PromptContentFooter = styled.footer`
  display: flex;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--bg-5);
  padding: 8px 4px 4px;
  margin-top: 14px;

  @media screen and (max-width: 600px) {
    gap: 16px;
  }
`;

/* Wraps the heart tap-target and the count/label tap-target as separate
   sibling controls — they must not nest (a <button> inside a <button>
   breaks a11y and stops the two from having independent hover states). */
export const LikeGroup = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const HeartLikeButton = styled.button<{ $liked?: boolean }>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 8px;
  border-radius: 9px;
  color: ${({ $liked }) => ($liked ? "var(--tomato-9)" : "var(--text-secondary)")};
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;

  svg {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  &:active {
    transform: scale(0.92);
  }

  @media (hover: hover) {
    &:hover {
      color: var(--tomato-9);
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  @media screen and (max-width: 600px) {
    padding: 7px 4px;
  }
`;

export const LikeCountButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  padding: 7px 11px 7px 0;
  border-radius: 9px;
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease;

  /* Desktop shows the full label; the short count is a mobile fallback. */
  .count-short {
    display: none;
  }
  .label-full {
    display: inline;
  }

  &:hover {
    text-decoration: underline;
    color: var(--text);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  @media screen and (max-width: 600px) {
    padding: 7px 4px 7px 0;

    .count-short {
      display: inline;
    }
    .label-full {
      display: none;
    }
  }
`;

export const ActionButton = styled.button<{
  $accentHover?: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 9px;
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  svg {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  /* Desktop shows the full label; the short count is a mobile fallback. */
  .count-short {
    display: none;
  }
  .label-full {
    display: inline;
  }

  @media (hover: hover) {
    &:hover {
      background: var(--bg-4);
      color: ${({ $accentHover }) =>
        $accentHover ? "var(--accent)" : "var(--text)"};
    }
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }

  &.share {
    margin-left: auto;
  }

  /* Mobile: swap the wordy label for a compact count next to the icon. */
  @media screen and (max-width: 600px) {
    gap: 6px;
    padding: 7px 4px;

    .count-short {
      display: inline;
    }
    .label-full {
      display: none;
    }
  }
`;

const PromptContentRoot = styled.section`
  padding-top: 4px;
`;

export const PromptContent = Object.assign(
  {},
  {
    Footer: PromptContentFooter,
    Root: PromptContentRoot,
  },
);

// ─── Featured song card ───────────────────────────────────────────────────────

export const SongCard = styled.div`
  margin: 16px 0 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 13px;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
`;

export const SongArt = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 9px;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 60%, var(--bg-6)),
    var(--bg-5)
  );

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .song-art-note {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    opacity: 0.7;
  }

  .song-art-play {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.34);
    color: #fff;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &:hover .song-art-play,
  &.playing .song-art-play {
    opacity: 1;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    cursor: default;
  }
`;

export const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

export const SongTitle = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SongArtist = styled.span`
  font-size: var(--font-size-xsmall);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SongWave = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
  margin-top: 4px;
  cursor: pointer;

  i {
    width: 2px;
    border-radius: 2px;
    background: var(--bg-7);
    transition: background 0.2s ease;

    &.on {
      background: color-mix(in srgb, var(--accent) 75%, #fff);
    }
  }
`;

export const SongSource = styled.span`
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  align-self: flex-start;
  padding-top: 2px;
`;

export const SongHiddenEmbed = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
`;

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
  width: 100%;
`;

/** Slim header row: overlapping avatar stack, a flexing divider line, and the
 *  toggle pill — replaces the old percentage-width separator hack, which
 *  overlapped/misaligned at narrow (≤375px) widths. */
const PromptThreadsHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  @media screen and (max-width: 600px) {
    gap: 7px;
    margin-bottom: 10px;
  }
`;

export const PromptThreadsDivider = styled.div`
  flex: 1;
  min-width: 14px;
  height: 1px;
  background-color: var(--bg-5);
`;

const PromptThreadsToggle = styled.button<{ $active: boolean }>`
  all: unset;
  cursor: pointer;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  color: ${({ $active }) => ($active ? "var(--accent)" : "var(--text-secondary)")};
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  padding: 7px 14px;
  border-radius: 50px;
  border: 1px solid ${({ $active }) => ($active ? "var(--accent)" : "var(--bg-6)")};
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 10%, var(--bg-3))"
      : "var(--bg-3)"};
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;

  .toggle-caret {
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    transform: rotate(${({ $active }) => ($active ? "180deg" : "0deg")});
  }

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

  @media screen and (max-width: 600px) {
    padding: 6px 10px;
    gap: 5px;
    font-size: var(--font-size-xsmall);
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
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
  color: var(--accent);
  font-family: var(--font);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  border-radius: 50%;
  min-width: 19px;
  height: 19px;
  padding-inline: 3px;
  line-height: 1;

  @media screen and (max-width: 600px) {
    min-width: 17px;
    height: 17px;
    font-size: 10px;
  }
`;

/** Overlapping avatar stack, ringed against the card surface so faces stay
 *  legible when packed tight on small screens. */
export const PromptThreadsAvatars = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .avatar {
    width: 26px;
    height: 26px;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--bg-2);
    margin-left: -8px;

    &:first-child {
      margin-left: 0;
    }

    @media screen and (max-width: 600px) {
      width: 21px;
      height: 21px;
      margin-left: -6px;
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
    Divider: PromptThreadsDivider,
    Header: PromptThreadsHeader,
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
