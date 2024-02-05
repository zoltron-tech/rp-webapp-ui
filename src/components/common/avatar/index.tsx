import { FC } from "react";

import classNames from "classnames";
import Image from "next/image";
import * as S from "./styles";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  size?: number;
  name?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
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
  return (
    <S.Avatar className={classNames([className, { hoverable }])} {...rest}>
      <Image src={src || ""} alt={alt} width={size} height={size} />
      {name && hoverable && <S.Name>{name}</S.Name>}
    </S.Avatar>
  );
};
