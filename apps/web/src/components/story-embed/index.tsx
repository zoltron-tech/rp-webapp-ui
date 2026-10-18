"use client";

import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { StoryBoard, StoryCastMember } from "@nw/types";
import { hasUsableCrop } from "@nw/utils/image";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiGlobe,
  FiHeart,
  FiLink,
  FiLock,
  FiUsers,
} from "react-icons/fi";
import { PiBookBookmarkFill, PiBookmarkSimple } from "react-icons/pi";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { AvatarNew } from "../common/avatar-new";
import * as P from "../prompt-embed/styles";
import { fetchEmbeddedStory } from "./story-cache";
import * as S from "./styles";

/**
 * A story link, drawn as the book.
 *
 * See `styles.ts` for the shape of the card. Routes to the link as written,
 * so a link into a particular view of the story still lands there.
 */

type Props = {
  storyId: string;
  /** The URL as it was written; also where the card goes when clicked. */
  href: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; story: StoryBoard }
  | { status: "unavailable" };

const BLURB_LINES = 3;
const MAX_STICKERS = 4;
const MAX_CAST = 5;
const MAX_CO_AUTHORS = 3;

const pathOf = (href: string): string => {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

const castFace = (member: StoryCastMember) => ({
  crop: member.avatar?.src ? member.avatar.crop : null,
  src: member.avatar?.src || member.image || museAvatarUrl(member.id) || "",
});

export const StoryEmbed: FC<Props> = ({ storyId, href }) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedStory(storyId)
      .then((story) => {
        if (!active) return;
        setState(
          story ? { status: "ready", story } : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [storyId, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    routeToPage(pathOf(href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  if (state.status === "loading") {
    return (
      <S.Frame
        $tone={null}
        aria-busy="true"
        ref={ref}
        href={href}
        onClick={open}
      >
        <S.Card>
          <S.Jacket>
            <P.SkeletonLine $width="78px" $height="117px" />
            <S.Copy>
              <P.SkeletonLine $width="30%" $height="10px" />
              <P.SkeletonLine $width="80%" $height="15px" />
              <P.SkeletonLine $width="50%" $height="10px" />
              <P.SkeletonLine $width="95%" />
              <P.SkeletonLine $width="70%" />
            </S.Copy>
          </S.Jacket>
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable") {
    return (
      <P.Unavailable
        href={href}
        onClick={open}
        onKeyDown={onKeyDown}
        rel="noreferrer noopener"
      >
        <P.UnavailableIcon>
          <FiLink size={16} />
        </P.UnavailableIcon>
        <P.UnavailableText>
          <strong>A story on Novelist World</strong>
          <span>This story is private or no longer here.</span>
        </P.UnavailableText>
      </P.Unavailable>
    );
  }

  const { story } = state;
  const tone = story.fandom?.color ?? story.genres?.[0]?.color ?? null;

  const coverSrc = story.avatar?.src || story.image || "";
  const coverCrop = hasUsableCrop(story.avatar?.crop)
    ? (story.avatar?.crop ?? null)
    : null;

  const blurb = story.description
    ? richTextToPlainText(parseRichText(story.description))
        .replace(/\s+/g, " ")
        .trim()
    : "";

  const creator = story.createdBy ?? null;
  const coAuthors = (story.members ?? [])
    .filter((m) => m.username !== creator?.username)
    .slice(0, MAX_CO_AUTHORS);
  const extraAuthors = Math.max(
    0,
    (story.members ?? []).filter((m) => m.username !== creator?.username)
      .length - coAuthors.length,
  );

  const chapters = story.events ?? [];
  const latest = chapters.length
    ? [...chapters].sort((a, b) => (b.ordinal ?? 0) - (a.ordinal ?? 0))[0]
    : null;

  const stickers: Array<{
    key: string;
    label: string;
    color: string | null;
    fandom?: boolean;
  }> = [];
  if (story.fandom && story.fandom.id !== "FANDOMLESS") {
    stickers.push({
      color: story.fandom.color,
      fandom: true,
      key: `f-${story.fandom.id}`,
      label: story.fandom.name,
    });
  }
  for (const genre of story.genres ?? []) {
    if (stickers.length >= MAX_STICKERS) break;
    stickers.push({
      color: genre.color,
      key: `g-${genre.id}`,
      label: genre.label,
    });
  }

  const cast = (story.cast ?? []).slice(0, MAX_CAST);
  const castMore = (story.cast?.length ?? 0) - cast.length;

  return (
    <S.Frame
      $tone={tone}
      aria-label={`Open the story ${story.name}`}
      href={href}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <S.Card>
        <S.Jacket>
          <S.Book $crop={coverCrop} $src={coverSrc} aria-hidden="true">
            {!coverSrc ? <S.BookTitle>{story.name}</S.BookTitle> : null}
          </S.Book>

          <S.Copy>
            <S.Band>
              <PiBookBookmarkFill />
              Story
              <S.Visibility $public={story.isPublic}>
                {story.isPublic ? (
                  <>
                    <FiGlobe />
                    Published
                  </>
                ) : (
                  <>
                    <FiLock />
                    Private
                  </>
                )}
              </S.Visibility>
            </S.Band>

            <S.Title title={story.name}>{story.name}</S.Title>

            {creator ? (
              <S.Byline>
                by <strong>@{creator.username}</strong>
                {coAuthors.length > 0 ? (
                  <>
                    <S.Authors
                      title={coAuthors.map((m) => `@${m.username}`).join(", ")}
                    >
                      {coAuthors.map((member) => (
                        <AvatarNew
                          alt={member.username}
                          key={member.username}
                          src={member.image}
                          username={member.username}
                        />
                      ))}
                    </S.Authors>
                    <span>
                      {extraAuthors > 0
                        ? `+${coAuthors.length + extraAuthors} co-authors`
                        : coAuthors.length === 1
                          ? "+1 co-author"
                          : `+${coAuthors.length} co-authors`}
                    </span>
                  </>
                ) : null}
              </S.Byline>
            ) : null}

            <S.Blurb $lines={BLURB_LINES}>
              {blurb || (
                <S.BlurbEmpty>
                  No blurb yet — the story speaks for itself.
                </S.BlurbEmpty>
              )}
            </S.Blurb>

            <S.Facts>
              <S.Fact title="Chapters">
                <FiBookOpen />
                <strong>{chapters.length}</strong>
                {chapters.length === 1 ? "chapter" : "chapters"}
              </S.Fact>
              <S.Fact $active={story.reacted} title="Hearts">
                <FiHeart />
                <strong>{story.reactions ?? 0}</strong>
              </S.Fact>
              {story.members?.length ? (
                <S.Fact title="Authors">
                  <FiUsers />
                  <strong>{story.members.length}</strong>
                  {story.members.length === 1 ? "author" : "authors"}
                </S.Fact>
              ) : null}
            </S.Facts>
          </S.Copy>
        </S.Jacket>

        {stickers.length > 0 ? (
          <S.Stickers>
            {stickers.map((sticker) => (
              <S.Sticker
                $color={sticker.color}
                $fandom={sticker.fandom}
                key={sticker.key}
                title={sticker.label}
              >
                {sticker.label}
              </S.Sticker>
            ))}
          </S.Stickers>
        ) : null}

        {cast.length > 0 ? (
          <S.Cast>
            <S.CastLabel>Cast</S.CastLabel>
            <S.CastFaces title={cast.map((c) => c.name).join(", ")}>
              {cast.map((member) => {
                const face = castFace(member);
                return (
                  <S.CastFace
                    $accent={member.accent}
                    $crop={face.crop}
                    $src={face.src}
                    key={member.id}
                    title={member.name}
                  >
                    {!face.src ? member.name.charAt(0).toUpperCase() : null}
                  </S.CastFace>
                );
              })}
            </S.CastFaces>
            {castMore > 0 ? <S.CastMore>+{castMore}</S.CastMore> : null}
            <S.CastNames>{cast.map((c) => c.name).join(" · ")}</S.CastNames>
          </S.Cast>
        ) : null}

        <S.Footer>
          {latest ? (
            <S.LatestChapter title={latest.name}>
              <PiBookmarkSimple />
              <span>
                Latest: <strong>{latest.name}</strong>
              </span>
            </S.LatestChapter>
          ) : (
            <S.LatestChapter>
              <PiBookmarkSimple />
              <span>No chapters yet</span>
            </S.LatestChapter>
          )}
          <S.Open>
            Open story
            <FiArrowRight />
          </S.Open>
        </S.Footer>
      </S.Card>
    </S.Frame>
  );
};

export default StoryEmbed;
