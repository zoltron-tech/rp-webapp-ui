"use client";

import { ShouldRender } from "@novelist-world/ui";
import { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { PrivacyIcon } from "@/components/common/privacy-icon";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";
import PennedBy from "./PennedBy";

type Props = {
  muse: Muse | null;
  isOwnMuse: boolean;
};

export function MuseInfoSection({ muse, isOwnMuse }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { routeToPage } = usePageRouter();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <S.InfoPrivacyCorner>
            <PrivacyIcon privacy={muse?.privacy ?? "PUBLIC"} />
          </S.InfoPrivacyCorner>
          <S.InfoScrollBody accent={accent}>
            {/* Header: avatar + name + nicknames + fandom */}
            <S.InfoHeaderSection>
              <S.InfoCardAvatar
                $src={!muse?.image || avatarError ? "" : muse.image}
              >
                {muse?.image && (
                  // biome-ignore lint/a11y/useAltText: hidden probe only
                  <img
                    src={muse.image}
                    style={{ display: "none" }}
                    onError={() => setAvatarError(true)}
                  />
                )}
                {(!muse?.image || avatarError) && <FaUser size={30} />}
              </S.InfoCardAvatar>
              <S.InfoMuseName>
                {muse?.firstName}
                {muse?.lastName ? ` ${muse.lastName}` : ""}
              </S.InfoMuseName>
              <PennedBy pennedBy={muse?.pennedBy} accent={accent ?? null} />
              <ShouldRender if={Boolean(muse?.nicknames?.length)}>
                <S.InfoNicknamesRow>
                  {muse?.nicknames?.map((n) => (
                    <S.InfoNicknamePill key={n}>{n}</S.InfoNicknamePill>
                  ))}
                </S.InfoNicknamesRow>
              </ShouldRender>
              <ShouldRender
                if={Boolean(muse?.fandom && muse.fandom.id !== "FANDOMLESS")}
              >
                <S.FandomValue color={muse?.fandom?.color || "#444"}>
                  {muse?.fandom?.name}
                </S.FandomValue>
              </ShouldRender>
            </S.InfoHeaderSection>

            <S.InfoDivider $accent={accent ?? null} />

            <S.InfoSectionLabel>Details</S.InfoSectionLabel>

            {/* Details */}
            <S.InfoDetailsSection $accent={accent ?? null}>
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
            </S.InfoDetailsSection>
          </S.InfoScrollBody>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
