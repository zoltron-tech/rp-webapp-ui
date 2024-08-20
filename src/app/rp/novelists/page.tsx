"use client";

import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { Button, ShouldRender } from "@/components/common";
import * as S from "./styles";

const NovelistCarouselDynamic = dynamic(
  () => import("@/components/novelist-carousel"),
  { ssr: false }
);

export default function NovelistsPage() {
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
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
        <S.MainSubtext>Meet some of the Novelists</S.MainSubtext>
      </S.TabContainer>
      <NovelistCarouselDynamic />
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
