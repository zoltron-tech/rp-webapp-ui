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
  position: relative;

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
  color: var(--text-secondary);
  cursor: default;
`;

export const Source = Object.assign(SourceStyled, {
  Info: SourceInfo,
  Name: SourceName,
  Time: CommentTime,
});

export const HeaderDropdownMenuContainer = styled.div`
  display: flex;
  gap: 6px;
  position: absolute;
  right: 0px;
  top: 10px;
`;

const CommentContentRoot = styled.div`
  padding-top: 12px;
  padding-inline: 12px;
  padding-bottom: 8px;
  margin-left: 48px;
  background-color: var(--bg-3);
  border-radius: 4px;
`;

const TextLine = styled.span`
  display: inline-block;
  margin-bottom: 6px;
`;

export const CommentMediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 6px;

  max-width: 200px;
  height: fit-content;
  display: flex;
  background-color: #000000;
`;

export const CommentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const CommentContent = Object.assign(
  {},
  {
    Image: CommentImage,
    MediaContainer: CommentMediaContainer,
    Root: CommentContentRoot,
    TextLine: TextLine,
  },
);

const CommentFooterRoot = styled.footer`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-block: 10px;
  gap: 8px;

  @media screen and (max-width: 430px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

  @media screen and (max-width: 430px) {
    padding-left: 48px;
    width: 100%;
    justify-content: space-between;
  }
`;

const ReplyCount = styled.a`
  all: unset;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }

  .replies-icon {
    display: none;
  }

  @media screen and (max-width: 430px) {
    color: var(--text);
    margin-left: 4px;

    .replies-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
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
    Left: CommentFooterLeft,
    OpenThreadButton: OpenThreadButton,

    ReplyCount: ReplyCount,
    Right: CommentFooterRight,
    Root: CommentFooterRoot,
  },
);
