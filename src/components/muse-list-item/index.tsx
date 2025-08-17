"use client";
import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { Avatar } from "../common";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse: Muse | undefined;
};

export const MuseListItem: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!muse) return;
    push(ROUTES.Muse.View(muse.id || ""));
  };

  if (!muse) return <></>;

  return (
    <S.MuseContainer
      onClick={onAvatarClick}
      className={classNames(["muse-list-item", className])}
      {...rest}
    >
      <Flex justify="flex-start">
        <AvatarNew
          src={muse?.image ?? null}
          alt={muse?.firstName ?? "Muse"}
          name="open"
          onClick={onAvatarClick}
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
