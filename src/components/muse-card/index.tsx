"use client";
import { Muse } from "@/types/novelist";
import { FC } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { GrEdit } from "react-icons/gr";

import * as S from "./styles";
import { FaRegTrashCan } from "react-icons/fa6";
import { ShouldRender } from "../common";
import { INITIAL_MUSE } from "@/utils/constants";

type Props = {
  muse?: Muse | null;
};
export const MuseCard: FC<Props> = ({ muse }) => {
  const { push } = useRouter();

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
    <S.CardWrapper>
      <S.CardBackground banner={muse.image} />
      <S.Card className="muse-card">
        <ShouldRender if={muse != INITIAL_MUSE}>
          <S.EditButton onClick={onEditClick}>
            <GrEdit />
          </S.EditButton>
          <S.DeleteButton>
            <FaRegTrashCan />
          </S.DeleteButton>
        </ShouldRender>
        <S.CardHeader>
          <ShouldRender if={muse != INITIAL_MUSE}>
            <S.Avatar
              src={muse.image || ""}
              alt={""}
              name={"open"}
              onClick={onAvatarClick}
              hoverable
            />
          </ShouldRender>
          <ShouldRender if={muse == INITIAL_MUSE}>
            <S.Avatar
              src={
                "https://cdn.dribbble.com/users/4652895/screenshots/14493406/media/32e22691e52fd34a52337b5903c355ed.jpg"
              }
              alt={""}
              name={"open"}
              onClick={onAddClick}
              hoverable
            />
          </ShouldRender>
          <S.MuseInfo>
            <S.Title>
              {muse.firstName || "Add New"} {muse.lastName || ""}
            </S.Title>
            <ShouldRender if={muse != INITIAL_MUSE}>
              <S.Quote>{muse.note}</S.Quote>
            </ShouldRender>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
