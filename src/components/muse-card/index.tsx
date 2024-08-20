"use client";
import { Muse } from "@/types/novelist";
import { FC } from "react";

import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { GrEdit } from "react-icons/gr";

import * as S from "./styles";
import { FaRegTrashCan } from "react-icons/fa6";
import { ShouldRender } from "../common";
import { INITIAL_MUSE } from "@/utils/constants";
import { useAuthContext } from "@/hooks";
import classNames from "classnames";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse?: Muse | null;
};
export const MuseCard: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();
  const params = useParams();
  console.log("params", params);
  const { user } = useAuthContext();
  const username = params?.slug as string;
  const isCurrentUser = user?.username && user.username === username;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, muse: Muse) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !muse.firstName ? onAddClick() : onAvatarClick();
  };

  const onAvatarClick = () => {
    if (!muse) return;
    push(`/rp/muse/${muse.id}`);
  };

  const onAddClick = () => {
    if (!muse) return;
    push(`/rp/profile/muses/create`);
  };

  const onEditClick = () => {
    push(`/rp/profile/muses/edit/${muse?.id}`);
  };

  Logger.info("MuseCard rendered");

  if (!muse) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !muse.firstName,
        },
      ])}
      {...rest}
    >
      <S.CardBackground banner={muse.image} />
      <S.Card className="muse-card" onClick={(e) => handleCardClick(e, muse)}>
        <ShouldRender if={muse !== INITIAL_MUSE && !!isCurrentUser}>
          <S.EditButton className="button" onClick={onEditClick}>
            <GrEdit />
          </S.EditButton>
          <S.DeleteButton className="button">
            <FaRegTrashCan />
          </S.DeleteButton>
        </ShouldRender>
        <S.CardHeader>
          <S.MuseInfo>
            <S.Title>
              {muse.firstName || "Add New"} {muse.lastName || ""}
            </S.Title>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
