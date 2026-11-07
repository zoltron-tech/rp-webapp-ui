import { Ionicons } from "@expo/vector-icons";
import type {
  Headcanon,
  HeadcanonRequest,
  MuseFacts,
  MuseTrait,
  ThisOrThatPick,
} from "@nw/types/headcanon";
import { useRouter } from "expo-router";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SectionEmpty, Shimmer } from "@/components/muse/panel";
import { Text } from "@/components/text";
import {
  useHeadcanonCatalog,
  useHeadcanonEdit,
  useHeadcanonSection,
  type WriteResult,
} from "@/hooks/use-headcanons";
import { catalogLookups, type VerseOption } from "@/lib/headcanons";
import { border, fontSize, radius, space } from "@/theme";
import { FactBlocksSheet, FactListSheet, ThisOrThatSheet } from "./fact-sheets";
import { HeadcanonCard, QuickFacts } from "./headcanon-card";
import { HeadcanonDetailSheet } from "./headcanon-detail-sheet";
import { HeadcanonEditor } from "./headcanon-editor";
import {
  ChipRow,
  type HcColors,
  type HcTone,
  Pill,
  SmallButton,
  TraitChip,
  useHcColors,
} from "./parts";
import { TraitNoteSheet, TraitPickerSheet } from "./trait-sheets";

type Sheet =
  | { kind: "traits" }
  | { kind: "trait-note"; key: string }
  | { kind: "blocks" }
  | { kind: "list"; block: string }
  | { kind: "pairs" }
  | { kind: "editor"; headcanon: Headcanon | null }
  | null;

/**
 * A character's Headcanons — traits, quick facts and headcanon cards.
 *
 * Web's `HeadcanonsPanel`, drawn on the profile's dark panel (`card`) or on
 * the Edit character screen (`page`). The owner gets the editing affordances
 * wherever it is shown; everyone else reads it. What a visitor may see is
 * decided by the server; this only draws what came back, plus a locked line
 * for the friends-only cards they are missing.
 *
 * Reordering is the Edit character screen's: on the profile the panel is the
 * reading view, as on web's phone card.
 */
export const HeadcanonsPanel = ({
  accent,
  active = true,
  motion = false,
  museId,
  museName,
  openHeadcanonId,
  tone,
  verses,
  writer,
}: {
  accent?: string;
  /** The fetch waits until the panel is first shown. */
  active?: boolean;
  /** Whether the empty-state drawing may move (the profile's motion gate). */
  motion?: boolean;
  museId: string;
  museName: string;
  /** Open this card's detail once the section loads (a shared link). */
  openHeadcanonId?: string | null;
  tone: HcTone;
  /** The verse family, main verse first. One entry = no verse picker. */
  verses: VerseOption[];
  writer: { id: string; username: string } | null;
}) => {
  const router = useRouter();
  const colors = useHcColors(tone, accent);
  const catalogQuery = useHeadcanonCatalog();
  const catalog = catalogQuery.data ?? null;
  const lookups = useMemo(() => catalogLookups(catalog), [catalog]);
  const query = useHeadcanonSection(museId, active);
  const section = query.data;
  const edit = useHeadcanonEdit(museId);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [shownNote, setShownNote] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  /*
   * Edit, tapped in the detail tray. iOS presents one modal at a time, so the
   * full-screen editor waits until the tray has finished leaving.
   */
  const pendingEdit = useRef<Headcanon | null>(null);

  // A shared link opens straight onto its card.
  useEffect(() => {
    if (!openHeadcanonId || !section) return;
    if (section.headcanons.some((h) => h.id === openHeadcanonId)) {
      setOpenId(openHeadcanonId);
    }
  }, [openHeadcanonId, section]);

  /** Runs a write; a failure is said in an alert, success closes the tray. */
  const run = async (write: () => Promise<WriteResult>) => {
    setBusy(true);
    const result = await write();
    setBusy(false);
    if (result.error) {
      Alert.alert("Not saved", result.error);
      return false;
    }
    setSheet(null);
    if (result.notice) Alert.alert("Saved", result.notice);
    return true;
  };

  if (section === undefined || !catalog) {
    if (query.isError || catalogQuery.isError) {
      return (
        <Text style={[styles.hint, { color: colors.muted }]}>
          Headcanons couldn't be loaded.
        </Text>
      );
    }
    return (
      <View style={styles.root}>
        <Shimmer height={56} />
        <Shimmer height={84} />
        <Shimmer height={96} />
      </View>
    );
  }

  if (section === null) {
    return (
      <Text style={[styles.hint, { color: colors.muted }]}>
        Headcanons couldn't be loaded.
      </Text>
    );
  }

  const canEdit = section.canEdit;
  const cards = section.headcanons;
  const openCard = cards.find((h) => h.id === openId) ?? null;
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

  const saveTraits = (traits: MuseTrait[]) =>
    run(() => edit.saveTraits(traits));
  const saveFacts = (facts: MuseFacts) => run(() => edit.saveFacts(facts));

  const setBlocks = (enabled: string[]) => {
    const current = new Map(
      section.facts.blocks.map((b) => [b.block, b.items]),
    );
    void saveFacts({
      blocks: enabled.map((block) => ({
        block,
        items: current.get(block) ?? [],
      })),
      thisOrThat: section.facts.thisOrThat,
    });
  };

  const setListItems = (block: string, items: string[]) =>
    void saveFacts({
      ...section.facts,
      blocks: section.facts.blocks.map((b) =>
        b.block === block ? { ...b, items } : b,
      ),
    });

  const removeList = (block: string) => {
    // Strengths and flaws are switched on and off together.
    const gone =
      block === "STRENGTHS" || block === "FLAWS"
        ? ["STRENGTHS", "FLAWS"]
        : [block];
    void saveFacts({
      ...section.facts,
      blocks: section.facts.blocks.filter((b) => !gone.includes(b.block)),
    });
  };

  const setPicks = (picks: ThisOrThatPick[]) =>
    void saveFacts({ ...section.facts, thisOrThat: picks });

  const saveCard = async (request: HeadcanonRequest) => {
    if (sheet?.kind !== "editor") return;
    const editing = sheet.headcanon;
    setBusy(true);
    setEditorError(null);
    const result = await edit.saveCard(editing, request);
    setBusy(false);
    if (result.error) {
      setEditorError(result.error);
      return;
    }
    setSheet(null);
    if (result.notice) Alert.alert("Saved", result.notice);
  };

  const openEditor = (headcanon: Headcanon | null) => {
    setEditorError(null);
    setOpenId(null);
    setSheet({ headcanon, kind: "editor" });
  };

  const fail = (result: WriteResult) => {
    if (result.error) Alert.alert("Not saved", result.error);
  };

  return (
    <View style={styles.root}>
      {/*
       * Someone else's character with nothing to read: the drawing and the
       * one line, as every other empty section of the profile has. A locked
       * line for friends-only cards still follows below when there are some.
       */}
      {nothingForVisitors ? (
        tone === "card" ? (
          <SectionEmpty
            accent={accent}
            label={
              section.hiddenCount > 0
                ? "No public headcanons yet."
                : "No headcanons yet."
            }
            motion={motion}
            scene="unlit-bulb"
          />
        ) : section.hiddenCount === 0 ? (
          <Empty colors={colors}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No headcanons yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {museName}'s writer hasn't shared any.
            </Text>
          </Empty>
        ) : null
      ) : null}

      {/* ── Traits ─────────────────────────────────────────────── */}
      {canEdit || section.traits.length > 0 ? (
        <View style={styles.block}>
          <BlockHead
            colors={colors}
            count={canEdit ? `${section.traits.length}/${max}` : undefined}
            label="Traits"
          >
            {canEdit && section.traits.length > 0 ? (
              <SmallButton
                colors={colors}
                icon="pencil"
                label="Edit"
                onPress={() => setSheet({ kind: "traits" })}
              />
            ) : null}
          </BlockHead>

          {section.traits.length === 0 ? (
            <Empty colors={colors}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Pick up to {max} traits that sum {museName} up.
              </Text>
              <SmallButton
                colors={colors}
                icon="add"
                label="Add traits"
                onPress={() => setSheet({ kind: "traits" })}
                primary
              />
            </Empty>
          ) : (
            <>
              <ChipRow>
                {section.traits.map((t) => (
                  <TraitChip
                    colors={colors}
                    group={lookups.traits.get(t.key)?.group}
                    hasNote={Boolean(t.note)}
                    key={t.key}
                    label={lookups.traitLabel(t.key)}
                    on={!canEdit && shownNote === t.key}
                    onPress={() =>
                      canEdit
                        ? setSheet({ key: t.key, kind: "trait-note" })
                        : setShownNote((k) => (k === t.key ? null : t.key))
                    }
                    traitKey={t.key}
                  />
                ))}
              </ChipRow>
              {!canEdit && shownNoteTrait ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.hint, { color: colors.muted }]}
                >
                  <Text style={[styles.strong, { color: colors.text }]}>
                    {lookups.traitLabel(shownNoteTrait.key)}:
                  </Text>{" "}
                  {shownNoteTrait.note ?? "No note on this one."}
                </Text>
              ) : null}
              {canEdit ? (
                <Text style={[styles.hint, { color: colors.muted }]}>
                  Tap a trait to add a one-line note about how it shows.
                </Text>
              ) : null}
            </>
          )}
        </View>
      ) : null}

      {/* ── Quick facts ────────────────────────────────────────── */}
      {canEdit || hasFacts ? (
        <View style={styles.block}>
          <BlockHead colors={colors} label="Quick facts">
            {canEdit && enabledBlocks.length > 0 ? (
              <SmallButton
                colors={colors}
                icon="add"
                label="Blocks"
                onPress={() => setSheet({ kind: "blocks" })}
              />
            ) : null}
          </BlockHead>

          {canEdit ? (
            enabledBlocks.length === 0 ? (
              <Empty colors={colors}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Likes, dislikes, pet peeves, this or that…
                </Text>
                <SmallButton
                  colors={colors}
                  icon="add"
                  label="Add quick facts"
                  onPress={() => setSheet({ kind: "blocks" })}
                  primary
                />
              </Empty>
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
                  <View key={b.block} style={styles.factGroup}>
                    <View style={styles.head}>
                      <Text style={[styles.factName, { color: colors.muted }]}>
                        {lookups.blockLabel(b.block)}
                      </Text>
                      <SmallButton
                        colors={colors}
                        icon="pencil"
                        label="Edit"
                        onPress={() =>
                          setSheet(
                            isPairs
                              ? { kind: "pairs" }
                              : { block: b.block, kind: "list" },
                          )
                        }
                      />
                    </View>
                    {values.length === 0 ? (
                      <Text style={[styles.hint, { color: colors.muted }]}>
                        Empty — hidden on the profile until you add some.
                      </Text>
                    ) : (
                      <ChipRow style={styles.pills}>
                        {values.map((v) => (
                          <Pill
                            colors={colors}
                            key={v}
                            label={v}
                            soft={isPairs}
                          />
                        ))}
                      </ChipRow>
                    )}
                  </View>
                );
              })
            )
          ) : (
            <QuickFacts
              colors={colors}
              facts={section.facts}
              lookups={lookups}
            />
          )}
        </View>
      ) : null}

      {/* ── Headcanons ─────────────────────────────────────────── */}
      {canEdit || cards.length > 0 || section.hiddenCount > 0 ? (
        <View style={styles.block}>
          <BlockHead
            colors={colors}
            count={cards.length ? String(cards.length) : undefined}
            label="Headcanons"
          >
            {canEdit && cards.length > 0 ? (
              <SmallButton
                colors={colors}
                icon="add"
                label="New"
                onPress={() => openEditor(null)}
              />
            ) : null}
          </BlockHead>

          {presentCategories.length > 1 ? (
            <ChipRow style={styles.pills}>
              <FilterChip
                active={category === null}
                colors={colors}
                label="All"
                onPress={() => setCategory(null)}
              />
              {presentCategories.map((c) => (
                <FilterChip
                  active={category === c}
                  colors={colors}
                  key={c}
                  label={lookups.categoryLabel(c)}
                  onPress={() => setCategory((cur) => (cur === c ? null : c))}
                />
              ))}
            </ChipRow>
          ) : null}

          {canEdit && cards.length === 0 ? (
            <Empty colors={colors}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No headcanons yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                The little truths canon never told you about {museName}.
              </Text>
              <SmallButton
                colors={colors}
                icon="add"
                label="Write one"
                onPress={() => openEditor(null)}
                primary
              />
            </Empty>
          ) : null}

          <View style={styles.cards}>
            {shown.map((card) => {
              const index = cards.indexOf(card);
              const upBlocked =
                index === 0 || cards[index - 1].pinned !== card.pinned;
              const downBlocked =
                index === cards.length - 1 ||
                cards[index + 1].pinned !== card.pinned;
              const reorder = canEdit && !category && tone === "page";
              return (
                <View key={card.id} style={styles.cardRow}>
                  <View style={styles.cardFill}>
                    <HeadcanonCard
                      accent={accent}
                      colors={colors}
                      headcanon={card}
                      lookups={lookups}
                      onOpen={(h) => setOpenId(h.id)}
                      showVisibility={canEdit}
                      tone={tone}
                    />
                  </View>
                  {reorder ? (
                    <View style={styles.tools}>
                      <Arrow
                        colors={colors}
                        disabled={upBlocked}
                        icon="arrow-up"
                        label="Move up"
                        onPress={() => void edit.move(index, -1).then(fail)}
                      />
                      <Arrow
                        colors={colors}
                        disabled={downBlocked}
                        icon="arrow-down"
                        label="Move down"
                        onPress={() => void edit.move(index, 1).then(fail)}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {canEdit && cards.some((c) => c.pinned) ? (
            <Text style={[styles.hint, { color: colors.muted }]}>
              Pinned cards show first. Pin up to {catalog.limits.pinsMax}.
            </Text>
          ) : null}

          {section.hiddenCount > 0 ? (
            <View
              style={[
                styles.locked,
                { backgroundColor: colors.fill, borderColor: colors.edge },
              ]}
            >
              <Ionicons
                color={colors.muted}
                name="lock-closed-outline"
                size={14}
              />
              <Text style={[styles.lockedText, { color: colors.muted }]}>
                {section.hiddenCount} more for{" "}
                {writer ? `@${writer.username}'s` : "the writer's"} friends
              </Text>
              {writer ? (
                <SmallButton
                  colors={colors}
                  label="View profile"
                  onPress={() =>
                    router.push({
                      params: { username: writer.username },
                      pathname: "/novelist/[username]",
                    })
                  }
                />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ── Trays ──────────────────────────────────────────────── */}
      {canEdit ? (
        <>
          <TraitPickerSheet
            busy={busy}
            catalog={catalog}
            onClose={() => setSheet(null)}
            onSave={(traits) => void saveTraits(traits)}
            traits={section.traits}
            visible={sheet?.kind === "traits"}
          />
          <TraitNoteSheet
            busy={busy}
            group={noteTrait ? lookups.traits.get(noteTrait.key)?.group : null}
            label={noteTrait ? lookups.traitLabel(noteTrait.key) : ""}
            max={catalog.limits.traitNoteMax}
            note={noteTrait?.note ?? null}
            onClose={() => setSheet(null)}
            onRemove={() =>
              noteTrait &&
              void saveTraits(
                section.traits.filter((t) => t.key !== noteTrait.key),
              )
            }
            onSave={(note) =>
              noteTrait &&
              void saveTraits(
                section.traits.map((t) =>
                  t.key === noteTrait.key ? { ...t, note } : t,
                ),
              )
            }
            traitKey={noteTrait?.key ?? ""}
            visible={sheet?.kind === "trait-note" && Boolean(noteTrait)}
          />
          <FactBlocksSheet
            busy={busy}
            catalog={catalog}
            enabled={enabledBlocks}
            onClose={() => setSheet(null)}
            onSave={setBlocks}
            visible={sheet?.kind === "blocks"}
          />
          <FactListSheet
            busy={busy}
            items={listBlock?.items ?? []}
            label={listBlock ? lookups.blockLabel(listBlock.block) : ""}
            maxItems={catalog.limits.factItemsMax}
            maxLength={catalog.limits.factItemMax}
            onClose={() => setSheet(null)}
            onRemoveBlock={() => listBlock && removeList(listBlock.block)}
            onSave={(items) =>
              listBlock && setListItems(listBlock.block, items)
            }
            visible={sheet?.kind === "list" && Boolean(listBlock)}
          />
          <ThisOrThatSheet
            busy={busy}
            catalog={catalog}
            onClose={() => setSheet(null)}
            onSave={setPicks}
            picks={section.facts.thisOrThat}
            visible={sheet?.kind === "pairs"}
          />
          <HeadcanonEditor
            busy={busy}
            catalog={catalog}
            error={editorError}
            headcanon={sheet?.kind === "editor" ? sheet.headcanon : null}
            onClose={() => setSheet(null)}
            onSave={(request) => void saveCard(request)}
            verses={verses}
            visible={sheet?.kind === "editor"}
          />
        </>
      ) : null}

      <HeadcanonDetailSheet
        canEdit={canEdit}
        headcanon={openCard}
        lookups={lookups}
        museId={museId}
        museName={museName}
        onClose={() => setOpenId(null)}
        onDelete={(card) =>
          void edit.removeCard(card).then((result) => {
            if (result.error) fail(result);
            else setOpenId(null);
          })
        }
        onDismissed={() => {
          const card = pendingEdit.current;
          pendingEdit.current = null;
          if (card) openEditor(card);
        }}
        onEdit={(card) => {
          pendingEdit.current = card;
          setOpenId(null);
        }}
        onHeart={(card) => void edit.heart(card).then(fail)}
        onTogglePin={(card) => edit.togglePin(card).then(fail)}
        verseLabel={
          verses.length > 1 ? verseLabel(openCard?.verseId ?? null) : null
        }
        visible={Boolean(openCard) && sheet === null}
        writer={writer}
      />
    </View>
  );
};

/* ─── Small parts ────────────────────────────────────────────────────── */

const BlockHead = ({
  children,
  colors,
  count,
  label,
}: {
  children?: ReactNode;
  colors: HcColors;
  count?: string;
  label: string;
}) => (
  <View style={styles.head}>
    <Text style={[styles.label, { color: colors.faint }]}>
      {label}
      {count ? <Text style={styles.labelCount}>{`  ${count}`}</Text> : null}
    </Text>
    {children}
  </View>
);

const Empty = ({
  children,
  colors,
}: {
  children: ReactNode;
  colors: HcColors;
}) => (
  <View style={[styles.empty, { borderColor: colors.edge }]}>{children}</View>
);

const FilterChip = ({
  active,
  colors,
  label,
  onPress,
}: {
  active: boolean;
  colors: HcColors;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={[
      styles.filter,
      active
        ? { backgroundColor: colors.accent, borderColor: colors.accent }
        : { backgroundColor: colors.fill, borderColor: colors.edge },
    ]}
  >
    <Text
      style={[styles.filterLabel, { color: active ? "#ffffff" : colors.text }]}
    >
      {label}
    </Text>
  </Pressable>
);

const Arrow = ({
  colors,
  disabled,
  icon,
  label,
  onPress,
}: {
  colors: HcColors;
  disabled: boolean;
  icon: "arrow-up" | "arrow-down";
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    disabled={disabled}
    hitSlop={space.xxs}
    onPress={onPress}
    style={({ pressed }) => [
      styles.arrow,
      {
        backgroundColor: pressed ? colors.fillStrong : colors.fill,
        borderColor: colors.edge,
        opacity: disabled ? 0.35 : 1,
      },
    ]}
  >
    <Ionicons color={colors.muted} name={icon} size={15} />
  </Pressable>
);

const styles = StyleSheet.create({
  arrow: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  block: { gap: space.sm },
  cardFill: { flex: 1, minWidth: 0 },
  cardRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  cards: { gap: space.sm },
  empty: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1.5,
    gap: space.sm,
    paddingHorizontal: space.m,
    paddingVertical: space.md,
  },
  emptyText: { fontSize: fontSize.label, textAlign: "center" },
  emptyTitle: { fontSize: fontSize.body, fontWeight: "700" },
  factGroup: { gap: space.s },
  factName: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  filter: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    justifyContent: "center",
    minHeight: 28,
    paddingHorizontal: space.ms,
  },
  filterLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  head: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "space-between",
    minHeight: 28,
  },
  hint: { fontSize: fontSize.caption, lineHeight: 17 },
  label: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  labelCount: { fontWeight: "600", letterSpacing: 0 },
  locked: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    padding: space.m,
  },
  lockedText: { flex: 1, fontSize: fontSize.caption, minWidth: 120 },
  pills: { gap: space.s },
  root: { gap: space.ml, width: "100%" },
  strong: { fontWeight: "700" },
  tools: { gap: space.xs },
});
