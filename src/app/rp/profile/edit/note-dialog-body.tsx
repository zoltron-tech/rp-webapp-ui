import { type FC, useEffect, useRef, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { CUSTOM_EMOJI_SET } from "./note-emoji-set";
import * as S from "./styled";

const MAX_NOTE_LENGTH = 100;
const COLOR_GRID_COLS = 10;

// 40 versatile colors
export const NOTE_COLORS = [
  // reds
  "#6b1f1f", // deep crimson
  "#8b3a3a", // crimson
  "#a05252", // muted rose

  // oranges
  "#7a3210", // deep burnt orange
  "#a0522d", // sienna
  "#b5712a", // warm amber

  // yellows
  "#6b5010", // deep goldenrod
  "#8b6914", // goldenrod
  "#a08030", // muted gold

  // greens
  "#1e4d2b", // deep forest
  "#2d6e45", // forest green
  "#4a7c59", // sage green
  "#5c6b3a", // olive
  "#3d6b5e", // eucalyptus
  "#2a5c3f", // moss

  // teals
  "#0f3d38", // deep teal
  "#1e6b63", // deep teal
  "#2c5f6e", // slate teal
  "#1a5c6b", // dark cyan

  // blues
  "#0f2d4a", // deep navy
  "#1a5276", // ocean blue
  "#2a5a96", // cobalt
  "#3b5e8a", // steel blue
  "#2a4a7a", // deep cobalt

  // purples
  "#2d1f5e", // deep indigo
  "#4a3f8f", // indigo
  "#5a4a6b", // dusty purple
  "#6b3fa0", // violet
  "#7a3f8f", // deep violet

  // pinks & magentas
  "#6b1f4a", // deep plum
  "#8b2d6b", // plum
  "#a0305a", // raspberry
  "#8b3a5a", // muted magenta
  "#7b5e6e", // dusty mauve

  // browns & neutrals
  "#3b2010", // deep espresso
  "#6b4c3b", // mocha
  "#7a4419", // burnt umber
  "#5a3e2b", // dark walnut
  "#6b5540", // warm taupe
  "#4a3728", // dark chocolate
] as const;

const GRID_ROWS: string[][] = Array.from(
  { length: Math.ceil(NOTE_COLORS.length / COLOR_GRID_COLS) },
  (_, i) => [...NOTE_COLORS].slice(i * COLOR_GRID_COLS, (i + 1) * COLOR_GRID_COLS)
);


type NoteDialogBodyProps = {
  value: string;
  onChange: (value: string) => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
  emoji: string | null;
  onEmojiChange: (emoji: string | null) => void;
};

export const NoteDialogBody: FC<NoteDialogBodyProps> = ({
  value,
  onChange,
  color,
  onColorChange,
  emoji,
  onEmojiChange,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const emojiRowRef = useRef<HTMLDivElement>(null);
  const remaining = MAX_NOTE_LENGTH - value.length;
  const [colorGridExpanded, setColorGridExpanded] = useState(false);

  const selectedRowIndex = (() => {
    if (color === null) return 0;
    const idx = (NOTE_COLORS as readonly string[]).indexOf(color);
    return idx === -1 ? 0 : Math.floor(idx / COLOR_GRID_COLS);
  })();

  const renderColorRow = (row: string[]) =>
    row.map((c) => (
      <S.NoteColorSwatch
        key={c}
        $color={c}
        $active={color === c}
        type="button"
        onClick={() => {
          const next = color === c ? null : c;
          onColorChange(next);
          if (next === null) setColorGridExpanded(false);
        }}
        aria-label={`Note color ${c}`}
      />
    ));

  useEffect(() => {
    if (!contentRef.current) return;
    if (contentRef.current.textContent !== value) {
      contentRef.current.textContent = value;
    }
  }, [value]);

  // Scroll newly selected emoji into view within the row
  useEffect(() => {
    if (!emoji) return;
    const btn = emojiRowRef.current?.querySelector("[data-emoji-selected='true']") as HTMLElement | null;
    btn?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [emoji]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent ?? "";
    onChange(text.length > MAX_NOTE_LENGTH ? text.slice(0, MAX_NOTE_LENGTH) : text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent newlines — notes are single-line
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    // Block printable characters when at max length
    const len = e.currentTarget.textContent?.length ?? 0;
    const isControl = e.ctrlKey || e.metaKey;
    const isNav = e.key.length > 1; // arrows, backspace, delete, etc.
    if (!isControl && !isNav && len >= MAX_NOTE_LENGTH) {
      e.preventDefault();
    }
  };

  const scrollEmoji = (dir: "left" | "right") => {
    emojiRowRef.current?.scrollBy({ left: dir === "right" ? 120 : -120, behavior: "smooth" });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain");
    const current = contentRef.current?.textContent ?? "";
    const insertable = plain.replace(/\n/g, " ").slice(0, MAX_NOTE_LENGTH - current.length);
    if (insertable) {
      document.execCommand("insertText", false, insertable);
    }
  };

  return (
    <S.NoteDialogBodyWrapper>
      {/* Editable note bubble — preview and input combined */}
      <S.NoteEditableBubble
        $color={color}
        onClick={() => contentRef.current?.focus()}
      >
        {emoji && (() => {
          const found = CUSTOM_EMOJI_SET.find((e) => e.key === emoji);
          return found ? (
            <S.NotePreviewEmoji $rotate={found.rotate}>
              <found.Icon size={36} />
            </S.NotePreviewEmoji>
          ) : null;
        })()}
        <S.NoteEditableContent
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Share a thought..."
          data-empty={value.length === 0 ? "" : undefined}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </S.NoteEditableBubble>
      <S.NoteCharCount className={remaining <= 20 ? "warn" : undefined}>
        {value.length} / {MAX_NOTE_LENGTH}
      </S.NoteCharCount>

      <S.NotePerksBox $unlocked>
        <S.NotePerksHeader $unlocked>
          ✦ Personalize your note
        </S.NotePerksHeader>

        <div>
          <S.NoteColorLabel>
            Note color
            <S.NoteNoColorSwatch
              type="button"
              $active={color === null}
              onClick={() => { onColorChange(null); setColorGridExpanded(false); }}
              aria-label="No color"
              title="Remove color"
            />
          </S.NoteColorLabel>
          <S.NoteColorGridExpandWrap>
            {colorGridExpanded
              ? GRID_ROWS.map((row, rowIdx) => (
                  <S.NoteColorGridRow
                    key={row[0] ?? "no-color"}
                    $slideIn={rowIdx !== selectedRowIndex}
                    $delay={rowIdx}
                  >
                    <S.NoteColorGrid>{renderColorRow(row)}</S.NoteColorGrid>
                  </S.NoteColorGridRow>
                ))
              : (
                  <S.NoteColorGridRow
                    key={`collapsed-${selectedRowIndex}`}
                    $swap
                  >
                    <S.NoteColorGrid>
                      {renderColorRow(GRID_ROWS[selectedRowIndex])}
                    </S.NoteColorGrid>
                  </S.NoteColorGridRow>
                )}
          </S.NoteColorGridExpandWrap>
          <S.NoteColorToggle
            type="button"
            onClick={() => setColorGridExpanded((v) => !v)}
          >
            {colorGridExpanded ? "▴ show less" : "▾ show all colors"}
          </S.NoteColorToggle>
        </div>

        <div>
          <S.NoteColorLabel>Emoji</S.NoteColorLabel>
          <S.NoteEmojiPickerWrapper>
            <S.NoteEmojiPickerArrow
              type="button"
              aria-label="Scroll emojis left"
              onClick={() => scrollEmoji("left")}
            >
              <BsChevronLeft size={11} />
            </S.NoteEmojiPickerArrow>
            <S.NoteEmojiPickerRow ref={emojiRowRef}>
              {CUSTOM_EMOJI_SET.map((e) => {
                const isSelected = emoji === e.key;
                return (
                  <S.NoteEmojiButton
                    key={e.key}
                    type="button"
                    $selected={isSelected}
                    data-selected={isSelected ? "true" : undefined}
                    data-emoji-selected={isSelected ? "true" : undefined}
                    onClick={() => onEmojiChange(isSelected ? null : e.key)}
                    aria-label={isSelected ? `${e.label} — click to remove` : `Emoji ${e.label}`}
                    title={isSelected ? `${e.label} — click to remove` : e.label}
                  >
                    <e.Icon size={18} />
                  </S.NoteEmojiButton>
                );
              })}
            </S.NoteEmojiPickerRow>
            <S.NoteEmojiPickerArrow
              type="button"
              aria-label="Scroll emojis right"
              onClick={() => scrollEmoji("right")}
            >
              <BsChevronRight size={11} />
            </S.NoteEmojiPickerArrow>
          </S.NoteEmojiPickerWrapper>
        </div>
      </S.NotePerksBox>
    </S.NoteDialogBodyWrapper>
  );
};
