"use client";

import type { StoryCastMember, StoryCharacter } from "@nw/types";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiChevronRight } from "react-icons/fi";
import { LuVenetianMask } from "react-icons/lu";
import { MdOutlineExpandMore } from "react-icons/md";
import {
  getStoryCharactersAction,
  saveStoryCharacterAction,
} from "@/app/rp/story/actions";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { CharacterSheet } from "@/components/story-codex/character-sheet";
import { useUIContext } from "@/hooks";
import { useCustomEvents } from "@/hooks/use-custom-events";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import {
  CHARACTER_DELETED,
  CHARACTER_SAVED,
  STORY_CHARACTER_EVENTS,
} from "./events";
import { CharacterMiniProfile } from "./mini-profile";
import * as S from "./styles";
import type { StoryFace } from "./types";

interface Props {
  storyboardId: string;
  /** Muses with at least one dialog anywhere in this story's threads. */
  cast: StoryCastMember[];
  /** Whether this viewer may edit the story's own characters. */
  canEdit: boolean;
}

/** How many faces the collapsed header previews. */
const STACK_LIMIT = 4;

/**
 * Everyone in the story, as a collapsed strip that unrolls into a list.
 *
 * Both pools in one list: the muses that speak here, and the characters the
 * storyboard owns. They were split before — the muses shown as "Cast", the
 * story's own characters not shown on this page at all — which is a split the
 * reader has no reason to care about. On the page a character is a character;
 * the pool only decides who may edit them, and that surfaces as a badge and a
 * different button rather than as two separate strips.
 *
 * Deliberately the same object as the co-authors card above it: same chrome,
 * same gesture, same shape of summary.
 */
export const StoryCharacters: FC<Props> = ({ storyboardId, cast, canEdit }) => {
  const { errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();
  const characterEvents = useCustomEvents(STORY_CHARACTER_EVENTS, storyboardId);
  /** The hook builds a fresh handle every render, so holding it in a ref is
   *  what keeps the subscription below from being torn down and rebuilt on
   *  each one. The listeners themselves are matched by identity, and those
   *  are stable within the effect. */
  const eventsRef = useRef(characterEvents);
  eventsRef.current = characterEvents;

  const [expanded, setExpanded] = useState(false);
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [openFaceId, setOpenFaceId] = useState<string | null>(null);
  const [editing, setEditing] = useState<StoryCharacter | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStoryCharactersAction(storyboardId).then((result) => {
      if (cancelled || !result || "message" in result) return;
      setCharacters(result);
    });
    return () => {
      cancelled = true;
    };
  }, [storyboardId]);

  // The codex below shows the same characters from its own copy. Follow what
  // it changes, so an edit made there does not leave a stale name up here.
  useEffect(() => {
    const onSaved = (event: CustomEvent) => {
      const saved = event.detail as StoryCharacter;
      if (!saved?.id) return;
      setCharacters((current) =>
        current.some((candidate) => candidate.id === saved.id)
          ? current.map((candidate) =>
              candidate.id === saved.id ? saved : candidate,
            )
          : [...current, saved],
      );
    };
    const onDeleted = (event: CustomEvent) => {
      const id = event.detail as string;
      setCharacters((current) =>
        current.filter((candidate) => candidate.id !== id),
      );
      setOpenFaceId((current) => (current === id ? null : current));
    };
    const events = eventsRef.current;
    events.on(CHARACTER_SAVED, onSaved);
    events.on(CHARACTER_DELETED, onDeleted);
    return () => {
      events.off(CHARACTER_SAVED, onSaved);
      events.off(CHARACTER_DELETED, onDeleted);
    };
  }, []);

  /** Muses first — they are the ones who actually speak in the prose — then
   *  the story's own, each pool in the order the server gave it. */
  const faces = useMemo<StoryFace[]>(
    () => [
      ...cast.map((member) => ({
        accent: member.accent,
        avatar: member.avatar,
        id: member.id,
        image: member.image,
        name: member.name,
        // Its novelist disabled their account: no avatar to fetch.
        placeholder: member.isPlaceholder === true,
        refType: "MUSE" as const,
      })),
      ...characters
        .filter((character) => character.id)
        .map((character) => ({
          accent: character.useAccent ? (character.accent ?? null) : null,
          avatar: character.avatar ?? null,
          id: character.id as string,
          image: character.image ?? null,
          name: `${character.firstName} ${character.lastName ?? ""}`.trim(),
          refType: "CHARACTER" as const,
        })),
    ],
    [cast, characters],
  );

  const openFace = faces.find((face) => face.id === openFaceId) ?? null;
  const openCharacter =
    openFace?.refType === "CHARACTER"
      ? (characters.find((character) => character.id === openFace.id) ?? null)
      : null;

  const handleSaveCharacter = useCallback(
    async (character: StoryCharacter) => {
      const saved = await saveStoryCharacterAction(
        storyboardId,
        character,
      ).catch(() => null);
      if (!saved || "message" in saved) {
        errorToast("Could not save that character. Please try again.");
        return;
      }
      setCharacters((current) =>
        current.map((candidate) =>
          candidate.id === saved.id ? saved : candidate,
        ),
      );
      eventsRef.current.emit(CHARACTER_SAVED, saved);
      setEditing(null);
    },
    [storyboardId, errorToast],
  );

  if (faces.length === 0) return null;

  const stackFaces = faces.slice(0, STACK_LIMIT);
  const overflowCount = faces.length - stackFaces.length;

  return (
    <>
      <S.Card>
        <S.HeaderButton
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <S.HeaderLeft>
            <S.HeaderIcon>
              <LuVenetianMask />
            </S.HeaderIcon>
            <S.HeaderTitle>Characters</S.HeaderTitle>
            <S.CountBadge>{faces.length}</S.CountBadge>
          </S.HeaderLeft>

          <S.HeaderRight>
            <S.Stack aria-label="Characters preview">
              {stackFaces.map((face) => (
                <S.StackAvatar
                  key={face.id}
                  src={
                    face.image ||
                    (face.placeholder ? null : museAvatarUrl(face.id))
                  }
                  nwImage={face.avatar}
                  alt={face.name}
                  title={face.name}
                />
              ))}
              {overflowCount > 0 && (
                <S.StackOverflow>+{overflowCount}</S.StackOverflow>
              )}
            </S.Stack>

            <S.Chevron $expanded={expanded}>
              <MdOutlineExpandMore />
            </S.Chevron>
          </S.HeaderRight>
        </S.HeaderButton>

        {expanded ? (
          <S.List>
            {faces.map((face) => (
              <S.Row
                key={`${face.refType}-${face.id}`}
                type="button"
                onClick={() => setOpenFaceId(face.id)}
              >
                <S.RowAvatar
                  src={
                    face.image ||
                    (face.placeholder ? null : museAvatarUrl(face.id))
                  }
                  nwImage={face.avatar}
                  alt={face.name}
                  accentColor={face.accent}
                />
                <S.RowInfo>
                  <S.RowName>{face.name}</S.RowName>
                  <S.PoolBadge $muse={face.refType === "MUSE"}>
                    {face.refType === "MUSE" ? "Muse" : "Story"}
                  </S.PoolBadge>
                </S.RowInfo>
                <S.RowChevron>
                  <FiChevronRight />
                </S.RowChevron>
              </S.Row>
            ))}
          </S.List>
        ) : null}
      </S.Card>

      <CharacterMiniProfile
        open={openFaceId !== null && editing === null}
        face={openFace}
        character={openCharacter}
        canEdit={canEdit}
        onClose={() => setOpenFaceId(null)}
        onOpenMuse={(museId) => {
          setOpenFaceId(null);
          routeToPage(ROUTES.Muse.View(museId));
        }}
        onEditCharacter={(character) => setEditing(character)}
      />

      <CharacterSheet
        open={editing !== null}
        character={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveCharacter}
      />
    </>
  );
};

export default StoryCharacters;
