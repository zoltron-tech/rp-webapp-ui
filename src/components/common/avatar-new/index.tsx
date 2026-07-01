import classNames from "classnames";
import { Avatar } from "radix-ui";
import { type FC, forwardRef, type HTMLProps, useMemo } from "react";
import { useSocket } from "@/context/socket";
import { useGlobalState } from "@/context/store/stores";
import type { NWImage } from "@/types";
import * as S from "./styled";

type AvatarProps = Omit<HTMLProps<HTMLSpanElement>, "src"> & {
  src: string | null;
  alt: string;
  placeholder?: string;
  /** When provided the avatar shows a green online indicator if this username
   *  is present in the latest socket heartbeat payload. */
  username?: string;
  /** When provided (with valid crop data), renders the avatar using
   *  background-image positioning instead of a plain <img> tag. */
  nwImage?: NWImage | null;
  /** When provided, renders a colored ring around the avatar. For muse sources
   *  this is the hex accent color; for novelist sources pass `"var(--accent)"`
   *  within a wrapping element that has the palette class applied. */
  accentColor?: string | null;
};

export const useIsOnline = (username: string | undefined): boolean => {
  const { onlineUsernames, isConnected } = useSocket();
  const currentUser = useGlobalState("user");
  return (
    !!username &&
    (onlineUsernames.includes(username) ||
      (isConnected && username === currentUser?.username))
  );
};

export const AvatarNew: FC<AvatarProps> = forwardRef(
  (
    { src, alt, className, placeholder = "", username, nwImage, accentColor, ...rest },
    forwardedRef,
  ) => {
    const fallbackText = useMemo(() => {
      if (placeholder) return placeholder;
      return alt.charAt(0).toUpperCase();
    }, [placeholder, alt]);

    const isOnline = useIsOnline(username);

    const crop = nwImage?.crop;
    const hasCrop = crop && crop.width > 0 && crop.width <= 300;
    const effectiveSrc = nwImage?.src || src || "";

    if (hasCrop && effectiveSrc) {
      // Stored x/y are 0–100 CSS background-position percentages and width is
      // the zoom encoded as scale*100. Render with `background-size: w% auto`
      // (fit by width) and `background-position: x% y%` — exactly the model the
      // crop dialog previews, so the avatar matches the user's adjustment at
      // any size, independent of the image's aspect ratio.
      const scale = crop.width / 100;

      return (
        <S.AvatarRoot
          {...rest}
          $online={isOnline}
          $accentColor={accentColor}
          className={classNames("avatar", className)}
          ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
        >
          <S.NWImageLayer
            $src={effectiveSrc}
            $x={crop.x}
            $y={crop.y}
            $scale={scale}
          />
        </S.AvatarRoot>
      );
    }

    return (
      <S.AvatarRoot
        {...rest}
        $online={isOnline}
        $accentColor={accentColor}
        className={classNames("avatar", className)}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image className="avatar-image" src={effectiveSrc} alt={alt} />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {fallbackText}
        </Avatar.Fallback>
      </S.AvatarRoot>
    );
  },
);
