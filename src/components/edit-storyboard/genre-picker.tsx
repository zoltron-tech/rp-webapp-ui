"use client";

import { type FC, useEffect, useState } from "react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { getAllGenresAction } from "@/app/rp/story/actions";
import type { Genre } from "@/types/common";
import * as S from "./styled";

/** Maximum genres a story can be tagged with (mirrors the backend cap). */
export const MAX_STORY_GENRES = 5;

/** How many genres to show before the list collapses behind "Show all". */
const COLLAPSED_GENRE_COUNT = 12;

interface GenrePickerProps {
  value: Genre[];
  onChange: (genres: Genre[]) => void;
}

/**
 * Curated genre multi-select. Users toggle genres from the fixed catalogue —
 * they cannot add new ones — and can select at most {@link MAX_STORY_GENRES}.
 */
export const GenrePicker: FC<GenrePickerProps> = ({ value, onChange }) => {
  const [catalogue, setCatalogue] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getAllGenresAction();
      if (!active) return;
      setCatalogue(result && !("message" in result) ? result : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedIds = new Set(value.map((g) => g.id));
  const atLimit = value.length >= MAX_STORY_GENRES;

  const toggle = (genre: Genre) => {
    if (selectedIds.has(genre.id)) {
      onChange(value.filter((g) => g.id !== genre.id));
    } else if (!atLimit) {
      onChange([...value, genre]);
    }
  };

  if (loading) {
    return <S.PickerHint>Loading genres…</S.PickerHint>;
  }

  if (catalogue.length === 0) {
    return <S.PickerHint>No genres available.</S.PickerHint>;
  }

  const collapsible = catalogue.length > COLLAPSED_GENRE_COUNT;
  // While collapsed, still show any selected genres that fall past the cut so
  // the current selection never hides behind "Show all".
  const visibleGenres =
    expanded || !collapsible
      ? catalogue
      : catalogue.filter(
          (genre, index) =>
            index < COLLAPSED_GENRE_COUNT || selectedIds.has(genre.id),
        );
  const hiddenCount = catalogue.length - visibleGenres.length;

  return (
    <>
      <S.GenrePills>
        {visibleGenres.map((genre) => {
          const selected = selectedIds.has(genre.id);
          return (
            <S.GenrePill
              key={genre.id}
              type="button"
              $selected={selected}
              $color={genre.color}
              disabled={!selected && atLimit}
              aria-pressed={selected}
              onClick={() => toggle(genre)}
            >
              {genre.label}
            </S.GenrePill>
          );
        })}
      </S.GenrePills>
      {collapsible && (
        <S.GenreToggle
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              Show less
              <MdOutlineExpandLess />
            </>
          ) : (
            <>
              Show all{hiddenCount > 0 ? ` (+${hiddenCount})` : ""}
              <MdOutlineExpandMore />
            </>
          )}
        </S.GenreToggle>
      )}
      <S.PickerHint>
        {atLimit
          ? `You've reached the maximum of ${MAX_STORY_GENRES} genres.`
          : `Pick up to ${MAX_STORY_GENRES} genres that fit your story.`}
      </S.PickerHint>
    </>
  );
};

export default GenrePicker;
