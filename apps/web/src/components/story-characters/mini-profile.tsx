"use client";

import type { StoryCharacter } from "@nw/types";
import type { FC } from "react";
import { FiExternalLink } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import * as S from "./styles";
import type { StoryFace } from "./types";

type Props = {
  open: boolean;
  face: StoryFace | null;
  /** The full record behind a story character; muses have no equivalent here. */
  character: StoryCharacter | null;
  /** Whether this viewer may edit the story's own characters. */
  canEdit: boolean;
  onClose: () => void;
  /** A muse's own page, which is where everything about it actually lives. */
  onOpenMuse: (museId: string) => void;
  onEditCharacter: (character: StoryCharacter) => void;
};

/**
 * A character at a glance — a dialog on desktop, a bottom tray on mobile.
 *
 * Tapping a face used to jump straight to a muse's page, which is a heavy
 * answer to a light question ("who is that?") and had no equivalent at all for
 * the story's own characters. This answers the question in place, and offers
 * the heavy thing as a button rather than as the only option.
 *
 * What it can show depends on the pool. A muse is summarised elsewhere by its
 * own page and reaches this page only as a name and a face, so its profile is
 * a face and a way through. A story character is owned by the storyboard, so
 * everything the authors wrote about it is already here to show.
 */
export const CharacterMiniProfile: FC<Props> = ({
  open,
  face,
  character,
  canEdit,
  onClose,
  onOpenMuse,
  onEditCharacter,
}) => {
  if (!face) return null;

  const isMuse = face.refType === "MUSE";
  const nicknames = character?.nicknames?.filter(Boolean) ?? [];
  const attributes = Object.entries(character?.extraAttributes ?? {}).filter(
    ([name, value]) => name.trim() && value.trim(),
  );
  const hasFacts =
    Boolean(character?.gender) || nicknames.length > 0 || attributes.length > 0;

  return (
    <ResponsiveSheet open={open} title="Character" onClose={onClose}>
      <S.ProfileHead>
        <S.ProfileAvatar
          src={face.image}
          nwImage={face.avatar}
          alt={face.name}
          accentColor={face.accent}
        />
        <S.ProfileNameBlock>
          <S.ProfileName>{face.name}</S.ProfileName>
          <S.ProfileBadgeRow>
            <S.PoolBadge $muse={isMuse}>
              {isMuse ? "Muse" : "Story character"}
            </S.PoolBadge>
          </S.ProfileBadgeRow>
        </S.ProfileNameBlock>
      </S.ProfileHead>

      {hasFacts && (
        <S.FactList>
          {character?.gender && (
            <>
              <dt>Gender</dt>
              <dd>{character.gender}</dd>
            </>
          )}
          {nicknames.length > 0 && (
            <>
              <dt>Known as</dt>
              <dd>{nicknames.join(", ")}</dd>
            </>
          )}
          {attributes.map(([name, value]) => (
            <div key={name} style={{ display: "contents" }}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </S.FactList>
      )}

      {character?.about ? (
        <S.About>
          <RichTextRenderer
            savedText={character.about}
            overlayHidden
            disableCollapse
          />
        </S.About>
      ) : null}

      {isMuse && face.placeholder ? null : isMuse ? (
        <S.ProfileAction type="button" onClick={() => onOpenMuse(face.id)}>
          <FiExternalLink size={15} />
          View full profile
        </S.ProfileAction>
      ) : canEdit && character ? (
        <S.ProfileAction
          type="button"
          onClick={() => onEditCharacter(character)}
        >
          <GrEdit size={14} />
          Edit character
        </S.ProfileAction>
      ) : (
        !hasFacts &&
        !character?.about && (
          <F.Hint>
            Nothing written about this character yet
            {canEdit ? "." : " — only members of this story can add to it."}
          </F.Hint>
        )
      )}
    </ResponsiveSheet>
  );
};
