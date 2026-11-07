import { TraitGlyph } from "@nw/animations";
import type { HeadcanonCatalog, MuseTrait } from "@nw/types/headcanon";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SearchField } from "@/components/search-field";
import { Text, TextInput } from "@/components/text";
import { withAlpha } from "@/lib/color";
import { traitHue } from "@/lib/headcanons";
import { fontSize, radius, space, useAppTheme } from "@/theme";
import {
  ChipRow,
  DangerLink,
  FootRow,
  GroupLabel,
  HcSheet,
  Hint,
  TraitChip,
  useHcColors,
} from "./parts";

/**
 * Pick up to five traits from the fixed list. Opposites grey out and say why;
 * at the cap everything else dims. The picked ones sit in the footer, solid,
 * each an × away from gone. Notes ride along untouched — they are written one
 * trait at a time in `TraitNoteSheet`. Web's `TraitPickerSheet`.
 */
export const TraitPickerSheet = ({
  busy,
  catalog,
  onClose,
  onSave,
  traits,
  visible,
}: {
  busy?: boolean;
  catalog: HeadcanonCatalog;
  onClose: () => void;
  onSave: (traits: MuseTrait[]) => void;
  traits: MuseTrait[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const colors = useHcColors("page");
  const max = catalog.limits.maxTraits;
  const [picked, setPicked] = useState<MuseTrait[]>(traits);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!visible) return;
    setPicked(traits);
    setQuery("");
  }, [visible, traits]);

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

  let firstClash: string | null = null;
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
    <HcSheet
      busy={busy}
      footer={
        <>
          <View style={styles.pickedHead}>
            <GroupLabel>Picked</GroupLabel>
            <Text style={[styles.count, { color: theme.textGray }]}>
              {picked.length}/{max}
            </Text>
          </View>
          {/* One line that scrolls sideways, so picking never makes the
              footer taller and the tray's body shorter. */}
          <ScrollView
            contentContainerStyle={styles.pickedRow}
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {picked.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textGray }]}>
                Nothing picked yet.
              </Text>
            ) : (
              picked.map((t) => {
                const def = byKey.get(t.key);
                return (
                  <TraitChip
                    colors={colors}
                    group={def?.group}
                    key={t.key}
                    label={def?.label ?? t.key}
                    on
                    onPress={() => toggle(t.key)}
                    removable
                    traitKey={t.key}
                  />
                );
              })
            )}
          </ScrollView>
          <Hint>{hint}</Hint>
        </>
      }
      onClose={onClose}
      onConfirm={() => onSave(picked)}
      title="Traits"
      visible={visible}
    >
      <SearchField
        accessibilityLabel="Search traits"
        onChangeText={setQuery}
        placeholder="Search traits"
        value={query}
      />

      {groups.length === 0 ? (
        <Hint>No trait matches “{query.trim()}”.</Hint>
      ) : null}

      {groups.map(({ group, traits: list }) => (
        <View key={group.key} style={styles.group}>
          <GroupLabel>{group.label}</GroupLabel>
          <ChipRow>
            {list.map((t) => {
              const on = pickedKeys.has(t.key);
              const clash = on ? null : clashOf(t.key);
              return (
                <TraitChip
                  checked={on}
                  clash={Boolean(clash)}
                  colors={colors}
                  disabled={!on && (Boolean(clash) || full)}
                  group={t.group}
                  key={t.key}
                  label={t.label}
                  on={on}
                  onPress={() => toggle(t.key)}
                  traitKey={t.key}
                />
              );
            })}
          </ChipRow>
        </View>
      ))}
    </HcSheet>
  );
};

/** One line on how a trait shows — "Bookworm: only reads tragedies". */
export const TraitNoteSheet = ({
  busy,
  group,
  label,
  max,
  note,
  onClose,
  onRemove,
  onSave,
  traitKey,
  visible,
}: {
  busy?: boolean;
  group?: string | null;
  label: string;
  max: number;
  note: string | null;
  onClose: () => void;
  onRemove: () => void;
  onSave: (note: string | null) => void;
  traitKey: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [draft, setDraft] = useState(note ?? "");
  const hue = traitHue(group, theme.accent.solid);

  useEffect(() => {
    if (visible) setDraft(note ?? "");
  }, [visible, note]);

  return (
    <HcSheet
      busy={busy}
      footer={
        <FootRow
          trailing={
            <DangerLink
              disabled={busy}
              label="Remove trait"
              onPress={onRemove}
            />
          }
        >
          <Hint>Shows when someone taps the trait.</Hint>
        </FootRow>
      }
      onClose={onClose}
      onConfirm={() => onSave(draft.trim() ? draft.trim() : null)}
      title="Trait note"
      visible={visible}
    >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: withAlpha(hue, 0.14),
            borderColor: withAlpha(hue, 0.4),
          },
        ]}
      >
        <View style={styles.heroArt}>
          <TraitGlyph
            group={group ?? undefined}
            size={40}
            traitKey={traitKey}
          />
        </View>
        <Text style={[styles.heroLabel, { color: theme.text }]}>{label}</Text>
      </View>

      <View style={styles.group}>
        <GroupLabel>How does it show? (optional)</GroupLabel>
        <TextInput
          maxLength={max}
          onChangeText={setDraft}
          placeholder="e.g. Only reads tragedies. Annotates in pen."
          placeholderTextColor={theme.textGray}
          returnKeyType="done"
          style={[
            styles.input,
            { backgroundColor: theme.glass.field, color: theme.text },
          ]}
          value={draft}
        />
        <Text
          style={[styles.count, styles.countEnd, { color: theme.textGray }]}
        >
          {draft.length}/{max}
        </Text>
      </View>
    </HcSheet>
  );
};

const styles = StyleSheet.create({
  count: { fontSize: fontSize.caption, fontWeight: "600" },
  countEnd: { alignSelf: "flex-end" },
  empty: {
    fontSize: fontSize.caption,
    fontStyle: "italic",
    paddingVertical: 9,
  },
  group: { gap: space.sm },
  hero: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space.sm,
    paddingVertical: space.md,
  },
  heroArt: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  heroLabel: { fontSize: fontSize.lead, fontWeight: "700" },
  input: {
    borderRadius: radius.field,
    fontSize: fontSize.input,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  pickedHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickedRow: { alignItems: "center", gap: 3, minHeight: 36 },
});
