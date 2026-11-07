"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { IconType } from "react-icons";
import styled, { css } from "styled-components";

/**
 * The phone-only switcher between sections that share a tab (About = Info ·
 * Story · Canon, Social = Posts · Peers). The page decides what it is; each
 * section draws it inside its card, just under the name header, through
 * [SectionSwitcherSlot]. Null everywhere else, so desktop and single-section
 * tabs render nothing.
 */
export const SectionSwitcherContext = createContext<ReactNode>(null);

export function SectionSwitcherSlot() {
  return <>{useContext(SectionSwitcherContext)}</>;
}

/**
 * Non-null while a phone tab shows its switcher. Sections that normally draw
 * their own header then use the shared mini header instead, so switching
 * between Info, Story and Canon never moves or resizes the top of the card.
 */
export const useSectionSwitcher = () => useContext(SectionSwitcherContext);

export type SwitcherOption = {
  key: string;
  label: string;
  icon: IconType;
};

type Props = {
  label: string;
  options: SwitcherOption[];
  active: string;
  /**
   * The option that was showing before this one. Every section draws its own
   * card, so the switcher is a fresh element after each switch; it starts its
   * highlight here and slides to [active], like the side menu's pill.
   */
  from?: string | null;
  accent?: string | null;
  onSelect: (key: string) => void;
};

export function SectionSwitcher({
  label,
  options,
  active,
  from,
  accent,
  onSelect,
}: Props) {
  const indexOf = (key?: string | null) =>
    Math.max(
      0,
      options.findIndex((o) => o.key === key),
    );
  const target = indexOf(active);
  const [shown, setShown] = useState(() =>
    from && options.some((o) => o.key === from) ? indexOf(from) : target,
  );
  const [animate, setAnimate] = useState(false);

  // Paint once where the previous section was, then let the pill travel.
  useEffect(() => {
    if (shown === target) return;
    const frame = requestAnimationFrame(() => {
      setAnimate(true);
      setShown(target);
    });
    return () => cancelAnimationFrame(frame);
  }, [shown, target]);

  return (
    <Track
      role="tablist"
      aria-label={label}
      $count={options.length}
      $accent={accent}
    >
      <Pill
        aria-hidden="true"
        $animate={animate}
        style={{ transform: `translateX(${shown * 100}%)` }}
      />
      {options.map(({ key, label: name, icon: Icon }) => (
        <Option
          key={key}
          type="button"
          role="tab"
          aria-selected={key === active}
          onClick={() => key !== active && onSelect(key)}
        >
          <Icon aria-hidden="true" />
          <span>{name}</span>
        </Option>
      ))}
    </Track>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const Track = styled.div<{ $count: number; $accent?: string | null }>`
  --switch-accent: ${({ $accent }) =>
    $accent && $accent.trim() !== "" ? $accent : "var(--accent)"};
  --switch-count: ${({ $count }) => $count};
  position: relative;
  flex-shrink: 0;
  display: flex;
  width: 100%;
  box-sizing: border-box;
  margin: 8px 0 2px;
  padding: 3px;
  border-radius: 999px;
  /* Soft: a faint well, no hard rim. */
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
`;

const Pill = styled.span<{ $animate: boolean }>`
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / var(--switch-count));
  border-radius: 999px;
  background: color-mix(in srgb, var(--switch-accent) 30%, rgba(255, 255, 255, 0.04));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 14px color-mix(in srgb, var(--switch-accent) 24%, transparent);
  pointer-events: none;
  ${({ $animate }) =>
    $animate &&
    css`
      transition: transform 0.38s ${EASE};
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Option = styled.button`
  all: unset;
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.25s ease;

  svg {
    flex-shrink: 0;
    width: 13px;
    height: 13px;
    opacity: 0.85;
    transition: transform 0.38s ${EASE};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.85);
  }

  &[aria-selected="true"] {
    color: #fff;

    svg {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--switch-accent);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    svg {
      transition: none;
    }
  }
`;
