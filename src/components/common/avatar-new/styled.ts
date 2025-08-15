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
    background-color: var(--bg-2);
    color: var(--accent-a8);
    font-size: var(--font-size-xxlarge);
    font-weight: var(--font-weight-bold);
  }
`;
