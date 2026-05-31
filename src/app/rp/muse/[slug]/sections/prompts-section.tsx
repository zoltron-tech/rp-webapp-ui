"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import { FaComments } from "react-icons/fa6";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse, Prompt } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  prompts: Prompt[] | null;
};

export function PromptsSection({ muse, prompts }: Props) {
  const { routeToPage } = usePageRouter();
  const accent = muse?.useAccent ? muse.accent : undefined;

  return (
    <S.CardExpandedWrapper>
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Interactions</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            <ShouldRender if={!prompts || prompts.length === 0}>
              <S.SectionEmpty>No open starters yet.</S.SectionEmpty>
            </ShouldRender>
            {prompts?.map((prompt) => (
              <Flex
                key={prompt.id}
                direction="column"
                style={{ width: "100%" }}
              >
                <RichTextRenderer
                  savedText={prompt.text ?? ""}
                  collapsedHeight={100}
                  overlayHidden
                />
                {prompt.media && (
                  <S.PromptMedia>
                    <ShouldRender
                      if={/\.(mp4|mov|quicktime)$/i.test(prompt.media)}
                    >
                      <S.PromptVideo src={`${prompt.media}#t=0.3`} controls />
                    </ShouldRender>
                    <ShouldRender
                      if={!/\.(mp4|mov|quicktime)$/i.test(prompt.media)}
                    >
                      <AppImageViewer src={prompt.media} alt="Prompt media">
                        <S.CardBackground
                          banner={prompt.media}
                          className="image"
                        />
                      </AppImageViewer>
                    </ShouldRender>
                  </S.PromptMedia>
                )}
                <S.FooterContainer>
                  <Flex justify="flex-start" style={{ width: "80%" }}>
                    <FaComments />
                    <S.PromptFooterText
                      onClick={() =>
                        routeToPage(ROUTES.Prompt.View(prompt.id ?? ""))
                      }
                    >
                      View Comments &amp; Replies.
                    </S.PromptFooterText>
                  </Flex>
                  <S.StyledDate>
                    {toFormattedDate(prompt.createdOn)}
                  </S.StyledDate>
                </S.FooterContainer>
              </Flex>
            ))}
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
