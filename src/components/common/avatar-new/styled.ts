import { Avatar } from "radix-ui";
import { styled } from "styled-components";

export const AvatarRoot = styled(Avatar.Root)`
  display: inline-flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
  background-color: var(--bg-2);

  &.selectable {
    cursor: pointer;

    &:hover {
      outline: 1.5px solid var(--accent-a8);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    color: var(--accent-a8);
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-bold);
  }
`;
