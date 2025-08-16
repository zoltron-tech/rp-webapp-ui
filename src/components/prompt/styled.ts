import { Separator } from "radix-ui";
import { styled } from "styled-components";

export const PromptRoot = styled.article`
  background-color: var(--bg-2);
  max-width: 800px;
  margin-inline: auto;

  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-regular);

  padding: 10px;
  padding-bottom: 20px;
  margin-top: 40px;
  margin-bottom: 20px;
  border: 0.85px solid var(--bg-6);

  .separator[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
    margin-block: 10px;
    background-color: var(--bg-6);
  }

  @media screen and (max-width: 430px) {
    margin-block: 0px;
    padding-inline: 6px;
  }
`;

export const PromptHeaderRoot = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;

  .avatar {
    width: 64px;
    height: 64px;
    cursor: pointer;
  }

  @media screen and (max-width: 430px) {
    .avatar {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }
`;

export const SourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
`;

export const SourceName = styled.h1`
  all: unset;

  line-height: 1.5;
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  color: var(--text);
  font-family: var(--font);
`;

export const PromptSubheader = styled.time`
  all: unset;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  cursor: default;

  display: flex;
  align-items: center;
  gap: 8px;
`;

const PromptContentFooter = styled.footer`
  display: flex;
  align-items: center;
  margin-top: 18px;
  padding-bottom: 8px;
`;

const PromptContentRoot = styled.section`
  padding-inline: 16px;
  padding-top: 20px;
`;

export const PromptContent = Object.assign(
  {},
  {
    Root: PromptContentRoot,
    Footer: PromptContentFooter,
  },
);

export const PromptMediaContainer = styled.div`
  margin-inline: auto;
  margin-top: 10px;
  max-width: 350px;
  height: fit-content;
  display: flex;
  background-color: #000000;
`;

export const PromptImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const TextLine = styled.span`
  display: inline-block;
  margin-bottom: 8px;
`;

const PromptThreadsRoot = styled.div`
  .comment-action {
    margin-bottom: 10px;
  }
`;

const PromptThreadsHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const PromptThreadsSeparator = styled(Separator.Root)`
  height: 1px;
  width: 100%;
  margin-block: 10px;
  background-color: var(--bg-7);
`;

const PromptThreadsToggle = styled.button`
  all: unset;
  cursor: pointer;
  color: var(--text);
  font-size: var(--font-size);
  font-family: var(--font);
  font-weight: var(--font-weight-medium);
  padding: 6px 32px;
  border-radius: 8px;
  border: 1.5px solid var(--bg-7);
  background-color: var(--bg-4);
  white-space: nowrap;

  &:hover {
    background-color: var(--bg-3);
  }
  &:active {
    background-color: var(--bg-2);
  }
  &:focus {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
  }
`;

export const PromptThreads = Object.assign(
  {},
  {
    Root: PromptThreadsRoot,
    Header: PromptThreadsHeader,
    Left: PromptThreadsSeparator,
    Right: PromptThreadsSeparator,
    Toggle: PromptThreadsToggle,
  },
);
