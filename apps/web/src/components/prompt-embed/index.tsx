"use client";

import { imageSources, parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Prompt } from "@nw/types";
import { type Accent, ACCENT_MAP } from "@nw/types/theme";
import { toFormattedDate } from "@nw/utils/format";
import { wsrvImage } from "@nw/utils/image";
import classNames from "classnames";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaPlay } from "react-icons/fa";
import { FiArrowRight, FiHeart, FiLink, FiMessageCircle } from "react-icons/fi";
import { PiFeatherFill } from "react-icons/pi";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { AvatarNew } from "../common/avatar-new";
import { PrivacyIcon } from "../common/privacy-icon";
import { fetchEmbeddedPrompt } from "./prompt-cache";
import * as S from "./styles";

/**
 * A prompt link, drawn as the prompt.
 *
 * The companion to `MuseEmbed`: same three states at one width, same frame.
 * Opens the prompt through the link as written, so `?threadOpen=true` and
 * whatever else the author's URL carried still apply.
 */

type Props = {
  promptId: string;
  /** The URL as it was written; also where the card goes when clicked. */
  href: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; prompt: Prompt }
  | { status: "unavailable" };

const EXCERPT_LINES = 4;
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
/** A card's thumbnail: the original upload would be the full picture. */
const THUMB = { fit: "cover" as const, h: 240, w: 240 };

/** The in-app path of a link, so the router handles it like any other tap. */
const pathOf = (href: string): string => {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

export const PromptEmbed: FC<Props> = ({ promptId, href }) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedPrompt(promptId)
      .then((prompt) => {
        if (!active) return;
        setState(
          prompt ? { prompt, status: "ready" } : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [promptId, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    routeToPage(pathOf(href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  const prompt = state.status === "ready" ? state.prompt : null;

  // Words and pictures pulled from the saved rich text once per prompt.
  const { excerpt, inlineImage } = useMemo(() => {
    if (!prompt) return { excerpt: "", inlineImage: null };
    const nodes = parseRichText(prompt.text);
    return {
      excerpt: richTextToPlainText(nodes)
        .replace(/\n{2,}/g, "\n")
        .trim(),
      inlineImage: imageSources(nodes)[0] ?? null,
    };
  }, [prompt]);

  if (state.status === "loading") {
    return (
      <S.Frame
        $accent={null}
        aria-busy="true"
        ref={ref}
        href={href}
        onClick={open}
      >
        <S.Card>
          <S.Header>
            <S.SkeletonAvatar />
            <S.Author>
              <S.SkeletonLine $width="45%" $height="13px" />
              <S.SkeletonLine $width="30%" $height="9px" />
            </S.Author>
          </S.Header>
          <S.SkeletonLine $width="95%" />
          <S.SkeletonLine $width="80%" />
          <S.SkeletonLine $width="60%" />
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable" || !prompt) {
    return (
      <S.Unavailable
        href={href}
        onClick={open}
        onKeyDown={onKeyDown}
        rel="noreferrer noopener"
      >
        <S.UnavailableIcon>
          <FiLink size={16} />
        </S.UnavailableIcon>
        <S.UnavailableText>
          <strong>A prompt on Novelist World</strong>
          <span>This prompt is private or no longer here.</span>
        </S.UnavailableText>
      </S.Unavailable>
    );
  }

  const { source } = prompt;
  const isMuse = source.sourceType === "MUSE";
  // A muse carries its accent as a hex; a novelist carries a palette key that
  // only means something once the matching class is on an ancestor.
  const paletteClass =
    !isMuse && source.useAccent && source.accent != null
      ? (ACCENT_MAP[Number(source.accent) as Accent] ?? null)
      : null;
  const accent =
    isMuse && source.useAccent && source.accent ? source.accent : null;

  const media = prompt.media?.trim() || "";
  const mediaIsVideo = !!media && VIDEO_RE.test(media);
  const thumb = media && !mediaIsVideo ? media : inlineImage;

  return (
    <S.Frame
      $accent={accent}
      aria-label={`Open ${source.name}'s prompt`}
      className={classNames(paletteClass)}
      href={href}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <S.Card>
        <S.Header>
          <AvatarNew
            accentColor={accent ?? (paletteClass ? "var(--accent)" : null)}
            alt={source.name}
            nwImage={source.avatar}
            src={source.image}
          />
          <S.Author>
            <S.AuthorName>
              <span title={source.name}>{source.name}</span>
              <S.RoleTag $muse={isMuse}>
                {isMuse ? "Muse" : "Novelist"}
              </S.RoleTag>
            </S.AuthorName>
            <S.Meta>
              <span>{toFormattedDate(prompt.createdOn)}</span>
              <S.Dot />
              <PrivacyIcon privacy={prompt.privacy} />
            </S.Meta>
          </S.Author>
          <S.Kind aria-hidden="true">
            <PiFeatherFill />
            Prompt
          </S.Kind>
        </S.Header>

        <S.BodyRow>
          <S.Excerpt $lines={thumb ? EXCERPT_LINES : EXCERPT_LINES - 1}>
            {excerpt || (
              <S.Empty>A prompt with no words — just the picture.</S.Empty>
            )}
          </S.Excerpt>
          {thumb ? <S.Thumb $src={wsrvImage(thumb, THUMB)} /> : null}
          {!thumb && mediaIsVideo ? (
            <S.Thumb $src="">
              <S.VideoBadge>
                <FaPlay />
              </S.VideoBadge>
            </S.Thumb>
          ) : null}
        </S.BodyRow>

        <S.Footer>
          <S.Stat $active={prompt.reacted} title="Likes">
            <FiHeart />
            {prompt.reactions ?? 0}
          </S.Stat>
          <S.Stat title="Replies">
            <FiMessageCircle />
            {prompt.commentCount ?? 0}
          </S.Stat>
          <S.Open>
            Open thread
            <FiArrowRight />
          </S.Open>
        </S.Footer>
      </S.Card>
    </S.Frame>
  );
};

export default PromptEmbed;
