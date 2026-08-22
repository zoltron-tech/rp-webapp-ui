"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { Friend, Muse, Prompt } from "@nw/types";
import { useState } from "react";
import { FaComments, FaHeart } from "react-icons/fa6";
import { AvatarNew } from "@/components/common/avatar-new";
import { PrivacyIcon } from "@/components/common/privacy-icon";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { ReactionLikersDialog } from "@/components/reaction-likers-dialog";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { SharedWithDialog } from "@/components/shared-with-dialog";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  prompts: Prompt[] | null;
};

const isVideoMedia = (media: string) => /\.(mp4|mov|quicktime)$/i.test(media);

const commentsLabel = (count: number) =>
  count > 0
    ? `${count} comment${count === 1 ? "" : "s"}`
    : "Comments & replies";

const PRIVACY_LABELS: Record<Prompt["privacy"], string> = {
  CUSTOM: "Custom",
  FRIENDS: "Friends",
  ONLY_ME: "Only me",
  PUBLIC: "Public",
};

const sharedWithLabel = (friends: Friend[]) => {
  const first = friends[0]?.firstName ?? "";
  if (friends.length === 1) return `Shared with ${first}`;
  return `${first} & ${friends.length - 1} other${friends.length === 2 ? "" : "s"}`;
};

export function PromptsSection({ muse, prompts }: Props) {
  const { routeToPage } = usePageRouter();
  const accent = muse?.useAccent ? muse.accent : undefined;
  const [sharedWithList, setSharedWithList] = useState<Friend[] | null>(null);
  const [likersPrompt, setLikersPrompt] = useState<{
    id: string;
    count: number;
  } | null>(null);

  return (
    <S.CardExpandedWrapper>
      <SharedWithDialog
        friends={sharedWithList ?? []}
        open={sharedWithList !== null}
        onClose={() => setSharedWithList(null)}
      />
      <ReactionLikersDialog
        open={likersPrompt !== null}
        onClose={() => setLikersPrompt(null)}
        targetId={likersPrompt?.id ?? ""}
        initialCount={likersPrompt?.count}
      />
      <S.CardBack className="muse-card" accent={accent}>
        <S.InfoCardContent>
          <SectionMiniHeader muse={muse} accent={accent ?? null} />
          <S.InfoDivider $accent={accent ?? null} />
          <S.InfoSectionLabel>Interactions</S.InfoSectionLabel>
          <S.ScrollableContent accent={accent}>
            <ShouldRender if={prompts === null}>
              <S.ShimmerGroup>
                <S.ShimmerBlock $height="120px" />
                <S.ShimmerBlock $height="120px" style={{ marginTop: "10px" }} />
                <S.ShimmerBlock $height="120px" style={{ marginTop: "10px" }} />
              </S.ShimmerGroup>
            </ShouldRender>

            <ShouldRender if={prompts !== null && prompts.length === 0}>
              <S.SectionEmpty>No open starters yet.</S.SectionEmpty>
            </ShouldRender>

            {prompts && prompts.length > 0 && (
              <S.PromptList>
                {prompts.map((prompt) => (
                  <S.PromptCard key={prompt.id} $accent={accent ?? null}>
                    <S.PromptCardTopRow>
                      <S.PromptCardDate $accent={accent ?? null}>
                        {toFormattedDate(prompt.createdOn)}
                      </S.PromptCardDate>
                      {prompt.privacy &&
                        (prompt.privacy === "CUSTOM" &&
                        (prompt.sharedWith?.length ?? 0) > 0 ? (
                          <S.PromptPrivacyChip
                            type="button"
                            $accent={accent ?? null}
                            $interactive
                            title="See who this is shared with"
                            onClick={() => setSharedWithList(prompt.sharedWith)}
                          >
                            <S.PromptSharedAvatars>
                              {prompt.sharedWith.slice(0, 3).map((friend) => (
                                <AvatarNew
                                  key={friend.id}
                                  className="shared-avatar"
                                  src={friend.image}
                                  alt={friend.username}
                                  nwImage={friend.avatar}
                                />
                              ))}
                            </S.PromptSharedAvatars>
                            <span className="shared-label">
                              {sharedWithLabel(prompt.sharedWith)}
                            </span>
                          </S.PromptPrivacyChip>
                        ) : (
                          <S.PromptPrivacyChip
                            as="span"
                            $accent={accent ?? null}
                          >
                            <PrivacyIcon privacy={prompt.privacy} />
                            {PRIVACY_LABELS[prompt.privacy] ?? prompt.privacy}
                          </S.PromptPrivacyChip>
                        ))}
                    </S.PromptCardTopRow>

                    {prompt.text && (
                      <RichTextRenderer
                        savedText={prompt.text}
                        collapsedHeight={100}
                        overlayHidden
                        accent={accent ?? null}
                      />
                    )}

                    {prompt.media && (
                      <S.PromptCardMedia>
                        <ShouldRender if={isVideoMedia(prompt.media)}>
                          <S.PromptCardVideo
                            src={`${prompt.media}#t=0.3`}
                            controls
                          />
                        </ShouldRender>
                        <ShouldRender if={!isVideoMedia(prompt.media)}>
                          <AppImageViewer src={prompt.media} alt="Prompt media">
                            <S.PromptCardImage
                              src={prompt.media}
                              alt="Prompt media"
                              loading="lazy"
                            />
                          </AppImageViewer>
                        </ShouldRender>
                      </S.PromptCardMedia>
                    )}

                    <S.PromptCardFooter>
                      <S.PromptCommentsBtn
                        type="button"
                        $accent={accent ?? null}
                        onClick={() =>
                          routeToPage(ROUTES.Prompt.View(prompt.id ?? ""))
                        }
                      >
                        <FaComments size={12} />
                        {commentsLabel(prompt.commentCount ?? 0)}
                      </S.PromptCommentsBtn>
                      {(prompt.reactions ?? 0) > 0 && (
                        <S.PromptCardStat
                          title="Reactions"
                          onClick={() =>
                            prompt.id &&
                            setLikersPrompt({
                              count: prompt.reactions ?? 0,
                              id: prompt.id,
                            })
                          }
                        >
                          <FaHeart size={10} />
                          {prompt.reactions}
                        </S.PromptCardStat>
                      )}
                    </S.PromptCardFooter>
                  </S.PromptCard>
                ))}
              </S.PromptList>
            )}
          </S.ScrollableContent>
        </S.InfoCardContent>
      </S.CardBack>
    </S.CardExpandedWrapper>
  );
}
