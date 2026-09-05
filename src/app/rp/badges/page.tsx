"use client";

import { useEffect } from "react";
import { TbAward } from "react-icons/tb";
import { BadgeArtwork } from "@/components/badges";
import {
  BADGE_CATALOGUE,
  type CatalogueBadge,
  RARITY_LABEL,
} from "@/components/badges/catalogue";
import { BreadCrumb } from "@/components/breadcrumb";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import * as S from "./styles";

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
 * Deliberately not personalised — this is the "what is there to collect" page,
 * reachable from any novelist's badge dialog. A novelist's own progress lives
 * on the profile badges page instead.
 */
export default function BadgeCataloguePage() {
  const user = useGlobalState("user");
  const { stopPageLoading } = usePageRouter();

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  return (
    <S.Container>
      <BreadCrumb label="Badges" username={user?.username ?? ""} />

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
    </S.Container>
  );
}
