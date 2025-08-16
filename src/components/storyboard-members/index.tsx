import { Flex } from "@novelist-world/ui";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { FiMinus } from "react-icons/fi";
import { IoIosStarOutline, IoMdAdd, IoMdArrowRoundBack } from "react-icons/io";
import { TbStarFilled } from "react-icons/tb";
import { getStoryboardAction } from "@/app/rp/story/actions";
import { useGlobalState } from "@/context/store/stores";
import type { Friend, StoryBoard, StoryBoardMember } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { addStoryBoardMember, removeStoryBoardMember } from "./actions";
import * as S from "./styles";

type ListItemProps = React.HTMLProps<HTMLDivElement> & {
  novelist?: StoryBoardMember | null;
  storyBoardId: string;
  onRemoveMember: (username: string) => void;
};

export const StoryBoardMemberListItem: FC<ListItemProps> = ({
  novelist,
  storyBoardId,
  onRemoveMember,
}) => {
  const { push } = useRouter();
  const [isAdmin, setIsAdmin] = useState(novelist?.isAdmin);

  const onAvatarClick = () => {
    if (!novelist) return;
    push(ROUTES.Profile.View(novelist.username).Index);
  };

  const handleMakeAdmin = async () => {
    if (!novelist) return;

    const payload: StoryBoardMember = {
      ...novelist,
      isAdmin: true,
      storyBoardId: storyBoardId,
    };

    const response = await addStoryBoardMember(payload);

    if (response?.message === API_MESSAGE.Success) {
      setIsAdmin(true);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!novelist) return;

    const payload: StoryBoardMember = {
      ...novelist,
      isAdmin: false,
      storyBoardId: storyBoardId,
    };

    const response = await addStoryBoardMember(payload);

    if (response?.message === API_MESSAGE.Success) {
      setIsAdmin(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!novelist) return;

    const payload: StoryBoardMember = {
      ...novelist,
      storyBoardId: storyBoardId,
    };

    const response = await removeStoryBoardMember(payload);

    if (response?.message === API_MESSAGE.Success) {
      onRemoveMember(novelist.username);
    }
  };

  return (
    <S.CardWrapper>
      <S.Card className="muse-card">
        <S.Avatar
          src={novelist?.image ?? null}
          alt={""}
          size={50}
          onClick={onAvatarClick}
          hoverable
        />
        <S.Info>
          <S.username username={novelist?.username} />
        </S.Info>
        <Flex style={{ paddingRight: "20px" }} direction="row">
          <ShouldRender if={isAdmin === true}>
            <S.RemoveAdminButton onClick={handleRemoveAdmin}>
              <TbStarFilled />
            </S.RemoveAdminButton>
          </ShouldRender>
          <ShouldRender if={isAdmin === false}>
            <S.MakeAdminButton onClick={handleMakeAdmin}>
              <IoIosStarOutline />
            </S.MakeAdminButton>
          </ShouldRender>
          <S.RemoveMemberButton onClick={handleRemoveMember}>
            <FiMinus />
          </S.RemoveMemberButton>
        </Flex>
      </S.Card>
    </S.CardWrapper>
  );
};

type NewMembersListItemProps = React.HTMLProps<HTMLDivElement> & {
  novelist?: Friend | null;
  storyBoardId: string;
  onAddMember: (username: string) => void;
};

export const StoryBoardNewMemberListItem: FC<NewMembersListItemProps> = ({
  novelist,
  storyBoardId,
  onAddMember,
}) => {
  const { push } = useRouter();

  const onAvatarClick = () => {
    if (!novelist) return;
    push(ROUTES.Profile.View(novelist.username).Index);
  };

  const handleAddNewMember = async () => {
    if (!novelist) return;

    const payload: StoryBoardMember = {
      image: novelist.image,
      isAdmin: false,
      storyBoardId: storyBoardId,
      username: novelist.username,
    };

    const response = await addStoryBoardMember(payload);

    if (response?.message === API_MESSAGE.Success) {
      onAddMember(novelist.username);
    }
  };

  return (
    <S.CardWrapper>
      <S.Card className="muse-card">
        <S.Avatar
          src={novelist?.image ?? null}
          alt={""}
          size={50}
          onClick={onAvatarClick}
          hoverable
        />
        <S.Info>
          <S.username username={novelist?.username} />
        </S.Info>
        <Flex style={{ paddingRight: "20px" }} direction="row">
          <S.AddMemberButton onClick={handleAddNewMember}>
            <IoMdAdd />
          </S.AddMemberButton>
        </Flex>
      </S.Card>
    </S.CardWrapper>
  );
};

export const StoryBoardMembersList: FC<{ id?: string }> = ({ id }) => {
  const state = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [storyBoard, setStoryBoard] = useState<StoryBoard>();
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>();
  const { push } = useRouter();

  const onBackClick = () => {
    if (!storyBoard) return;
    push(ROUTES.Profile.Story.Edit(storyBoard.id || "").Index);
  };

  const fetchData = async () => {
    if (!id) return;

    const response = await getStoryboardAction(id);

    if (response && !("message" in response)) {
      setStoryBoard(response);
      const updatedFilteredFriends = novelist?.friends.filter(
        (friend) =>
          !response.members.some(
            (member) => member.username === friend.username,
          ),
      );
      setFilteredFriends(updatedFilteredFriends);
    }
  };

  const handleMemberRemoval = (removedUsername: string) => {
    setStoryBoard((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        members: prev.members?.filter(
          (member) => member.username !== removedUsername,
        ),
      };
    });

    const friendToAdd = novelist?.friends.find(
      (friend) => friend.username === removedUsername,
    );

    if (friendToAdd) {
      setFilteredFriends((prev) => [...(prev || []), friendToAdd]);
    }
  };

  const handleMemberAddition = (addedUsername: string) => {
    console.log("agya me");
    const friendToAdd = filteredFriends?.find(
      (friend) => friend.username === addedUsername,
    );

    if (!friendToAdd || !storyBoard?.id) return;

    setStoryBoard((prev) => {
      if (!prev) return prev;

      const newMember: StoryBoardMember = {
        image: friendToAdd.image,
        isAdmin: false,
        storyBoardId: prev.id || "",
        username: friendToAdd.username,
      };

      return {
        ...prev,
        members: [...(prev.members || []), newMember],
      };
    });

    setFilteredFriends((prev) =>
      prev?.filter((friend) => friend.username !== addedUsername),
    );
  };

  useEffect(() => {
    if (state !== "LOGGED_IN") return;
    fetchData();
  }, [state]);

  Logger.info("StoryBoardMembersList rendered");

  return (
    <S.LocalContainer>
      <S.HeaderFlex justify="flex-start">
        <S.Button className="button" onClick={onBackClick}>
          <IoMdArrowRoundBack />
        </S.Button>
      </S.HeaderFlex>
      <Flex
        style={{ borderTop: "1px solid dimgray", width: "100%" }}
        direction="column"
        justify="center"
      >
        <S.ListContainer>
          {id &&
            storyBoard?.members.map((member) => (
              <StoryBoardMemberListItem
                key={member?.username}
                novelist={member}
                storyBoardId={id}
                onRemoveMember={handleMemberRemoval}
              />
            ))}
          {id &&
            filteredFriends?.map((friend) => (
              <StoryBoardNewMemberListItem
                key={friend?.username}
                novelist={friend}
                storyBoardId={id}
                onAddMember={handleMemberAddition}
              />
            ))}
        </S.ListContainer>
      </Flex>
    </S.LocalContainer>
  );
};

export default StoryBoardMembersList;
