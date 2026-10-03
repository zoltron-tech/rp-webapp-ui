import styled from "styled-components";

/**
 * Shared base for all unread/notification count badges.
 * Extend this for positional variants (absolute on icons, inline next to text, etc.).
 */
export const UnreadBadgeBase = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: #e53e3e;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  pointer-events: none;
`;
