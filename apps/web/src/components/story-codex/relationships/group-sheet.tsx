"use client";

import type { CodexGroup, CodexGroupMember, StoryPerson } from "@nw/types";
import { type FC, useEffect, useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { CODEX_COLORS } from "../icons";
import * as S from "./styles";

type Props = {
  open: boolean;
  /** Null when starting a new group. */
  group: CodexGroup | null;
  /** Every character in the story, from both pools. */
  cast: StoryPerson[];
  /** Colours already spoken for, so a second group doesn't open on the first
   *  one's hue and produce two fields nobody can tell apart. */
  takenColors: string[];
  canEdit: boolean;
  onClose: () => void;
  onSave: (group: CodexGroup) => unknown;
  onDelete?: (group: CodexGroup) => unknown;
};

/** Fewest characters a group can hold — mirrors the server's own floor. */
const MIN_MEMBERS = 2;

/** A member's identity is the id *and* the pool it came from. */
const memberKey = (member: Pick<CodexGroupMember, "id" | "refType">) =>
  `${member.refType}:${member.id}`;

/**
 * Names a house, a clan, a crew — a set of the story's characters that belongs
 * together.
 *
 * The picker does not separate muses from the story's own characters, for the
 * same reason the relationship sheet does not: on the page they are all just
 * characters, and the pool only rides along so the server can check the right
 * one.
 *
 * Two members at least. A group of one is that character, and the field the
 * mesh would draw around them says nothing their own disc does not.
 */
export const GroupSheet: FC<Props> = ({
  open,
  group,
  cast,
  takenColors,
  canEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CODEX_COLORS[0]);
  /** Keyed `REFTYPE:id`, so the two id spaces cannot collide. */
  const [members, setMembers] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Held while disbanding: no save and no closing until it lands.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!group || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(group);
    } finally {
      setDeleting(false);
    }
  };

  /** Read when the sheet opens, never depended on: the parent builds this list
   *  inline, so a fresh array arrives on every render and depending on it would
   *  reset the form under the author mid-edit. */
  const takenRef = useRef(takenColors);
  takenRef.current = takenColors;

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? "");
    setColor(
      group?.color ??
        // Open on a hue nothing else is using; only fall back to the first
        // once the story has been through the whole palette.
        CODEX_COLORS.find((hex) => !takenRef.current.includes(hex)) ??
        CODEX_COLORS[0],
    );
    setMembers(new Set((group?.members ?? []).map(memberKey)));
    setConfirmDelete(false);
  }, [open, group]);

  const toggleMember = (person: StoryPerson) =>
    setMembers((current) => {
      const next = new Set(current);
      const key = memberKey({ id: person.id, refType: person.refType });
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const trimmed = name.trim();
  const chosen = cast.filter((person) =>
    members.has(memberKey({ id: person.id, refType: person.refType })),
  );
  const valid = Boolean(trimmed) && chosen.length >= MIN_MEMBERS;

  return (
    <ResponsiveSheet
      open={open}
      title={group ? "Group" : "New group"}
      confirmDisabled={!valid || deleting}
      onConfirm={
        canEdit && valid
          ? () =>
              onSave({
                color,
                id: group?.id ?? null,
                members: chosen.map((person) => ({
                  id: person.id,
                  refType: person.refType,
                })),
                name: trimmed,
                ordinal: group?.ordinal ?? 0,
              })
          : undefined
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      {!canEdit ? (
        <F.Hint>Only members of this story can change its groups.</F.Hint>
      ) : cast.length < MIN_MEMBERS ? (
        <F.Hint>
          A group gathers two or more of this story&rsquo;s characters — muses,
          which join the cast as soon as one of their dialogs appears in a
          passage, and the characters the story owns.
        </F.Hint>
      ) : (
        <>
          <F.Field>
            What is this group called?
            <F.TextInput
              value={name}
              maxLength={40}
              placeholder="Gryffindor · House Corvin · the Ninth"
              onChange={(e) => setName(e.target.value)}
            />
          </F.Field>

          <F.Field as="div">
            Colour
            <F.SwatchRow>
              {CODEX_COLORS.map((hex) => (
                <F.Swatch
                  key={hex}
                  type="button"
                  $color={hex}
                  $active={color === hex}
                  aria-label={
                    takenColors.includes(hex) && hex !== group?.color
                      ? `Colour ${hex}, already used by another group`
                      : `Colour ${hex}`
                  }
                  aria-pressed={color === hex}
                  onClick={() => setColor(hex)}
                />
              ))}
            </F.SwatchRow>
          </F.Field>

          <F.Field as="div">
            Who is in it?
            <F.ChoiceRow>
              {cast.map((person) => {
                const active = members.has(
                  memberKey({ id: person.id, refType: person.refType }),
                );
                return (
                  <F.Choice
                    key={memberKey({ id: person.id, refType: person.refType })}
                    type="button"
                    $active={active}
                    $color={active ? color : undefined}
                    aria-pressed={active}
                    onClick={() => toggleMember(person)}
                  >
                    {person.name}
                  </F.Choice>
                );
              })}
            </F.ChoiceRow>
          </F.Field>

          {chosen.length < MIN_MEMBERS && (
            <F.Hint>
              Pick at least two. A group of one is just that character.
            </F.Hint>
          )}

          {/* The same dressing the board uses — wash, hatch, slim rim — so the
              swatch above is not the only thing the author is choosing from. */}
          <S.GroupPreview aria-hidden>
            <svg viewBox="0 0 120 44">
              <title>How this group is drawn</title>
              <defs>
                <pattern
                  id="group-preview-hatch"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                  width="5"
                  height="5"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="5"
                    stroke={color}
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect
                x="4"
                y="6"
                width="112"
                height="32"
                rx="16"
                fill={color}
                opacity="0.22"
              />
              <rect
                x="4"
                y="6"
                width="112"
                height="32"
                rx="16"
                fill="url(#group-preview-hatch)"
                opacity="0.16"
              />
              <rect
                x="4"
                y="6"
                width="112"
                height="32"
                rx="16"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.42"
              />
              <circle cx="34" cy="22" r="9" fill={color} opacity="0.85" />
              <circle cx="62" cy="22" r="9" fill={color} opacity="0.85" />
              <circle cx="90" cy="22" r="9" fill={color} opacity="0.85" />
            </svg>
            <span>
              The mesh draws this as a field around whoever is in it. Somebody
              in two groups sits in both, and the part where the two fields meet
              is painted in the blend of their colours.
            </span>
          </S.GroupPreview>

          {group && onDelete && (
            <F.DangerButton
              type="button"
              disabled={deleting}
              onClick={() => setConfirmDelete(true)}
            >
              <FaRegTrashCan size={13} />
              Disband group
            </F.DangerButton>
          )}
        </>
      )}

      <AppAlertDialog
        heading="Disband this group?"
        text="Its field comes off the mesh for every co-author. The characters in it and their relationships stay as they are."
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Disband"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleDelete}
      />
    </ResponsiveSheet>
  );
};
