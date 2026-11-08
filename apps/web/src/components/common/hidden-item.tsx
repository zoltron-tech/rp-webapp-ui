"use client";

import {
  BLOCK_BLACKLIST_COPY,
  type HiddenItemKind,
  type HiddenReason,
} from "@nw/types";
import { type FC, type ReactNode, useState } from "react";
import { FiEyeOff } from "react-icons/fi";
import styled from "styled-components";
import { MATERIAL } from "@/theme";

const Stub = styled.div`
  ${MATERIAL};
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  max-width: 640px;
  margin: 6px 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: var(--font-size-small);
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    opacity: 0.8;
  }

  @media screen and (max-width: 800px) {
    padding: 8px 10px;
    gap: 6px;
  }
`;

const Label = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ShowButton = styled.button`
  flex-shrink: 0;
  padding: 4px 10px;
  border: 1px solid var(--material-edge);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--material-highlight);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-9, var(--blue-9));
    outline-offset: 2px;
  }
`;

type Props = {
  /** The server's flag; nothing to hide when absent. */
  reason: HiddenReason | null | undefined;
  /** Picks the stub's noun: "Comment from @x hidden". */
  kind: HiddenItemKind;
  /** The author as shown, e.g. "@ada" or a muse's name. */
  handle: string;
  /** The item itself, drawn once revealed. */
  children: ReactNode;
  className?: string;
};

/**
 * A stub in place of something written by a novelist the viewer blacklisted,
 * or, inside a shared story, someone they blocked (BLOCK_BLACKLIST_PLAN.md B11,
 * B12, K4): "Comment from @ada hidden · Show". The server sent the item whole,
 * so Show swaps it in without a fetch. The reveal is per item and per view;
 * it is hidden again on the next load.
 */
export const HiddenItem: FC<Props> = ({
  reason,
  kind,
  handle,
  children,
  className,
}) => {
  const [shown, setShown] = useState(false);
  if (!reason || shown) return <>{children}</>;

  const label = BLOCK_BLACKLIST_COPY.stub(kind, handle);
  return (
    <Stub className={className} role="note">
      <FiEyeOff aria-hidden="true" />
      <Label title={label}>{label}</Label>
      <ShowButton
        aria-label={`${BLOCK_BLACKLIST_COPY.show}: ${label}`}
        onClick={() => setShown(true)}
        type="button"
      >
        {BLOCK_BLACKLIST_COPY.show}
      </ShowButton>
    </Stub>
  );
};

type SectionStubProps = {
  /** "@ada", for "Hidden — you've blacklisted @ada". */
  handle: string;
  onShow: () => void;
};

/**
 * The one reveal over several sections at once — the posts and muses of a
 * profile the viewer blacklisted (B3). The caller owns the state, so a single
 * Show can open every section it gates. Same look as [HiddenItem].
 */
export const HiddenSectionStub: FC<SectionStubProps> = ({ handle, onShow }) => {
  const label = BLOCK_BLACKLIST_COPY.hiddenSection(handle);
  return (
    <Stub role="note">
      <FiEyeOff aria-hidden="true" />
      <Label title={label}>{label}</Label>
      <ShowButton onClick={onShow} type="button">
        {BLOCK_BLACKLIST_COPY.show}
      </ShowButton>
    </Stub>
  );
};
