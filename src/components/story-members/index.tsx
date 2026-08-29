"use client";

import type { StoryBoard } from "@nw/types";
import { type FC, useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { MdOutlineExpandMore } from "react-icons/md";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

interface Props {
  storyboard: StoryBoard | null;
}

type Role = "creator" | "admin" | "member";

interface DisplayMember {
  username: string;
  image: string | null;
  role: Role;
}

const STACK_LIMIT = 4;

export const StoryMembers: FC<Props> = ({ storyboard }) => {
  const [expanded, setExpanded] = useState(false);
  const { routeToPage } = usePageRouter();

  const members: DisplayMember[] = useMemo(() => {
    const creator = storyboard?.createdBy;
    return [
      ...(creator
        ? [
            {
              image: creator.image,
              role: "creator" as Role,
              username: creator.username,
            },
          ]
        : []),
      ...(storyboard?.members ?? [])
        .filter((member) => member.username !== creator?.username)
        .map((member) => ({
          image: member.image,
          role: (member.isAdmin ? "admin" : "member") as Role,
          username: member.username,
        })),
    ];
  }, [storyboard]);

  if (members.length === 0) return null;

  const stackMembers = members.slice(0, STACK_LIMIT);
  const overflowCount = members.length - stackMembers.length;

  const onMemberClick = (username: string) => {
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  return (
    <S.Card>
      <S.HeaderButton
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <S.HeaderLeft>
          <S.HeaderIcon>
            <HiOutlineUserGroup />
          </S.HeaderIcon>
          <S.HeaderTitle>Co-authors</S.HeaderTitle>
          <S.CountBadge>{members.length}</S.CountBadge>
        </S.HeaderLeft>

        <S.HeaderRight>
          <S.Stack aria-label="Members preview">
            {stackMembers.map((member) => (
              <S.StackAvatar
                key={member.username}
                src={member.image}
                alt={member.username}
                title={`@${member.username}`}
              />
            ))}
            {overflowCount > 0 && (
              <S.StackOverflow>+{overflowCount}</S.StackOverflow>
            )}
          </S.Stack>

          <S.Chevron $expanded={expanded}>
            <MdOutlineExpandMore />
          </S.Chevron>
        </S.HeaderRight>
      </S.HeaderButton>

      {expanded ? (
        <S.List>
          {members.map((member) => (
            <S.Row
              key={member.username}
              type="button"
              onClick={() => onMemberClick(member.username)}
            >
              <S.RowAvatar src={member.image} alt={member.username} />
              <S.RowInfo>
                <S.RowUsername>@{member.username}</S.RowUsername>
                {member.role !== "member" && (
                  <S.RoleBadge $variant={member.role}>
                    {member.role === "creator" ? "author" : "Admin"}
                  </S.RoleBadge>
                )}
              </S.RowInfo>
              <S.RowChevron>
                <FiChevronRight />
              </S.RowChevron>
            </S.Row>
          ))}
        </S.List>
      ) : null}
    </S.Card>
  );
};

export default StoryMembers;
