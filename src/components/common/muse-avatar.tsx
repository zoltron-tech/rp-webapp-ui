import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "./avatar-new";

type MuseAvatarProps = {
  museId: string;
  image: string;
  name: string;
};

export const MuseAvatar: FC<MuseAvatarProps> = ({ museId, image, name }) => {
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
      <AvatarNew src={image} alt={name} />
    </a>
  );
};
