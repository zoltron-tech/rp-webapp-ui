"use client";

import { Button, ShouldRender } from "@/components/common";
import { useRouter } from "next/navigation";
import { FC } from "react";
import * as S from "./styles";
import { Novelist } from "@/types";
import classNames from "classnames";

type Props = React.HTMLProps<HTMLDivElement> & {
  novelist?: Novelist | null;
  isRequest?: boolean;
};

export const StrangerCard: FC<Props> = ({
  novelist,
  isRequest,
  className,
  ...rest
}) => {
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
          size={150}
          onClick={onAvatarClick}
          hoverable
        />
        <S.Info>
          <S.Title>{novelist?.firstName}</S.Title>
          <S.username username={novelist?.username} />
        </S.Info>
        <S.ButtonContainer>
          <ShouldRender if={isRequest !== true}>
            <Button variant="primary">Add Friend</Button>
          </ShouldRender>
          <ShouldRender if={isRequest === true}>
            <Button variant="positive">Accept</Button>
            <Button variant="negative">Decline</Button>
          </ShouldRender>
        </S.ButtonContainer>
      </S.Card>
    </S.CardWrapper>
  );
};
