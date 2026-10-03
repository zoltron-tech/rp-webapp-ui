"use client";

import type { Friend } from "@nw/types";
import classNames from "classnames";
import type { FC } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
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
      <S.Avatar
        className="selectable"
        src={novelist?.image ?? null}
        alt={novelist?.username ?? "Avatar"}
        onClick={onAvatarClick}
        username={novelist?.username}
      />
    </S.CardWrapper>
  );
};
