"use client";

import type { Novelist } from "@nw/types";
import classNames from "classnames";
import type { FC } from "react";
import { Button, ShouldRender } from "@/components/common";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

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
  const { routeToPage } = usePageRouter();

  const onAvatarClick = () => {
    if (!novelist) return;
    routeToPage(ROUTES.Profile.View(novelist.username).Index);
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
            <Button variant="primary" onClick={onAvatarClick}>
              View Profile
            </Button>
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
