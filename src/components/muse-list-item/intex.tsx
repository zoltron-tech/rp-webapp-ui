"use client";
import { Muse } from "@/types";
import * as S from "./styles";
import { FC } from "react";
import { Container, Flex } from "@novelist-world/ui";
import { Avatar } from "../common";
import classNames from "classnames";
import { useRouter } from "next/navigation";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse: Muse | undefined;
};

export const MuseListItem: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!muse) return;
    push(`/rp/muse/${muse.id}`);
  };

  if (!muse) return <></>;

  return (
    <S.MuseContainer onClick={onAvatarClick}>
      <Flex justify="flex-start">
        <Avatar
          src={muse?.image || ""}
          alt=""
          size={50}
          name="open"
          onClick={onAvatarClick}
          hoverable
        />
        <S.MuseName>
          {muse.firstName}{" "}
          <span className={classNames(["muse-last-name"])}>
            {muse.lastName}
          </span>
        </S.MuseName>
      </Flex>
    </S.MuseContainer>
  );
};

export default MuseListItem;
