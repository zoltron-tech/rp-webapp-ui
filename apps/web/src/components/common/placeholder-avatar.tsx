import classNames from "classnames";
import { type FC, memo } from "react";
import { AvatarRoot } from "./avatar-new/styled";

type Props = {
  /** The placeholder label, e.g. "A Quiet Novelist"; read out as the avatar's name. */
  label: string;
  className?: string;
};

/**
 * The avatar of a disabled author's stand-in (ACCOUNT_DISABLE_PLAN.md §6.3):
 * a neutral silhouette, no accent ring, no online dot, no hover card, and not
 * a link. Use it wherever a source has `isPlaceholder` (or a chat member has
 * `isDisabled`), instead of AvatarNew, NovelistAvatar or MuseAvatar — those
 * fall back to the first letter of the name, which for a placeholder is a
 * misleading "A".
 *
 * It is the same root as AvatarNew and carries its `avatar` class, so the
 * sizes callers set on `.avatar` apply unchanged.
 */
export const PlaceholderAvatar: FC<Props> = memo(({ label, className }) => (
  <AvatarRoot
    aria-label={label}
    className={classNames("avatar", className)}
    role="img"
  >
    <svg
      aria-hidden="true"
      focusable="false"
      height="100%"
      viewBox="0 0 24 24"
      width="100%"
      style={{ color: "var(--text-secondary)", opacity: 0.55 }}
    >
      <circle cx="12" cy="9" fill="currentColor" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
    </svg>
  </AvatarRoot>
));

PlaceholderAvatar.displayName = "PlaceholderAvatar";
