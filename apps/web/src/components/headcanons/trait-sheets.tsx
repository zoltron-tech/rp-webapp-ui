"use client";

import type { HeadcanonCatalog, MuseTrait } from "@nw/types/headcanon";
import { type FC, useEffect, useMemo, useState } from "react";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import * as S from "./styles";
import { TraitGlyph } from "./trait-art";
import { TraitChip } from "./trait-chip";

type PickerProps = {
  open: boolean;
  catalog: HeadcanonCatalog;
  traits: MuseTrait[];
  busy?: boolean;
  onClose: () => void;
  onSave: (traits: MuseTrait[]) => void;
};

/**
 * Pick up to five traits from the fixed list. Opposites grey out and say why;
 * at the cap everything else dims. Notes ride along untouched — they are
 * written one trait at a time in [TraitNoteSheet].
 */
export const TraitPickerSheet: FC<PickerProps> = ({
  open,
  catalog,
  traits,
  busy,
  onClose,
  onSave,
}) => {
  const max = catalog.limits.maxTraits;
  const [picked, setPicked] = useState<MuseTrait[]>(traits);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setPicked(traits);
    setQuery("");
  }, [open, traits]);

  const byKey = useMemo(
    () => new Map(catalog.traits.map((t) => [t.key, t])),
    [catalog],
  );
  const pickedKeys = new Set(picked.map((t) => t.key));
  const clashOf = (key: string) =>
    byKey.get(key)?.clashesWith.find((other) => pickedKeys.has(other)) ?? null;
  const full = picked.length >= max;

  const toggle = (key: string) =>
    setPicked((current) =>
      current.some((t) => t.key === key)
        ? current.filter((t) => t.key !== key)
        : current.length >= max || clashOf(key)
          ? current
          : [...current, { key, note: null }],
    );

  const needle = query.trim().toLowerCase();
  let firstClash: string | null = null;
  const groups = catalog.traitGroups
    .map((group) => ({
      group,
      traits: catalog.traits.filter(
        (t) =>
          t.group === group.key &&
          (!needle || t.label.toLowerCase().includes(needle)),
      ),
    }))
    .filter((g) => g.traits.length > 0);

  for (const g of groups) {
    for (const t of g.traits) {
      const clash = !pickedKeys.has(t.key) ? clashOf(t.key) : null;
      if (clash && !firstClash) {
        firstClash = `${t.label} clashes with ${byKey.get(clash)?.label ?? clash}.`;
      }
    }
  }

  const hint = full
    ? `${max} of ${max} picked. Remove one to swap.`
    : (firstClash ?? "Tap a trait to add it. Opposites grey out.");

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title="Traits"
      onClose={onClose}
      onConfirm={() => onSave(picked)}
      confirmDisabled={busy}
      footer={
        <>
          <S.PickedHead>
            <S.GroupLabel>Picked</S.GroupLabel>
            <S.Count>
              {picked.length}/{max}
            </S.Count>
          </S.PickedHead>
          <S.PickedRow>
            {picked.length === 0 ? (
              <S.PickedEmpty>Nothing picked yet.</S.PickedEmpty>
            ) : (
              picked.map((t) => {
                const def = byKey.get(t.key);
                return (
                  <TraitChip
                    key={t.key}
                    traitKey={t.key}
                    label={def?.label ?? t.key}
                    group={def?.group}
                    on
                    removable
                    onClick={() => toggle(t.key)}
                  />
                );
              })
            )}
          </S.PickedRow>
          <S.SheetFoot aria-live="polite">{hint}</S.SheetFoot>
        </>
      }
    >
      <F.TextInput
        type="search"
        value={query}
        placeholder="Search traits"
        aria-label="Search traits"
        onChange={(e) => setQuery(e.target.value)}
      />

      {groups.length === 0 && (
        <F.Hint>No trait matches "{query.trim()}".</F.Hint>
      )}

      {groups.map(({ group, traits: list }) => (
        <F.Field as="div" key={group.key}>
          <S.GroupLabel>{group.label}</S.GroupLabel>
          <F.ChoiceRow>
            {list.map((t) => {
              const on = pickedKeys.has(t.key);
              const clash = on ? null : clashOf(t.key);
              const disabled = !on && (Boolean(clash) || full);
              return (
                <TraitChip
                  key={t.key}
                  traitKey={t.key}
                  label={t.label}
                  group={t.group}
                  on={on}
                  checked={on}
                  pressed={on}
                  disabled={disabled}
                  clash={Boolean(clash)}
                  title={
                    clash
                      ? `Clashes with ${byKey.get(clash)?.label ?? clash}`
                      : undefined
                  }
                  onClick={() => toggle(t.key)}
                />
              );
            })}
          </F.ChoiceRow>
        </F.Field>
      ))}
    </ResponsiveSheet>
  );
};

type NoteProps = {
  open: boolean;
  traitKey: string;
  group?: string | null;
  label: string;
  note: string | null;
  max: number;
  busy?: boolean;
  onClose: () => void;
  onSave: (note: string | null) => void;
  onRemove: () => void;
};

/** One line on how a trait shows — "Bookworm: only reads tragedies". */
export const TraitNoteSheet: FC<NoteProps> = ({
  open,
  traitKey,
  group,
  label,
  note,
  max,
  busy,
  onClose,
  onSave,
  onRemove,
}) => {
  const [draft, setDraft] = useState(note ?? "");

  useEffect(() => {
    if (open) setDraft(note ?? "");
  }, [open, note]);

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title="Trait note"
      onClose={onClose}
      confirmDisabled={busy}
      onConfirm={() => onSave(draft.trim() ? draft.trim() : null)}
      footer={
        <S.FootRow>
          <F.Hint>Shows when someone taps the trait.</F.Hint>
          <F.DangerButton type="button" disabled={busy} onClick={onRemove}>
            Remove trait
          </F.DangerButton>
        </S.FootRow>
      }
    >
      <S.TraitHero $hue={S.traitHue(group)}>
        <span className="art">
          <TraitGlyph
            traitKey={traitKey}
            group={group ?? undefined}
            size={44}
          />
        </span>
        <strong>{label}</strong>
      </S.TraitHero>
      <F.Field>
        How does it show? (optional)
        <F.TextInput
          value={draft}
          maxLength={max}
          placeholder="e.g. Only reads tragedies. Annotates in pen."
          onChange={(e) => setDraft(e.target.value)}
        />
      </F.Field>
      <S.CharCount>
        {draft.length}/{max}
      </S.CharCount>
    </ResponsiveSheet>
  );
};
