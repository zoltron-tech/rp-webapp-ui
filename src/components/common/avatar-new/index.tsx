import { FC, forwardRef, HTMLProps } from "react";
import * as S from "./styled";
import { Avatar } from "radix-ui";

type AvatarProps = HTMLProps<HTMLSpanElement> & {
  src: string;
  alt: string;
};

export const AvatarNew: FC<AvatarProps> = forwardRef(
  ({ src, alt, ...rest }, forwardedRef) => {
    return (
      <S.AvatarRoot
        className="avatar"
        {...rest}
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
      >
        <Avatar.Image className="avatar-image" src={src} alt={alt} />
        <Avatar.Fallback className="avatar-fallback" delayMs={600}>
          {alt.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </S.AvatarRoot>
    );
  }
);
