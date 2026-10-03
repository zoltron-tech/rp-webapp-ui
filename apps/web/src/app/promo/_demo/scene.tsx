"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineTheaters } from "react-icons/md";
import * as P from "@/app/rp/story/[slug]/styles";
import { CoverImage, Username } from "@/components/common";
import { Button as AddNewButtonStyle } from "@/components/common/add-new-button/styles";
import { AppDropdownMenuResponsive } from "@/components/profile-more-dropdown";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import StoryCardEvent from "@/components/story-event-card";
import { StoryMembers } from "@/components/story-members";
import { StoryboardWorkspace } from "@/components/storyboard-workspace";
import * as W from "@/components/storyboard-workspace/styles";
import { CODEX, STORYBOARD, STORYBOARD_ID } from "./dummy-data";
import { usePromoHarness } from "./harness";
import * as S from "./styles";
import { applyFrame, DURATION } from "./timeline";

export const PromoScene = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Put the scene at t=0 before the browser paints, so the first thing anyone
  // sees is the stage still off-shot rather than the finished screen flashing
  // into place.
  useLayoutEffect(() => {
    if (rootRef.current) applyFrame(rootRef.current, 0);
  }, []);

  usePromoHarness(
    DURATION,
    useCallback((t: number) => {
      if (rootRef.current) applyFrame(rootRef.current, t);
    }, []),
  );

  return (
    <S.Root ref={rootRef}>
      <S.Stage data-promo="stage">
        <S.PageHead>
          <P.HeroRow>
            <P.HeroCover className="promo-cover">
              <CoverImage src={STORYBOARD.image} nwImage={STORYBOARD.avatar} />
            </P.HeroCover>
            <P.HeroInfo>
              <P.Name>{STORYBOARD.name}</P.Name>
              <P.CreatedByRow>
                <span>Author:</span>
                <Username
                  primary
                  className="mini medium"
                  username={STORYBOARD.createdBy?.username}
                />
              </P.CreatedByRow>
              <P.MetaStack>
                <P.FandomChip title="Fandom">
                  <MdOutlineTheaters />
                  <b>{STORYBOARD.fandom?.name}</b>
                </P.FandomChip>
                <P.GenreRow>
                  {(STORYBOARD.genres ?? []).map((genre) => (
                    <P.GenrePill key={genre.id} $color={genre.color}>
                      {genre.label}
                    </P.GenrePill>
                  ))}
                </P.GenreRow>
              </P.MetaStack>
            </P.HeroInfo>
          </P.HeroRow>

          <P.DescriptionSection>
            <RichTextRenderer
              savedText={STORYBOARD.description ?? ""}
              overlayHidden
              disableCollapse
            />
          </P.DescriptionSection>

          <P.ActionRow>
            <P.HeartChip type="button" aria-label="React">
              <FaRegHeart />
              <P.HeartCountText>
                <b>{STORYBOARD.reactions}</b>likes
              </P.HeartCountText>
            </P.HeartChip>
            <P.ShareButton type="button">
              <FiShare2 />
              Share
            </P.ShareButton>
            <P.ActionRowSpacer />
            <AppDropdownMenuResponsive
              trigger={<BsThreeDots size={18} />}
              items={[]}
              variant="bordered"
            />
          </P.ActionRow>

          <StoryMembers storyboard={STORYBOARD} />

          {/* The cast strip is deliberately left out — it costs ~90px of
              height and says the same thing the codex beat is about to say
              properly, with faces and relationships. */}
        </S.PageHead>

        <S.WorkspaceSlot>
          <StoryboardWorkspace
            storyboardId={STORYBOARD_ID}
            story={STORYBOARD}
            canEdit
            codexSeed={CODEX}
            chaptersView={
              <>
                <W.SectionHeaderRow data-promo="chapters-head">
                  <W.SectionName>
                    CHAPTERS ({STORYBOARD.events.length} / 12)
                  </W.SectionName>
                  <W.Spacer />
                  <AddNewButtonStyle type="button">
                    Add chapter
                    <IoMdAdd size={18} />
                  </AddNewButtonStyle>
                </W.SectionHeaderRow>

                <W.ChapterGrid data-promo="chapters">
                  {STORYBOARD.events.map((event) => (
                    <StoryCardEvent
                      key={event.id}
                      event={event}
                      storyboardId={STORYBOARD_ID}
                      isCurrentUser
                    >
                      {event.name}
                    </StoryCardEvent>
                  ))}
                </W.ChapterGrid>
              </>
            }
          />
        </S.WorkspaceSlot>
      </S.Stage>
    </S.Root>
  );
};
