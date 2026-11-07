"use client";

import { PLACEHOLDER_LABELS, type StoryBoard } from "@nw/types";
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
  /** A co-author who disabled their account: shown, never linked. */
  isPlaceholder?: boolean;
}

/** What a row says: the @handle, or the placeholder label for a disabled member. */
const handleOf = (member: DisplayMember) =>
  member.isPlaceholder ? PLACEHOLDER_LABELS.NOVELIST : `@${member.username}`;

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
              isPlaceholder: creator.isPlaceholder === true,
              role: "creator" as Role,
              username: creator.username,
            },
          ]
        : []),
      ...(storyboard?.members ?? [])
        .filter(
          (member) =>
            member.isPlaceholder || member.username !== creator?.username,
        )
        .map((member) => ({
          image: member.isPlaceholder ? null : member.image,
          isPlaceholder: member.isPlaceholder === true,
          role: (member.isAdmin ? "admin" : "member") as Role,
          username: member.username,
        })),
    ];
  }, [storyboard]);

  if (members.length === 0) return null;

  const stackMembers = members.slice(0, STACK_LIMIT);
  const overflowCount = members.length - stackMembers.length;

  const onMemberClick = (member: DisplayMember) => {
    if (member.isPlaceholder) return;
    routeToPage(ROUTES.Profile.View(member.username).Index);
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
            {stackMembers.map((member, index) => (
              <S.StackAvatar
                key={
                  member.isPlaceholder
                    ? `placeholder-${index}`
                    : member.username
                }
                src={member.image}
                alt={handleOf(member)}
                title={handleOf(member)}
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
          {members.map((member, index) => (
            <S.Row
              key={
                member.isPlaceholder ? `placeholder-${index}` : member.username
              }
              type="button"
              disabled={member.isPlaceholder}
              onClick={() => onMemberClick(member)}
            >
              <S.RowAvatar src={member.image} alt={handleOf(member)} />
              <S.RowInfo>
                <S.RowUsername>{handleOf(member)}</S.RowUsername>
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
