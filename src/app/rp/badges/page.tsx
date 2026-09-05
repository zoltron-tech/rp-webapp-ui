"use client";

import { useEffect } from "react";
import { TbAward } from "react-icons/tb";
import { BadgeArtwork } from "@/components/badges";
import {
  BADGE_CATALOGUE,
  type CatalogueBadge,
  RARITY_LABEL,
} from "@/components/badges/catalogue";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./styles";

/**
 * The blanks at the foot of the page.
 *
 * Six of them, which is enough for the fade to run out mid-row on every width
 * the grid takes — the shelf has to look like it carries on past the bottom of
 * the page, and a tidy finished row says the opposite.
 */
const GHOST_COUNT = 6;

/** Title, description, requirement: the shape of a card, with nothing in it. */
const GHOST_LINES = ["54%", "88%", "70%"];

function CatalogueCard({ badge }: { badge: CatalogueBadge }) {
  return (
    <S.Card>
      <S.CardArt>
        <BadgeArtwork code={badge.code} size={78} animated />
      </S.CardArt>
      <S.CardText>
        <S.CardTitleRow>
          <S.CardTitle>{badge.title}</S.CardTitle>
          <S.RarityChip $rare={badge.rarity !== "COMMON"}>
            {RARITY_LABEL[badge.rarity]}
          </S.RarityChip>
        </S.CardTitleRow>
        <S.CardDescription>{badge.description}</S.CardDescription>
        <S.HowTo>
          <b>How to earn it:</b> {badge.requirement}
        </S.HowTo>
      </S.CardText>
    </S.Card>
  );
}

/**
 * Every badge in Novelist World, with what earns each one.
 *
 * Deliberately not personalised, and deliberately without a breadcrumb: this is
 * the "what is there to collect" page, not a page about the novelist looking at
 * it, and a trail reading "/ username / Badges" says the opposite. A novelist's
 * own progress lives on the profile badges page instead.
 */
export default function BadgeCataloguePage() {
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.Container>
      <S.Hero>
        <S.HeroIcon>
          <TbAward />
        </S.HeroIcon>
        <S.HeroText>
          <S.HeroTitle>Badges of Novelist World</S.HeroTitle>
          <S.HeroSubtitle>
            Every badge there is to earn, and what earns it. Badges you hold
            show on your profile and anywhere else Novelists see your name.
          </S.HeroSubtitle>
        </S.HeroText>
      </S.Hero>

      <S.SectionHeading>
        The collection · {BADGE_CATALOGUE.length} badges
      </S.SectionHeading>

      <S.Grid>
        {BADGE_CATALOGUE.map((badge) => (
          <CatalogueCard key={badge.code} badge={badge} />
        ))}
      </S.Grid>

      <S.ComingSoon>
        <S.ComingSoonLabel>More badges on the way</S.ComingSoonLabel>

        {/* Decorative: there is nothing here to read, and a screen reader
            announcing six empty cards would be worse than silence. */}
        <S.GhostFade aria-hidden="true">
          <S.Grid>
            {Array.from({ length: GHOST_COUNT }, (_, index) => (
              <S.GhostCard key={`ghost-${index + 1}`}>
                <S.GhostArt>?</S.GhostArt>
                <S.CardText>
                  {GHOST_LINES.map((width) => (
                    <S.GhostLine key={width} $w={width} />
                  ))}
                </S.CardText>
              </S.GhostCard>
            ))}
          </S.Grid>
        </S.GhostFade>
      </S.ComingSoon>
    </S.Container>
  );
}
