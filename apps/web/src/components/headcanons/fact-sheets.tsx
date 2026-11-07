"use client";

import type { HeadcanonCatalog, ThisOrThatPick } from "@nw/types/headcanon";
import { type FC, type FormEvent, useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiCheck, FiPlus, FiX } from "react-icons/fi";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import * as S from "./styles";

/** Strengths and flaws are two blocks the owner turns on as one. */
const PAIRED = ["STRENGTHS", "FLAWS"];

const EXAMPLES: Record<string, string> = {
  COMFORTS: "warm socks, tea, re-reads",
  DISLIKES: "being interrupted",
  FEARS: "thunderstorms, deep water",
  HABITS: "hums when nervous",
  HOBBIES: "chess, potions, lockpicking",
  LIKES: "rain, old libraries",
  PET_PEEVES: "dog-eared pages",
  STRENGTHS: "two short lists side by side",
  THIS_OR_THAT: "tea or coffee, cats or dogs…",
};

// ── Which blocks are on ────────────────────────────────────────────────────

type BlocksProps = {
  open: boolean;
  catalog: HeadcanonCatalog;
  enabled: string[];
  busy?: boolean;
  onClose: () => void;
  onSave: (enabled: string[]) => void;
};

export const FactBlocksSheet: FC<BlocksProps> = ({
  open,
  catalog,
  enabled,
  busy,
  onClose,
  onSave,
}) => {
  const [on, setOn] = useState<Set<string>>(new Set(enabled));

  useEffect(() => {
    if (open) setOn(new Set(enabled));
  }, [open, enabled]);

  const options = catalog.factBlocks.filter((b) => b.key !== "FLAWS");
  const toggle = (key: string) =>
    setOn((current) => {
      const next = new Set(current);
      const keys = key === "STRENGTHS" ? PAIRED : [key];
      const turningOn = !next.has(key);
      for (const k of keys) {
        if (turningOn) next.add(k);
        else next.delete(k);
      }
      return next;
    });

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title="Quick facts"
      onClose={onClose}
      confirmDisabled={busy}
      // Catalogue order is the order the profile shows them in.
      onConfirm={() =>
        onSave(catalog.factBlocks.map((b) => b.key).filter((k) => on.has(k)))
      }
      footer={
        <S.FootRow>
          <F.Hint>
            Empty blocks never show on the profile. Turning a list off clears
            it.
          </F.Hint>
          <S.Count>
            {on.size === 0
              ? "None"
              : `${options.filter((o) => on.has(o.key)).length} on`}
          </S.Count>
        </S.FootRow>
      }
    >
      {options.map((option) => {
        const isOn = on.has(option.key);
        const label =
          option.key === "STRENGTHS" ? "Strengths & flaws" : option.label;
        return (
          <S.BlockToggle
            key={option.key}
            type="button"
            $on={isOn}
            aria-pressed={isOn}
            onClick={() => toggle(option.key)}
          >
            <span className="box">{isOn && <FiCheck size={11} />}</span>
            <span className="text">
              <b>{label}</b>
              {EXAMPLES[option.key] && <span>{EXAMPLES[option.key]}</span>}
            </span>
          </S.BlockToggle>
        );
      })}
    </ResponsiveSheet>
  );
};

// ── One list ───────────────────────────────────────────────────────────────

type ListProps = {
  open: boolean;
  label: string;
  items: string[];
  maxItems: number;
  maxLength: number;
  busy?: boolean;
  onClose: () => void;
  onSave: (items: string[]) => void;
  onRemoveBlock: () => void;
};

export const FactListSheet: FC<ListProps> = ({
  open,
  label,
  items,
  maxItems,
  maxLength,
  busy,
  onClose,
  onSave,
  onRemoveBlock,
}) => {
  const [list, setList] = useState<string[]>(items);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setList(items);
    setDraft("");
  }, [open, items]);

  const clean = draft.trim().replace(/\s+/g, " ");
  const duplicate = list.some((i) => i.toLowerCase() === clean.toLowerCase());
  const canAdd = clean.length > 0 && list.length < maxItems && !duplicate;

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!canAdd) return;
    setList((current) => [...current, clean]);
    setDraft("");
  };

  const move = (index: number, by: -1 | 1) =>
    setList((current) => {
      const next = [...current];
      const target = index + by;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title={label}
      onClose={onClose}
      confirmDisabled={busy}
      // Whatever is still typed counts, so nobody loses a last item.
      onConfirm={() => onSave(canAdd ? [...list, clean] : list)}
      footer={
        <S.FootRow>
          <F.Hint>
            <S.Count>
              {list.length}/{maxItems}
            </S.Count>{" "}
            · {maxLength} characters each
            {duplicate && clean ? " · already on the list" : ""}
          </F.Hint>
          <F.DangerButton type="button" disabled={busy} onClick={onRemoveBlock}>
            Remove this list
          </F.DangerButton>
        </S.FootRow>
      }
    >
      {list.length === 0 && (
        <S.PickedEmpty>
          Nothing here yet. Add the first one below.
        </S.PickedEmpty>
      )}
      {list.map((item, index) => (
        <S.ListItem key={item}>
          <span>{item}</span>
          <S.MiniIconButton
            type="button"
            aria-label={`Move ${item} up`}
            disabled={index === 0}
            onClick={() => move(index, -1)}
          >
            <FiArrowUp size={14} />
          </S.MiniIconButton>
          <S.MiniIconButton
            type="button"
            aria-label={`Move ${item} down`}
            disabled={index === list.length - 1}
            onClick={() => move(index, 1)}
          >
            <FiArrowDown size={14} />
          </S.MiniIconButton>
          <S.MiniIconButton
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() =>
              setList((current) => current.filter((i) => i !== item))
            }
          >
            <FiX size={14} />
          </S.MiniIconButton>
        </S.ListItem>
      ))}

      {list.length < maxItems && (
        <S.AddRow onSubmit={add}>
          <F.TextInput
            value={draft}
            maxLength={maxLength}
            placeholder={list.length === 0 ? "Add the first one…" : "Add one…"}
            aria-label={`Add to ${label}`}
            onChange={(e) => setDraft(e.target.value)}
          />
          <F.SheetActionButton
            type="submit"
            aria-label="Add"
            disabled={!canAdd}
          >
            <FiPlus size={16} />
          </F.SheetActionButton>
        </S.AddRow>
      )}
    </ResponsiveSheet>
  );
};

// ── This or that ───────────────────────────────────────────────────────────

type PairsProps = {
  open: boolean;
  catalog: HeadcanonCatalog;
  picks: ThisOrThatPick[];
  busy?: boolean;
  onClose: () => void;
  onSave: (picks: ThisOrThatPick[]) => void;
};

export const ThisOrThatSheet: FC<PairsProps> = ({
  open,
  catalog,
  picks,
  busy,
  onClose,
  onSave,
}) => {
  const [chosen, setChosen] = useState<Record<string, "A" | "B">>({});

  useEffect(() => {
    if (!open) return;
    setChosen(Object.fromEntries(picks.map((p) => [p.pairKey, p.pick])));
  }, [open, picks]);

  const answered = Object.keys(chosen).length;
  const choose = (key: string, side: "A" | "B") =>
    setChosen((current) => {
      const next = { ...current };
      if (next[key] === side) delete next[key];
      else next[key] = side;
      return next;
    });

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title="This or that"
      onClose={onClose}
      confirmDisabled={busy}
      onConfirm={() =>
        onSave(
          catalog.pairs
            .filter((p) => chosen[p.key])
            .map((p) => ({ pairKey: p.key, pick: chosen[p.key] })),
        )
      }
      footer={
        <S.FootRow>
          <F.Hint>
            Tap a side. Tap it again to skip; skipped pairs stay hidden.
          </F.Hint>
          <S.Count>
            {answered}/{catalog.pairs.length}
          </S.Count>
        </S.FootRow>
      }
    >
      {catalog.pairs.map((pair) => (
        <S.PairRow key={pair.key} aria-label={`${pair.a} or ${pair.b}`}>
          <button
            type="button"
            aria-pressed={chosen[pair.key] === "A"}
            onClick={() => choose(pair.key, "A")}
          >
            {pair.a}
          </button>
          <button
            type="button"
            aria-pressed={chosen[pair.key] === "B"}
            onClick={() => choose(pair.key, "B")}
          >
            {pair.b}
          </button>
        </S.PairRow>
      ))}
    </ResponsiveSheet>
  );
};
