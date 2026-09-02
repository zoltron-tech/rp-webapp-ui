"use client";

import classNames from "classnames";
import type { FC } from "react";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string | null;
  alt: string;
  size?: number;
  name?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  /**
   * Accepted for call-site compatibility and ignored. next/image used it to
   * pick a compression level; the wsrv.nl proxy owns that now (`q` in
   * @nw/utils/image), and it is applied when the URL is built, not here.
   */
  quality?: number;
}

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size = 100,
  name,
  className,
  hoverable = false,
  ...rest
}) => {
  Logger.info("Avatar rendered");

  return (
    <S.Avatar
      data-size={size}
      className={classNames([className, { hoverable }])}
      {...rest}
    >
      {/* Plain <img>: these avatars already go through the wsrv.nl proxy,
          which does the resizing and format conversion next/image would have.
          `object-fit` and the circular crop come from AVATAR_IMAGE in
          theme/common.styled.ts, which targets `img` and is unchanged. */}
      <img src={src || ""} alt={alt} width={size} height={size} />
      {name && hoverable && <S.Name>{name}</S.Name>}
    </S.Avatar>
  );
};
