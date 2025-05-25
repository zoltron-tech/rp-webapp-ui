"use client";

import * as S from "./styles";
import { TbSquareRoundedLetterSFilled } from "react-icons/tb";
import {
  TbCircleLetterS,
  TbCircleLetterG,
  TbCircleLetterP,
} from "react-icons/tb";
import { GiCircleClaws } from "react-icons/gi";
import { GiGoldShell } from "react-icons/gi";
import { GiStarSwirl } from "react-icons/gi";
import { Flex } from "@novelist-world/ui";

export default function TiersCatalog() {
  const onLoginClick = () => {
    window.location.replace(`${process.env.RP_LOGIN_URL}?modal=SIGNUP`);
  };

  return (
    <>
      <S.MainContainer>
      <Flex style={{ marginTop: "40px" }} direction="column">
        <S.MainSubtext>Packages</S.MainSubtext>
        <S.CardsContainer>
          <S.StandardInfoCardBorder tiltOnHover effectStrength={10}>
            <S.InfoCard>
              <Flex direction="row" justify="center" align="center">
                <S.Badge tier="standard">
                  <TbSquareRoundedLetterSFilled />
                </S.Badge>
                <S.MainSubtext>Standard</S.MainSubtext>
              </Flex>
              <S.InfoContainer>
                <S.InfoItem>
                  <S.InfoLabel>Muses:</S.InfoLabel>
                  <S.InfoValue>10</S.InfoValue>
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
                  <S.InfoLabel>Media storage:</S.InfoLabel>
                  <S.InfoValue>1 GB</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>GIF-Enabled avatars:</S.InfoLabel>
                  <S.NegtiveInfoValue>No</S.NegtiveInfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Custom banner:</S.InfoLabel>
                  <S.NegtiveInfoValue>No</S.NegtiveInfoValue>
                </S.InfoItem>
                <S.Divider />
                <S.InfoItem>
                  <S.InfoLabel>Monthly price</S.InfoLabel>
                  <S.InfoValue>FREE</S.InfoValue>
                </S.InfoItem>
                <S.FormButton onClick={onLoginClick}>Join</S.FormButton>
              </S.InfoContainer>
            </S.InfoCard>
          </S.StandardInfoCardBorder>
          <S.SilverInfoCardBorder tiltOnHover effectStrength={10}>
            <S.InfoCard>
              <Flex direction="row" justify="center" align="center">
                <S.Badge tier="silver">
                  <GiCircleClaws />
                  <TbCircleLetterS className="letter" />
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
                  <S.InfoLabel>Media storage:</S.InfoLabel>
                  <S.InfoValue>3 GB</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>GIF-Enabled avatars:</S.InfoLabel>
                  <S.PositiveInfoValue>Yes</S.PositiveInfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Custom banner:</S.InfoLabel>
                  <S.NegtiveInfoValue>No</S.NegtiveInfoValue>
                </S.InfoItem>
                <S.Divider />
                <S.InfoItem>
                  <S.InfoLabel>Monthly price</S.InfoLabel>
                  <S.InfoValue>--</S.InfoValue>
                </S.InfoItem>
                <S.FormButton secondary>Coming Soon</S.FormButton>
              </S.InfoContainer>
            </S.InfoCard>
          </S.SilverInfoCardBorder>
          <S.GoldInfoCardBorder tiltOnHover effectStrength={10}>
            <S.InfoCard>
              <Flex direction="row" justify="center" align="center">
                <S.Badge tier="gold">
                  <GiGoldShell />
                  <TbCircleLetterG className="letter" />
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
                  <S.InfoLabel>Events per storyboards:</S.InfoLabel>
                  <S.InfoValue>30</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Media storage:</S.InfoLabel>
                  <S.InfoValue>10 GB</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>GIF-Enabled avatars:</S.InfoLabel>
                  <S.PositiveInfoValue>Yes</S.PositiveInfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Custom banner:</S.InfoLabel>
                  <S.PositiveInfoValue>Yes</S.PositiveInfoValue>
                </S.InfoItem>
                <S.Divider />
                <S.InfoItem>
                  <S.InfoLabel>Monthly price</S.InfoLabel>
                  <S.InfoValue>--</S.InfoValue>
                </S.InfoItem>
                <S.FormButton secondary>Coming Soon</S.FormButton>
              </S.InfoContainer>
            </S.InfoCard>
          </S.GoldInfoCardBorder>
          <S.PremiumInfoCardBorder tiltOnHover effectStrength={10}>
            <S.InfoCard>
              <Flex direction="row" justify="center" align="center">
                <S.Badge tier="premium">
                  <GiStarSwirl />
                  <TbCircleLetterP className="letter" />
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
                  <S.InfoLabel>Media storage:</S.InfoLabel>
                  <S.InfoValue>30 GB</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>GIF-Enabled avatars:</S.InfoLabel>
                  <S.PositiveInfoValue>Yes</S.PositiveInfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Custom banner:</S.InfoLabel>
                  <S.PositiveInfoValue>Yes</S.PositiveInfoValue>
                </S.InfoItem>
                <S.Divider />
                <S.InfoItem>
                  <S.InfoLabel>Monthly price</S.InfoLabel>
                  <S.InfoValue>--</S.InfoValue>
                </S.InfoItem>
                <S.FormButton secondary>Coming Soon</S.FormButton>
              </S.InfoContainer>
            </S.InfoCard>
          </S.PremiumInfoCardBorder>
        </S.CardsContainer>
      </Flex>
        </S.MainContainer>
    </>
  );
}
