"use client";

import { Flex } from "@novelist-world/ui";
import { IoHeart } from "react-icons/io5";
import { VscUnverified, VscVerifiedFilled } from "react-icons/vsc";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
};

export function ConnectionsSection({ muse }: Props) {
  const { routeToPage } = usePageRouter();
  const accent = muse?.useAccent ? muse.accent : undefined;

  const handleConnectionClick = (
    connection: NonNullable<Muse["connections"]>[number],
  ) => {
    const targetId =
      connection.sourceMuseId === muse?.id
        ? connection.targetMuseId
        : connection.sourceMuseId;
    if (targetId) routeToPage(ROUTES.Muse.View(targetId));
  };

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.ConnectionsContainer>
            <S.ScrollableContent accent={accent}>
              {!muse && (
                <S.ShimmerGroup>
                  <S.ShimmerBlock $height="56px" />
                  <S.ShimmerBlock $height="56px" />
                  <S.ShimmerBlock $height="56px" />
                </S.ShimmerGroup>
              )}
              <S.ExpandedContentInner>
                {muse?.connections?.map((connection) => (
                  <S.ConnectionItem
                    key={`${connection.sourceMuseId}-${connection.targetMuseId}`}
                    onClick={() => handleConnectionClick(connection)}
                  >
                    <S.Avatar
                      src={connection.image}
                      alt={connection.firstName}
                      size={40}
                      className="paddington"
                      name={connection.firstName}
                    />
                    <Flex direction="column" align="flex-start">
                      <S.ConnectionLabel>
                        {connection.firstName} {connection.lastName}
                      </S.ConnectionLabel>
                      <Flex>
                        <S.ConnectionType>
                          {connection.connection}
                        </S.ConnectionType>
                        {connection.verified &&
                          connection.connection !== "RELATIONSHIP" && (
                            <VscVerifiedFilled
                              size={20}
                              color="rgb(21, 74, 117)"
                            />
                          )}
                        {connection.connection === "RELATIONSHIP" &&
                          connection.verified && (
                            <IoHeart size={20} color="rgb(151, 42, 42)" />
                          )}
                        {!connection.verified && (
                          <VscUnverified size={20} color="rgb(184, 184, 184)" />
                        )}
                      </Flex>
                    </Flex>
                  </S.ConnectionItem>
                ))}
              </S.ExpandedContentInner>
            </S.ScrollableContent>
          </S.ConnectionsContainer>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
