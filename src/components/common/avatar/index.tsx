"use client";

import classNames from "classnames";
import Image from "next/image";
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
  quality?: number;
}

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size = 100,
  quality = 100,
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
      <Image
        src={src || ""}
        alt={alt}
        width={size}
        height={size}
        quality={quality}
      />
      {name && hoverable && <S.Name>{name}</S.Name>}
    </S.Avatar>
  );
};
