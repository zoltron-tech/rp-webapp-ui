"use client";

import {
  HEADCANON_ERROR,
  type HeadcanonDetail,
  headcanonPath,
} from "@nw/types/headcanon";
import { hasUsableCrop } from "@nw/utils/image";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FiEyeOff, FiHeart, FiLink, FiLock } from "react-icons/fi";
import { getHeadcanonAction } from "@/app/rp/muse/headcanon-actions";
import { usePageRouter } from "@/hooks/use-page-router";
import { toPlainText } from "@/utils/rich-text";
import { catalogLookups, useHeadcanonCatalog } from "../headcanons/catalog";
import * as M from "../muse-embed/styles";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import * as S from "./styles";

type Props = {
  headcanonId: string;
  /** The URL as written: the muse page, opened at this card. */
  href: string;
};

type Loaded =
  | { status: "loading" }
  | { status: "ready"; detail: HeadcanonDetail }
  | { status: "friends-only" }
  | { status: "unavailable" };

/**
 * Fetched cards, kept for the page's lifetime: the promise, so cards mounted
 * together share a request. A friends-only or missing answer is cached too;
 * a network failure is not.
 */
const cache = new Map<string, Promise<Loaded>>();

const fetchCard = (id: string): Promise<Loaded> => {
  const hit = cache.get(id);
  if (hit) return hit;
  const request = getHeadcanonAction(id).then((result): Loaded => {
    if (result && typeof result === "object" && "headcanon" in result) {
      return { detail: result, status: "ready" };
    }
    if (
      result &&
      typeof result === "object" &&
      "reason" in result &&
      result.reason === HEADCANON_ERROR.FriendsOnly
    ) {
      return { status: "friends-only" };
    }
    if (result === null) return { status: "unavailable" };
    cache.delete(id);
    return { status: "unavailable" };
  });
  cache.set(id, request);
  return request;
};

/**
 * A headcanon link, drawn as the headcanon: the character's face and name,
 * the card's title and first lines, its category and hearts. Spoilers stay
 * hidden in the preview; a friends-only card says so instead of leaking it.
 */
export const HeadcanonEmbed: FC<Props> = ({ headcanonId, href }) => {
  const { routeToPage } = usePageRouter();
  const catalog = useHeadcanonCatalog();
  const lookups = useMemo(() => catalogLookups(catalog), [catalog]);
  const [state, setState] = useState<Loaded>({ status: "loading" });
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    fetchCard(headcanonId).then((loaded) => {
      if (active) setState(loaded);
    });
    return () => {
      active = false;
    };
  }, [headcanonId, near]);

  const target =
    state.status === "ready"
      ? headcanonPath(state.detail.muse.id ?? "", state.detail.headcanon.id)
      : null;

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (target) routeToPage(target);
    else window.open(href, "_blank", "noopener");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  if (state.status === "loading") {
    return (
      <M.Frame
        $accent={null}
        aria-busy="true"
        ref={ref}
        href={href}
        onClick={open}
      >
        <M.Card>
          <S.Body>
            <M.SkeletonLine $width="40%" $height="10px" />
            <M.SkeletonLine $width="70%" $height="14px" />
            <M.SkeletonLine $width="90%" $height="10px" />
          </S.Body>
        </M.Card>
      </M.Frame>
    );
  }

  if (state.status !== "ready") {
    const friendsOnly = state.status === "friends-only";
    return (
      <M.Unavailable
        href={href}
        onClick={open}
        onKeyDown={onKeyDown}
        rel="noreferrer noopener"
      >
        <M.UnavailableIcon>
          {friendsOnly ? <FiLock size={16} /> : <FiLink size={16} />}
        </M.UnavailableIcon>
        <M.UnavailableText>
          <strong>
            {friendsOnly
              ? "A private headcanon"
              : "A headcanon on Novelist World"}
          </strong>
          <span>
            {friendsOnly
              ? "Only the writer's friends can read this one."
              : "This headcanon is private or no longer here."}
          </span>
        </M.UnavailableText>
      </M.Unavailable>
    );
  }

  const { headcanon, muse } = state.detail;
  const accent = muse.useAccent && muse.accent ? muse.accent : null;
  const museName = [muse.firstName, muse.lastName].filter(Boolean).join(" ");
  const avatarSrc = muse.avatar?.src || muse.image || "";
  const avatarCrop =
    muse.avatar?.src && hasUsableCrop(muse.avatar.crop)
      ? muse.avatar.crop
      : null;
  const excerpt = toPlainText(headcanon.body);

  return (
    <M.Frame
      $accent={accent}
      aria-label={`Open ${museName}'s headcanon`}
      href={href}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <M.Card>
        <S.Body>
          <S.Head>
            <S.Face $src={avatarSrc} $crop={avatarCrop}>
              {!avatarSrc && (museName.charAt(0).toUpperCase() || "?")}
            </S.Face>
            <S.Kind>
              Headcanon · <strong>{museName}</strong>
            </S.Kind>
          </S.Head>
          {headcanon.title && <S.Title>{headcanon.title}</S.Title>}
          {headcanon.spoiler ? (
            <S.Spoiler>
              <FiEyeOff size={13} /> Spoiler — open to read it
            </S.Spoiler>
          ) : (
            <S.Excerpt>{excerpt}</S.Excerpt>
          )}
          <S.Foot>
            <S.Tag>{lookups.categoryLabel(headcanon.category)}</S.Tag>
            {headcanon.alternateUniverse && <S.Tag>AU</S.Tag>}
            {headcanon.heartCount > 0 && (
              <S.Hearts>
                <FiHeart size={12} /> {headcanon.heartCount}
              </S.Hearts>
            )}
          </S.Foot>
        </S.Body>
      </M.Card>
    </M.Frame>
  );
};
