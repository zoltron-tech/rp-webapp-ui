"use client";

import {
  type FactsRequest,
  HEADCANON_REASON_COPY,
  type Headcanon,
  type HeadcanonRequest,
  type HeadcanonSection,
  type MuseFacts,
  type MuseTrait,
  type ThisOrThatPick,
} from "@nw/types/headcanon";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiLock,
  FiPlus,
} from "react-icons/fi";
import {
  createHeadcanonAction,
  deleteHeadcanonAction,
  getHeadcanonSectionAction,
  reorderHeadcanonsAction,
  setHeadcanonPinnedAction,
  updateHeadcanonAction,
  updateMuseFactsAction,
  updateMuseTraitsAction,
} from "@/app/rp/muse/headcanon-actions";
import { NoHeadcanonsArt } from "@/components/book-art";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { catalogLookups, useHeadcanonCatalog } from "./catalog";
import { FactBlocksSheet, FactListSheet, ThisOrThatSheet } from "./fact-sheets";
import { HeadcanonCard } from "./headcanon-card";
import { HeadcanonDetailSheet } from "./headcanon-detail-sheet";
import {
  HeadcanonEditorSheet,
  type VerseOption,
} from "./headcanon-editor-sheet";
import { QuickFacts } from "./quick-facts";
import * as S from "./styles";
import { TraitChip } from "./trait-chip";
import { TraitNoteSheet, TraitPickerSheet } from "./trait-sheets";

type Props = {
  museId: string;
  museName: string;
  tone: S.ToneName;
  accent?: string | null;
  /** The verse family, main verse first. One entry = no verse picker. */
  verses: VerseOption[];
  ownerNovelistId: string | null;
  ownerUsername: string | null;
  /** Open this card's detail once the section loads (a shared link). */
  openHeadcanonId?: string | null;
  /** Section data handed in (promo/fixtures); skips the fetch. */
  seed?: HeadcanonSection | null;
};

type Sheet =
  | { kind: "traits" }
  | { kind: "trait-note"; key: string }
  | { kind: "blocks" }
  | { kind: "list"; block: string }
  | { kind: "pairs" }
  | { kind: "editor"; headcanon: Headcanon | null }
  | null;

const reasonCopy = (result: unknown, fallback: string) => {
  const reason =
    result && typeof result === "object" && "reason" in result
      ? (result as { reason?: string }).reason
      : undefined;
  return (reason && HEADCANON_REASON_COPY[reason]) || fallback;
};

const isError = (
  value: unknown,
): value is { message: string } | null | undefined =>
  !value || (typeof value === "object" && "message" in value);

/**
 * A muse's Headcanons section — traits, quick facts and headcanon cards.
 *
 * The owner gets the editing affordances wherever it is shown (the Edit muse
 * page, and their own muse profile); everyone else reads it. What a visitor
 * may see is decided by the server; this only draws what came back, plus a
 * locked line for the friends-only cards they are missing.
 */
export const HeadcanonsPanel: FC<Props> = ({
  museId,
  museName,
  tone,
  accent,
  verses,
  ownerNovelistId,
  ownerUsername,
  openHeadcanonId,
  seed,
}) => {
  const catalog = useHeadcanonCatalog();
  const lookups = useMemo(() => catalogLookups(catalog), [catalog]);
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const [section, setSection] = useState<HeadcanonSection | null | undefined>(
    seed ?? undefined,
  );
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [shownNote, setShownNote] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getHeadcanonSectionAction(museId);
    if (result === null) {
      setSection(null);
      return;
    }
    if (isError(result)) {
      setSection(null);
      return;
    }
    setSection(result);
  }, [museId]);

  useEffect(() => {
    if (seed) return;
    setSection(undefined);
    load();
  }, [load, seed]);

  // A shared link opens straight onto its card.
  useEffect(() => {
    if (!openHeadcanonId || !section) return;
    if (section.headcanons.some((h) => h.id === openHeadcanonId)) {
      setOpenId(openHeadcanonId);
    }
  }, [openHeadcanonId, section]);

  const canEdit = Boolean(section?.canEdit);
  const cards = section?.headcanons ?? [];
  const openCard = cards.find((h) => h.id === openId) ?? null;

  const replaceCard = (card: Headcanon) =>
    setSection((s) =>
      s
        ? {
            ...s,
            headcanons: s.headcanons.map((h) => (h.id === card.id ? card : h)),
          }
        : s,
    );

  // ── Traits ───────────────────────────────────────────────────────────────

  // The save helpers below return their promise to the sheet's onConfirm, so
  // the sheet spins and stays put until it settles; a network throw counts
  // as a failure (toast, sheet stays open) and never leaves `busy` stuck.
  const saveTraits = async (traits: MuseTrait[], done?: string) => {
    setBusy(true);
    let result: Awaited<ReturnType<typeof updateMuseTraitsAction>> | null;
    try {
      result = await updateMuseTraitsAction(museId, {
        traits: traits.map((t) => ({ key: t.key, note: t.note })),
      }).catch(() => null);
    } finally {
      setBusy(false);
    }
    if (isError(result) || !Array.isArray(result)) {
      errorToast(
        reasonCopy(result, "Couldn't save the traits. Please try again."),
      );
      return;
    }
    setSection((s) => (s ? { ...s, traits: result } : s));
    setSheet(null);
    if (done) successToast(done);
  };

  // ── Quick facts ──────────────────────────────────────────────────────────

  const saveFacts = async (facts: MuseFacts) => {
    const request: FactsRequest = {
      blocks: facts.blocks.map((b) => ({ block: b.block, items: b.items })),
      thisOrThat: facts.blocks.some((b) => b.block === "THIS_OR_THAT")
        ? facts.thisOrThat
        : [],
    };
    setBusy(true);
    let result: Awaited<ReturnType<typeof updateMuseFactsAction>> | null;
    try {
      result = await updateMuseFactsAction(museId, request).catch(() => null);
    } finally {
      setBusy(false);
    }
    if (isError(result) || !("blocks" in result)) {
      errorToast(
        reasonCopy(result, "Couldn't save the quick facts. Please try again."),
      );
      return;
    }
    setSection((s) => (s ? { ...s, facts: result } : s));
    setSheet(null);
  };

  const setBlocks = (enabled: string[]) => {
    if (!section) return;
    const current = new Map(
      section.facts.blocks.map((b) => [b.block, b.items]),
    );
    return saveFacts({
      blocks: enabled.map((block) => ({
        block,
        items: current.get(block) ?? [],
      })),
      thisOrThat: section.facts.thisOrThat,
    });
  };

  const setListItems = (block: string, items: string[]) => {
    if (!section) return;
    return saveFacts({
      ...section.facts,
      blocks: section.facts.blocks.map((b) =>
        b.block === block ? { ...b, items } : b,
      ),
    });
  };

  const removeList = (block: string) => {
    if (!section) return;
    // Strengths and flaws are switched on and off together.
    const gone =
      block === "STRENGTHS" || block === "FLAWS"
        ? ["STRENGTHS", "FLAWS"]
        : [block];
    return saveFacts({
      ...section.facts,
      blocks: section.facts.blocks.filter((b) => !gone.includes(b.block)),
    });
  };

  const setPicks = (picks: ThisOrThatPick[]) => {
    if (!section) return;
    return saveFacts({ ...section.facts, thisOrThat: picks });
  };

  // ── Cards ────────────────────────────────────────────────────────────────

  const saveCard = async (request: HeadcanonRequest) => {
    if (sheet?.kind !== "editor") return;
    const editing = sheet.headcanon;
    setBusy(true);
    setEditorError(null);
    let result:
      | Awaited<ReturnType<typeof updateHeadcanonAction>>
      | Awaited<ReturnType<typeof createHeadcanonAction>>
      | null;
    try {
      result = await (
        editing
          ? updateHeadcanonAction(editing.id, request)
          : createHeadcanonAction(museId, request)
      ).catch(() => null);
    } finally {
      setBusy(false);
    }
    if (isError(result) || !("id" in result)) {
      errorToast("Couldn't save the headcanon.");
      setEditorError(
        reasonCopy(result, "Couldn't save the headcanon. Please try again."),
      );
      return;
    }
    setSheet(null);
    if (editing) {
      // A card moved to another verse leaves this verse's list.
      if (result.verseId && result.verseId !== museId) {
        setSection((s) =>
          s
            ? {
                ...s,
                headcanons: s.headcanons.filter((h) => h.id !== result.id),
              }
            : s,
        );
        successToast("Saved. It now shows on its verse only.");
      } else {
        replaceCard(result);
      }
      return;
    }
    // New cards land on top of the unpinned ones, as the server orders them.
    setSection((s) => {
      if (!s) return s;
      const pinned = s.headcanons.filter((h) => h.pinned);
      const rest = s.headcanons.filter((h) => !h.pinned);
      return { ...s, headcanons: [...pinned, result, ...rest] };
    });
    successToast(
      result.verseId && result.verseId !== museId
        ? "Saved to its verse."
        : "Headcanon added.",
    );
  };

  const togglePin = async (card: Headcanon) => {
    if (pinningId) return;
    setPinningId(card.id);
    try {
      const result = await setHeadcanonPinnedAction(
        card.id,
        !card.pinned,
      ).catch(() => null);
      if (isError(result) || !("id" in result)) {
        errorToast(
          reasonCopy(result, "Couldn't change the pin. Please try again."),
        );
        return;
      }
      // Show the new pin state at once, then take the server's order for
      // where it lands among the others. A failed refetch keeps what's shown.
      replaceCard(result);
      successToast(result.pinned ? "Headcanon pinned." : "Headcanon unpinned.");
      const fresh = await getHeadcanonSectionAction(museId).catch(() => null);
      if (!isError(fresh)) setSection(fresh);
    } finally {
      setPinningId(null);
    }
  };

  const deleteCard = async (card: Headcanon) => {
    const result = await deleteHeadcanonAction(card.id);
    if (
      !result ||
      !("message" in result) ||
      result.message !== API_MESSAGE.Success
    ) {
      errorToast("Couldn't delete the headcanon. Please try again.");
      return;
    }
    setOpenId(null);
    setSection((s) =>
      s
        ? { ...s, headcanons: s.headcanons.filter((h) => h.id !== card.id) }
        : s,
    );
    successToast("Headcanon deleted.");
  };

  const move = async (index: number, by: -1 | 1) => {
    if (!section) return;
    const list = [...section.headcanons];
    const target = index + by;
    if (target < 0 || target >= list.length) return;
    // Pins stay on top: a card only moves within its own group.
    if (list[index].pinned !== list[target].pinned) return;
    [list[index], list[target]] = [list[target], list[index]];
    const previous = section.headcanons;
    setSection({ ...section, headcanons: list });
    const result = await reorderHeadcanonsAction(
      museId,
      list.map((h) => h.id),
    );
    if (isError(result) || !Array.isArray(result)) {
      setSection((s) => (s ? { ...s, headcanons: previous } : s));
      errorToast("Couldn't reorder. Please try again.");
      return;
    }
    setSection((s) => (s ? { ...s, headcanons: result } : s));
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (section === undefined || !catalog) {
    return (
      <S.Tone $tone={tone} $accent={accent} aria-busy="true">
        <S.Skeleton $height={56} />
        <S.Skeleton $height={84} />
        <S.Skeleton $height={96} />
      </S.Tone>
    );
  }

  if (section === null) {
    return (
      <S.Tone $tone={tone} $accent={accent}>
        <S.Hint>Headcanons couldn't be loaded.</S.Hint>
      </S.Tone>
    );
  }

  const max = catalog.limits.maxTraits;
  const enabledBlocks = section.facts.blocks.map((b) => b.block);
  const hasFacts =
    section.facts.blocks.some(
      (b) => b.block !== "THIS_OR_THAT" && b.items.length > 0,
    ) || section.facts.thisOrThat.length > 0;
  const presentCategories = [...new Set(cards.map((h) => h.category))];
  const shown = category ? cards.filter((h) => h.category === category) : cards;
  const verseLabel = (id: string | null) =>
    id ? (verses.find((v) => v.id === id)?.label ?? null) : null;
  const listBlock =
    sheet?.kind === "list"
      ? section.facts.blocks.find((b) => b.block === sheet.block)
      : undefined;
  const noteTrait =
    sheet?.kind === "trait-note"
      ? section.traits.find((t) => t.key === sheet.key)
      : undefined;
  const shownNoteTrait = section.traits.find((t) => t.key === shownNote);

  const nothingForVisitors =
    !canEdit && section.traits.length === 0 && !hasFacts && cards.length === 0;

  return (
    <S.Tone $tone={tone} $accent={accent}>
      {/* Someone else's character with nothing to read: on the profile card,
          the drawing and one line, as every other empty section there. */}
      {nothingForVisitors &&
        (tone === "card" ? (
          <S.SceneEmpty>
            <NoHeadcanonsArt accent={accent} />
            <span>
              {section.hiddenCount > 0
                ? "No public headcanons yet."
                : "No headcanons yet."}
            </span>
          </S.SceneEmpty>
        ) : (
          section.hiddenCount === 0 && (
            <S.Empty>
              <strong>No headcanons yet</strong>
              <span>{museName}'s writer hasn't shared any.</span>
            </S.Empty>
          )
        ))}

      {/* ── Traits ─────────────────────────────────────────────────── */}
      {(canEdit || section.traits.length > 0) && (
        <S.Block aria-label="Traits">
          <S.BlockHead>
            <S.BlockLabel>
              Traits
              {canEdit && (
                <span>
                  {section.traits.length}/{max}
                </span>
              )}
            </S.BlockLabel>
            {canEdit && section.traits.length > 0 && (
              <S.SmallButton
                type="button"
                onClick={() => setSheet({ kind: "traits" })}
              >
                <FiEdit2 size={12} /> Edit
              </S.SmallButton>
            )}
          </S.BlockHead>

          {section.traits.length === 0 ? (
            <S.Empty>
              <span>
                Pick up to {max} traits that sum {museName} up.
              </span>
              <S.PrimaryButton
                type="button"
                onClick={() => setSheet({ kind: "traits" })}
              >
                <FiPlus size={13} /> Add traits
              </S.PrimaryButton>
            </S.Empty>
          ) : (
            <>
              <S.Row>
                {section.traits.map((t) => (
                  <TraitChip
                    key={t.key}
                    traitKey={t.key}
                    label={lookups.traitLabel(t.key)}
                    group={lookups.traits.get(t.key)?.group}
                    hasNote={Boolean(t.note)}
                    on={!canEdit && shownNote === t.key}
                    pressed={!canEdit ? shownNote === t.key : undefined}
                    title={canEdit ? "Add a note" : (t.note ?? undefined)}
                    onClick={() =>
                      canEdit
                        ? setSheet({ key: t.key, kind: "trait-note" })
                        : setShownNote((k) => (k === t.key ? null : t.key))
                    }
                  />
                ))}
              </S.Row>
              {!canEdit && shownNoteTrait && (
                <S.Hint aria-live="polite">
                  <strong>{lookups.traitLabel(shownNoteTrait.key)}:</strong>{" "}
                  {shownNoteTrait.note ?? "No note on this one."}
                </S.Hint>
              )}
              {canEdit && (
                <S.Hint>
                  Tap a trait to add a one-line note about how it shows.
                </S.Hint>
              )}
            </>
          )}
        </S.Block>
      )}

      {/* ── Quick facts ────────────────────────────────────────────── */}
      {(canEdit || hasFacts) && (
        <S.Block aria-label="Quick facts">
          <S.BlockHead>
            <S.BlockLabel>Quick facts</S.BlockLabel>
            {canEdit && enabledBlocks.length > 0 && (
              <S.SmallButton
                type="button"
                onClick={() => setSheet({ kind: "blocks" })}
              >
                <FiPlus size={12} /> Blocks
              </S.SmallButton>
            )}
          </S.BlockHead>

          {canEdit ? (
            enabledBlocks.length === 0 ? (
              <S.Empty>
                <span>Likes, dislikes, pet peeves, this or that…</span>
                <S.PrimaryButton
                  type="button"
                  onClick={() => setSheet({ kind: "blocks" })}
                >
                  <FiPlus size={13} /> Add quick facts
                </S.PrimaryButton>
              </S.Empty>
            ) : (
              section.facts.blocks.map((b) => {
                const isPairs = b.block === "THIS_OR_THAT";
                const values = isPairs
                  ? section.facts.thisOrThat
                      .map((p) => {
                        const pair = lookups.pair(p.pairKey);
                        return pair ? (p.pick === "A" ? pair.a : pair.b) : null;
                      })
                      .filter((v): v is string => Boolean(v))
                  : b.items;
                return (
                  <S.FactGroup key={b.block}>
                    <S.BlockHead>
                      <S.FactName>{lookups.blockLabel(b.block)}</S.FactName>
                      <S.SmallButton
                        type="button"
                        aria-label={`Edit ${lookups.blockLabel(b.block)}`}
                        onClick={() =>
                          setSheet(
                            isPairs
                              ? { kind: "pairs" }
                              : { block: b.block, kind: "list" },
                          )
                        }
                      >
                        <FiEdit2 size={12} /> Edit
                      </S.SmallButton>
                    </S.BlockHead>
                    {values.length === 0 ? (
                      <S.Hint>
                        Empty — hidden on the profile until you add some.
                      </S.Hint>
                    ) : (
                      <S.Row>
                        {values.map((v) =>
                          isPairs ? (
                            <S.Chip as="span" key={v} $soft>
                              {v}
                            </S.Chip>
                          ) : (
                            <S.FactItem key={v}>{v}</S.FactItem>
                          ),
                        )}
                      </S.Row>
                    )}
                  </S.FactGroup>
                );
              })
            )
          ) : (
            <QuickFacts facts={section.facts} lookups={lookups} />
          )}
        </S.Block>
      )}

      {/* ── Headcanons ─────────────────────────────────────────────── */}
      {(canEdit || cards.length > 0 || section.hiddenCount > 0) && (
        <S.Block aria-label="Headcanons">
          <S.BlockHead>
            <S.BlockLabel>
              Headcanons<span>{cards.length || ""}</span>
            </S.BlockLabel>
            {canEdit && cards.length > 0 && (
              <S.SmallButton
                type="button"
                onClick={() => {
                  setEditorError(null);
                  setSheet({ headcanon: null, kind: "editor" });
                }}
              >
                <FiPlus size={12} /> New
              </S.SmallButton>
            )}
          </S.BlockHead>

          {presentCategories.length > 1 && (
            <S.Filters aria-label="Filter by category">
              <S.Chip
                type="button"
                $on={category === null}
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                All
              </S.Chip>
              {presentCategories.map((c) => (
                <S.Chip
                  key={c}
                  type="button"
                  $on={category === c}
                  aria-pressed={category === c}
                  onClick={() => setCategory((cur) => (cur === c ? null : c))}
                >
                  {lookups.categoryLabel(c)}
                </S.Chip>
              ))}
            </S.Filters>
          )}

          {canEdit && cards.length === 0 && (
            <S.Empty>
              <strong>No headcanons yet</strong>
              <span>
                The little truths canon never told you about {museName}.
              </span>
              <S.PrimaryButton
                type="button"
                onClick={() => {
                  setEditorError(null);
                  setSheet({ headcanon: null, kind: "editor" });
                }}
              >
                <FiPlus size={13} /> Write one
              </S.PrimaryButton>
            </S.Empty>
          )}

          <S.CardList>
            {shown.map((card) => {
              const index = cards.indexOf(card);
              const upBlocked =
                index === 0 || cards[index - 1].pinned !== card.pinned;
              const downBlocked =
                index === cards.length - 1 ||
                cards[index + 1].pinned !== card.pinned;
              return (
                <S.CardRow key={card.id}>
                  <HeadcanonCard
                    headcanon={card}
                    lookups={lookups}
                    showVisibility={canEdit}
                    onOpen={(h) => setOpenId(h.id)}
                  />
                  {/* Reordering lives on the Edit muse page: the character
                      card is too narrow on a phone for the arrows. */}
                  {canEdit && !category && tone === "page" && (
                    <S.CardTools>
                      <S.IconButton
                        type="button"
                        aria-label="Move up"
                        disabled={upBlocked}
                        onClick={() => move(index, -1)}
                      >
                        <FiArrowUp size={14} />
                      </S.IconButton>
                      <S.IconButton
                        type="button"
                        aria-label="Move down"
                        disabled={downBlocked}
                        onClick={() => move(index, 1)}
                      >
                        <FiArrowDown size={14} />
                      </S.IconButton>
                    </S.CardTools>
                  )}
                </S.CardRow>
              );
            })}
          </S.CardList>

          {canEdit && cards.some((c) => c.pinned) && (
            <S.Hint>
              Pinned cards show first. Pin up to {catalog.limits.pinsMax}.
            </S.Hint>
          )}

          {section.hiddenCount > 0 && (
            <S.Locked>
              <FiLock size={14} aria-hidden="true" />
              <span>
                {section.hiddenCount} more for{" "}
                {ownerUsername ? `@${ownerUsername}'s` : "the writer's"} friends
              </span>
              {ownerUsername && (
                <S.SmallButton
                  type="button"
                  onClick={() =>
                    routeToPage(ROUTES.Profile.View(ownerUsername).Index)
                  }
                >
                  View profile
                </S.SmallButton>
              )}
            </S.Locked>
          )}
        </S.Block>
      )}

      {/* ── Sheets ─────────────────────────────────────────────────── */}
      <TraitPickerSheet
        open={sheet?.kind === "traits"}
        catalog={catalog}
        traits={section.traits}
        busy={busy}
        onClose={() => setSheet(null)}
        onSave={(traits) => saveTraits(traits)}
      />

      <TraitNoteSheet
        open={sheet?.kind === "trait-note" && Boolean(noteTrait)}
        traitKey={noteTrait?.key ?? ""}
        group={noteTrait ? lookups.traits.get(noteTrait.key)?.group : null}
        label={noteTrait ? lookups.traitLabel(noteTrait.key) : ""}
        note={noteTrait?.note ?? null}
        max={catalog.limits.traitNoteMax}
        busy={busy}
        onClose={() => setSheet(null)}
        onSave={(note) =>
          noteTrait &&
          saveTraits(
            section.traits.map((t) =>
              t.key === noteTrait.key ? { ...t, note } : t,
            ),
          )
        }
        onRemove={() =>
          noteTrait &&
          saveTraits(
            section.traits.filter((t) => t.key !== noteTrait.key),
            "Trait removed.",
          )
        }
      />

      <FactBlocksSheet
        open={sheet?.kind === "blocks"}
        catalog={catalog}
        enabled={enabledBlocks}
        busy={busy}
        onClose={() => setSheet(null)}
        onSave={setBlocks}
      />

      <FactListSheet
        open={sheet?.kind === "list" && Boolean(listBlock)}
        label={listBlock ? lookups.blockLabel(listBlock.block) : ""}
        items={listBlock?.items ?? []}
        maxItems={catalog.limits.factItemsMax}
        maxLength={catalog.limits.factItemMax}
        busy={busy}
        onClose={() => setSheet(null)}
        onSave={(items) => listBlock && setListItems(listBlock.block, items)}
        onRemoveBlock={() => listBlock && removeList(listBlock.block)}
      />

      <ThisOrThatSheet
        open={sheet?.kind === "pairs"}
        catalog={catalog}
        picks={section.facts.thisOrThat}
        busy={busy}
        onClose={() => setSheet(null)}
        onSave={setPicks}
      />

      <HeadcanonEditorSheet
        open={sheet?.kind === "editor"}
        catalog={catalog}
        headcanon={sheet?.kind === "editor" ? sheet.headcanon : null}
        verses={verses}
        busy={busy}
        error={editorError}
        onClose={() => setSheet(null)}
        onSave={saveCard}
      />

      <HeadcanonDetailSheet
        open={Boolean(openCard) && sheet === null}
        headcanon={openCard}
        lookups={lookups}
        museId={museId}
        museName={museName}
        ownerNovelistId={ownerNovelistId}
        ownerUsername={ownerUsername}
        canEdit={canEdit}
        verseLabel={
          verses.length > 1 ? verseLabel(openCard?.verseId ?? null) : null
        }
        onClose={() => setOpenId(null)}
        onChange={replaceCard}
        onEdit={(h) => {
          setEditorError(null);
          setSheet({ headcanon: h, kind: "editor" });
        }}
        onTogglePin={togglePin}
        pinning={Boolean(openCard) && pinningId === openCard?.id}
        onDelete={deleteCard}
      />
    </S.Tone>
  );
};
