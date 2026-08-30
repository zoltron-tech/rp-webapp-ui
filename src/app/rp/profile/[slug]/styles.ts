import { Container, ContainerClasses } from "@novelist-world/ui";
import styled, { keyframes } from "styled-components";
import { Avatar as AvatarCommon, Pill } from "@/components/common";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppDropdownMenu } from "@/components/profile-more-dropdown";
import { BLUR_FILTER, DEV_MODE_BORDER, Z_INDEX } from "@/theme";
import { Badge } from "../../tiers/styles";

interface BannerProps {
  src: string;
  $x?: number;
  $y?: number;
  $scale?: number;
  $blurred?: boolean;
}

/**
 * In-flow banner container — same width and aspect ratio as the crop dialog
 * so what the user sees while editing is exactly what renders on the profile.
 * overflow: visible lets the avatar hang below the bottom edge.
 */
export const BannerSection = styled.div<{
  $compact?: boolean;
  $hasBanner?: boolean;
}>`
  position: relative;
  width: 800px;
  aspect-ratio: ${({ $compact }) => ($compact ? "5 / 1" : "5 / 2")};
  overflow: visible;
  border-radius: 12px 12px 0 0;
  /* Give an uploaded banner some breathing room from the top on desktop. */
  margin-top: ${({ $hasBanner }) => ($hasBanner ? "24px" : "0")};

  @container profile-content (max-width: 800px) {
    width: 100%;
    border-radius: 0;
    margin-top: 0;
  }
`;

/**
 * Row anchored to the bottom of BannerSection. BannerSection is now the same
 * width as ContentInner, so simple padding suffices — no centering math needed.
 */
export const BannerAvatarRow = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  overflow: visible;
  padding-left: 20px;
  padding-right: 20px;
  z-index: ${Z_INDEX.AVATAR};
  pointer-events: none;
  > * { pointer-events: auto; }
`;

/**
 * Slide-up compose overlay for mobile "Add Prompt" flow.
 * The `transform` on this element makes it the containing block for the
 * fixed-positioned FPRoot inside FullPagePromptInput.
 */
export const ComposeSheet = styled.div<{ $open: boolean }>`
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  transform: translateY(${(p) => (p.$open ? "0" : "100%")});
  /* iOS Safari sizes position:fixed boxes against the shrunken visual
     viewport while the browser toolbars are showing, then grows the viewport
     when they retract at the bottom of the page: the off-screen
     translateY(100%) is left short by the toolbar height and a strip of the
     closed sheet paints over the content below it (the Load More button).
     visibility makes the closed state unpaintable whatever the geometry, and
     the 0.38s delay lets the slide-out animation finish before it applies. */
  visibility: ${(p) => (p.$open ? "visible" : "hidden")};
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s linear ${(p) => (p.$open ? "0s" : "0.38s")};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  /* Since FPRoot is position:fixed relative to this element (transform
     creates a new containing block), reset its top to 0. */
  .compose-fp-inner {
    top: 0 !important;
    height: 100% !important;
  }

  /* Not needed on desktop — inline PromptInput is used there. */
  @media screen and (min-width: 801px) {
    display: none;
  }
`;

export const AddPromptButton = styled.button`
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
  border-top-right-radius: var(--border-radius);
  border-top-left-radius: var(--border-radius);
  color: var(--accent);
  font-family: var(--font);
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
    color: var(--text);
  }

  &:active {
    background-color: var(--bg-5);
  }

  &:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const Banner = styled.div<BannerProps>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;

  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  /* When crop data exists use the stored scale/position exactly as the crop
     dialog set them. Fall back to cover+center only when there is no crop. */
  background-size: ${({ $scale }) =>
    $scale != null ? `${$scale * 100}% auto` : "cover"};
  background-position: ${({ $x, $y, $scale }) =>
    $scale != null ? `${$x ?? 50}% ${$y ?? 50}%` : "center"};

  ${({ $blurred }) => $blurred && BLUR_FILTER}
`;

export const EditProfile = styled.div`
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: ${Z_INDEX.AVATAR};

  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }: any) => theme.textPrimary};
  font-size: 24px;
`;

export const Content = styled.div`
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  max-width: 1400px;
  margin-inline: auto;
  width: 100cqw;
  height: max-content;
  display: flex;
  position: relative;
  z-index: ${Z_INDEX.DEFAULT};

  container-name: profile-content;
  container-type: inline-size;

  ${DEV_MODE_BORDER("green")}
`;

export const ContentRight = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  flex-direction: column;
  align-items: center;

  @container (max-width: 800px) {
    max-width: 100%;
    width: 100%;
    padding-inline: 0px;
  }
`;

export const ProfileDropdownMenuContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  gap: 6px;
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: ${Z_INDEX.AVATAR};
`;

export const ProfileMoreDropdownMenu = styled.div`
  ${DEV_MODE_BORDER("blue")}
  position: relative;
`;

export const ContentInner = styled.div`
  ${DEV_MODE_BORDER("blue")}
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bg-5);
  border-top: none;
  align-items: center;
  background-color: var(--bg-2);
  width: 800px;
  border-radius: 0 0 12px 12px;
  padding-top: 12px;
  gap: 2px;

  @container (max-width: 800px) {
    width: 100%;
    padding-inline: 0px;
    margin-top: 0px;
    border-radius: 0px;
    border-right: unset;
    border-left: unset;
    border-bottom: unset;
  }
`;

export const ButtonsContainer = styled.div`
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--border-radius);

  @container (max-width: 800px) {
    & {
      font-size: 12px;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: 12px;
    }
  }
`;

export const PartitionContainer = styled.div`
  width: 50cqw;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: flex-start;
  gap: 0.3rem;
  overflow-x: auto;
  padding-bottom: 10px;

  @media (max-width: 900px) {
    & {
      width: 90cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 700px) {
    & {
      width: 85cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 600px) {
    & {
      width: 86cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 550px) {
    & {
      width: 85.5cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 460px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 430px) {
    & {
      width: 82cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 415px) {
    & {
      width: 81cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 400px) {
    & {
      width: 80cqw;
      font-size: 18px;
    }
  }

  @media (max-width: 360px) {
    & {
      width: 78cqw;
      font-size: 18px;
    }
  }
`;

export const ContentContainer = styled(Container)`
  width: 95%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-inline: unset;
  padding-block: 4px;
  background-color: var(--bg-3);
  margin-bottom: 10px;
`;

export const ActivitiesContainer = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-2);
  margin-top: 10px;
  gap: 10px;

  @media (max-width: 600px) {
    gap: 12px;
  }
`;

export const AboutContainer = styled(Container)<{ $attachedTop?: boolean }>`
  width: 100%;
  margin: 0;
  border-radius: 10px;
  border: 1px solid var(--bg-5);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: var(--bg-3);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;

  /* When a song pill sits directly on top, merge with it: no top rounding and
     no doubled border between the two. */
  ${({ $attachedTop }) =>
    $attachedTop &&
    `
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  `}

  @media screen and (max-width: 800px) {
    border: none;
    border-radius: 0;
    border-top: 1px solid var(--bg-4);
    border-bottom: 1px solid var(--bg-4);
    width: 100%;

    ${({ $attachedTop }) =>
      $attachedTop &&
      `
      border-top: none;
    `}
  }
`;

/**
 * Stacks the song pill flush on top of the About section (single flex column,
 * no gap), width and side margins matching the other 95% content containers.
 */
export const MediaStack = styled.div<{ $spotify?: boolean }>`
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 6px;
  margin-bottom: 8px;
  /* Spotify embeds sit flush against About; other songs get a larger gap. */
  gap: ${({ $spotify }) => ($spotify ? "0" : "16px")};

  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

export const Wrapper = styled.div<{ $animating: boolean }>`
  white-space: pre-wrap;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
  ${({ $animating }) => $animating && "will-change: max-height;"}
`;

export const Toggle = styled.span`
  font-size: var(--font-size-small);
  margin-top: 10px;
  margin-inline-start: 10px;
  font-style: italic;
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  cursor: pointer;
  transition: color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      color: var(--accent-hover);
    }
  }

  &:active {
    color: var(--accent-active);
  }
`;

export const SubText = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 20px;
  margin-bottom: 8px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-5);
  }

  @media screen and (max-width: 800px) {
    width: 92%;
  }
`;

export const MuseSectionHeader = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 20px;
  margin-bottom: 8px;

  > span {
    white-space: nowrap;
  }

  @media screen and (max-width: 800px) {
    width: 92%;
  }
`;

export const MuseSectionRule = styled.div`
  flex: 1;
  height: 1px;
  background-color: var(--bg-5);
`;

export const AddMuseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid var(--bg-6);
  border-radius: 50px;
  background: var(--bg-3);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease,
    border-color 0.15s ease;

  svg {
    display: block;
  }

  @media (hover: hover) {
    &:hover {
      color: var(--accent);
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, var(--bg-3));
    }
  }
`;

export const SeeMoreLink = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block: 16px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-5);
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 18px;
    border: 1px solid var(--bg-6);
    border-radius: 50px;
    background: var(--bg-3);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    color: var(--text-secondary);
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    cursor: default;

    svg {
      display: block;
    }
  }

  @media (hover: hover) {
    span:hover {
      cursor: pointer;
      color: var(--accent);
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, var(--bg-3));
    }
  }

  span:active {
    background: color-mix(in srgb, var(--accent) 18%, var(--bg-3));
  }

  @container (max-width: 600px) {
    span {
      font-size: var(--font-size-xsmall);
      padding: 6px 14px;
    }
  }
`;

export const InfoTextBold = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text);
`;

export const InfoText = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  margin-block: 8px;
`;

/**
 * Desktop avatar — centered at the top of the content card, pulled up with a
 * negative margin so it overlaps the banner by ~half. In-flow (no absolute
 * hang), so everything below simply stacks beneath it with no overlap math.
 */
export const Avatar = styled(AvatarNew)`
  box-shadow: 0 0 0 6px var(--bg-2);
  background-color: var(--bg-2);
  height: 150px;
  width: 150px;
  flex-shrink: 0;

  @media (max-width: 800px) {
    display: none;
  }

  .avatar-fallback {
    font-size: var(--font-size-h1);
  }
`;

export const AvatarMobile = styled(AvatarNew)`
  box-shadow: 0 0 0 5px var(--bg-2);
  background-color: var(--bg-2);
  height: 104px;
  width: 104px;
  flex-shrink: 0;
  display: none;

  @media (max-width: 800px) {
    display: block;
  }
`;

/**
 * Header cluster lifted up so the avatar overlaps the banner. Avatar sits on
 * the left (with margin); the note bubble sits to its right; the XP badge is
 * pinned to the avatar's bottom-right corner. Width matches the 95% content
 * containers so the left margin lines up with About/MuseList below.
 */
export const AvatarHeader = styled.div`
  position: relative;
  z-index: 2;
  width: 95%;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: -84px; /* lift the cluster up into the banner */
  margin-bottom: 12px;

  @media (max-width: 800px) {
    width: 100%;
    padding-inline: 16px;
    gap: 12px;
    margin-top: -58px;
  }
`;

/** Positioning context for the avatar + its attached XP badge. */
export const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  margin-left: 8px;

  @media (max-width: 800px) {
    margin-left: 2px;
  }
`;

/** XP/Score chip attached to the avatar's bottom-right, clear of the circle. */
export const AvatarXpBadge = styled.span`
  position: absolute;
  right: 0;
  bottom: 2px;
  transform: translate(34%, 30%);
  z-index: 3;

  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 20%, var(--bg-2));
  border: 1px solid color-mix(in srgb, var(--accent) 48%, var(--bg-5));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 22%, transparent);
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--accent) 28%, var(--bg-2));
    border-color: color-mix(in srgb, var(--accent) 62%, var(--bg-5));
  }

  @media (max-width: 800px) {
    font-size: 0.6rem;
    padding: 2px 8px 2px 6px;
    transform: translate(26%, 28%);
  }
`;

export const ExtendedBadge = styled(Badge)`
  width: 30px;
  height: 30px;
  margin-bottom: 5px;
  cursor: pointer;

  & svg {
    width: 30px;
    height: 30px;
  }
  &:hover {
    & svg {
      transform: scale(1.1);
    }
  }
`;

export const NameMobile = styled.div`
  color: var(--text);
  font-size: 30px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  width: 100%;
  text-align: center;
  margin-top: 6px;

  @container profile-content (max-width: 800px) {
    & {
      font-size: 24px;
    }
  }
`;

export const UsernameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  margin-block: 2px;
  max-width: 100%;
`;

/**
 * Status note — a thought bubble sitting to the right of the avatar. The two
 * trailing dots (::before / ::after) point left, toward the avatar.
 */
export const NoteContainer = styled.div<{ $color?: string | null }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 240px;
  padding: 8px 14px;
  border-radius: 16px;
  background: ${({ $color }) =>
    $color
      ? $color
      : "linear-gradient(135deg, var(--accent-4) 0%, var(--accent-3) 100%)"};
  color: ${({ $color }) => ($color ? "#ffffff" : "inherit")};
  font-size: var(--font-size-small);
  line-height: 1.35;
  word-break: break-word;

  /* Thought-bubble trail pointing left at the avatar */
  &::before {
    content: "";
    position: absolute;
    left: -11px;
    top: 50%;
    transform: translateY(-50%);
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: ${({ $color }) => ($color ? $color : "var(--accent-3)")};
  }

  &::after {
    content: "";
    position: absolute;
    left: -21px;
    top: calc(50% + 6px);
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => ($color ? $color : "var(--accent-3)")};
  }

  @media (max-width: 800px) {
    font-size: var(--font-size-xsmall);
    max-width: 180px;
    padding: 6px 12px;
  }
`;

export const NoteEmoji = styled.span<{ $rotate?: boolean }>`
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 1;
  pointer-events: none;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.18));
  transform: ${({ $rotate }) => ($rotate ? "rotate(15deg)" : "none")};
`;

export const MusePillContainer = styled.div`
  width: 95%;
  margin-inline: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @container profile-content (max-width: 1024px) {
    & {
      gap: 0rem;
    }
  }
`;

/* Fandom chips above the character list — the distinct fandoms this novelist
   writes in, sent by the backend (the muse list itself is trimmed to 3, so
   they can't be derived client-side). Collapsed to two plus a "See all"
   toggle so a prolific novelist doesn't push the characters off screen. */
export const FandomSection = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;

  @media screen and (max-width: 800px) {
    width: 92%;
  }
`;

/** Sits above the chips to say whose fandoms these are — deliberately smaller
 *  than the chips themselves so it reads as a caption, not another chip. */
export const FandomEyebrow = styled.span`
  font-family: var(--font);
  font-size: var(--font-size-xxsmall);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FandomChipRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ProfileFandomChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  color: var(--text);
  background: ${({ $color }) =>
    `color-mix(in srgb, ${$color} 16%, transparent)`};
  border: 1px solid
    ${({ $color }) => `color-mix(in srgb, ${$color} 34%, transparent)`};

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({ $color }) => $color};
  }
`;

export const FandomSeeAllChip = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  white-space: nowrap;
  color: var(--text-secondary);
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const MuseList = styled.div`
  width: 95%;
  border-radius: 10px;
  border: 1px solid var(--bg-5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;

  @media screen and (max-width: 800px) {
    border: none;
    border-radius: 0;
    border-top: 1px solid var(--bg-4);
    border-bottom: 1px solid var(--bg-4);
    width: 100%;
  }
`;

export const FriendList = styled.div<{ maxHeight: string }>`
  width: 100%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  overflow: hidden;
  transition: max-height 0.4s ease;
  max-height: ${({ maxHeight }) => maxHeight ?? "0px"};
`;

export const MutualFriendsList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  gap: 0.2rem; // space between avatars
`;

export const FriendsButton = styled.div`
  width: 95%;
  padding-inline: 20px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: 50px;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-5);
  transition: background-color 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background-color: var(--bg-4);
      border-color: var(--bg-6);
    }
  }

  &:active {
    background-color: var(--bg-5);
  }
`;

export const FriendsButtonLabel = styled.span`
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
`;

export const FriendsAvatarStack = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: -4px;
  }

  .avatar {
    height: 28px;
    width: 28px;
  }

  .with-outline .avatar {
    outline: 4px solid var(--bg-3);
  }
`;

export const FeedTabBar = styled.div`
  display: flex;
  width: 95%;
  border-bottom: 1px solid var(--bg-5);
  margin-top: 8px;
`;

export const FeedTab = styled.button<{ $active: boolean }>`
  all: unset;
  box-sizing: border-box;
  padding: 10px 20px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: ${({ $active }) => ($active ? "var(--accent)" : "var(--text-secondary)")};
  border-bottom: 2px solid ${({ $active }) => ($active ? "var(--accent)" : "transparent")};
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: var(--text);
  }
`;

export const PostsContainer = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  @media (max-width: 600px) {
      gap: 12px;
      padding-bottom: 12px;
  }
`;

export const EmptyFeedContainer = styled.div`
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px 44px;
  gap: 10px;
`;

export const EmptyFeedTitle = styled.p`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  text-align: center;
`;

export const EmptyFeedSubtitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  text-align: center;
  max-width: 270px;
  line-height: 1.55;
`;

export const LevelStrip = styled.div`
  width: 95%;
  display: flex;
  align-items: stretch;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 12%, var(--bg-3)) 0%,
    var(--bg-3) 65%
  );
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--bg-5));
  box-shadow: 0 2px 12px color-mix(in srgb, var(--accent) 10%, transparent);
  margin-block: 6px;

  @media screen and (max-width: 800px) {
    width: 92%;
  }
`;

export const LevelTile = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px 10px;
  gap: 4px;
`;

export const LevelTileDivider = styled.div`
  width: 1px;
  background: color-mix(in srgb, var(--accent) 20%, var(--bg-5));
  margin-block: 10px;
  flex-shrink: 0;
`;

export const LevelTileLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--text-secondary);
  font-weight: 700;
`;

export const LevelTileValue = styled.div`
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

export const LevelChipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-block: 6px;
  flex-wrap: wrap;
`;

/** Centered, wrapping stat row (Friends / Characters / Joined). */
export const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 2px 18px;
  width: 100%;
  padding-inline: 16px;
  margin-block: 2px;

  @media (max-width: 800px) {
    flex-wrap: nowrap;
    justify-content: center;
    gap: 0 8px;
    padding-inline: 10px;

    svg {
      flex-shrink: 0;
      width: 13px;
      height: 13px;
    }

    ${InfoText},
    ${InfoTextBold} {
      font-size: var(--font-size-xsmall);
      margin-block: 2px;
      white-space: nowrap;
    }
  }
`;

export const LevelChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--bg-5));
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 14%, transparent);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--accent) 22%, var(--bg-3));
    border-color: color-mix(in srgb, var(--accent) 56%, var(--bg-5));
  }
`;

export const ScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, var(--bg-3));
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--bg-5));
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 14%, transparent);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--accent) 22%, var(--bg-3));
    border-color: color-mix(in srgb, var(--accent) 56%, var(--bg-5));
  }
`;

const goldShimmer = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

export const RankBadgeShimmer = styled.span`
  display: inline-flex;
  width: 80px;
  height: 25px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(251, 191, 36, 0.06) 0%,
      rgba(251, 191, 36, 0.22) 40%,
      rgba(255, 236, 153, 0.45) 50%,
      rgba(251, 191, 36, 0.22) 60%,
      rgba(251, 191, 36, 0.06) 100%
    );
    background-size: 200% 100%;
    animation: ${goldShimmer} 1.6s ease-in-out infinite;
  }
`;

export const RankBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 8px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.18) 0%,
    rgba(245, 158, 11, 0.12) 100%
  );
  border: 1px solid rgba(251, 191, 36, 0.45);
  box-shadow:
    0 0 10px rgba(251, 191, 36, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(251, 191, 36, 0.28) 0%,
      rgba(245, 158, 11, 0.2) 100%
    );
    border-color: rgba(251, 191, 36, 0.65);
  }
`;
