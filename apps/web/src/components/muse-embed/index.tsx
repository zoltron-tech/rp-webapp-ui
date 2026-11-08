"use client";

import type { Muse } from "@nw/types";
import { hasUsableCrop } from "@nw/utils/image";
import {
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import { FiArrowRight, FiLink, FiLock } from "react-icons/fi";
import { usePageRouter } from "@/hooks/use-page-router";
import { useNearViewport } from "../nw-link-embed/use-near-viewport";
import { ROUTES } from "@/utils/constants/routes";
import { fetchEmbeddedMuse } from "./muse-cache";
import * as S from "./styles";

/**
 * A muse link, drawn as the muse.
 *
 * Mounted wherever a `novelist.world/rp/muse/<id>` URL turns up in text — a
 * prompt, a comment, a chat message — in place of the URL. Fetches the muse
 * through the ordinary profile endpoint, so what the viewer sees is exactly
 * what they could open: a private or blocked muse answers 404 and the card
 * says so, rather than leaking a name through the preview.
 *
 * Three states, all the same width so the text around the card does not jump
 * when the fetch lands: a shimmering skeleton, the card, or a quiet
 * "unavailable" row that still carries the original link.
 *
 * `preview` is the same card opened from a post header's avatar: the card is
 * no longer a link, and the Visit profile button is the only way through.
 */

type Props = {
  museId: string;
  /** The URL as it was written, kept as the fallback destination. */
  href?: string;
  /** Drawn in a popover: only the Visit profile button routes. */
  preview?: boolean;
  /** Preview only: the name and accent the post header already shows, kept
   *  on the card when the muse itself can't be loaded (private, hidden,
   *  deleted). Nothing here is more than the header around it already says. */
  fallbackName?: string;
  fallbackAccent?: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; muse: Muse }
  | { status: "unavailable" };

const MAX_NICKNAMES = 3;

export const MuseEmbed: FC<Props> = ({
  museId,
  href = ROUTES.Muse.View(museId),
  preview = false,
  fallbackName,
  fallbackAccent = null,
}) => {
  const { routeToPage } = usePageRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nothing is fetched until the card is about to be seen.
  const [ref, near] = useNearViewport();

  useEffect(() => {
    if (!near) return;
    let active = true;
    setState({ status: "loading" });
    fetchEmbeddedMuse(museId)
      .then((muse) => {
        if (!active) return;
        setState(muse ? { muse, status: "ready" } : { status: "unavailable" });
      })
      .catch(() => {
        if (active) setState({ status: "unavailable" });
      });
    return () => {
      active = false;
    };
  }, [museId, near]);

  const open = (event: MouseEvent | KeyboardEvent) => {
    // The card lives inside things with their own click handlers — a chat
    // bubble's long-press menu, a collapsed post's expand toggle — none of
    // which should fire when the viewer meant "open this muse".
    event.preventDefault();
    event.stopPropagation();
    routeToPage(ROUTES.Muse.View(museId));
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
      <S.Frame $accent={null} aria-busy="true" ref={ref} {...frameLink}>
        <S.Card>
          <S.SkeletonCover />
          <S.Body>
            <S.SkeletonAvatar />
            <S.Text>
              <S.SkeletonLine $width="55%" $height="14px" />
              <S.SkeletonLine $width="35%" $height="10px" />
              <S.SkeletonLine $width="80%" $height="10px" />
            </S.Text>
          </S.Body>
        </S.Card>
      </S.Frame>
    );
  }

  // In a popover the inline "unavailable" row (a translucent material strip
  // meant to sit in prose) reads as a ghost of a card over the feed. Draw the
  // same opaque card as a loaded muse instead, with the message where the
  // details would be and no way through.
  if (state.status === "unavailable" && preview) {
    const name = fallbackName?.trim() || "A muse on Novelist World";
    return (
      <S.Frame $accent={fallbackAccent} as="div" data-preview="">
        <S.Card>
          <S.Cover $src="">
            <S.CoverPattern />
          </S.Cover>
          <S.Body>
            <S.Avatar $crop={null} $src="" aria-hidden="true">
              <FiLock size={22} />
            </S.Avatar>
            <S.Text>
              <S.Name title={name}>{name}</S.Name>
              <S.UnavailableMessage>
                This muse is private, hidden or no longer here.
              </S.UnavailableMessage>
            </S.Text>
          </S.Body>
          <S.Footer>
            <S.FooterNote>Profile unavailable</S.FooterNote>
          </S.Footer>
        </S.Card>
      </S.Frame>
    );
  }

  if (state.status === "unavailable") {
    return (
      <S.Unavailable
        {...(preview
          ? ({ as: "div" } as const)
          : { href, onClick: open, onKeyDown, rel: "noreferrer noopener" })}
      >
        <S.UnavailableIcon>
          <FiLink size={16} />
        </S.UnavailableIcon>
        <S.UnavailableText>
          <strong>A muse on Novelist World</strong>
          <span>This muse is private or no longer here.</span>
        </S.UnavailableText>
      </S.Unavailable>
    );
  }

  const { muse } = state;
  const accent = muse.useAccent && muse.accent ? muse.accent : null;
  const fullName = [muse.firstName, muse.lastName].filter(Boolean).join(" ");

  // Same rules as the preview card: the card background, else the main image;
  // the stored crop only applies to the image it was made for.
  const coverSrc = muse.cardBackground?.src || muse.image || "";
  const coverCrop = muse.cardBackground?.src ? muse.cardBackground.crop : null;
  const coverSize = hasUsableCrop(coverCrop)
    ? `${coverCrop.width}%`
    : undefined;
  const coverPosition = hasUsableCrop(coverCrop)
    ? `${coverCrop.x}% ${coverCrop.y}%`
    : undefined;

  const avatarSrc = muse.avatar?.src || muse.image || "";
  const avatarCrop = muse.avatar?.src ? muse.avatar.crop : null;

  const fandom =
    muse.fandom && muse.fandom.id !== "FANDOMLESS" ? muse.fandom : null;
  const nicknames = (muse.nicknames ?? [])
    .filter((name) => name?.trim())
    .slice(0, MAX_NICKNAMES);
  const quote = muse.note?.trim() ?? "";

  return (
    <S.Frame
      $accent={accent}
      aria-label={preview ? undefined : `Open ${fullName}'s muse page`}
      {...frameLink}
    >
      <S.Card>
        <S.Cover
          $bgPosition={coverPosition}
          $bgSize={coverSize}
          $src={coverSrc}
        >
          {!coverSrc && <S.CoverPattern />}
          <S.CoverChips>
            {fandom && (
              <S.FandomTag $color={fandom.color}>{fandom.name}</S.FandomTag>
            )}
          </S.CoverChips>
        </S.Cover>

        <S.Body>
          <S.Avatar $crop={avatarCrop} $src={avatarSrc}>
            {!avatarSrc && (fullName.charAt(0).toUpperCase() || "?")}
          </S.Avatar>

          <S.Text>
            <S.Name title={fullName}>{fullName}</S.Name>
            {muse.pennedBy?.username && (
              <S.PennedBy>
                penned by <strong>@{muse.pennedBy.username}</strong>
              </S.PennedBy>
            )}
            {quote && <S.Quote>{quote}</S.Quote>}
            {nicknames.length > 0 && (
              <S.Nicknames>
                {nicknames.map((name) => (
                  <S.Nickname key={name} title={name}>
                    {name}
                  </S.Nickname>
                ))}
              </S.Nicknames>
            )}
          </S.Text>
        </S.Body>

        <S.Footer>
          {preview ? (
            <S.Open
              as="a"
              aria-label={`Visit ${fullName}'s profile`}
              href={ROUTES.Muse.View(museId)}
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
      </S.Card>
    </S.Frame>
  );
};

export default MuseEmbed;
