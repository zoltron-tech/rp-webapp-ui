"use client";

import type { Headcanon } from "@nw/types/headcanon";
import type { FC, KeyboardEvent } from "react";
import { FiEyeOff, FiHeart, FiLock, FiUsers } from "react-icons/fi";
import { LuPin } from "react-icons/lu";
import { toPlainText } from "@/utils/rich-text";
import type { CatalogLookups } from "./catalog";
import * as S from "./styles";

type Props = {
  headcanon: Headcanon;
  lookups: CatalogLookups;
  onOpen: (headcanon: Headcanon) => void;
  /** The owner sees who a card is for; visitors only see a lock on theirs. */
  showVisibility?: boolean;
};

/**
 * One headcanon in a list: title, a three-line excerpt, category and the
 * heart count. Spoilers stay blurred here — reading one is a deliberate
 * second tap, in the detail sheet.
 */
export const HeadcanonCard: FC<Props> = ({
  headcanon,
  lookups,
  onOpen,
  showVisibility,
}) => {
  const excerpt = toPlainText(headcanon.body);
  // An untitled card is titled by its first words — unless those words are
  // the spoiler.
  const title =
    headcanon.title ||
    (headcanon.spoiler
      ? "Untitled spoiler"
      : excerpt.length > 60
        ? `${excerpt.slice(0, 60)}…`
        : excerpt);
  const open = () => onOpen(headcanon);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  const visibilityIcon =
    headcanon.visibility === "FRIENDS" ? (
      <FiUsers size={13} aria-label="Friends only" />
    ) : headcanon.visibility === "ONLY_ME" ? (
      <FiLock size={13} aria-label="Only me" />
    ) : null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: the card holds block content (title, paragraph, tags) that a <button> may not contain
    <S.Card
      $pinned={headcanon.pinned}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      aria-label={`Open headcanon: ${title}`}
    >
      <S.CardTop>
        <S.CardTitle>{title}</S.CardTitle>
        <S.CardIcons>
          {(showVisibility || headcanon.visibility === "FRIENDS") &&
            visibilityIcon}
          {headcanon.pinned && (
            <LuPin className="pinned" size={14} aria-label="Pinned" />
          )}
        </S.CardIcons>
      </S.CardTop>

      {headcanon.title &&
        (headcanon.spoiler ? (
          <S.SpoilerVeil>
            <S.CardExcerpt aria-hidden="true">{excerpt}</S.CardExcerpt>
            <span>
              <FiEyeOff size={13} /> Spoiler
            </span>
          </S.SpoilerVeil>
        ) : (
          <S.CardExcerpt>{excerpt}</S.CardExcerpt>
        ))}

      <S.CardFoot>
        <S.Row>
          <S.Tag $accent>{lookups.categoryLabel(headcanon.category)}</S.Tag>
          {headcanon.alternateUniverse && <S.Tag>AU</S.Tag>}
          {!headcanon.title && headcanon.spoiler && (
            <S.Tag>
              <FiEyeOff size={11} /> Spoiler
            </S.Tag>
          )}
        </S.Row>
        {headcanon.heartCount > 0 && (
          <S.HeartCount aria-label={`${headcanon.heartCount} hearts`}>
            <FiHeart size={12} />
            {headcanon.heartCount}
          </S.HeartCount>
        )}
      </S.CardFoot>
    </S.Card>
  );
};
