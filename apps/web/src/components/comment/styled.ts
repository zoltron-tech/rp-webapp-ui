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

  @media screen and (max-width: 430px) {
    .avatar {
      width: 32px;
      height: 32px;
    }
  }
`;

const SourceName = styled.h2`
  all: unset;
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
  margin-left: 8px;
  /* Keep clear of the absolutely-positioned 3-dot menu on the right. */
  padding-right: 34px;
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

export const ConcludedChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent-11, var(--accent));
  font-family: var(--font);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
`;

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
  /* A speech bubble on the card: a neutral wash, tail corner towards the
     speaker's avatar. */
  background-color: var(--fill-hover, var(--bg-3));
  border: 1px solid var(--material-edge, var(--bg-5));
  border-radius: 4px 16px 16px 16px;

  @media screen and (max-width: 430px) {
    margin-left: 36px;
    padding-inline: 10px;
  }
`;

const TextLine = styled.span`
  display: block;
  margin-bottom: 6px;
    min-height: 1em;
    overflow-wrap: break-word;
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
  padding-top: 2px;
  padding-bottom: 4px;
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

  @media screen and (max-width: 430px) {
    margin-left: 36px;
  }
`;

const CommentFooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media screen and (max-width: 430px) {
    padding-left: 36px;
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
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-family: var(--font);
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  font-weight: var(--font-weight-bold);
  padding: 7px 12px;
  border-radius: 50px;
  border: 1px solid var(--material-edge, var(--bg-6));
  background-color: var(--fill-hover, var(--bg-3));
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  .icon {
    width: 13px;
    height: 13px;
    transition: transform 0.1s ease;
  }

  @media (hover: hover) {
    &:hover {
      color: var(--text);
      background-color: var(--fill-pressed, var(--bg-4));
      .icon {
        transform: translateX(2px);
      }
    }
  }

  &:active {
    background-color: var(--fill-pressed, var(--bg-5));
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }

  @media screen and (max-width: 430px) {
    padding: 6px 10px;
    font-size: 11px;
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
