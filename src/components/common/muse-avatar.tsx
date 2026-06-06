import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import type { NWImage } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "./avatar-new";

type MuseAvatarProps = {
  museId: string;
  image: string;
  name: string;
  /** When provided (with valid crop data), renders using background-image
   *  positioning. Falls back to `image` when null/absent. */
  avatar?: NWImage | null;
};

export const MuseAvatar: FC<MuseAvatarProps> = ({
  museId,
  image,
  name,
  avatar,
}) => {
  const { routeToPage } = usePageRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(ROUTES.Muse.View(museId));
    },
    [museId, routeToPage],
  );

  return (
    <a onClick={handleClick} href={ROUTES.Muse.View(museId)}>
      <AvatarNew src={image} alt={name} nwImage={avatar} />
    </a>
  );
};
