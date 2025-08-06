import styled from "styled-components";

export const CommentRoot = styled.div`
  display: flex;
  flex-direction: column;
  padding-inline: 8px;

  margin-top: 20px;

  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);
`;

const SourceStyled = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;

  .avatar {
    width: 40px;
    height: 40px;
  }
`;

const SourceName = styled.h2`
  all: unset;
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
`;

const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 8px;
`;

const CommentTime = styled.time`
  all: unset;
  font-size: var(--font-size-small);
  color: var(--bg-11);
  cursor: default;
`;

export const Source = Object.assign(SourceStyled, {
  Info: SourceInfo,
  Name: SourceName,
  Time: CommentTime,
});

const TextLine = styled.span`
  display: inline-block;
  margin-bottom: 8px;
`;

const CommentContentRoot = styled.div`
  /* padding: 12px; */
  padding-top: 12px;
  padding-inline: 8px;
  margin-left: 48px;
  background-color: var(--bg-3);
  border-radius: 4px;
`;

export const CommentContent = Object.assign(
  {},
  {
    Root: CommentContentRoot,
    TextLine: TextLine,
  }
);

const CommentFooterRoot = styled.footer`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  margin-block: 10px;
  gap: 8px;
`;

const CommentFooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 48px;
`;

const CommentFooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReplyCount = styled.a`
  all: unset;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
  color: var(--bg-11);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const OpenThreadButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-small);
  color: var(--text);
  font-weight: var(--font-weight-medium);
  padding: 6px;
  border-radius: 4px;
  background-color: var(--accent);
  transition: background-color 0.1s;

  .icon {
    width: 14px;
    height: 14px;
    margin-left: 2px;
    position: relative;
    transition-property: transform;
    transition-duration: 0.1s;
    transition-timing-function: ease-in-out;
  }

  &:hover {
    background-color: var(--accent-hover);
    .icon {
      transform: translateX(2px);
    }
  }

  &:active {
    background-color: var(--accent-active);
  }

  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const CommentFooter = Object.assign(
  {},
  {
    Root: CommentFooterRoot,
    Left: CommentFooterLeft,
    Right: CommentFooterRight,

    ReplyCount: ReplyCount,
    OpenThreadButton: OpenThreadButton,
  }
);
