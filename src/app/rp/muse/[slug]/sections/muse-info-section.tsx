"use client";

import { ShouldRender } from "@novelist-world/ui";
import { GrEdit } from "react-icons/gr";
import { PrivacyIcon } from "@/components/common/privacy-icon";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";

type Props = {
  muse: Muse | null;
  isOwnMuse: boolean;
};

export function MuseInfoSection({ muse, isOwnMuse }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { routeToPage } = usePageRouter();

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <S.InfoPrivacyCorner>
            <PrivacyIcon privacy={muse?.privacy ?? "PUBLIC"} />
          </S.InfoPrivacyCorner>
          <S.InfoScrollBody accent={accent}>
            {/* Name + Nicknames */}
            <S.InfoHeaderSection>
              <S.InfoCardAvatar $src={muse?.image ?? ""} />
              <S.InfoMuseName>
                {muse?.firstName}
                {muse?.lastName ? ` ${muse.lastName}` : ""}
              </S.InfoMuseName>
              <ShouldRender if={Boolean(muse?.nicknames?.length)}>
                <S.InfoNicknamesRow>
                  {muse?.nicknames?.map((n) => (
                    <S.InfoNicknamePill key={n}>{n}</S.InfoNicknamePill>
                  ))}
                </S.InfoNicknamesRow>
              </ShouldRender>
            </S.InfoHeaderSection>

            {/* Fandom */}
            <ShouldRender if={muse?.fandom !== null}>
              <S.InfoFandomSection>
                <S.FandomValue color={muse?.fandom?.color || "#444"}>
                  {muse?.fandom?.name}
                </S.FandomValue>
              </S.InfoFandomSection>
            </ShouldRender>

            {/* Extra Attributes */}
            <ShouldRender
              if={
                !muse?.extraAttributes ||
                Object.keys(muse.extraAttributes).length === 0
              }
            >
              <S.SectionEmptyWrap>
                <S.SectionEmpty>No information yet.</S.SectionEmpty>
                <ShouldRender if={isOwnMuse}>
                  <S.SectionEmptyCta
                    type="button"
                    onClick={() =>
                      routeToPage(
                        ROUTES.Profile.Muses.ExtraAttributes(muse?.id ?? ""),
                      )
                    }
                  >
                    <GrEdit size={13} />
                    Add information
                  </S.SectionEmptyCta>
                </ShouldRender>
              </S.SectionEmptyWrap>
            </ShouldRender>
            <ShouldRender
              if={Boolean(
                muse?.extraAttributes &&
                  Object.keys(muse.extraAttributes).length > 0,
              )}
            >
              <S.InfoAttributesGrid>
                {muse?.extraAttributes &&
                  Object.entries(muse.extraAttributes).map(([key, value]) => (
                    <S.InfoAttributeCard key={key} accent={accent}>
                      <S.InfoAttributeKey>{key}</S.InfoAttributeKey>
                      <S.InfoAttributeValue>{value}</S.InfoAttributeValue>
                    </S.InfoAttributeCard>
                  ))}
              </S.InfoAttributesGrid>
            </ShouldRender>
          </S.InfoScrollBody>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
