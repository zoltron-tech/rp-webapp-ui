"use client";

import type { Muse } from "@nw/types";
import { toVerseOptions } from "@/components/headcanons/headcanon-editor-sheet";
import { HeadcanonsPanel } from "@/components/headcanons/headcanons-panel";
import { getMuseAppearance } from "../appearance";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  /** A shared headcanon link opens straight onto its card. */
  openHeadcanonId?: string | null;
};

/**
 * Traits, quick facts and headcanon cards on the character card. Visitors
 * read it; the owner edits it right here (same panel as Edit muse).
 */
export function HeadcanonsSection({ muse, openHeadcanonId }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { hideExpandedBackground } = getMuseAppearance(muse);
  const museName = muse
    ? [muse.firstName, muse.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <S.CardExpandedWrapper $hideChrome={hideExpandedBackground}>
      <S.CardBack
        className="muse-card"
        accent={accent}
        $hideBackground={hideExpandedBackground}
      >
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.ScrollableContent accent={accent}>
            {!muse?.id ? (
              <S.ShimmerGroup>
                <S.ShimmerBlock $height="40px" />
                <S.ShimmerBlock $height="80px" />
                <S.ShimmerBlock $height="96px" />
              </S.ShimmerGroup>
            ) : (
              <HeadcanonsPanel
                key={muse.id}
                museId={muse.id}
                museName={museName}
                tone="card"
                accent={accent ?? null}
                verses={toVerseOptions(muse.verses)}
                ownerNovelistId={muse.pennedBy?.id ?? null}
                ownerUsername={muse.pennedBy?.username ?? null}
                openHeadcanonId={openHeadcanonId}
              />
            )}
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
