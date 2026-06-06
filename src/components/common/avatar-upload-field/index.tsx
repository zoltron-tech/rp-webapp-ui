import { type FC, useMemo } from "react";
import { HiOutlineCamera, HiOutlinePencilSquare } from "react-icons/hi2";
import * as S from "./styles";

type AvatarUploadFieldProps = {
  src: string | null;
  alt: string;
  note?: string | null;
  onNoteClick?: (e: React.MouseEvent) => void;
  onAvatarClick?: () => void;
  nwImage?: any;
};

const trimNote = (text: string, max = 40) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

const NOTE_PROMPTS = [
  "✨ What's sparkling in your mind?",
  "🎭 Set the stage for today...",
  "💬 Drop something worth reading...",
  "🌊 Ride the wave, say something...",
  "🔥 What's got you fired up?",
  "🌙 Current mood in three words...",
  "💡 Bright idea? Spill it!",
  "🎲 Feeling lucky? Say something fun!",
  "🖊️ Your story starts here...",
  "🌈 Color your followers' day!",
  "⚡ Hit them with something electric...",
  "🎯 Make it count!",
];

export const AvatarUploadField: FC<AvatarUploadFieldProps> = ({
  src,
  alt,
  note,
  nwImage,
  onNoteClick,
  onAvatarClick,
}) => {
  const placeholder = useMemo(
    () => NOTE_PROMPTS[Math.floor(Math.random() * NOTE_PROMPTS.length)],
    [],
  );
  const avatarContent = (
    <>
      <S.Avatar className="selectable" src={src} alt={alt} nwImage={nwImage} />
      <S.CameraOverlay>
        <HiOutlineCamera />
      </S.CameraOverlay>
    </>
  );
  return (
    <S.Wrapper>
      {onAvatarClick ? (
        <S.AvatarButton
          type="button"
          aria-label="Change avatar"
          onClick={onAvatarClick}
        >
          {avatarContent}
        </S.AvatarButton>
      ) : (
        avatarContent
      )}
      {onNoteClick !== undefined && (
        <S.NoteBubble
          type="button"
          data-placeholder={!note ? "true" : undefined}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onNoteClick(e);
          }}
        >
          <HiOutlinePencilSquare />
          {note ? trimNote(note) : placeholder}
        </S.NoteBubble>
      )}
    </S.Wrapper>
  );
};
