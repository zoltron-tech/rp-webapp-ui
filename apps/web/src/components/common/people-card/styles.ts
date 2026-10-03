import styled from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";
import { MATERIAL_CARD } from "@/theme";

/**
 * The chrome for a collapsed strip of people.
 *
 * A header that reads as a summary on its own — a label, a count, and a
 * stack of faces — over a list that only unrolls when someone asks for it.
 * Two of these sit together on the storyboard page (co-authors and cast), and
 * they have to be the same object at a glance or the pair reads as two
 * unrelated widgets rather than two views of "people in this story".
 *
 * Shared rather than copied for exactly that reason: a divergence here shows
 * up immediately, side by side, on the page that uses both.
 */

/* Sized by whatever lays it out — on the storyboard page that is a column it
   shares with its twin, so it cannot set its own width or margins. */
export const Card = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 16px;
  ${MATERIAL_CARD}
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
    width: 14px;
    height: 14px;
  }
`;

/* A caption, not a heading: it labels a strip of faces and should not compete
   with the story's own title above it. */
export const HeaderTitle = styled.span`
  font-size: 0.7rem;
  font-weight: var(--font-weight-semi-bold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  white-space: nowrap;
`;

export const CountBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--fill-hover);
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
    width: 16px;
    height: 16px;
  }
`;

export const Stack = styled.span`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const STACK_AVATAR_SIZE = "22px";

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
    width: 20px;
    height: 20px;

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
  background: var(--fill-pressed);
  color: var(--text-secondary);
  font-size: 0.6rem;
  font-weight: var(--font-weight-semi-bold);
  flex-shrink: 0;

  @container (max-width: 500px) {
    width: 20px;
    height: 20px;
    margin-left: -7px;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  max-height: 168px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid var(--field-edge);
  background: var(--field-fill);

  @container (max-width: 500px) {
    max-height: 148px;
  }
`;

export const Row = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:not(:last-child) {
    border-bottom: 1px solid var(--material-edge);
  }

  &:hover,
  &:focus-visible {
    background: var(--fill-hover);
  }
`;

export const RowAvatar = styled(AvatarNew)`
  box-sizing: border-box;
  width: 28px;
  height: 28px;
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

export const RowName = styled.span`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
