import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "./avatar-new";

type NovelistAvatarProps = {
  username: string;
  image: string;
  name: string;
};

export const NovelistAvatar: FC<NovelistAvatarProps> = ({
  username,
  image,
  name,
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
      <AvatarNew src={image} alt={name} username={username}/>
    </a>
  );
};
