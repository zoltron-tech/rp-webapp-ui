import { FC } from "react";

import classNames from "classnames";
import Image from "next/image";
import * as S from "./styles";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  name?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  width,
  height,
  name,
  className,
  hoverable = false,
}) => {
  return (
    <S.Avatar
      className={classNames([className, { hoverable }])}
      width={width}
      height={height}
    >
      <Image src={src} alt={alt} width={width} height={height} />
      {name && hoverable && <S.Name>{name}</S.Name>}
    </S.Avatar>
  );
};
