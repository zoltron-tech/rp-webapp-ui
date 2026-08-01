"use client";

import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuArrowLeftRight, LuArrowRight } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { useGlobalState } from "@/context/store/stores";
import type {
  CodexRelationship,
  RelationshipTone,
  StoryCastMember,
} from "@/types";
import { TONE_ORDER, TONE_SPECS, toneColor } from "./tones";

type Props = {
  open: boolean;
  /** Null when adding a new relationship. */
  relationship: CodexRelationship | null;
  cast: StoryCastMember[];
  canEdit: boolean;
  onClose: () => void;
  onSave: (relationship: CodexRelationship) => void;
  onDelete?: (relationship: CodexRelationship) => void;
};

const STRENGTH_LABELS = ["Passing", "Real", "Defining"];

/** Records how two of the story's cast stand toward each other. */
export const RelationshipSheet: FC<Props> = ({
  open,
  relationship,
  cast,
  canEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const theme = useGlobalState("theme");

  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [tone, setTone] = useState<RelationshipTone>("NEUTRAL");
  const [isDirected, setIsDirected] = useState(false);
  const [strength, setStrength] = useState(2);

  useEffect(() => {
    if (!open) return;
    setFromId(relationship?.fromMuseId ?? cast[0]?.id ?? null);
    setToId(relationship?.toMuseId ?? cast[1]?.id ?? null);
    setLabel(relationship?.label ?? "");
    setTone(relationship?.tone ?? "NEUTRAL");
    setIsDirected(relationship?.isDirected ?? false);
    setStrength(relationship?.strength ?? 2);
  }, [open, relationship, cast]);

  const trimmed = label.trim();
  // A character can't stand in a relationship with themselves, and the mesh
  // needs both ends to draw an arc.
  const valid = Boolean(fromId && toId && fromId !== toId && trimmed);

  return (
    <ResponsiveSheet
      open={open}
      title={relationship ? "Relationship" : "New relationship"}
      confirmDisabled={!valid}
      onConfirm={
        canEdit && fromId && toId
          ? () =>
              onSave({
                fromMuseId: fromId,
                id: relationship?.id ?? null,
                isDirected,
                label: trimmed,
                strength,
                toMuseId: toId,
                tone,
              })
          : undefined
      }
      onClose={onClose}
    >
      {!canEdit ? (
        <F.Hint>
          Only members of this story can change its relationships.
        </F.Hint>
      ) : cast.length < 2 ? (
        <F.Hint>
          Relationships are drawn between characters in this story's cast — a
          muse joins it as soon as one of its dialogs appears in a passage. Two
          are needed before there is anything to connect.
        </F.Hint>
      ) : (
        <>
          <F.Field as="div">
            From
            <F.ChoiceRow>
              {cast.map((member) => (
                <F.Choice
                  key={member.id}
                  type="button"
                  $active={fromId === member.id}
                  aria-pressed={fromId === member.id}
                  onClick={() => setFromId(member.id)}
                >
                  {member.name}
                </F.Choice>
              ))}
            </F.ChoiceRow>
          </F.Field>

          <F.Field as="div">
            To
            <F.ChoiceRow>
              {cast.map((member) => (
                <F.Choice
                  key={member.id}
                  type="button"
                  $active={toId === member.id}
                  aria-pressed={toId === member.id}
                  onClick={() => setToId(member.id)}
                >
                  {member.name}
                </F.Choice>
              ))}
            </F.ChoiceRow>
          </F.Field>

          {fromId && toId && fromId === toId && (
            <F.Hint>Pick two different characters.</F.Hint>
          )}

          <F.Field>
            What are they to each other?
            <F.TextInput
              value={label}
              maxLength={60}
              placeholder="sworn enemies · raised him · owes a debt"
              onChange={(e) => setLabel(e.target.value)}
            />
          </F.Field>

          <F.Field as="div">
            Tone
            <F.ChoiceRow>
              {TONE_ORDER.map((candidate) => (
                <F.Choice
                  key={candidate}
                  type="button"
                  $active={tone === candidate}
                  $color={toneColor(candidate, theme)}
                  aria-pressed={tone === candidate}
                  title={TONE_SPECS[candidate].description}
                  onClick={() => setTone(candidate)}
                >
                  {TONE_SPECS[candidate].label}
                </F.Choice>
              ))}
            </F.ChoiceRow>
          </F.Field>
          <F.Hint>
            Tone only colours the line. What it means is the words you wrote —
            there are three tones because three is the most that stay apart for
            a colour-blind reader once the mesh gets busy.
          </F.Hint>

          <F.ToggleRow
            type="button"
            $active={isDirected}
            aria-pressed={isDirected}
            onClick={() => setIsDirected((v) => !v)}
          >
            {isDirected ? (
              <LuArrowRight size={16} />
            ) : (
              <LuArrowLeftRight size={16} />
            )}
            {isDirected ? "One-way — draws an arrow" : "Mutual — no arrow"}
          </F.ToggleRow>

          <F.Field as="div">
            How much it defines them
            <F.RangeRow>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={strength}
                aria-label="How much it defines them"
                onChange={(e) => setStrength(Number(e.target.value))}
              />
              <F.RangeValue>{STRENGTH_LABELS[strength - 1]}</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          {relationship && onDelete && (
            <F.DangerButton
              type="button"
              onClick={() => onDelete(relationship)}
            >
              <FaRegTrashCan size={13} />
              Delete relationship
            </F.DangerButton>
          )}
        </>
      )}
    </ResponsiveSheet>
  );
};
