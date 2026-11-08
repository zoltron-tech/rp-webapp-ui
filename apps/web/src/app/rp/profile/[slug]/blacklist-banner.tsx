"use client";

import { BLOCK_BLACKLIST_COPY } from "@nw/types";
import type { FC } from "react";
import { BiHide } from "react-icons/bi";
import styled from "styled-components";
import { MATERIAL } from "@/theme";

const Banner = styled.div`
  ${MATERIAL};
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  max-width: 640px;
  box-sizing: border-box;
  margin: 10px 0 4px;
  padding: 10px 12px;
  border-radius: 12px;
  color: var(--text);
  font-size: var(--font-size-small);

  > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: var(--text-secondary);
  }

  @media screen and (max-width: 800px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
  }
`;

const Text = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--material-edge);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--material-highlight);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--accent-9, var(--blue-9));
    outline-offset: 2px;
  }
`;

type Props = {
  /** "@ada". */
  handle: string;
  busy: boolean;
  onRemove: () => void;
};

/**
 * "You've blacklisted @ada · Remove from blacklist", on the profile of someone
 * the viewer blacklisted (BLOCK_BLACKLIST_PLAN.md B3). Only the viewer sees it;
 * the other side is never told.
 */
export const BlacklistBanner: FC<Props> = ({ handle, busy, onRemove }) => (
  <Banner role="note">
    <BiHide aria-hidden="true" />
    <Text title={BLOCK_BLACKLIST_COPY.profileBanner(handle)}>
      {BLOCK_BLACKLIST_COPY.profileBanner(handle)}
    </Text>
    <RemoveButton disabled={busy} onClick={onRemove} type="button">
      {BLOCK_BLACKLIST_COPY.removeFromBlacklist}
    </RemoveButton>
  </Banner>
);
