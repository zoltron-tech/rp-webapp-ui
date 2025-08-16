"use client";
import classNames from "classnames";
import { useParams, useRouter } from "next/navigation";
import type { FC } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { useGlobalState } from "@/context/store/stores";
import type { Muse } from "@/types/novelist";
import { INITIAL_MUSE } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse?: Muse | null;
};
export const MuseCard: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();
  const params = useParams();

  const user = useGlobalState("user");

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
      <S.CardBackground banner={muse.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !muse.firstName,
          },
        ])}
        onClick={(e) => handleCardClick(e, muse)}
      >
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
            <S.Title
              className={classNames([
                {
                  new: !muse.firstName,
                },
              ])}
            >
              {muse.firstName || "Add New"} {muse.lastName || ""}
            </S.Title>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};

export default MuseCard;
