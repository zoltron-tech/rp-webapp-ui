import type { FC } from "react";
import * as S from "./styled";

const MAX_NOTE_LENGTH = 100;
const NOTE_COLOR_LEVEL = 3;

export const NOTE_COLORS = [
  "#fde68a",
  "#86efac",
  "#93c5fd",
  "#c4b5fd",
  "#f9a8d4",
  "#fdba74",
  "#6ee7b7",
  "#a5b4fc",
  "#fca5a5",
  "#d1d5db",
] as const;

type NoteDialogBodyProps = {
  value: string;
  onChange: (value: string) => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
  emoji: string | null;
  onEmojiChange: (emoji: string | null) => void;
  level: number;
};

export const NoteDialogBody: FC<NoteDialogBodyProps> = ({
  value,
  onChange,
  color,
  onColorChange,
  emoji,
  onEmojiChange,
  level,
}) => {
  const remaining = MAX_NOTE_LENGTH - value.length;
  const isPremium = level >= NOTE_COLOR_LEVEL;

  return (
    <S.NoteDialogBodyWrapper>
      <S.NoteDialogTextarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_NOTE_LENGTH) {
            onChange(e.target.value);
          }
        }}
        placeholder="What's on your mind?"
        spellCheck
        maxLength={MAX_NOTE_LENGTH}
      />
      <S.NoteCharCount className={remaining <= 20 ? "warn" : undefined}>
        {value.length} / {MAX_NOTE_LENGTH}
      </S.NoteCharCount>

      <S.NoteColorSection>
        <S.NoteColorLabel>
          Note color
          {!isPremium && (
            <S.NoteLevelGate>✦ Level {NOTE_COLOR_LEVEL}+ only</S.NoteLevelGate>
          )}
        </S.NoteColorLabel>
        <S.NoteColorGrid>
          {NOTE_COLORS.map((c) => (
            <S.NoteColorSwatch
              key={c}
              $color={c}
              $active={color === c}
              $locked={!isPremium}
              type="button"
              disabled={!isPremium}
              onClick={() => onColorChange(color === c ? null : c)}
              aria-label={`Note color ${c}`}
            />
          ))}
        </S.NoteColorGrid>
      </S.NoteColorSection>

      <S.NoteEmojiSection>
        <S.NoteColorLabel>
          Emoji
          {!isPremium && (
            <S.NoteLevelGate>✦ Level {NOTE_COLOR_LEVEL}+ only</S.NoteLevelGate>
          )}
        </S.NoteColorLabel>
        <S.NoteEmojiInput
          value={emoji ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onEmojiChange(val ? val : null);
          }}
          placeholder="e.g. 🌙"
          disabled={!isPremium}
          maxLength={2}
        />
      </S.NoteEmojiSection>
    </S.NoteDialogBodyWrapper>
  );
};
