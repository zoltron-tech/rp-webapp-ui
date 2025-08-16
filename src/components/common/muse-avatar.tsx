import { useRouter } from "next/navigation";
import { type FC, type MouseEventHandler, useCallback } from "react";
import { AvatarNew } from "./avatar-new";

type MuseAvatarProps = {
  museId: string;
  image: string;
  name: string;
};

export const MuseAvatar: FC<MuseAvatarProps> = ({ museId, image, name }) => {
  const { push } = useRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      push(`/rp/muse/${museId}`);
    },
    [museId, push],
  );

  return (
    <a onClick={handleClick} href={`/rp/muse/${museId}`}>
      <AvatarNew src={image} alt={name} />
    </a>
  );
};
