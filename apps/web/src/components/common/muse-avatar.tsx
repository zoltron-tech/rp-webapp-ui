import type { NWImage } from "@nw/types";
import { type FC, type MouseEventHandler, useCallback } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { MuseEmbed } from "../muse-embed";
import { SourcePreview } from "../source-preview";
import { AvatarNew } from "./avatar-new";

type MuseAvatarProps = {
  museId: string;
  image: string;
  name: string;
  /** When provided (with valid crop data), renders using background-image
   *  positioning. Falls back to `image` when null/absent. */
  avatar?: NWImage | null;
  useAccent?: boolean;
  accent?: string | null;
  /** Post headers: open a mini preview of the muse instead of routing. Its
   *  Visit profile button does the routing. */
  preview?: boolean;
};

export const MuseAvatar: FC<MuseAvatarProps> = ({
  museId,
  image,
  name,
  avatar,
  useAccent,
  accent,
  preview = false,
}) => {
  const { routeToPage } = usePageRouter();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      routeToPage(ROUTES.Muse.View(museId));
    },
    [museId, routeToPage],
  );

  const accentColor = useAccent && accent ? accent : null;

  if (preview && museId) {
    return (
      <SourcePreview
        label={`Preview ${name}`}
        preview={
          <MuseEmbed
            museId={museId}
            preview
            fallbackName={name}
            fallbackAccent={accentColor}
          />
        }
      >
        <AvatarNew
          src={image}
          alt={name}
          nwImage={avatar}
          accentColor={accentColor}
        />
      </SourcePreview>
    );
  }

  return (
    <a onClick={handleClick} href={ROUTES.Muse.View(museId)}>
      <AvatarNew src={image} alt={name} nwImage={avatar} accentColor={accentColor} />
    </a>
  );
};
