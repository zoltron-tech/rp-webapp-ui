"use client";

import type { Badge } from "@nw/types/badge";
import { type FC, useMemo, useState } from "react";
import { AppAlertDialog } from "@/components/dialog";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { BadgeArtwork, hasBadgeArtwork } from "./artwork";
import * as S from "./styles";

/**
 * How many crests a profile shows before the rest collapse into a "+N".
 *
 * Two, because the row sits inline next to a username on a 375px screen and a
 * third crest is what starts pushing the handle out of view.
 */
const DEFAULT_VISIBLE = 2;

const DEFAULT_SIZE = 22;

/** Drops badges this bundle has no artwork for; see the artwork registry. */
const renderable = (badges: Badge[] | undefined): Badge[] =>
  (badges ?? []).filter((badge) => hasBadgeArtwork(badge.code));

/**
 * Whether a strip or row would draw anything at all.
 *
 * For callers that wrap the strip in chrome of their own — a scrim, a border,
 * a corner slot — which has to disappear along with it. `BadgeStrip` returning
 * null is not enough on its own: the wrapper would still paint an empty pill.
 */
export const hasVisibleBadges = (badges: Badge[] | undefined): boolean =>
  renderable(badges).length > 0;

interface RowProps {
  badges: Badge[] | undefined;
  /** Crest size in px. Below 30 the crests drop their fine detail. */
  size?: number;
  /** How many crests before the "+N". */
  max?: number;
  /**
   * Whose badges these are, for the dialog heading. Omit for the signed-in
   * novelist's own.
   */
  ownerName?: string | null;
}

/**
 * The inline badge row that sits beside a novelist's name.
 *
 * Shows up to [max] crests and collapses the rest into a "+N" — tapping
 * anywhere on the row opens the full list, which is the only way the overflow
 * is reachable on a phone.
 */
export const BadgeRow: FC<RowProps> = ({
  badges,
  size = DEFAULT_SIZE,
  max = DEFAULT_VISIBLE,
  ownerName,
}) => {
  const [open, setOpen] = useState(false);
  const { routeToPage } = usePageRouter();
  const visible = useMemo(() => renderable(badges), [badges]);

  if (visible.length === 0) return null;

  const shown = visible.slice(0, max);
  const overflow = visible.length - shown.length;
  const label =
    visible.length === 1
      ? `Badge: ${visible[0].title}`
      : `${visible.length} badges`;

  return (
    <>
      <S.Row
        type="button"
        aria-label={label}
        title={shown.map((badge) => badge.title).join(" · ")}
        onClick={(event) => {
          // The row is often inside a clickable card or a link to the profile;
          // opening the badge list must not also navigate away from it.
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        {shown.map((badge) => (
          <BadgeArtwork
            key={badge.code}
            code={badge.code}
            size={size}
            animated
          />
        ))}
        {overflow > 0 && <S.Overflow $size={size}>+{overflow}</S.Overflow>}
      </S.Row>

      <AppAlertDialog
        open={open}
        onOpenChange={setOpen}
        heading={ownerName ? `${ownerName}'s badges` : "Badges"}
        text=""
        closeButtonText="Close"
        actionButtonLabel="See all badges"
        actionColor="neutral"
        // The dialog answers "what has this novelist got"; the catalogue
        // answers the question that follows it — what else is there, and how
        // would I get one.
        onConfirm={() => {
          setOpen(false);
          routeToPage(ROUTES.Badges);
        }}
        body={<BadgeList badges={visible} />}
      />
    </>
  );
};

interface StaticRowProps {
  badges: Badge[] | undefined;
  size?: number;
  max?: number;
  /**
   * Off inside the exported novelist card: `html-to-image` paints a single
   * frame, and a crest caught mid-sweep exports with a white streak across it.
   */
  animated?: boolean;
  /**
   * "vertical" stacks the crests into a column — for the corner of a card,
   * where a row would run into the name or off the edge.
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * The same row with no dialog behind it, for surfaces that are already one
 * tap target — a preview card that opens a profile, or the exported card.
 */
export const BadgeStrip: FC<StaticRowProps> = ({
  badges,
  size = DEFAULT_SIZE,
  max = DEFAULT_VISIBLE,
  animated = true,
  orientation = "horizontal",
}) => {
  const visible = useMemo(() => renderable(badges), [badges]);
  if (visible.length === 0) return null;

  const shown = visible.slice(0, max);
  const overflow = visible.length - shown.length;

  return (
    <S.StaticRow
      $vertical={orientation === "vertical"}
      title={shown.map((badge) => badge.title).join(" · ")}
      aria-label={`${visible.length} badges`}
    >
      {shown.map((badge) => (
        <BadgeArtwork
          key={badge.code}
          code={badge.code}
          size={size}
          animated={animated}
        />
      ))}
      {overflow > 0 && <S.Overflow $size={size}>+{overflow}</S.Overflow>}
    </S.StaticRow>
  );
};

interface ListProps {
  badges: Badge[];
}

/** Crest, title and description — the body of the badge dialog. */
export const BadgeList: FC<ListProps> = ({ badges }) => {
  if (badges.length === 0) {
    return <S.DialogEmpty>No badges earned yet.</S.DialogEmpty>;
  }

  return (
    <S.DialogList>
      {badges.map((badge) => (
        <S.DialogItem key={badge.code}>
          <BadgeArtwork code={badge.code} size={48} animated />
          <S.DialogItemText>
            <S.DialogItemTitle>{badge.title}</S.DialogItemTitle>
            <S.DialogItemDescription>
              {badge.description}
            </S.DialogItemDescription>
          </S.DialogItemText>
        </S.DialogItem>
      ))}
    </S.DialogList>
  );
};

export { BadgeArtwork, hasBadgeArtwork } from "./artwork";
