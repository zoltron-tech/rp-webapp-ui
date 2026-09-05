import styled, { css, keyframes } from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";
import {
  BASE_TRANSITION,
  DEV_MODE_BORDER,
  NO_USER_SELECT,
  Z_INDEX,
} from "@/theme";

/* The bar chrome, in three states.
 *
 * Default (app pages): a translucent glass sheet over the page rather than the
 * old opaque `--bg-3` slab with a 5px drop shadow. At 60px tall that shadow
 * read as a hard edge sitting on top of the content; a hairline plus blur
 * keeps the bar attached to the page instead.
 *
 * `$overlay` (the /rp/novelists landing): the bar leaves the flow entirely and
 * floats over the hero, so the animated backdrop runs unbroken to the top of
 * the viewport. The hero already reserves 64-168px of top padding, so nothing
 * ends up underneath it. It also carries the dark theme classes (see index),
 * because the landing hero is hard-dark whatever palette the reader has set.
 *
 * `$scrolled`: once the hero is behind you the overlay picks up the same glass
 * as everywhere else, so the bar never sits on unreadable content. */
const glass = css`
  background-color: color-mix(in srgb, var(--bg-3) 80%, transparent);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-bottom-color: color-mix(in srgb, var(--accent-8) 24%, transparent);
  box-shadow: 0 1px 22px rgba(0, 0, 0, 0.26);

  /* Older engines paint nothing behind the blur, which would leave the bar
     see-through over real content. */
  @supports not (
    (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))
  ) {
    background-color: var(--bg-3);
  }
`;

export const Container = styled.div<{
  $overlay?: boolean;
  $scrolled?: boolean;
}>`
  align-items: center;
  position: ${({ $overlay }) => ($overlay ? "fixed" : "sticky")};
  top: 0;
  left: 0;
  right: 0;
  margin-inline: auto;
  display: flex;
  justify-content: space-between;
  /* Pages pin their own rails at top: var(--topbar-height), so the bar has to
     be exactly that tall. box-sizing is border-box app-wide, so the hairline
     sits inside the height instead of adding a 1px seam under the bar. */
  height: var(--topbar-height);
  border-bottom: 1px solid transparent;
  z-index: ${Z_INDEX.TOPBAR};
  transition-property: background-color, border-color, box-shadow,
    backdrop-filter, -webkit-backdrop-filter;
  ${BASE_TRANSITION}

  ${({ $overlay, $scrolled }) =>
    $overlay && !$scrolled
      ? css`
          background-color: transparent;
          box-shadow: none;
        `
      : glass}
`;

export const Bar = styled.div<{ $overlay?: boolean }>`
  position: sticky;
  top: 0px;
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 clamp(14px, 3vw, 28px);
  container-name: top-bar;
  container-type: size;
  z-index: ${Z_INDEX.TOPBAR};

  /* Floating over the landing hero, the bar takes the hero own content box
     (1180px plus the same gutter) instead of the 1400px app column, so the
     logo starts on the vertical the eyebrow and headline start on rather than
     sitting 80px further out. */
  ${({ $overlay }) =>
    $overlay &&
    css`
      max-width: calc(1180px + 2 * clamp(20px, 5vw, 48px));
      padding-inline: clamp(20px, 5vw, 48px);

      @media (max-width: 640px) {
        padding-inline: 20px;
      }

      @media (max-width: 420px) {
        padding-inline: 16px;
      }
    `}
`;
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  text-decoration: none;
  cursor: pointer;
  /* The wordmark is the one part of the bar that can afford to give ground:
     the actions on the right are all hit targets and must keep their size, so
     this yields first rather than pushing Log In past the gutter. */
  min-width: 0;
  flex-shrink: 1;
`;

export const Logo = styled.div`
  height: var(--font-size-h2);
  width: var(--font-size-h2);
  display: flex;
  align-items: center;
  ${NO_USER_SELECT}

  @media screen and (max-width: 480px) {
    height: var(--font-size-h3);
    width: var(--font-size-h3); 
  }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  27.6% { opacity: 0.99; }
  62% { opacity: 0.999; }
  83.2% { opacity: 1; }
  100% { opacity: 1; }
`;

export const LogoText = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 400;
  font-style: italic;
  ${NO_USER_SELECT}

  
  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

    @media (max-width: 700px) {
    &.searchBarExpanded {
      opacity: 0;
    }
  }

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-h6);
    }
  }

      @container (max-width: 430px) {
    & {
    font-size: var(--font-size-input);
    }
  }

  /* The 375px baseline: at 16px the wordmark alone eats half the bar, which
     is what pushed Log In off-screen once the palette trigger joined the row. */
  @container (max-width: 400px) {
    & {
      font-size: var(--font-size);
      margin-left: 3px;
    }
  }
`;

export const LogoTextSuffix = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
  font-size: 24px;
  font-weight: 700;
  font-style: italic;
  color: var(--accent-8);
  ${NO_USER_SELECT}
  opacity: 0;
  animation: ${fadeIn} 0.75s ease-in-out forwards 0.6s;

  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

    @media (max-width: 700px) {
    &.searchBarExpanded {
      opacity: 0;
    }
  }

  @container (max-width: 600px) {
    & {
    font-size: var(--font-size-h6);
    }
  }

    @container (max-width: 430px) {
    & {
    font-size: var(--font-size-input);
    }
  }

  @container (max-width: 400px) {
    & {
      font-size: var(--font-size);
      margin-left: 3px;
    }
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  ${DEV_MODE_BORDER("red")}
`;

export const SearchDropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  height: 40px;
  padding: 10px 20px;
  cursor: pointer;
  ${NO_USER_SELECT}
`;

export const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  /* Takes the row minus the arrow, and may shrink below its content so the
     name can be clipped instead of running past the panel edge. */
  flex: 1;
  min-width: 0;

  .avatar {
    width: 50px;
    height: 50px;
  }
`;

export const NameContainer = styled.div`
  display: flex;
  align-items: start;
  justify-content: center;
  gap: 5;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;

  /* A long username (@MollyMarieTorricelli) ran off the right edge of the
     dropdown at 375. */
  & > * {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > div:nth-child(1) {
    font-size: 14px;
    font-weight: 500;
  }

  & > div:nth-child(2) {
    font-size: 12px;
    font-weight: 300;
  }
`;

export const PennedBy = styled.span`
  max-width: 100%;
  font-size: var(--font-size-xsmall);
  font-weight: 300;
  color: var(--text-secondary, inherit);
  opacity: 0.75;
`;

export const SearchAvatar = styled(AvatarNew)``;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(12px, 1.8vw, 22px);
  /* Every child here is a hit target; the wordmark shrinks instead. */
  flex-shrink: 0;

  @media (max-width: 700px) {
    gap: 10px;

    &.searchBarExpanded {
      gap: 0px;
    }
  }

  @media (max-width: 420px) {
    gap: 6px;
  }
`;

export const ButtonsContainerDesktop = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  /* Was a hard width, which made the label fit a guessed box. The collapse
     when the mobile search expands still animates, because a max-width can be
     transitioned where an auto width cannot. */
  max-width: 220px;
  transition-property: max-width, gap, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  /* Log In is the one call to action up here, so it echoes the hero primary
     pill instead of the default app button shape. */
  .button.primary {
    border-radius: 999px;
    padding: 9px 20px;
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.3px;
    box-shadow: 0 6px 18px -8px var(--accent);
    transition: transform 0.18s ease, box-shadow 0.18s ease,
      background-color 0.2s ease-in-out;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px -8px var(--accent);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    .button.primary {
      padding: 8px 16px;
    }
  }

  @media (max-width: 700px) {
    &.searchBarExpanded {
      max-width: 0px;
      gap: 0px;
      opacity: 0;
      /* Only while collapsed. The user menu panel is positioned against the
         avatar, which lives in here, so a permanent clip would cut the panel
         off at the edge of this box and the menu would never appear. */
      overflow: hidden;
      /* Clipped to nothing, so it must not stay clickable. */
      pointer-events: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .button.primary {
      transition: background-color 0.2s ease-in-out;

      &:hover {
        transform: none;
      }
    }
  }
`;

export const ButtonsContainerLoggedInDesktop = styled(ButtonsContainerDesktop)`
  /* Notifications + avatar, both in the flow now, so this is a real box that
     measures its contents instead of a spacer sized to match two hard-coded
     right offsets. */
  max-width: 160px;
  gap: 12px;
`;
