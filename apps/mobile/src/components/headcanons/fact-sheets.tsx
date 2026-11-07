import { Ionicons } from "@expo/vector-icons";
import type { HeadcanonCatalog, ThisOrThatPick } from "@nw/types/headcanon";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { BLOCK_EXAMPLES, PAIRED_BLOCKS } from "@/lib/headcanons";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { DangerLink, FootRow, HcSheet, Hint } from "./parts";

/* ─── Which blocks are on ────────────────────────────────────────────── */

/** Web's `FactBlocksSheet`: a checklist of the lists, with an example each. */
export const FactBlocksSheet = ({
  busy,
  catalog,
  enabled,
  onClose,
  onSave,
  visible,
}: {
  busy?: boolean;
  catalog: HeadcanonCatalog;
  enabled: string[];
  onClose: () => void;
  onSave: (enabled: string[]) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [on, setOn] = useState<Set<string>>(new Set(enabled));

  useEffect(() => {
    if (visible) setOn(new Set(enabled));
  }, [visible, enabled]);

  const options = catalog.factBlocks.filter((b) => b.key !== "FLAWS");
  const toggle = (key: string) =>
    setOn((current) => {
      const next = new Set(current);
      const keys = key === "STRENGTHS" ? PAIRED_BLOCKS : [key];
      const turningOn = !next.has(key);
      for (const k of keys) {
        if (turningOn) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  const count = options.filter((o) => on.has(o.key)).length;

  return (
    <HcSheet
      busy={busy}
      footer={
        <FootRow
          trailing={
            <Text style={[styles.count, { color: theme.textGray }]}>
              {count === 0 ? "None" : `${count} on`}
            </Text>
          }
        >
          <Hint>
            Empty blocks never show on the profile. Turning a list off clears
            it.
          </Hint>
        </FootRow>
      }
      onClose={onClose}
      // Catalogue order is the order the profile shows them in.
      onConfirm={() =>
        onSave(catalog.factBlocks.map((b) => b.key).filter((k) => on.has(k)))
      }
      title="Quick facts"
      visible={visible}
    >
      {options.map((option) => {
        const isOn = on.has(option.key);
        const label =
          option.key === "STRENGTHS" ? "Strengths & flaws" : option.label;
        return (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isOn }}
            key={option.key}
            onPress={() => toggle(option.key)}
            style={({ pressed }) => [
              styles.toggle,
              {
                backgroundColor: isOn
                  ? theme.accent.surface
                  : pressed
                    ? theme.material.fillPressed
                    : theme.material.fillTranslucent,
                borderColor: isOn
                  ? theme.accent.solid
                  : theme.material.edgeTranslucent,
              },
            ]}
          >
            <View
              style={[
                styles.box,
                isOn
                  ? {
                      backgroundColor: theme.accent.fill,
                      borderColor: theme.accent.fill,
                    }
                  : { borderColor: theme.material.edge },
              ]}
            >
              {isOn ? (
                <Ionicons
                  color={theme.accent.onFill}
                  name="checkmark"
                  size={13}
                />
              ) : null}
            </View>
            <View style={styles.toggleText}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>
                {label}
              </Text>
              {BLOCK_EXAMPLES[option.key] ? (
                <Text
                  numberOfLines={1}
                  style={[styles.toggleExample, { color: theme.textGray }]}
                >
                  {BLOCK_EXAMPLES[option.key]}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </HcSheet>
  );
};

/* ─── One list ───────────────────────────────────────────────────────── */

/** Web's `FactListSheet`: up to five short items, reorderable. */
export const FactListSheet = ({
  busy,
  items,
  label,
  maxItems,
  maxLength,
  onClose,
  onRemoveBlock,
  onSave,
  visible,
}: {
  busy?: boolean;
  items: string[];
  label: string;
  maxItems: number;
  maxLength: number;
  onClose: () => void;
  onRemoveBlock: () => void;
  onSave: (items: string[]) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [list, setList] = useState<string[]>(items);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!visible) return;
    setList(items);
    setDraft("");
  }, [visible, items]);

  const clean = draft.trim().replace(/\s+/g, " ");
  const duplicate = list.some((i) => i.toLowerCase() === clean.toLowerCase());
  const canAdd = clean.length > 0 && list.length < maxItems && !duplicate;

  const add = () => {
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

  const tool = (
    name: keyof typeof Ionicons.glyphMap,
    a11y: string,
    onPress: () => void,
    disabled = false,
  ) => (
    <Pressable
      accessibilityLabel={a11y}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={space.xxs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tool,
        {
          backgroundColor: pressed ? theme.material.fillPressed : "transparent",
          opacity: disabled ? 0.3 : 1,
        },
      ]}
    >
      <Ionicons color={theme.textGray} name={name} size={16} />
    </Pressable>
  );

  return (
    <HcSheet
      busy={busy}
      footer={
        <FootRow
          trailing={
            <DangerLink
              disabled={busy}
              label="Remove this list"
              onPress={onRemoveBlock}
            />
          }
        >
          <Hint>
            {list.length}/{maxItems} · {maxLength} characters each
            {duplicate && clean ? " · already on the list" : ""}
          </Hint>
        </FootRow>
      }
      onClose={onClose}
      // Whatever is still typed counts, so nobody loses a last item.
      onConfirm={() => onSave(canAdd ? [...list, clean] : list)}
      title={label}
      visible={visible}
    >
      {list.length === 0 ? (
        <Hint>Nothing here yet. Add the first one below.</Hint>
      ) : null}

      {list.map((item, index) => (
        <View
          key={item}
          style={[
            styles.item,
            {
              backgroundColor: theme.material.fillTranslucent,
              borderColor: theme.material.edgeTranslucent,
            },
          ]}
        >
          <Text
            numberOfLines={2}
            style={[styles.itemLabel, { color: theme.text }]}
          >
            {item}
          </Text>
          {tool(
            "arrow-up",
            `Move ${item} up`,
            () => move(index, -1),
            index === 0,
          )}
          {tool(
            "arrow-down",
            `Move ${item} down`,
            () => move(index, 1),
            index === list.length - 1,
          )}
          {tool("close", `Remove ${item}`, () =>
            setList((current) => current.filter((i) => i !== item)),
          )}
        </View>
      ))}

      {list.length < maxItems ? (
        <View style={styles.addRow}>
          <TextInput
            accessibilityLabel={`Add to ${label}`}
            blurOnSubmit={false}
            maxLength={maxLength}
            onChangeText={setDraft}
            onSubmitEditing={add}
            placeholder={list.length === 0 ? "Add the first one…" : "Add one…"}
            placeholderTextColor={theme.textGray}
            returnKeyType="done"
            style={[
              styles.input,
              { backgroundColor: theme.glass.field, color: theme.text },
            ]}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Add"
            accessibilityRole="button"
            disabled={!canAdd}
            onPress={add}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: pressed
                  ? theme.accent.fillPressed
                  : theme.accent.fill,
                opacity: canAdd ? 1 : 0.5,
              },
            ]}
          >
            <Ionicons color={theme.accent.onFill} name="add" size={18} />
          </Pressable>
        </View>
      ) : null}
    </HcSheet>
  );
};

/* ─── This or that ───────────────────────────────────────────────────── */

/** Web's `ThisOrThatSheet`: tap a side; tap it again to skip the pair. */
export const ThisOrThatSheet = ({
  busy,
  catalog,
  onClose,
  onSave,
  picks,
  visible,
}: {
  busy?: boolean;
  catalog: HeadcanonCatalog;
  onClose: () => void;
  onSave: (picks: ThisOrThatPick[]) => void;
  picks: ThisOrThatPick[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [chosen, setChosen] = useState<Record<string, "A" | "B">>({});

  useEffect(() => {
    if (!visible) return;
    setChosen(Object.fromEntries(picks.map((p) => [p.pairKey, p.pick])));
  }, [visible, picks]);

  const answered = Object.keys(chosen).length;
  const choose = (key: string, side: "A" | "B") =>
    setChosen((current) => {
      const next = { ...current };
      if (next[key] === side) delete next[key];
      else next[key] = side;
      return next;
    });

  const side = (key: string, which: "A" | "B", label: string) => {
    const active = chosen[key] === which;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => choose(key, which)}
        style={({ pressed }) => [
          styles.side,
          {
            backgroundColor: active
              ? theme.accent.fill
              : pressed
                ? theme.material.fillPressed
                : "transparent",
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.sideLabel,
            { color: active ? theme.accent.onFill : theme.text },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <HcSheet
      busy={busy}
      footer={
        <FootRow
          trailing={
            <Text style={[styles.count, { color: theme.textGray }]}>
              {answered}/{catalog.pairs.length}
            </Text>
          }
        >
          <Hint>
            Tap a side. Tap it again to skip; skipped pairs stay hidden.
          </Hint>
        </FootRow>
      }
      onClose={onClose}
      onConfirm={() =>
        onSave(
          catalog.pairs
            .filter((p) => chosen[p.key])
            .map((p) => ({ pairKey: p.key, pick: chosen[p.key] })),
        )
      }
      title="This or that"
      visible={visible}
    >
      {catalog.pairs.map((pair) => (
        <View
          accessibilityLabel={`${pair.a} or ${pair.b}`}
          key={pair.key}
          style={[
            styles.pair,
            {
              backgroundColor: theme.material.fillTranslucent,
              borderColor: theme.material.edgeTranslucent,
            },
          ]}
        >
          {side(pair.key, "A", pair.a)}
          <Text style={[styles.or, { color: theme.textGray }]}>or</Text>
          {side(pair.key, "B", pair.b)}
        </View>
      ))}
    </HcSheet>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  addRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  box: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  count: { fontSize: fontSize.caption, fontWeight: "700" },
  input: {
    borderRadius: radius.field,
    flex: 1,
    fontSize: fontSize.input,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  item: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xxs,
    paddingLeft: space.m,
    paddingRight: space.xs,
    paddingVertical: space.xs,
  },
  itemLabel: { flex: 1, fontSize: fontSize.body },
  or: { fontSize: fontSize.caption, fontStyle: "italic" },
  pair: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    padding: 3,
  },
  side: {
    alignItems: "center",
    borderRadius: radius.full,
    flex: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: space.sm,
  },
  sideLabel: { fontSize: fontSize.label, fontWeight: "600" },
  toggle: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
  toggleExample: { fontSize: fontSize.caption },
  toggleLabel: { fontSize: fontSize.body, fontWeight: "700" },
  toggleText: { flex: 1, gap: 2 },
  tool: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
