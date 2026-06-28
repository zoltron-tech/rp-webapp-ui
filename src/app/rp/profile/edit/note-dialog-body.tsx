import { type FC, useEffect, useRef, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import * as S from "./styled";

const MAX_NOTE_LENGTH = 100;
const NOTE_COLOR_LEVEL = 3;

// 9 muted, eye-friendly colors + 1 "no color" swatch = 10 total
export const NOTE_COLORS = [
  "#f2d5d5", // dusty rose
  "#f4dcc8", // soft peach
  "#eadcb0", // warm sand
  "#d4e8d4", // sage green
  "#c8e4de", // seafoam
  "#d0ddf2", // powder blue
  "#ddd4f0", // soft violet
  "#e4d0dc", // mauve
  "#d8cfc4", // warm stone
] as const;

const EMOJI_SET = [
  "✨", "⭐", "🌟", "💫", "🔥", "⚡", "🌙", "☀️",
  "🌸", "🍀", "🌊", "🌈", "🌺", "🌷", "🍄", "🌻",
  "💎", "👑", "🏆", "🎯", "🎭", "🎪", "🎨", "🎵",
  "🖊️", "📖", "🎲", "💌", "💝", "🦋", "🦄", "🔮",
  "🧿", "🌿", "🏹", "🦁", "🐉", "🦊", "🌠", "🎬",
] as const;

type NoteDialogBodyProps = {
  value: string;
  onChange: (value: string) => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
  emoji: string | null;
  onEmojiChange: (emoji: string | null) => void;
  level: number;
  lockedPulseKey: number;
};

export const NoteDialogBody: FC<NoteDialogBodyProps> = ({
  value,
  onChange,
  color,
  onColorChange,
  emoji,
  onEmojiChange,
  level,
  lockedPulseKey,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const emojiRowRef = useRef<HTMLDivElement>(null);
  const remaining = MAX_NOTE_LENGTH - value.length;
  const isPremium = level >= NOTE_COLOR_LEVEL;
  const [previewWiggling, setPreviewWiggling] = useState(false);
  const [pickerWiggling, setPickerWiggling] = useState(false);

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

  // On locked-save attempt: scroll selected emoji into view + wiggle both
  useEffect(() => {
    if (lockedPulseKey === 0 || !emoji) return;
    const btn = emojiRowRef.current?.querySelector("[data-emoji-selected='true']") as HTMLElement | null;
    btn?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
    // Reset then replay animations
    setPreviewWiggling(false);
    setPickerWiggling(false);
    requestAnimationFrame(() => {
      setPreviewWiggling(true);
      setPickerWiggling(true);
    });
  }, [lockedPulseKey]);

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
        {emoji && (
          <S.NotePreviewEmoji
            $wiggling={previewWiggling}
            onAnimationEnd={() => setPreviewWiggling(false)}
          >
            {emoji}
          </S.NotePreviewEmoji>
        )}
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

      <S.NotePerksBox>
        <S.NotePerksHeader>✦ Level {NOTE_COLOR_LEVEL} Perks</S.NotePerksHeader>

        {!isPremium && (
          <S.NoteLockBanner key={lockedPulseKey}>
            <S.NoteLockBannerIcon>🔒</S.NoteLockBannerIcon>
            <S.NoteLockBannerBody>
              <S.NoteLockBannerTitle>
                Color &amp; Emoji — Level {NOTE_COLOR_LEVEL} Perk
              </S.NoteLockBannerTitle>
              <S.NoteLockBannerDesc>
                Keep writing to earn XP and unlock note customization at Level{" "}
                {NOTE_COLOR_LEVEL}!
              </S.NoteLockBannerDesc>
            </S.NoteLockBannerBody>
          </S.NoteLockBanner>
        )}

        <div>
          <S.NoteColorLabel>Note color</S.NoteColorLabel>
          <S.NoteColorGrid>
            {NOTE_COLORS.map((c) => (
              <S.NoteColorSwatch
                key={c}
                $color={c}
                $active={color === c}
                type="button"
                onClick={() => onColorChange(color === c ? null : c)}
                aria-label={`Note color ${c}`}
              />
            ))}
            <S.NoteNoColorSwatch
              type="button"
              $active={color === null}
              onClick={() => onColorChange(null)}
              aria-label="No color"
              title="Remove color"
            />
          </S.NoteColorGrid>
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
              {EMOJI_SET.map((e) => {
                const isSelected = emoji === e;
                return (
                  <S.NoteEmojiButton
                    key={e}
                    type="button"
                    $selected={isSelected}
                    $wiggling={isSelected && pickerWiggling}
                    data-selected={isSelected ? "true" : undefined}
                    data-emoji-selected={isSelected ? "true" : undefined}
                    onClick={() => onEmojiChange(isSelected ? null : e)}
                    aria-label={isSelected ? `${e} — click to remove` : `Emoji ${e}`}
                    title={isSelected ? `${e} — click to remove` : e}
                    onAnimationEnd={isSelected ? () => setPickerWiggling(false) : undefined}
                  >
                    {e}
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
