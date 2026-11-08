"use client";

import type { Muse, Novelist } from "@nw/types";
import { type Accent, ACCENT_MAP } from "@nw/types/theme";
import { hasUsableCrop } from "@nw/utils/image";
import { mainVerseMuses } from "@nw/utils/muse";
import classNames from "classnames";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { FiArrowRight, FiCheck, FiLink } from "react-icons/fi";
import { PiFeatherFill } from "react-icons/pi";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { ROUTES } from "@/utils/constants/routes";
import { BadgeStrip } from "../badges";
import { AvatarNew } from "../common/avatar-new";
import * as P from "../prompt-embed/styles";
import { fetchEmbeddedNovelist } from "./novelist-cache";
import * as S from "./styles";

/**
 * A novelist link, drawn as the novelist.
 *
 * See `styles.ts` for the shape of the card. The link's id is the username
 * from `/@username`; the card routes to the profile route built from it so
 * the destination is the app's own, whatever the link's host was.
 *
 * `preview` is the same card opened from an OOC post header's avatar: the
 * card is no longer a link, and Visit profile is the only way through.
 */

type Props = {
  username: string;
  /** The URL as it was written; the fallback destination. */
  href?: string;
  /** Drawn in a popover: only the Visit profile button routes. */
  preview?: boolean;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; novelist: Novelist }
  | { status: "unavailable" };

const MAX_MUSE_FACES = 5;
const MAX_FANDOMS = 3;
const MAX_BADGES = 4;

const museFace = (muse: Muse) => ({
  crop: muse.avatar?.src ? muse.avatar.crop : null,
  src: muse.avatar?.src || muse.image || "",
});

export const NovelistEmbed: FC<Props> = ({
  username,
  href = ROUTES.Profile.View(username).Index,
  preview = false,
}) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedNovelist(username)
      .then((novelist) => {
        if (!active) return;
        setState(
          novelist ? { novelist, status: "ready" } : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [username, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    routeToPage(ROUTES.Profile.View(username).Index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") open(event);
  };

  // In a preview the frame is inert; the footer button carries the route.
  const frameLink = preview
    ? ({ as: "div", "data-preview": "" } as const)
    : { href, onClick: open, onKeyDown };

  if (state.status === "loading") {
    return (
      <S.Frame aria-busy="true" ref={ref} {...frameLink}>
        <S.Card>
          <P.SkeletonLine $width="100%" $height="92px" />
          <S.Body>
            <S.Identity>
              <S.AvatarWrap>
                <P.SkeletonAvatar />
              </S.AvatarWrap>
              <S.Text>
                <P.SkeletonLine $width="55%" $height="14px" />
                <P.SkeletonLine $width="35%" $height="10px" />
              </S.Text>
            </S.Identity>
            <P.SkeletonLine $width="70%" $height="10px" />
          </S.Body>
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable") {
    return (
      <P.Unavailable
        {...(preview
          ? ({ as: "div" } as const)
          : { href, onClick: open, onKeyDown, rel: "noreferrer noopener" })}
      >
        <P.UnavailableIcon>
          <FiLink size={16} />
        </P.UnavailableIcon>
        <P.UnavailableText>
          <strong>A novelist on Novelist World</strong>
          <span>
            @{username} isn&rsquo;t here any more, or isn&rsquo;t visible to
            you.
          </span>
        </P.UnavailableText>
      </P.Unavailable>
    );
  }

  const { novelist } = state;
  const fullName =
    [novelist.firstName, novelist.lastName].filter(Boolean).join(" ") ||
    novelist.username;
  const paletteClass = ACCENT_MAP[novelist.palette as Accent] ?? null;

  const bannerSrc = novelist.banner?.src || "";
  const standIn =
    !bannerSrc && !!novelist.image && !novelist.image.endsWith(".gif");
  const bannerCrop = hasUsableCrop(novelist.banner?.crop)
    ? (novelist.banner?.crop ?? null)
    : null;

  const muses = mainVerseMuses(novelist.muses ?? []);
  const faces = muses.slice(0, MAX_MUSE_FACES);
  const museCount = Math.max(novelist.museCount ?? 0, muses.length);
  const moreMuses = museCount - faces.length;
  const fandoms = (novelist.fandoms ?? [])
    .filter((f) => f.id !== "FANDOMLESS")
    .slice(0, MAX_FANDOMS);
  const since = novelist.createdAt
    ? new Date(novelist.createdAt).getFullYear()
    : null;
  const note = novelist.note?.text?.trim() ? novelist.note : null;

  return (
    <S.Frame
      aria-label={preview ? undefined : `Open ${fullName}'s profile`}
      className={classNames(paletteClass)}
      {...frameLink}
    >
      <S.Card>
        <S.Banner
          $crop={bannerCrop}
          $src={bannerSrc || (standIn ? novelist.image : "")}
          $standIn={standIn}
        >
          {!bannerSrc && !standIn ? <S.BannerPattern /> : null}
          <S.BannerChips>
            <S.Kind>
              <PiFeatherFill />
              Novelist
            </S.Kind>
          </S.BannerChips>
        </S.Banner>

        <S.Body>
          <S.Identity>
            <S.AvatarWrap>
              <AvatarNew
                alt={fullName}
                nwImage={novelist.avatar}
                src={novelist.image}
                username={novelist.username}
              />
              {novelist.isVerified ? (
                <S.Verified title="Verified">
                  <FiCheck />
                </S.Verified>
              ) : null}
            </S.AvatarWrap>
            <S.Text>
              <S.Name title={fullName}>{fullName}</S.Name>
              <S.Handle>
                <strong>@{novelist.username}</strong>
                {since ? <S.Since>writing since {since}</S.Since> : null}
              </S.Handle>
            </S.Text>
          </S.Identity>

          {note ? (
            <S.Note $color={note.color} title={note.text}>
              {note.emoji ? <span>{note.emoji}</span> : <span>✦</span>}
              <span>{note.text}</span>
            </S.Note>
          ) : null}

          <S.Stats>
            <S.Stat>
              <strong>{museCount}</strong>
              {museCount === 1 ? "muse" : "muses"}
            </S.Stat>
            <S.Stat>
              <strong>{novelist.friendsCount ?? 0}</strong>
              {novelist.friendsCount === 1 ? "friend" : "friends"}
            </S.Stat>
            {novelist.badges?.length ? (
              <S.Stat>
                <strong>{novelist.badges.length}</strong>
                {novelist.badges.length === 1 ? "badge" : "badges"}
              </S.Stat>
            ) : null}
          </S.Stats>

          {faces.length > 0 ? (
            <S.Shelf>
              <S.ShelfLabel>Muses</S.ShelfLabel>
              <S.MuseFaces title={faces.map((m) => m.firstName).join(", ")}>
                {faces.map((muse) => {
                  const face = museFace(muse);
                  return (
                    <S.MuseFace
                      $crop={face.crop}
                      $src={face.src}
                      key={muse.id ?? muse.firstName}
                      title={muse.firstName}
                    >
                      {!face.src
                        ? muse.firstName.charAt(0).toUpperCase()
                        : null}
                    </S.MuseFace>
                  );
                })}
              </S.MuseFaces>
              {moreMuses > 0 ? <S.MoreMuses>+{moreMuses}</S.MoreMuses> : null}
            </S.Shelf>
          ) : null}

          {fandoms.length > 0 ? (
            <S.Fandoms>
              {fandoms.map((fandom) => (
                <S.Fandom
                  $color={fandom.color}
                  key={fandom.id}
                  title={fandom.name}
                >
                  {fandom.name}
                </S.Fandom>
              ))}
            </S.Fandoms>
          ) : null}

          <S.Footer>
            <BadgeStrip
              animated={false}
              badges={novelist.badges}
              max={MAX_BADGES}
              size={22}
            />
            {preview ? (
              <S.Open
                as="a"
                aria-label={`Visit ${fullName}'s profile`}
                href={ROUTES.Profile.View(username).Index}
                onClick={open}
              >
                Visit profile
                <FiArrowRight />
              </S.Open>
            ) : (
              <S.Open>
                Visit profile
                <FiArrowRight />
              </S.Open>
            )}
          </S.Footer>
        </S.Body>
      </S.Card>
    </S.Frame>
  );
};

export default NovelistEmbed;
