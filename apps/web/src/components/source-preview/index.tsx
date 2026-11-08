"use client";

import classNames from "classnames";
import { Popover } from "radix-ui";
import { type FC, type ReactNode, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styles";

/**
 * A post header's avatar that opens a mini preview instead of navigating.
 *
 * Prompts, threads and replies name their author with an avatar. Tapping it
 * used to leave the page; now it opens the same card a pasted link unfurls
 * to (muse or novelist), and the card's Visit profile button is the way on.
 *
 * The content is mounted only while open, so a feed of fifty posts does not
 * fetch fifty profiles. Clicks are stopped at the trigger and the popover:
 * posts sit inside cards with their own click handlers, and React bubbles a
 * portalled click through the component tree as if it were still inline.
 */

type Props = {
  /** What the button announces, e.g. "Preview Arya Stark". */
  label: string;
  /** The avatar the trigger draws. */
  children: ReactNode;
  /** The card shown in the popover. */
  preview: ReactNode;
  /** Palette class applied to the trigger (a novelist's accent). */
  className?: string;
  /** Optional control, for headers where something besides the avatar (the
   *  author's name) opens the same preview. Uncontrolled when omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const SourcePreview: FC<Props> = ({
  label,
  children,
  preview,
  className,
  open: openProp,
  onOpenChange,
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <S.Trigger
          type="button"
          aria-label={label}
          className={className}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </S.Trigger>
      </Popover.Trigger>
      <Popover.Portal>
        <S.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          // Portalled to <body>, outside .page-container: carry the accent
          // and theme classes so the card's tokens resolve.
          className={classNames([accent, theme])}
          onClick={(event) => event.stopPropagation()}
          // Capture, because the card's own handler stops the click: Visit
          // profile routes, and the popover should not linger over the next
          // page.
          onClickCapture={(event) => {
            if ((event.target as Element).closest("a[href]")) setOpen(false);
          }}
          onOpenAutoFocus={(event) => {
            // Touch: no focus ring flash on open. Keyboard users still land
            // inside via Tab.
            if (window.matchMedia("(hover: none)").matches) {
              event.preventDefault();
            }
          }}
        >
          {preview}
        </S.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default SourcePreview;
