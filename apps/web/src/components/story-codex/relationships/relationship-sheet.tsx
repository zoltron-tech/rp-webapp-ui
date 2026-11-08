"use client";

import type {
  CharacterRefType,
  CodexRelationship,
  CodexTone,
  CodexToneLineStyle,
  RelationshipTone,
  StoryPerson,
} from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import { LuArrowLeftRight, LuArrowRight, LuX } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { CODEX_COLORS } from "../icons";
import * as S from "./styles";
import {
  LINE_STYLE_DASH,
  LINE_STYLE_LABELS,
  LINE_STYLE_ORDER,
  type ResolvedTone,
} from "./tones";

type Props = {
  open: boolean;
  /** Null when adding a new relationship. */
  relationship: CodexRelationship | null;
  /** Every character in the story, from both pools. */
  cast: StoryPerson[];
  /** Every tone this story can draw — the built-in three, then its own. */
  palette: ResolvedTone[];
  /** The custom tones behind the non-system half of `palette`, so the sheet
   *  can edit and retire them. */
  tones: CodexTone[];
  canEdit: boolean;
  onClose: () => void;
  onSave: (relationship: CodexRelationship) => unknown;
  onDelete?: (relationship: CodexRelationship) => unknown;
  /** Returns the saved tone so it can be selected the moment it exists. */
  onSaveTone: (tone: CodexTone) => Promise<CodexTone | null>;
  /** Resolves true once the tone is gone. */
  onDeleteTone: (tone: CodexTone) => Promise<boolean>;
};

const STRENGTH_LABELS = ["Passing", "Real", "Defining"];

/**
 * Records how two of the story's characters stand toward each other.
 *
 * Either end may be a cast muse or one of the story's own characters, and the
 * picker deliberately does not separate them: on the page they are all just
 * characters, and the kind only rides along so the server can check the right
 * pool. It has to ride along, though — the two id spaces are separate, so an id
 * alone does not say who somebody is.
 */
export const RelationshipSheet: FC<Props> = ({
  open,
  relationship,
  cast,
  palette,
  tones,
  canEdit,
  onClose,
  onSave,
  onDelete,
  onSaveTone,
  onDeleteTone,
}) => {
  const theme = useGlobalState("theme");

  const [fromId, setFromId] = useState<string | null>(null);
  const [fromType, setFromType] = useState<CharacterRefType>("MUSE");
  const [toId, setToId] = useState<string | null>(null);
  const [toType, setToType] = useState<CharacterRefType>("MUSE");
  const [label, setLabel] = useState("");
  /** The built-in this edge falls back to if its custom tone is retired. */
  const [tone, setTone] = useState<RelationshipTone>("NEUTRAL");
  const [toneId, setToneId] = useState<string | null>(null);

  // The inline tone maker. An author reaches for a new colour while recording
  // the relationship that needs it, so it lives here rather than behind a
  // separate settings trip.
  const [makingTone, setMakingTone] = useState(false);
  const [toneLabel, setToneLabel] = useState("");
  const [toneColour, setToneColour] = useState<string>(CODEX_COLORS[0]);
  const [toneLine, setToneLine] = useState<CodexToneLineStyle>("SOLID");
  const [savingTone, setSavingTone] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [strength, setStrength] = useState(2);
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** The custom tone waiting on "Retire it?" — null when nothing is asked. */
  const [retiring, setRetiring] = useState<CodexTone | null>(null);
  // Held while a delete is in flight: no save and no closing until it lands.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!relationship || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(relationship);
    } finally {
      setDeleting(false);
    }
  };

  const handleRetireTone = async () => {
    if (!retiring) return;
    const custom = retiring;
    setDeleting(true);
    try {
      // Fall back only once it is really gone, so a failed retire leaves the
      // sheet on the tone the author had.
      if (await onDeleteTone(custom)) {
        setToneId((current) => (current === custom.id ? null : current));
      }
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setFromId(relationship?.fromId ?? cast[0]?.id ?? null);
    setFromType(relationship?.fromType ?? cast[0]?.refType ?? "MUSE");
    setToId(relationship?.toId ?? cast[1]?.id ?? null);
    setToType(relationship?.toType ?? cast[1]?.refType ?? "MUSE");
    setLabel(relationship?.label ?? "");
    setTone(relationship?.tone ?? "NEUTRAL");
    setToneId(relationship?.toneId ?? null);
    setMakingTone(false);
    setToneLabel("");
    setToneColour(CODEX_COLORS[0]);
    setToneLine("SOLID");
    setSavingTone(false);
    setIsDirected(relationship?.isDirected ?? false);
    setStrength(relationship?.strength ?? 2);
    setConfirmDelete(false);
    setRetiring(null);
  }, [open, relationship, cast]);

  const trimmed = label.trim();
  // A character can't stand in a relationship with themselves, and the mesh
  // needs both ends to draw an arc. "Themselves" is the id *and* the kind: the
  // two pools number their people independently.
  const isSamePerson = fromId === toId && fromType === toType;
  const valid = Boolean(fromId && toId && !isSamePerson && trimmed);

  return (
    <ResponsiveSheet
      open={open}
      title={relationship ? "Relationship" : "New relationship"}
      confirmDisabled={!valid || deleting}
      onConfirm={
        canEdit && fromId && toId
          ? () =>
              onSave({
                fromId,
                fromType,
                id: relationship?.id ?? null,
                isDirected,
                label: trimmed,
                strength,
                toId,
                tone,
                toneId,
                toType,
              })
          : undefined
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      {!canEdit ? (
        <F.Hint>
          Only members of this story can change its relationships.
        </F.Hint>
      ) : cast.length < 2 ? (
        <F.Hint>
          Relationships are drawn between this story&rsquo;s characters — muses,
          which join the cast as soon as one of their dialogs appears in a
          passage, and the characters the story owns. Two are needed before
          there is anything to connect.
        </F.Hint>
      ) : (
        <>
          <F.Field as="div">
            From
            <F.ChoiceRow>
              {cast.map((member) => (
                <F.Choice
                  key={`${member.refType}:${member.id}`}
                  type="button"
                  $active={fromId === member.id && fromType === member.refType}
                  aria-pressed={
                    fromId === member.id && fromType === member.refType
                  }
                  onClick={() => {
                    setFromId(member.id);
                    setFromType(member.refType);
                  }}
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
                  key={`${member.refType}:${member.id}`}
                  type="button"
                  $active={toId === member.id && toType === member.refType}
                  aria-pressed={toId === member.id && toType === member.refType}
                  onClick={() => {
                    setToId(member.id);
                    setToType(member.refType);
                  }}
                >
                  {member.name}
                </F.Choice>
              ))}
            </F.ChoiceRow>
          </F.Field>

          {fromId && toId && isSamePerson && (
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
              {palette.map((candidate) => {
                const active = candidate.isSystem
                  ? toneId === null && tone === candidate.key
                  : toneId === candidate.key;
                return (
                  <F.Choice
                    key={candidate.key}
                    type="button"
                    $active={active}
                    $color={candidate.color}
                    aria-pressed={active}
                    title={candidate.description ?? "A tone this story defined"}
                    onClick={() => {
                      if (candidate.isSystem) {
                        setTone(candidate.key as RelationshipTone);
                        setToneId(null);
                      } else {
                        setToneId(candidate.key);
                      }
                    }}
                  >
                    {candidate.label}
                  </F.Choice>
                );
              })}
              {canEdit && !makingTone && (
                <F.Choice type="button" onClick={() => setMakingTone(true)}>
                  <IoMdAdd size={14} />
                  New tone
                </F.Choice>
              )}
            </F.ChoiceRow>
          </F.Field>

          {/* Retiring a tone is offered next to the one in use, not buried:
              it is the only destructive thing on this sheet that is not the
              relationship itself, so it says what it will and will not take. */}
          {canEdit &&
            toneId &&
            (() => {
              const custom = tones.find((candidate) => candidate.id === toneId);
              if (!custom) return null;
              return (
                <S.ToneRetire
                  type="button"
                  disabled={deleting}
                  onClick={() => setRetiring(custom)}
                >
                  <LuX size={13} />
                  Retire &ldquo;{custom.label}&rdquo; from this story
                </S.ToneRetire>
              );
            })()}

          {canEdit && makingTone && (
            <S.ToneMaker>
              <F.Field>
                What is this tone called?
                <F.TextInput
                  value={toneLabel}
                  maxLength={40}
                  placeholder="blood oath · unrequited · same regiment"
                  onChange={(e) => setToneLabel(e.target.value)}
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
                      $active={toneColour === hex}
                      aria-label={`Colour ${hex}`}
                      aria-pressed={toneColour === hex}
                      onClick={() => setToneColour(hex)}
                    />
                  ))}
                </F.SwatchRow>
              </F.Field>

              {/* The stroke is not decoration. Past the built-in three hues,
                  colour alone stops separating reliably — the pattern is what
                  keeps a busy mesh readable, and readable without colour. */}
              <F.Field as="div">
                Line
                <F.ChoiceRow>
                  {LINE_STYLE_ORDER.map((style) => (
                    <F.Choice
                      key={style}
                      type="button"
                      $active={toneLine === style}
                      aria-pressed={toneLine === style}
                      onClick={() => setToneLine(style)}
                    >
                      <S.ToneStrokePreview viewBox="0 0 26 10" aria-hidden>
                        <line
                          x1="1"
                          y1="5"
                          x2="25"
                          y2="5"
                          stroke={toneColour}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={
                            LINE_STYLE_DASH[style] === "none"
                              ? undefined
                              : LINE_STYLE_DASH[style]
                          }
                        />
                      </S.ToneStrokePreview>
                      {LINE_STYLE_LABELS[style]}
                    </F.Choice>
                  ))}
                </F.ChoiceRow>
              </F.Field>

              <S.ToneMakerActions>
                <F.Choice
                  type="button"
                  $active
                  disabled={toneLabel.trim().length === 0 || savingTone}
                  onClick={async () => {
                    setSavingTone(true);
                    const saved = await onSaveTone({
                      color: toneColour,
                      id: null,
                      label: toneLabel.trim(),
                      lineStyle: toneLine,
                      ordinal: tones.length,
                    });
                    setSavingTone(false);
                    if (!saved?.id) return;
                    // Select it at once — the author made it for this edge.
                    setToneId(saved.id);
                    setMakingTone(false);
                    setToneLabel("");
                  }}
                >
                  {savingTone ? "Adding…" : "Add tone"}
                </F.Choice>
                <F.Choice type="button" onClick={() => setMakingTone(false)}>
                  Cancel
                </F.Choice>
              </S.ToneMakerActions>
            </S.ToneMaker>
          )}

          <F.Hint>
            Tone only colours the line. What it means is the words you wrote.
            Bond, Strain and Neutral are always here — they are the three hues
            that stay apart for a colour-blind reader once the mesh gets busy,
            which is why anything you add carries its own stroke too.
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
              disabled={deleting}
              onClick={() => setConfirmDelete(true)}
            >
              <FaRegTrashCan size={13} />
              Delete relationship
            </F.DangerButton>
          )}
        </>
      )}

      <AppAlertDialog
        heading="Delete this relationship?"
        text="The line between these two comes off the mesh for every co-author. This cannot be undone."
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        actionButtonLabel="Delete"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleDelete}
      />

      <AppAlertDialog
        heading={`Retire “${retiring?.label ?? ""}”?`}
        text="It leaves this story's palette. Relationships drawn in it stay, and go back to their built-in tone."
        open={retiring !== null}
        onOpenChange={(next) => {
          if (!next) setRetiring(null);
        }}
        actionButtonLabel="Retire"
        actionColor="negative"
        closeOnConfirm
        onConfirm={handleRetireTone}
      />
    </ResponsiveSheet>
  );
};
