"use client";

import { ShouldRender } from "@novelist-world/ui";
import { GrEdit } from "react-icons/gr";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { Quote } from "@/components/novelist-card/styles";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse, MuseAboutSection } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  aboutSections: MuseAboutSection[] | null;
  isOwnMuse: boolean;
};

export function BackStorySection({ muse, aboutSections, isOwnMuse }: Props) {
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { routeToPage } = usePageRouter();

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Story</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            <ShouldRender
              if={muse?.note?.length !== undefined && muse.note.length > 0}
            >
              <S.NoteContainer>
                <Quote>{muse?.note}</Quote>
              </S.NoteContainer>
            </ShouldRender>

            <ShouldRender if={!aboutSections || aboutSections.length === 0}>
              <S.SectionEmptyWrap>
                <S.SectionEmpty>No story yet.</S.SectionEmpty>
                <ShouldRender if={isOwnMuse}>
                  <S.SectionEmptyCta
                    type="button"
                    onClick={() =>
                      routeToPage(
                        ROUTES.Profile.Muses.AboutCreate(muse?.id ?? ""),
                      )
                    }
                  >
                    <GrEdit size={13} />
                    Add story section
                  </S.SectionEmptyCta>
                </ShouldRender>
              </S.SectionEmptyWrap>
            </ShouldRender>

            <ShouldRender
              if={Boolean(aboutSections && aboutSections.length > 0)}
            >
              {aboutSections?.map((section, index) => (
                <div key={section.id ?? `about-section-${index}`}>
                  {section.image && (
                    <AppImageViewer
                      src={section.image}
                      alt="Section attachment"
                    >
                      <S.AboutSectionImage
                        src={section.image}
                        alt="Section attachment"
                      />
                    </AppImageViewer>
                  )}
                  <RichTextRenderer
                    savedText={section.text || ""}
                    overlayHidden
                    disableCollapse
                  />
                </div>
              ))}
            </ShouldRender>
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
