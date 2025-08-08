"use client";

import { useRouter } from "next/navigation";
import { FC } from "react";
import * as S from "./styles";
import { Friend } from "@/types";
import classNames from "classnames";

type Props = React.HTMLProps<HTMLDivElement> & {
  novelist?: Friend | null;
  isRequest?: boolean;
};

export const FriendListItem: FC<Props> = ({ novelist, className, ...rest }) => {
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!novelist) return;
    push(`/rp/profile/${novelist.username}`);
  };

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !novelist?.username,
        },
      ])}
      {...rest}
    >
      <S.CardBackground banner={novelist?.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !novelist?.username,
          },
        ])}
      >
        <S.Avatar
          src={novelist?.image ?? null}
          alt={""}
          size={50}
          onClick={onAvatarClick}
          hoverable
        />
        <S.Info>
          <S.username username={novelist?.username} />
        </S.Info>
      </S.Card>
    </S.CardWrapper>
  );
};
