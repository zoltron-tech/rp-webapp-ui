"use client";

import classNames from "classnames";
import type { FC } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  novelist?: Friend | null;
  isRequest?: boolean;
};

export const SideBarFriendListItem: FC<Props> = ({
  novelist,
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
          className="selectable"
          src={novelist?.image ?? null}
          alt={novelist?.username ?? "Avatar"}
          onClick={onAvatarClick}
          username={novelist?.username}
        />
        <S.Info>
          <S.username username={novelist?.username} />
        </S.Info>
      </S.Card>
    </S.CardWrapper>
  );
};
