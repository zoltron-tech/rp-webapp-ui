"use client";
import { Flex, ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import type { FC } from "react";
import { FiChevronRight } from "react-icons/fi";
import { VscVerifiedFilled } from "react-icons/vsc";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Friend } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { Username } from "../common";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  friend: Friend;
};

export const ProfileFriendListItem: FC<Props> = ({
  friend,
  className,
  ...rest
}) => {
  const { routeToPage } = usePageRouter();

  const onAvatarClick = () => {
    if (!friend) return;
    routeToPage(ROUTES.Profile.View(friend.username || "").Index);
  };

  if (!friend) return <></>;

  return (
    <S.MuseContainer
      onClick={onAvatarClick}
      className={classNames(["muse-list-item", className])}
      {...rest}
    >
      <Flex justify="space-between" align="center" style={{ width: "100%" }}>
        <Flex justify="flex-start" align="center" gap={"0px"}>
          <AvatarNew
            src={friend?.image ?? null}
            alt={friend?.username ?? "Friend"}
            name="open"
            onClick={onAvatarClick}
          />
          <Flex
            direction="column"
            style={{ alignItems: "flex-start", marginLeft: "10px" }}
            gap={"0.2rem"}
          >
            <Flex gap={"0.2rem"}>
              <S.Name>
                {friend.firstName} {friend.lastName}
              </S.Name>
              <ShouldRender if={friend?.isVerified === true}>
                <VscVerifiedFilled size={16} color="rgb(28, 123, 201)" />
              </ShouldRender>
            </Flex>
            <Username username={friend.username} className="mini" primary />
          </Flex>
        </Flex>

        <FiChevronRight size={20} color="gray" />
      </Flex>
    </S.MuseContainer>
  );
};

export default ProfileFriendListItem;
