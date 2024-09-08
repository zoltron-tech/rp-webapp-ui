"use client";

import * as S from "./styles";
import { MdPentagon } from "react-icons/md";
import { GiSparkles } from "react-icons/gi";
import { GiGoldShell } from "react-icons/gi";
import { GiAbstract047 } from "react-icons/gi";
import { Button, Flex } from "@novelist-world/ui";

export default function TiersCatalog() {
  return (
    <>
      <S.CardsContainer>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <Flex direction="row" justify="center" align="center">
            <S.Badge tier="standard">
              <MdPentagon />
            </S.Badge>
            <S.MainSubtext>Standard</S.MainSubtext>
          </Flex>
          <S.InfoContainer>
            <S.InfoItem>
              <S.InfoLabel>Muses:</S.InfoLabel>
              <S.InfoValue>20</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Storyboards:</S.InfoLabel>
              <S.InfoValue>10</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Events per storyboards:</S.InfoLabel>
              <S.InfoValue>20</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>media storage:</S.InfoLabel>
              <S.InfoValue>500 MB</S.InfoValue>
            </S.InfoItem>
            <S.Divider />
            <S.InfoItem>
              <S.InfoLabel>Monthly price</S.InfoLabel>
              <S.InfoValue>FREE</S.InfoValue>
            </S.InfoItem>
            <S.FormButton>Join</S.FormButton>
          </S.InfoContainer>
        </S.InfoCard>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <Flex direction="row" justify="center" align="center">
            <S.Badge tier="silver">
              <GiSparkles />
            </S.Badge>
            <S.MainSubtext>Silver</S.MainSubtext>
          </Flex>
          <S.InfoContainer>
            <S.InfoItem>
              <S.InfoLabel>Muses:</S.InfoLabel>
              <S.InfoValue>30</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Storyboards:</S.InfoLabel>
              <S.InfoValue>15</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Events per storyboards:</S.InfoLabel>
              <S.InfoValue>25</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>media storage:</S.InfoLabel>
              <S.InfoValue>750 MB</S.InfoValue>
            </S.InfoItem>
            <S.Divider />
            <S.InfoItem>
              <S.InfoLabel>Monthly price</S.InfoLabel>
              <S.InfoValue>$0.99</S.InfoValue>
            </S.InfoItem>
            <S.FormButton>Subscribe</S.FormButton>
          </S.InfoContainer>
        </S.InfoCard>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <Flex direction="row" justify="center" align="center">
            <S.Badge tier="gold">
              <GiGoldShell />
            </S.Badge>
            <S.MainSubtext>Gold</S.MainSubtext>
          </Flex>
          <S.InfoContainer>
            <S.InfoItem>
              <S.InfoLabel>Muses:</S.InfoLabel>
              <S.InfoValue>40</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Storyboards:</S.InfoLabel>
              <S.InfoValue>20</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Events / storyboards:</S.InfoLabel>
              <S.InfoValue>30</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>media storage:</S.InfoLabel>
              <S.InfoValue>1 GB</S.InfoValue>
            </S.InfoItem>
            <S.Divider />
            <S.InfoItem>
              <S.InfoLabel>Monthly price</S.InfoLabel>
              <S.InfoValue>$3.99</S.InfoValue>
            </S.InfoItem>
            <S.FormButton>Subscribe</S.FormButton>
          </S.InfoContainer>
        </S.InfoCard>
        <S.InfoCard tiltOnHover effectStrength={15}>
          <Flex direction="row" justify="center" align="center">
            <S.Badge tier="premium">
              <GiAbstract047 />
            </S.Badge>
            <S.MainSubtext>Premium</S.MainSubtext>
          </Flex>
          <S.InfoContainer>
            <S.InfoItem>
              <S.InfoLabel>Muses:</S.InfoLabel>
              <S.InfoValue>50</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Storyboards:</S.InfoLabel>
              <S.InfoValue>30</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>Events per storyboards:</S.InfoLabel>
              <S.InfoValue>50</S.InfoValue>
            </S.InfoItem>
            <S.InfoItem>
              <S.InfoLabel>media storage:</S.InfoLabel>
              <S.InfoValue>1 GB</S.InfoValue>
            </S.InfoItem>
            <S.Divider />
            <S.InfoItem>
              <S.InfoLabel>Monthly price</S.InfoLabel>
              <S.InfoValue>$7.99</S.InfoValue>
            </S.InfoItem>
            <S.FormButton>Subscribe</S.FormButton>
          </S.InfoContainer>
        </S.InfoCard>
      </S.CardsContainer>
    </>
  );
}
