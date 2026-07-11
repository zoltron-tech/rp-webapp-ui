import styled from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";
import { CARD_BORDER } from "@/theme";

export const Card = styled.div`
  box-sizing: border-box;
  width: 90%;
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--bg-2);
  ${CARD_BORDER};
`;

export const HeaderButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  gap: 10px;
`;

export const HeaderLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 0;
`;

export const HeaderRight = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const HeaderIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);

  svg {
    width: 17px;
    height: 17px;
  }
`;

export const HeaderTitle = styled.span`
  font-size: var(--font-size);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export const CountBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--bg-4);
  color: var(--text-secondary);
  font-size: var(--font-size-xsmall);
  font-weight: var(--font-weight-semi-bold);
  flex-shrink: 0;
`;

export const Chevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  flex-shrink: 0;
  transform: rotate(${(p) => (p.$expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Stack = styled.span`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const STACK_AVATAR_SIZE = "24px";

export const StackAvatar = styled(AvatarNew)`
  box-sizing: border-box;
  width: ${STACK_AVATAR_SIZE};
  height: ${STACK_AVATAR_SIZE};
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  cursor: pointer;
  transition: transform 0.15s ease;
  flex-shrink: 0;

  &:not(:first-child) {
    margin-left: -8px;
  }

  &:hover {
    transform: translateY(-2px);
  }

  @container (max-width: 500px) {
    width: 22px;
    height: 22px;

    &:not(:first-child) {
      margin-left: -7px;
    }
  }
`;

export const StackOverflow = styled.span`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${STACK_AVATAR_SIZE};
  height: ${STACK_AVATAR_SIZE};
  margin-left: -8px;
  border-radius: 50%;
  border: 2px solid var(--bg-2);
  background: var(--bg-5);
  color: var(--text-secondary);
  font-size: 0.6rem;
  font-weight: var(--font-weight-semi-bold);
  flex-shrink: 0;

  @container (max-width: 500px) {
    width: 22px;
    height: 22px;
    margin-left: -7px;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid var(--bg-5);
  background: var(--bg-3);

  @container (max-width: 500px) {
    max-height: 170px;
  }
`;

export const Row = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid var(--bg-5);
  }

  &:hover,
  &:focus-visible {
    background: var(--bg-4);
  }
`;

export const RowAvatar = styled(AvatarNew)`
  box-sizing: border-box;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const RowInfo = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RowUsername = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RoleBadge = styled.span<{ $variant: "creator" | "admin" }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid
    ${({ $variant }) => ($variant === "creator" ? "var(--amber-9)" : "var(--accent)")};
  color: ${({ $variant }) => ($variant === "creator" ? "var(--amber-9)" : "var(--accent)")};
  background: ${({ $variant }) =>
    $variant === "creator"
      ? "color-mix(in srgb, var(--amber-9) 12%, transparent)"
      : "color-mix(in srgb, var(--accent) 12%, transparent)"};
`;

export const RowChevron = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const EmptyText = styled.p`
  margin: 12px 0 0;
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;
