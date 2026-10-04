import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, type TextInput } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import {
  MuseGate,
  NameInput,
  SaveBar,
  useBottomPadding,
  useNameDraft,
  useOwnedMuse,
} from "@/components/edit-muse/shared";
import { AttributeSheet } from "@/components/muse/edit/attribute-sheet";
import { FandomSheet } from "@/components/muse/edit/fandom-sheet";
import {
  MAX_NICKNAMES,
  NicknameSheet,
} from "@/components/muse/edit/nickname-sheet";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { useMuseEdit } from "@/hooks/use-muse-edit";
import { useMuseForm } from "@/hooks/use-muse-form";
import { asColor } from "@/lib/color";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `InformationSection`: the name, the fandom, the nicknames and the
 * extra attributes.
 *
 * The name is a draft with an explicit save, as on web and on the landing
 * page. The rest saves as it is confirmed, through the trays the profile
 * already edits them with — the fandom search, the nickname tray, the
 * key-and-value tray — so a detail changed here and a detail changed on the
 * card are the same write. Web's move-up and move-down arrows on each
 * attribute are here too; the order is part of the character form, so a move
 * saves the whole list.
 */

type Sheet =
  | { kind: "attribute"; target: { key: string; value: string } | null }
  | { kind: "attribute-menu"; key: string; value: string }
  | { kind: "fandom" }
  | { kind: "nicknames" }
  | null;

export default function EditMuseInformation() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Information muse={muse} />}
    </MuseGate>
  );
}

const Information = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const id = muse.id ?? "";
  const edit = useMuseEdit(id);
  const form = useMuseForm(id);
  const name = useNameDraft(muse, form);
  const bottom = useBottomPadding(name.dirty);
  const lastNameInput = useRef<TextInput>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const close = () => setSheet(null);

  const nicknames = muse.nicknames ?? [];
  const attributes = Object.entries(muse.extraAttributes ?? {});
  const hasFandom = Boolean(
    muse.fandom?.id && muse.fandom.id !== "FANDOMLESS",
  );
  const fandomColor = asColor(muse.fandom?.color) ?? theme.material.edge;

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= attributes.length) return;
    const next = [...attributes];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(attributes[index][0]);
    const ok = await form.save({ extraAttributes: Object.fromEntries(next) });
    setBusy(null);
    if (!ok) Alert.alert("Not saved", "The new order could not be saved.");
  };

  const remove = (key: string) => {
    close();
    Alert.alert("Remove attribute?", `Remove "${key}"? This cannot be undone.`, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: async () => {
          setBusy(key);
          const ok = await edit.removeAttribute(key);
          setBusy(null);
          if (!ok) Alert.alert("Not removed", "Try again in a moment.");
        },
        style: "destructive",
        text: "Remove",
      },
    ]);
  };

  const attributeItems =
    sheet?.kind === "attribute-menu"
      ? ([
          {
            icon: "create-outline",
            label: "Edit",
            onPress: () =>
              setSheet({
                kind: "attribute",
                target: { key: sheet.key, value: sheet.value },
              }),
          },
          { separator: true },
          {
            icon: "trash-outline",
            label: "Remove",
            onPress: () => remove(sheet.key),
            variant: "danger",
          },
        ] satisfies ActionItem[])
      : [];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsGroup title="Name">
          <View style={styles.names}>
            <NameInput
              label="First name"
              onChangeText={name.setFirstName}
              onSubmitEditing={() => lastNameInput.current?.focus()}
              placeholder="First name"
              returnKeyType="next"
              value={name.firstName}
            />
            <NameInput
              inputRef={lastNameInput}
              label="Last name"
              onChangeText={name.setLastName}
              onSubmitEditing={() => void name.save()}
              placeholder="Last name (optional)"
              returnKeyType="done"
              value={name.lastName}
            />
            {name.dirty && name.missing ? (
              <Text style={[styles.error, { color: theme.error }]}>
                First name is required.
              </Text>
            ) : null}
          </View>
        </SettingsGroup>

        <SettingsGroup
          footer="Pick the fandom this character comes from, or leave them an original."
          title="Fandom"
        >
          <SettingsRow
            accessory={
              <View style={[styles.fandomDot, { backgroundColor: fandomColor }]} />
            }
            icon="planet-outline"
            label={hasFandom ? muse.fandom.name : "Original character"}
            onPress={() => setSheet({ kind: "fandom" })}
            subtitle="Tap to search fandoms"
          />
        </SettingsGroup>

        <SettingsGroup title={`Nicknames · ${nicknames.length}/${MAX_NICKNAMES}`}>
          {nicknames.length > 0 ? (
            <View style={styles.pills}>
              {nicknames.map((nickname) => (
                <View
                  key={nickname}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: theme.accent.tint,
                      borderColor: theme.accent.surface,
                    },
                  ]}
                >
                  <Text style={[styles.pillLabel, { color: theme.accent.text }]}>
                    {nickname}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <SettingsRow
            icon={nicknames.length > 0 ? "create-outline" : "add"}
            label={nicknames.length > 0 ? "Manage nicknames" : "Add a nickname"}
            onPress={() => setSheet({ kind: "nicknames" })}
            subtitle={
              nicknames.length > 0
                ? "Rename, remove or add another."
                : `Up to ${MAX_NICKNAMES} names people know them by.`
            }
          />
        </SettingsGroup>

        <SettingsGroup
          footer="Custom facts about your character, e.g. House → Gryffindor."
          title={`Extra attributes · ${attributes.length}`}
        >
          {attributes.map(([key, value], index) => (
            <SettingsRow
              accessory={
                <View style={styles.order}>
                  <OrderButton
                    disabled={index === 0 || busy !== null}
                    icon="chevron-up"
                    label={`Move ${key} up`}
                    onPress={() => void move(index, -1)}
                  />
                  <OrderButton
                    disabled={index === attributes.length - 1 || busy !== null}
                    icon="chevron-down"
                    label={`Move ${key} down`}
                    onPress={() => void move(index, 1)}
                  />
                </View>
              }
              busy={busy === key}
              key={key}
              label={key}
              onPress={() => setSheet({ key, kind: "attribute-menu", value })}
              subtitle={value}
            />
          ))}
          <SettingsRow
            icon="add"
            label="Add attribute"
            onPress={() => setSheet({ kind: "attribute", target: null })}
          />
        </SettingsGroup>
      </ScrollView>

      <SaveBar
        busy={name.saving}
        canSave={name.canSave}
        label="Unsaved name changes"
        onReset={name.reset}
        onSave={() => void name.save()}
        visible={name.dirty}
      />

      <FandomSheet
        current={muse.fandom}
        edit={edit}
        onClose={close}
        visible={sheet?.kind === "fandom"}
      />
      <NicknameSheet
        edit={edit}
        nicknames={nicknames}
        onClose={close}
        visible={sheet?.kind === "nicknames"}
      />
      <AttributeSheet
        edit={edit}
        existing={attributes.map(([key]) => key)}
        onClose={close}
        target={sheet?.kind === "attribute" ? sheet.target : null}
        visible={sheet?.kind === "attribute"}
      />
      <ActionMenu
        items={attributeItems}
        onClose={close}
        subtitle={sheet?.kind === "attribute-menu" ? sheet.value : undefined}
        title={sheet?.kind === "attribute-menu" ? sheet.key : "Attribute"}
        visible={sheet?.kind === "attribute-menu"}
      />
    </View>
  );
};

const OrderButton = ({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderButton,
        {
          backgroundColor: pressed
            ? theme.material.fillPressed
            : theme.glass.field,
          borderColor: theme.material.edge,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Ionicons color={theme.text} name={icon} size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.lg, padding: space.m },
  error: { fontSize: fontSize.caption },
  fandomDot: { borderRadius: 7, height: 14, width: 14 },
  names: { gap: space.m, padding: space.md },
  order: { flexDirection: "row", gap: space.s },
  orderButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  pill: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.m,
    paddingVertical: 5,
  },
  pillLabel: { fontSize: fontSize.label, fontStyle: "italic", fontWeight: "600" },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  root: { flex: 1 },
});
