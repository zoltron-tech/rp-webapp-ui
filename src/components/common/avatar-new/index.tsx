import classNames from "classnames";
import { Avatar } from "radix-ui";
import { type FC, forwardRef, type HTMLProps, useMemo } from "react";
import * as S from "./styled";

type AvatarProps = Omit<HTMLProps<HTMLSpanElement>, "src"> & {
  src: string | null;
  alt: string;
  placeholder?: string;
};

export const AvatarNew: FC<AvatarProps> = forwardRef(
  ({ src, alt, className, placeholder = "", ...rest }, forwardedRef) => {
    const fallbackText = useMemo(() => {
      if (placeholder) return placeholder;

      return alt.charAt(0).toUpperCase();
    }, [placeholder, alt]);
    return (
      <S.AvatarRoot
        {...rest}
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
