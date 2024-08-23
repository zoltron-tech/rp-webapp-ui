"use client";

import { Button, ShouldRender } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { useAuthContext } from "@/hooks";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import * as S from "./styles";
import { Novelist } from "@/types";
import classNames from "classnames";
import { sendFriendRequest } from "@/app/rp/profile/actions";

type Props = React.HTMLProps<HTMLDivElement> & {
  novelist?: Novelist | null;
};

export const StrangerCard: FC<Props> = ({ novelist, className, ...rest }) => {
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
        onClick={() => onAvatarClick()}
      >
        <S.Avatar
          src={novelist?.image || ""}
          alt={""}
          size={150}
          onClick={onAvatarClick}
          hoverable
        />
        <S.Info>
          <S.Title>{novelist?.firstName}</S.Title>
          <S.username username={novelist?.username} />
        </S.Info>
        <S.ButtonContainer>
          <Button variant="secondary">Add Friend</Button>
        </S.ButtonContainer>
      </S.Card>
    </S.CardWrapper>
  );
};
