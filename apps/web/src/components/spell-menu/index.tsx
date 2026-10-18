"use client";

import classNames from "classnames";
import {
  type FC,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useGlobalState } from "@/context/store/stores";
import type { SpellMenuState } from "@/lib/spell/use-spellcheck";
import * as S from "./styled";

interface SpellMenuProps {
  state: SpellMenuState;
  onPick: (word: string) => void;
  onFocus: (index: number) => void;
  onAdd: () => void;
  onIgnore: () => void;
  onClose: () => void;
}

const GUTTER = 8;
const GAP = 6;
/** The tallest the menu can get (mirrors `max-height` in styled.ts). */
const MAX_HEIGHT = 18 * 16;

type Placement =
  | { left: number; top: number; bottom?: undefined }
  | { left: number; bottom: number; top?: undefined };

/**
 * The word popover. In spelling mode: corrections (hover highlights, Enter or
 * click picks) and the two dictionary actions — nothing else. In thesaurus
 * mode (double-click / Ctrl+. on a correct word): the synonyms of the word.
 *
 * Placed **once per open**, from the anchor alone: below the word when the
 * menu's maximum height fits there, else above, pinned by its bottom edge.
 * Width and the synonyms block are fixed, so content arriving never moves
 * anything under the pointer.
 *
 * Buttons cancel `mousedown` so the editor keeps focus and its selection —
 * the same trick the mention dropdown uses.
 */
export const SpellMenu: FC<SpellMenuProps> = ({
  state,
  onPick,
  onFocus,
  onAdd,
  onIgnore,
  onClose,
}) => {
  const theme = useGlobalState("theme");
  const accent = useGlobalState("accent");
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Placement | null>(null);

  // `anchor` is created when the menu opens and kept by every later state
  // update, so this runs once per open rather than per content change.
  const { anchor } = state;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = el.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.min(
      Math.max(GUTTER, anchor.left),
      Math.max(GUTTER, vw - width - GUTTER),
    );
    const roomBelow = vh - GUTTER - (anchor.bottom + GAP);
    const roomAbove = anchor.top - GAP - GUTTER;
    const fitsBelow = roomBelow >= Math.min(MAX_HEIGHT, vh - 2 * GUTTER);
    if (fitsBelow || roomBelow >= roomAbove) {
      setPos({ left, top: anchor.bottom + GAP });
    } else {
      setPos({ bottom: vh - anchor.top + GAP, left });
    }
  }, [anchor]);

  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [onClose]);

  const stop = (e: SyntheticEvent) => e.preventDefault();
  const spelling = state.mode === "spelling";

  return createPortal(
    <S.Menu
      ref={ref}
      role="menu"
      aria-label={
        spelling
          ? `Corrections for ${state.word}`
          : `Synonyms for ${state.word}`
      }
      className={classNames(theme, accent)}
      data-spell-menu=""
      style={{
        bottom: pos?.bottom,
        left: pos?.left ?? 0,
        top: pos?.top,
        visibility: pos ? "visible" : "hidden",
      }}
      onMouseDown={stop}
    >
      <S.Word title={state.word} $flagged={spelling}>
        {state.word}
      </S.Word>

      {spelling &&
        (state.loadingSuggestions ? (
          <S.Empty>Looking up…</S.Empty>
        ) : state.suggestions.length === 0 ? (
          <S.Empty>No suggestions</S.Empty>
        ) : (
          state.suggestions.map((word, index) => (
            <S.Suggestion
              key={word}
              type="button"
              role="menuitem"
              $focused={index === state.focused}
              onMouseEnter={() => onFocus(index)}
              onMouseDown={stop}
              onClick={() => onPick(word)}
            >
              {word}
            </S.Suggestion>
          ))
        ))}

      {!spelling && (
        <>
          <S.SectionLabel title={`Synonyms for ${state.word}`}>
            Synonyms for {state.word}
          </S.SectionLabel>
          <S.SynonymsBox $stale={state.loadingSynonyms}>
            {state.synonyms.length === 0 ? (
              <S.Empty>
                {state.loadingSynonyms ? "Loading…" : "No synonyms"}
              </S.Empty>
            ) : (
              state.synonyms.map((word) => (
                <S.Chip
                  key={word}
                  type="button"
                  role="menuitem"
                  onMouseDown={stop}
                  onClick={() => onPick(word)}
                >
                  {word}
                </S.Chip>
              ))
            )}
          </S.SynonymsBox>
        </>
      )}

      {spelling && (
        <S.Actions>
          <S.Action
            type="button"
            role="menuitem"
            onMouseDown={stop}
            onClick={onAdd}
          >
            Add to dictionary
          </S.Action>
          <S.Action
            type="button"
            role="menuitem"
            onMouseDown={stop}
            onClick={onIgnore}
          >
            Ignore
          </S.Action>
        </S.Actions>
      )}
    </S.Menu>,
    document.body,
  );
};
