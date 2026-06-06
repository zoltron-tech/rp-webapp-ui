import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import type { NWImage } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "./avatar-new";

type NovelistAvatarProps = {
  username: string;
  image: string;
  name: string;
  /** When provided (with valid crop data), renders using background-image
   *  positioning. Falls back to `image` when null/absent. */
  avatar?: NWImage | null;
};

export const NovelistAvatar: FC<NovelistAvatarProps> = ({
  username,
  image,
  name,
  avatar,
}) => {
  const { routeToPage } = usePageRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(ROUTES.Profile.View(username).Index);
    },
    [username, routeToPage],
  );

  return (
    <a onClick={handleClick} href={ROUTES.Profile.View(username).Index}>
      <AvatarNew src={image} alt={name} username={username} nwImage={avatar} />
    </a>
  );
};
