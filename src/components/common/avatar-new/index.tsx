import classNames from "classnames";
import { Avatar } from "radix-ui";
import { type FC, forwardRef, type HTMLProps, useMemo } from "react";
import { useSocket } from "@/context/socket";
import * as S from "./styled";

type AvatarProps = Omit<HTMLProps<HTMLSpanElement>, "src"> & {
  src: string | null;
  alt: string;
  placeholder?: string;
  /** When provided the avatar shows a green online indicator if this username
   *  is present in the latest socket heartbeat payload. */
  username?: string;
};

export const AvatarNew: FC<AvatarProps> = forwardRef(
  ({ src, alt, className, placeholder = "", username, ...rest }, forwardedRef) => {
    const fallbackText = useMemo(() => {
      if (placeholder) return placeholder;
      return alt.charAt(0).toUpperCase();
    }, [placeholder, alt]);

    const { onlineUsernames } = useSocket();
    const isOnline = !!username && onlineUsernames.includes(username);

    return (
      <S.AvatarRoot
        {...rest}
        $online={isOnline}
        className={classNames("avatar", className)}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image className="avatar-image" src={src || ""} alt={alt} />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {fallbackText}
        </Avatar.Fallback>
      </S.AvatarRoot>
    );
  },
);
