import type { NWImage } from "@nw/types";
import { ACCENT_MAP, type Accent } from "@nw/types/theme";
import classNames from "classnames";
import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "./avatar-new";

type NovelistAvatarProps = {
  username: string;
  image: string;
  name: string;
  /** When provided (with valid crop data), renders using background-image
   *  positioning. Falls back to `image` when null/absent. */
  avatar?: NWImage | null;
  useAccent?: boolean;
  /** Palette key as a string (e.g. "0", "1"). Resolved via ACCENT_MAP to apply
   *  the correct CSS class so `var(--accent)` resolves to the novelist's color. */
  accent?: string | null;
};

export const NovelistAvatar: FC<NovelistAvatarProps> = ({
  username,
  image,
  name,
  avatar,
  useAccent,
  accent,
}) => {
  const { routeToPage } = usePageRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(ROUTES.Profile.View(username).Index);
    },
    [username, routeToPage],
  );

  const paletteClass =
    useAccent && accent != null
      ? (ACCENT_MAP[Number(accent) as Accent] ?? null)
      : null;

  return (
    <a
      onClick={handleClick}
      href={ROUTES.Profile.View(username).Index}
      className={classNames(paletteClass)}
    >
      <AvatarNew
        src={image}
        alt={name}
        username={username}
        nwImage={avatar}
        accentColor={paletteClass ? "var(--accent)" : null}
      />
    </a>
  );
};
