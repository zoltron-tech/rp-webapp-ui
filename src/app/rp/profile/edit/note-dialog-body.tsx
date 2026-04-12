import type { FC } from "react";
import * as S from "./styled";

const MAX_NOTE_LENGTH = 100;

type NoteDialogBodyProps = {
  value: string;
  onChange: (value: string) => void;
};

export const NoteDialogBody: FC<NoteDialogBodyProps> = ({
  value,
  onChange,
}) => {
  const remaining = MAX_NOTE_LENGTH - value.length;

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
    </S.NoteDialogBodyWrapper>
  );
};
