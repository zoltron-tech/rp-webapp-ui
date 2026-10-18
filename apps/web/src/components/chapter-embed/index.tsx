"use client";

import { parseRichText, richTextToPlainText } from "@nw/richtext";
import { hasUsableCrop } from "@nw/utils/image";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFeather,
  FiLink,
  FiMapPin,
  FiMusic,
  FiUsers,
} from "react-icons/fi";
import { PiBookmarkSimpleFill } from "react-icons/pi";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { AvatarNew } from "../common/avatar-new";
import * as P from "../prompt-embed/styles";
import { type EmbeddedChapter, fetchEmbeddedChapter } from "./chapter-cache";
import * as S from "./styles";

/**
 * A chapter link, drawn as a page held open in its book.
 *
 * See `styles.ts` for the shape of the card. Routes to the link as written,
 * so a link to a particular passage still lands on it.
 */

type Props = {
  eventId: string;
  /** The URL as it was written; also where the card goes when clicked. */
  href: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; chapter: EmbeddedChapter }
  | { status: "unavailable" };

const OVERTURE_LINES = 2;

const pathOf = (href: string): string => {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

const words = (html: string | null | undefined): string =>
  html
    ? richTextToPlainText(parseRichText(html)).replace(/\s+/g, " ").trim()
    : "";

export const ChapterEmbed: FC<Props> = ({ eventId, href }) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedChapter(eventId)
      .then((chapter) => {
        if (!active) return;
        setState(
          chapter ? { chapter, status: "ready" } : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [eventId, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    routeToPage(pathOf(href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  const chapter = state.status === "ready" ? state.chapter : null;

  const derived = useMemo(() => {
    if (!chapter) return null;
    const { event, story, opening } = chapter;
    const chapters = [...(story?.events ?? [])].sort(
      (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0),
    );
    const index = chapters.findIndex((c) => c.id === event.id);
    const prev = index > 0 ? chapters[index - 1] : null;
    const next =
      index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;
    return {
      next,
      prev,
      // Position in the book: the sorted index when the story loaded, else
      // the event's own ordinal.
      at: index >= 0 ? index + 1 : (event.ordinal ?? 0),
      count: chapters.length || Math.max(event.ordinal ?? 0, 1),
      openingWords: words(opening?.message),
      overture: words(event.description),
    };
  }, [chapter]);

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
          <S.Head>
            <P.SkeletonLine $width="54px" $height="81px" />
            <S.Copy>
              <P.SkeletonLine $width="40%" $height="10px" />
              <P.SkeletonLine $width="85%" $height="15px" />
              <P.SkeletonLine $width="55%" $height="10px" />
              <P.SkeletonLine $width="95%" />
            </S.Copy>
          </S.Head>
          <P.SkeletonLine $width="100%" $height="54px" />
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable" || !chapter || !derived) {
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
          <strong>A chapter on Novelist World</strong>
          <span>This chapter is private or no longer here.</span>
        </P.UnavailableText>
      </P.Unavailable>
    );
  }

  const { event, story, opening, passageCount } = chapter;
  const tone = story?.fandom?.color ?? story?.genres?.[0]?.color ?? null;

  // The chapter's own cover when it has one, else the book's.
  const coverSrc =
    event.avatar?.src ||
    event.image ||
    story?.avatar?.src ||
    story?.image ||
    "";
  const coverCrop = event.avatar?.src
    ? hasUsableCrop(event.avatar.crop)
      ? event.avatar.crop
      : null
    : story?.avatar?.src && hasUsableCrop(story.avatar.crop)
      ? story.avatar.crop
      : null;

  const location = event.location?.trim() || "";
  const when = event.eventTime?.trim() || "";
  const song = event.song ?? null;
  const authors = story?.members?.length ?? 0;

  return (
    <S.Frame
      $tone={tone}
      aria-label={`Open the chapter ${event.name}`}
      href={href}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <S.Card>
        <S.Head>
          <S.Spine $crop={coverCrop} $src={coverSrc} aria-hidden="true">
            <S.Ribbon $flashback={!!event.isFlashback} />
          </S.Spine>

          <S.Copy>
            <S.Band>
              <PiBookmarkSimpleFill />
              <span>
                Chapter {derived.at}
                {derived.count > 1 ? ` of ${derived.count}` : ""}
              </span>
              {event.isFlashback ? <S.Flashback>Flashback</S.Flashback> : null}
            </S.Band>

            <S.Title title={event.name}>{event.name}</S.Title>

            {story ? (
              <S.Of title={story.name}>
                from{" "}
                <span>
                  <strong>{story.name}</strong>
                </span>
              </S.Of>
            ) : null}

            {location || when ? (
              <S.Setting>
                {location ? (
                  <span title={location}>
                    <FiMapPin />
                    <span>{location}</span>
                  </span>
                ) : null}
                {when ? (
                  <span title={when}>
                    <FiClock />
                    <span>{when}</span>
                  </span>
                ) : null}
              </S.Setting>
            ) : null}

            {derived.overture ? (
              <S.Overture $lines={OVERTURE_LINES}>
                {derived.overture}
              </S.Overture>
            ) : null}
          </S.Copy>
        </S.Head>

        {opening && derived.openingWords ? (
          <S.Opening>
            <S.OpeningText>{derived.openingWords}</S.OpeningText>
            <S.OpeningBy title={`Opened by ${opening.author.name}`}>
              <AvatarNew
                alt={opening.author.name}
                nwImage={opening.author.avatar}
                src={opening.author.image}
              />
              <em>
                <strong>{opening.author.name}</strong>, opening passage
              </em>
            </S.OpeningBy>
          </S.Opening>
        ) : null}

        <S.Facts>
          <S.Fact title="Passages">
            <FiFeather />
            <strong>{passageCount ?? 0}</strong>
            {passageCount === 1 ? "passage" : "passages"}
          </S.Fact>
          {authors > 0 ? (
            <S.Fact title="Authors">
              <FiUsers />
              <strong>{authors}</strong>
              {authors === 1 ? "author" : "authors"}
            </S.Fact>
          ) : null}
          {song ? (
            <S.Song
              title={`${song.title}${song.artist ? ` — ${song.artist}` : ""}`}
            >
              <FiMusic />
              <span>
                <strong>{song.title}</strong>
                {song.artist ? ` · ${song.artist}` : ""}
              </span>
            </S.Song>
          ) : null}
        </S.Facts>

        <S.Nav>
          <S.Neighbours>
            <S.Neighbour title={derived.prev?.name}>
              <FiChevronLeft />
              <span>
                <i>Before: </i>
                {derived.prev ? (
                  <strong>{derived.prev.name}</strong>
                ) : (
                  <em>the beginning</em>
                )}
              </span>
            </S.Neighbour>
            <S.Neighbour title={derived.next?.name}>
              <FiChevronRight />
              <span>
                <i>Next: </i>
                {derived.next ? (
                  <strong>{derived.next.name}</strong>
                ) : (
                  <em>the latest chapter</em>
                )}
              </span>
            </S.Neighbour>
          </S.Neighbours>
          <S.Open>
            Read chapter
            <FiArrowRight />
          </S.Open>
        </S.Nav>
      </S.Card>
    </S.Frame>
  );
};

export default ChapterEmbed;
