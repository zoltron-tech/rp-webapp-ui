"use client";

import { imageSources, parseRichText, richTextToPlainText } from "@nw/richtext";
import type { PromptSource, Reply } from "@nw/types";
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
import {
  FiArrowRight,
  FiCheckCircle,
  FiCornerDownRight,
  FiHeart,
  FiLink,
  FiMessageCircle,
} from "react-icons/fi";
import { PiArrowsLeftRightBold, PiChatsFill } from "react-icons/pi";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { AvatarNew } from "../common/avatar-new";
import * as P from "../prompt-embed/styles";
import * as S from "./styles";
import { type EmbeddedThread, fetchEmbeddedThread } from "./thread-cache";

/**
 * A thread link, drawn as the exchange it is.
 *
 * Two voices paired at the top — the prompt's author and whoever answered —
 * then the prompt's opening and the thread's first reply as facing turns, the
 * newest reply as a faint third line, and the cast of repliers along the
 * bottom. See `styles.ts` for why it is drawn this way.
 */

type Props = {
  commentId: string;
  /** The URL as it was written; also where the card goes when clicked. */
  href: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; thread: EmbeddedThread }
  | { status: "unavailable" };

const PROMPT_LINES = 2;
const REPLY_LINES = 3;
const CAST_SIZE = 4;
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const THUMB = { fit: "cover" as const, h: 240, w: 240 };

const pathOf = (href: string): string => {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

const words = (html: string): string =>
  richTextToPlainText(parseRichText(html))
    .replace(/\n{2,}/g, "\n")
    .trim();

/** A hex for a muse that uses one; a palette class for a novelist. */
const toneOf = (
  source: PromptSource | null | undefined,
): { hex: string | null; paletteClass: string | null } => {
  if (!source?.useAccent || source.accent == null) {
    return { hex: null, paletteClass: null };
  }
  if (source.sourceType === "MUSE") {
    return { hex: source.accent, paletteClass: null };
  }
  return {
    hex: null,
    paletteClass: ACCENT_MAP[Number(source.accent) as Accent] ?? null,
  };
};

/** Distinct repliers, newest first, the thread opener excluded. */
const castOf = (replies: Reply[], openerId: string): PromptSource[] => {
  const seen = new Set<string>([openerId]);
  const cast: PromptSource[] = [];
  for (const reply of replies) {
    const id = reply.source?.sourceId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    cast.push(reply.source);
    if (cast.length === CAST_SIZE) break;
  }
  return cast;
};

const Face: FC<{ source: PromptSource; accent?: string | null }> = ({
  source,
  accent,
}) => (
  <AvatarNew
    accentColor={accent ?? null}
    alt={source.name}
    nwImage={source.avatar}
    src={source.image}
  />
);

export const ThreadEmbed: FC<Props> = ({ commentId, href }) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedThread(commentId)
      .then((thread) => {
        if (!active) return;
        setState(
          thread ? { status: "ready", thread } : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [commentId, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    routeToPage(pathOf(href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  const thread = state.status === "ready" ? state.thread : null;

  const derived = useMemo(() => {
    if (!thread) return null;
    const { comment, replies } = thread;
    const replyNodes = parseRichText(comment.text);
    const latest = replies[0] ?? null;
    return {
      cast: castOf(replies, comment.source.sourceId),
      inlineImage: imageSources(replyNodes)[0] ?? null,
      latestWords: latest ? words(latest.text).replace(/\s+/g, " ") : "",
      promptWords: comment.prompt ? words(comment.prompt.text) : "",
      replyWords: richTextToPlainText(replyNodes)
        .replace(/\n{2,}/g, "\n")
        .trim(),
    };
  }, [thread]);

  if (state.status === "loading") {
    return (
      <S.Frame
        $toneA={null}
        $toneB={null}
        aria-busy="true"
        ref={ref}
        href={href}
        onClick={open}
      >
        <S.Card $concluded={false}>
          <S.Band>
            <P.SkeletonLine $width="30%" $height="10px" />
          </S.Band>
          <S.Pair>
            <P.SkeletonAvatar />
            <S.PairText>
              <P.SkeletonLine $width="60%" $height="13px" />
              <P.SkeletonLine $width="45%" $height="9px" />
            </S.PairText>
          </S.Pair>
          <P.SkeletonLine $width="88%" $height="40px" />
          <P.SkeletonLine $width="88%" $height="52px" />
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable" || !thread || !derived) {
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
          <strong>A thread on Novelist World</strong>
          <span>This thread is private or no longer here.</span>
        </P.UnavailableText>
      </P.Unavailable>
    );
  }

  const { comment } = thread;
  const opener = comment.source;
  const promptAuthor = comment.prompt?.source ?? null;
  const toneA = toneOf(promptAuthor);
  const toneB = toneOf(opener);
  // One palette class fits on the frame; the opener's wins, since the card
  // is theirs. A novelist prompt author then borrows the ambient accent.
  const paletteClass = toneB.paletteClass ?? toneA.paletteClass;
  const toneAHex = toneA.hex;
  const faceA = toneA.hex ?? (toneA.paletteClass ? "var(--accent)" : null);
  const faceB = toneB.hex ?? (toneB.paletteClass ? "var(--accent)" : null);

  const media = comment.media?.trim() || "";
  const thumb = media && !VIDEO_RE.test(media) ? media : derived.inlineImage;
  const replyCount = comment.replyCount ?? 0;
  const latest = thread.replies[0] ?? null;
  const sameSpeaker =
    !!promptAuthor && promptAuthor.sourceId === opener.sourceId;

  return (
    <S.Frame
      $toneA={toneAHex}
      $toneB={toneB.hex}
      aria-label={`Open ${opener.name}'s thread`}
      className={classNames(paletteClass)}
      href={href}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <S.Card $concluded={comment.concluded}>
        <S.Band>
          <S.BandKind>
            <PiChatsFill />
            Thread
          </S.BandKind>
          <S.Dot />
          <S.BandTime>{toFormattedDate(comment.createdOn)}</S.BandTime>
          <S.Status $concluded={comment.concluded}>
            {comment.concluded ? (
              <>
                <FiCheckCircle />
                Concluded
              </>
            ) : (
              "Open"
            )}
          </S.Status>
        </S.Band>

        <S.Pair>
          <S.Duo>
            {promptAuthor && !sameSpeaker ? (
              <Face accent={faceA} source={promptAuthor} />
            ) : (
              <span aria-hidden="true" />
            )}
            <Face accent={faceB} source={opener} />
          </S.Duo>
          <S.PairText>
            <S.Names>
              <S.NameB title={opener.name}>{opener.name}</S.NameB>
              {promptAuthor && !sameSpeaker ? (
                <>
                  <PiArrowsLeftRightBold />
                  <S.NameA title={promptAuthor.name}>
                    {promptAuthor.name}
                  </S.NameA>
                </>
              ) : null}
            </S.Names>
            <S.Story>
              <strong className="tone-b">{opener.name}</strong>
              <span className="role">
                {opener.sourceType === "MUSE" ? "Muse" : "Novelist"}
              </span>{" "}
              {promptAuthor ? (
                sameSpeaker ? (
                  "continued their own prompt"
                ) : (
                  <>
                    picked up{" "}
                    <strong className="tone-a">{promptAuthor.name}</strong>
                    &rsquo;s prompt
                  </>
                )
              ) : (
                "opened a thread"
              )}
              {replyCount > 0 ? (
                <>
                  {" "}
                  &middot; {replyCount} {replyCount === 1 ? "reply" : "replies"}{" "}
                  so far
                </>
              ) : (
                <> &middot; waiting for a first reply</>
              )}
            </S.Story>
          </S.PairText>
        </S.Pair>

        <S.Exchange>
          {promptAuthor ? (
            <S.Turn $side="a">
              <S.TurnAvatar>
                <Face accent={faceA} source={promptAuthor} />
              </S.TurnAvatar>
              <S.TurnBody $side="a" data-side="a">
                <S.TurnWho>
                  <span>{promptAuthor.name}</span>
                  <em>opened with</em>
                </S.TurnWho>
                <S.TurnText $lines={PROMPT_LINES}>
                  {derived.promptWords || (
                    <S.TurnEmpty>
                      A prompt with no words — just a picture.
                    </S.TurnEmpty>
                  )}
                </S.TurnText>
              </S.TurnBody>
            </S.Turn>
          ) : null}

          <S.Turn $side="b">
            <S.TurnAvatar>
              <Face accent={faceB} source={opener} />
            </S.TurnAvatar>
            <S.TurnBody $side="b" data-side="b">
              <S.TurnWho>
                <span>{opener.name}</span>
                <em>answered</em>
              </S.TurnWho>
              <S.TurnText $lines={REPLY_LINES}>
                {derived.replyWords || (
                  <S.TurnEmpty>
                    A reply with no words — just a picture.
                  </S.TurnEmpty>
                )}
              </S.TurnText>
            </S.TurnBody>
            {thumb ? <S.TurnThumb $src={wsrvImage(thumb, THUMB)} /> : null}
          </S.Turn>

          {latest && derived.latestWords ? (
            <S.Latest>
              <FiCornerDownRight />
              <span>
                <Face source={latest.source} />
              </span>
              <S.LatestText>
                <strong>{latest.source.name}</strong>,{" "}
                {toFormattedDate(latest.createdOn)}: {derived.latestWords}
              </S.LatestText>
            </S.Latest>
          ) : null}
        </S.Exchange>

        <S.Footer>
          {derived.cast.length > 0 ? (
            <S.Cast title={derived.cast.map((c) => c.name).join(", ")}>
              {derived.cast.map((member) => (
                <Face key={member.sourceId} source={member} />
              ))}
            </S.Cast>
          ) : null}
          <S.Stat title="Replies">
            <FiMessageCircle />
            {replyCount}
          </S.Stat>
          <S.Stat $active={comment.reacted} title="Likes">
            <FiHeart />
            {comment.reactions ?? 0}
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

export default ThreadEmbed;
