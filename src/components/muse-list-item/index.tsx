"use client";
import classNames from "classnames";
import type { FC } from "react";
import { FiChevronRight } from "react-icons/fi";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse: Muse | undefined;
};

export const MuseListItem: FC<Props> = ({ muse, className, ...rest }) => {
  const { routeToPage } = usePageRouter();

  const onAvatarClick = () => {
    if (!muse) return;
    routeToPage(ROUTES.Muse.View(muse.id || ""));
  };

  if (!muse) return <></>;

  return (
    <S.MuseContainer
      onClick={onAvatarClick}
      className={classNames(["muse-list-item", className])}
      {...rest}
    >
      <AvatarNew
        className="avatar"
        src={muse?.image ?? null}
        alt={muse?.firstName ?? "Muse"}
        name="open"
        onClick={onAvatarClick}
      />
      <S.MuseInfo>
        <S.MuseName>
          {muse.firstName} <S.MuseSubname>{muse.lastName}</S.MuseSubname>
        </S.MuseName>
      </S.MuseInfo>
      <FiChevronRight size={18} color="var(--text-secondary)" />
    </S.MuseContainer>
  );
};

export default MuseListItem;
