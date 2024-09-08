"use client";

import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import * as S from "./styles";
import { Button, Carousel } from "@novelist-world/ui";
import { MuseCard } from "@/components/muse-card";
import { getHeroPageMusesAction } from "../muse/actions";
import { Muse } from "@/types";
import { useAuthContext } from "@/hooks";
import { useRouter } from "next/navigation";
import TiersCatalog from "../tiers/page";

const NovelistCarouselDynamic = dynamic(
  () => import("@/components/novelist-carousel"),
  { ssr: false }
);

export default function NovelistsPage() {
  const initialRender = useRef(true);
  const [muses, set] = useState<Muse[]>([]);
  const { state } = useAuthContext();
  const { push } = useRouter();

  const updateMuses = useCallback(async () => {
    const response = await getHeroPageMusesAction();
    if (response && !("message" in response)) {
      set(response);
    }
  }, [set]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      updateMuses();
      return;
    }
  }, [updateMuses]);

  Logger.info("NovelistsPage rendered");

  const onLoginClick = () => {
    window.location.replace(`${process.env.RP_LOGIN_URL}?modal=SIGNUP`);
  };

  const toHomePage = () => {
    push(`/rp/home/`);
  };

  return (
    <>
      <S.PageContainer>
        <S.MainHeading>NOVELIST WORLD</S.MainHeading>
        <S.MainSubtext>
          Create Worlds, Write Stories, Collaborate with Creators.
        </S.MainSubtext>
        <S.Story>
          Collaborate with friends and fellow novelists to bring your
          imagination to life. Work together to craft intricate realms, develop
          compelling characters, and weave stories that reflect your collective
          creativity. Join a community of like-minded writers where you can
          share ideas, inspire each other, and build entire worlds together.
        </S.Story>
        <S.ButtonsGroupContainer>
          <S.MainButton
            primary={state === "LOGGED_IN"}
            secondary={state !== "LOGGED_IN"}
            onClick={state == "LOGGED_IN" ? toHomePage : onLoginClick}
          >
            {state == "LOGGED_IN" ? "My Dashboard" : "Get Started"}
          </S.MainButton>
        </S.ButtonsGroupContainer>
      </S.PageContainer>
      <S.TabContainer>
        <S.MainSubtext>Collaborate with fellow Novelists</S.MainSubtext>
      </S.TabContainer>
      <NovelistCarouselDynamic />
      <S.MainSubtext>Interact with Characters</S.MainSubtext>
      <S.MuseCarouselContainer>
        <Carousel>
          {muses.length &&
            muses
              .slice(0, Math.floor(muses.length / 2))
              .map((muse) => (
                <MuseCard
                  key={muse?.id}
                  className="hero"
                  muse={muse}
                ></MuseCard>
              ))}
        </Carousel>
        <Carousel direction="to-right">
          {muses.length &&
            muses
              .slice(Math.floor(muses.length / 2))
              .map((muse) => (
                <MuseCard
                  key={muse?.id}
                  className="hero"
                  muse={muse}
                ></MuseCard>
              ))}
        </Carousel>
      </S.MuseCarouselContainer>

      <S.CardsContainer>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <S.MainSubtext>Create Your Own Realm</S.MainSubtext>
          <S.Story>
            Create and customize realms, populate them with unique characters,
            and fill them with magical objects. Your imagination is the only
            limit.
          </S.Story>
        </S.InfoCard>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <S.MainSubtext>Collaborate and Connect</S.MainSubtext>
          <S.Story>
            Work with fellow writers to expand your stories. Share ideas,
            develop plots, and create something extraordinary together.
          </S.Story>
        </S.InfoCard>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <S.MainSubtext>Join a Thriving Community</S.MainSubtext>
          <S.Story>
            Whether you are a seasoned writer or just starting, you will find
            inspiration and support in our diverse and welcoming community.
          </S.Story>
        </S.InfoCard>
      </S.CardsContainer>

      <TiersCatalog></TiersCatalog>
    </>
  );
}
