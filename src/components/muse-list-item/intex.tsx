"use client";
import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import type { Muse } from "@/types";
import { Avatar } from "../common";
import * as S from "./styles";

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
          src={muse?.image ?? null}
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
