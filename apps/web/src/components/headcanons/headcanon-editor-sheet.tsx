"use client";

import {
  HEADCANON_PROMPTS,
  HEADCANON_VISIBILITY_COPY,
  type Headcanon,
  type HeadcanonCatalog,
  type HeadcanonCategory,
  type HeadcanonRequest,
  type HeadcanonVisibility,
} from "@nw/types/headcanon";
import { type FC, useEffect, useState } from "react";
import { FiEyeOff, FiGlobe, FiLock, FiUsers } from "react-icons/fi";
import { LuDices } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import { RichTextEditor } from "@/components/rich-text-editor-input";
import { toPlainText } from "@/utils/rich-text";
import * as S from "./styles";

export type VerseOption = { id: string; label: string };

/** A muse's `verses` (main verse first) as picker options. */
export const toVerseOptions = (
  verses: { id: string; verseNumber?: number | null }[] | null | undefined,
): VerseOption[] =>
  (verses ?? []).map((v) => ({
    id: v.id,
    label: (v.verseNumber ?? 1) <= 1 ? "Main verse" : `Verse ${v.verseNumber}`,
  }));

type Props = {
  open: boolean;
  catalog: HeadcanonCatalog;
  /** Null when writing a new one. */
  headcanon: Headcanon | null;
  /** The family's verses; the picker only shows when there is more than one. */
  verses: VerseOption[];
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (request: HeadcanonRequest) => unknown;
};

const VISIBILITY_ICON: Record<HeadcanonVisibility, FC<{ size?: number }>> = {
  FRIENDS: FiUsers,
  ONLY_ME: FiLock,
  PUBLIC: FiGlobe,
};

const randomPrompt = (not?: string) => {
  const pool = HEADCANON_PROMPTS.filter((p) => p !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Write or edit one headcanon: an optional starter question, title, body,
 * category, verse, canon/AU, spoiler, and who can see it. A dialog on
 * desktop, a tall tray on phones; the body scrolls inside the 375×667
 * budget.
 */
export const HeadcanonEditorSheet: FC<Props> = ({
  open,
  catalog,
  headcanon,
  verses,
  busy,
  error,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<HeadcanonCategory>("HABITS");
  const [verseId, setVerseId] = useState<string | null>(null);
  const [au, setAu] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [visibility, setVisibility] = useState<HeadcanonVisibility>("PUBLIC");
  const [prompt, setPrompt] = useState<string | null>(null);
  // The editor is uncontrolled; remount it for each card it opens on.
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTitle(headcanon?.title ?? "");
    setBody(headcanon?.body ?? "");
    setCategory(headcanon?.category ?? "HABITS");
    setVerseId(headcanon?.verseId ?? null);
    setAu(headcanon?.alternateUniverse ?? false);
    setSpoiler(headcanon?.spoiler ?? false);
    setVisibility(headcanon?.visibility ?? "PUBLIC");
    setPrompt(headcanon ? null : randomPrompt());
    setEditorKey((k) => k + 1);
  }, [open, headcanon]);

  const text = toPlainText(body);
  const tooLong = text.length > catalog.limits.bodyTextMax;
  const blank = text.length === 0;

  return (
    <ResponsiveSheet
      open={open}
      wide
      fixed
      title={headcanon ? "Edit headcanon" : "New headcanon"}
      onClose={onClose}
      confirmDisabled={busy || blank || tooLong}
      footer={
        <S.FootRow>
          {error ? (
            <S.ErrorText role="alert">{error}</S.ErrorText>
          ) : (
            <F.Hint>
              {HEADCANON_VISIBILITY_COPY[visibility].label}
              {spoiler ? " · spoiler" : ""}
              {au ? " · AU" : ""}
            </F.Hint>
          )}
          <S.Count
            style={tooLong ? { color: "var(--tomato-9, #e5484d)" } : undefined}
          >
            {text.length}/{catalog.limits.bodyTextMax}
          </S.Count>
        </S.FootRow>
      }
      onConfirm={() =>
        onSave({
          alternateUniverse: au,
          body,
          category,
          spoiler,
          title: title.trim() || null,
          verseId,
          visibility,
        })
      }
    >
      {prompt && (
        <S.PromptStrip>
          <LuDices size={15} aria-hidden="true" />
          <span>{prompt}</span>
          <S.LinkButton
            type="button"
            onClick={() => setPrompt(randomPrompt(prompt))}
          >
            Shuffle
          </S.LinkButton>
          <S.LinkButton
            type="button"
            aria-label="Hide the prompt"
            onClick={() => setPrompt(null)}
          >
            ✕
          </S.LinkButton>
        </S.PromptStrip>
      )}

      <F.Field>
        Title (optional)
        <F.TextInput
          value={title}
          maxLength={catalog.limits.titleMax}
          placeholder="e.g. Insomnia rituals"
          onChange={(e) => setTitle(e.target.value)}
        />
      </F.Field>

      <F.Field as="div">
        Headcanon
        <S.EditorArea>
          <RichTextEditor
            key={editorKey}
            placeholder={
              prompt ? "Answer it, or write anything…" : "Write the headcanon…"
            }
            value={body}
            compact
            desktopRounded
            onChange={setBody}
          />
        </S.EditorArea>
        {tooLong && (
          <S.ErrorText>
            {text.length}/{catalog.limits.bodyTextMax} characters. Trim it a
            little.
          </S.ErrorText>
        )}
      </F.Field>

      <F.Field as="div">
        Category
        <F.ChoiceRow>
          {catalog.categories.map((c) => (
            <F.Choice
              key={c.key}
              type="button"
              $active={category === c.key}
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key as HeadcanonCategory)}
            >
              {c.label}
            </F.Choice>
          ))}
        </F.ChoiceRow>
      </F.Field>

      {verses.length > 1 && (
        <F.Field as="div">
          Verse
          <F.ChoiceRow>
            <F.Choice
              type="button"
              $active={verseId === null}
              aria-pressed={verseId === null}
              onClick={() => setVerseId(null)}
            >
              All verses
            </F.Choice>
            {verses.map((v) => (
              <F.Choice
                key={v.id}
                type="button"
                $active={verseId === v.id}
                aria-pressed={verseId === v.id}
                onClick={() => setVerseId(v.id)}
              >
                {v.label}
              </F.Choice>
            ))}
          </F.ChoiceRow>
        </F.Field>
      )}

      <F.Field as="div">
        Canon
        <F.ChoiceRow>
          <F.Choice
            type="button"
            $active={!au}
            aria-pressed={!au}
            onClick={() => setAu(false)}
          >
            Canon-compliant
          </F.Choice>
          <F.Choice
            type="button"
            $active={au}
            aria-pressed={au}
            onClick={() => setAu(true)}
          >
            AU / divergent
          </F.Choice>
        </F.ChoiceRow>
      </F.Field>

      <F.ToggleRow
        type="button"
        $active={spoiler}
        aria-pressed={spoiler}
        onClick={() => setSpoiler((s) => !s)}
      >
        <FiEyeOff size={15} />
        {spoiler ? "Spoiler — blurred until opened" : "Mark as a spoiler"}
      </F.ToggleRow>

      <F.Field as="div">
        Who can see this
        <F.ChoiceRow>
          {(["PUBLIC", "FRIENDS", "ONLY_ME"] as HeadcanonVisibility[]).map(
            (v) => {
              const Icon = VISIBILITY_ICON[v];
              return (
                <F.Choice
                  key={v}
                  type="button"
                  $active={visibility === v}
                  aria-pressed={visibility === v}
                  onClick={() => setVisibility(v)}
                >
                  <Icon size={13} />
                  {HEADCANON_VISIBILITY_COPY[v].label}
                </F.Choice>
              );
            },
          )}
        </F.ChoiceRow>
        <F.Hint>{HEADCANON_VISIBILITY_COPY[visibility].hint}</F.Hint>
      </F.Field>
    </ResponsiveSheet>
  );
};
