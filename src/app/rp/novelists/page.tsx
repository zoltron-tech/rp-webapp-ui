"use client";

import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Button } from "@/components/common";
import { MuseCard } from "@/components/muse-card";
import * as S from "./styles";
import { Carousel } from "@novelist-world/ui";
import { useStore } from "@/hooks";
import { StoreState } from "@/types/state";
import { getHeroPageMusesAction } from "../muse/actions";

const NovelistCarouselDynamic = dynamic(
  () => import("@/components/novelist-carousel"),
  { ssr: false },
);

export default function NovelistsPage() {
  const initialRender = useRef(true);
  const [muses, set] = useStore<StoreState, "muses">((store) => store.muses);

  const updateMuses = async () => {
    const response = await getHeroPageMusesAction();
    console.log("response", response);
    if (response && !("message" in response)) {
      set({ muses: response });
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      updateMuses();
      return;
    }
  }, []);

  Logger.info("NovelistsPage rendered");

  const onLoginClick = () => {
    window.location.replace(`${process.env.RP_LOGIN_URL}`);
  };

  return (
    <>
      <S.PageContainer>
        <S.MainHeading>NOVELIST WORLD</S.MainHeading>
        <S.MainSubtext>
          Create Worlds, Write Stories, Collaborate with Creators.
        </S.MainSubtext>
        <S.Story>
          Join a community of writers and bring your imagination to life. Craft
          realms, develop characters, and share stories with a network of
          passionate creators.
        </S.Story>
        <S.ButtonsGroupContainer>
          <S.ButtonContainer>
            <Button variant="secondary" onClick={onLoginClick}>
              Get Started
            </Button>
          </S.ButtonContainer>
        </S.ButtonsGroupContainer>
      </S.PageContainer>
      <S.TabContainer>
        <S.MainSubtext>Colaborate with fellow Novelists</S.MainSubtext>
      </S.TabContainer>
      <NovelistCarouselDynamic />
      <S.MainSubtext>Interact with Muses</S.MainSubtext>
      <S.MuseCarouselContainer>
        {muses && (
          <>
            <Carousel>
              {muses &&
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
              {muses &&
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
          </>
        )}
      </S.MuseCarouselContainer>

      <S.CardsContainer>
        <S.InfoCard>
          <S.MainSubtext>Create Your Own Realm</S.MainSubtext>
          <S.Story>
            Create and customize realms, populate them with unique characters,
            and fill them with magical objects. Your imagination is the only
            limit.
          </S.Story>
        </S.InfoCard>
        <S.InfoCard>
          <S.MainSubtext>Collaborate and Connect</S.MainSubtext>
          <S.Story>
            Work with fellow writers to expand your stories. Share ideas,
            develop plots, and create something extraordinary together.
          </S.Story>
        </S.InfoCard>
        <S.InfoCard>
          <S.MainSubtext>Join a Thriving Community</S.MainSubtext>
          <S.Story>
            Whether you are a seasoned writer or just starting, you will find
            inspiration and support in our diverse and welcoming community.
          </S.Story>
        </S.InfoCard>
      </S.CardsContainer>
    </>
  );
}
