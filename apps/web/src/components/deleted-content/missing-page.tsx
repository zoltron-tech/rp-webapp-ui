"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { Button } from "@/components/common/button";

/**
 * A whole page standing in for something that is not there — a character
 * that was deleted, a thread that was taken down, a link that never led
 * anywhere.
 *
 * `DeletedContent` is the small notice for the same news inside a page that
 * otherwise exists. This is for when the missing thing *was* the page: the
 * scene is drawn large and the block sits in the middle of the screen, where
 * the thing itself would have been.
 */

const Page = styled.div`
  width: 100%;
  /* The screen, less the top bar above and the tab bar a phone has below. */
  min-height: calc(100dvh - 180px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px 20px 40px;
  box-sizing: border-box;
  text-align: center;
`;

/* The scenes carry their own small sizes for use inside lists; here they are
   drawn larger, as the one thing on the page — but not so large that the
   drawing's few strokes turn coarse on a wide screen. Each keeps the shape
   of its viewBox, and is the same 220px at the 375px baseline. */
const Scene = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;

  && > svg {
    width: min(220px, 62vw);
    height: auto;
  }
`;

const Title = styled.h1`
  all: unset;
  display: block;
  font-family: var(--font);
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--accent-11, var(--accent));
  letter-spacing: 0.01em;
  max-width: 420px;
`;

const Message = styled.p`
  all: unset;
  display: block;
  font-family: var(--font);
  font-size: var(--font-size);
  color: var(--text-secondary);
  max-width: 360px;
  line-height: 1.6;
`;

const Aside = styled.p`
  all: unset;
  display: block;
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-style: italic;
  color: var(--text-secondary);
  opacity: 0.75;
  max-width: 340px;
  margin-bottom: 8px;
`;

/* The shared button fills whatever holds it; this holds it to its label. */
const Action = styled.div`
  width: max-content;
  max-width: 100%;
`;

interface MissingPageProps {
  /** The scene, from `@/components/book-art`. */
  art: ReactNode;
  title: string;
  message: string;
  /** The quieter second thought under the message. */
  aside?: string;
  actionLabel: string;
  onAction: () => void;
}

export const MissingPage = ({
  art,
  title,
  message,
  aside,
  actionLabel,
  onAction,
}: MissingPageProps) => (
  <Page>
    <Scene>{art}</Scene>
    <Title>{title}</Title>
    <Message>{message}</Message>
    {aside ? <Aside>{aside}</Aside> : null}
    <Action>
      <Button onClick={onAction}>{actionLabel}</Button>
    </Action>
  </Page>
);
