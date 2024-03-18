"use client";
import { Muse } from "@/types/novelist";
import { FC } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { GrEdit } from "react-icons/gr";
import * as S from "./styles";
import { FaRegTrashCan } from "react-icons/fa6";

type Props = {
  muse?: Muse | null;
};
export const MuseCard: FC<Props> = ({ muse }) => {
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!muse) return;
    push(`/rp/muse/${muse.id}`);
  };

  const onEditClick = () => {
    push(`/rp/profile/muses/edit/${muse?.id}`);
  };

  Logger.info("MuseCard rendered");

  if (!muse) return <></>;

  return (
    <S.CardWrapper>
      <S.CardBackground banner={muse.image} />
      <S.Card className="muse-card">
        <S.EditButton onClick={onEditClick}>
          <GrEdit />
        </S.EditButton>
        <S.DeleteButton>
          <FaRegTrashCan />
        </S.DeleteButton>
        <S.CardHeader>
          <S.Avatar
            src={muse.image || ""}
            alt={""}
            size={200}
            name={"open"}
            onClick={onAvatarClick}
            hoverable
          />
          <S.MuseInfo>
            <S.Title>
              {muse.firstName} {muse.lastName}
            </S.Title>
            <S.username username={muse.pennedBy?.username} />
            <S.Quote>{muse.note}</S.Quote>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
