import { FC, forwardRef, HTMLProps } from "react";
import * as S from "./styled";
import { Avatar } from "radix-ui";
import classNames from "classnames";

type AvatarProps = Omit<HTMLProps<HTMLSpanElement>, "src"> & {
  src: string | null;
  alt: string;
};

export const AvatarNew: FC<AvatarProps> = forwardRef(
  ({ src, alt, className, ...rest }, forwardedRef) => {
    return (
      <S.AvatarRoot
        {...rest}
        className={classNames("avatar", className)}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image className="avatar-image" src={src || ""} alt={alt} />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {alt.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </S.AvatarRoot>
    );
  }
);
