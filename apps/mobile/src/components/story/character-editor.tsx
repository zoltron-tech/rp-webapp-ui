import { Ionicons } from "@expo/vector-icons";
import type { NWImage, StoryCharacter } from "@nw/types";
import { toCropFilter } from "@nw/utils";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { PillButton } from "@/components/settings";
import {
  Choice,
  DangerRow,
  FieldLabel,
  Hint,
  Swatches,
  useFieldStyle,
} from "@/components/story/form-bits";
import { RichFieldEditor } from "@/components/story/rich-field-editor";
import { Text, TextInput } from "@/components/text";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import type { StoryCodexEdit } from "@/hooks/use-story-codex-edit";
import { plainText } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The story's own character — web's `CharacterSheet`.
 *
 * Not the muse editor: a character here belongs to this story, every co-author
 * writes it, and it needs only enough to be somebody: a name, a face, and
 * whatever fields the authors decide matter in their world.
 *
 * The server reads a null `avatar` as "unchanged", so an untouched portrait is
 * not sent: re-sending one mints a new image row on every save. Taking it off
 * is `clearAvatar`.
 */

const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };
/** A character sheet, not a database. The server's cap. */
const MAX_ATTRIBUTES = 30;
const FACE = 96;

interface DraftAttribute {
  key: string;
  name: string;
  value: string;
}

let seed = 0;
const draftAttribute = (name = "", value = ""): DraftAttribute => {
  seed += 1;
  return { key: `attribute-${seed}`, name, value };
};

export const CharacterEditor = ({
  character,
  edit,
  onClose,
  onDeleted,
  onSaved,
  storyId,
  visible,
}: {
  /** Null when creating. */
  character: StoryCharacter | null;
  edit: StoryCodexEdit;
  onClose: () => void;
  onDeleted: () => void;
  onSaved: (character: StoryCharacter) => void;
  storyId: string | undefined;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState<NWImage | null>(null);
  const dirtyAvatar = useRef(false);
  const [gender, setGender] = useState("");
  const [nicknames, setNicknames] = useState("");
  const [about, setAbout] = useState("");
  const [attributes, setAttributes] = useState<DraftAttribute[]>([]);
  const [accent, setAccent] = useState<string | null>(null);
  const [useAccent, setUseAccent] = useState(false);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setFirstName(character?.firstName ?? "");
    setLastName(character?.lastName ?? "");
    setAvatar(
      character?.avatar ??
        // Saved before the portrait was adjustable: a flat url, framed centred.
        (character?.image
          ? {
              crop: toCropFilter(character.image, 50, 50, 1),
              filterValues: NEUTRAL_FILTERS,
              src: character.image,
            }
          : null),
    );
    dirtyAvatar.current = false;
    setGender(character?.gender ?? "");
    setNicknames((character?.nicknames ?? []).join("\n"));
    setAbout(character?.about ?? "");
    setAttributes(
      Object.entries(character?.extraAttributes ?? {}).map(([name, value]) =>
        draftAttribute(name, value),
      ),
    );
    setAccent(character?.accent ?? null);
    setUseAccent(character?.useAccent ?? false);
    setError(null);
  }, [character, visible]);

  const crop = useImageCropFlow({
    onSave: async (src, state) => {
      setAvatar({
        crop: toCropFilter(src, state.x, state.y, state.scale),
        filterValues: NEUTRAL_FILTERS,
        src,
      });
      dirtyAvatar.current = true;
      return true;
    },
    prefix: storyId,
  });

  const trimmed = firstName.trim();
  const preview = plainText(about);

  const setAttribute = (key: string, patch: Partial<DraftAttribute>) =>
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.key === key ? { ...attribute, ...patch } : attribute,
      ),
    );

  const save = async () => {
    if (!trimmed) return;
    setError(null);
    const saved = await edit.saveCharacter({
      about: about || null,
      accent,
      avatar: dirtyAvatar.current ? avatar : null,
      clearAvatar: dirtyAvatar.current && avatar === null,
      extraAttributes: Object.fromEntries(
        attributes
          .map(({ name, value }) => [name.trim(), value.trim()])
          .filter(([name, value]) => name && value),
      ),
      firstName: trimmed,
      gender: gender.trim() || null,
      id: character?.id ?? null,
      lastName: lastName.trim() || null,
      nicknames: nicknames
        .split("\n")
        .map((nickname) => nickname.trim())
        .filter(Boolean),
      useAccent: useAccent && Boolean(accent),
    });
    if (!saved) {
      setError("Could not save that character. Please try again.");
      return;
    }
    onSaved(saved);
  };

  const remove = () => {
    if (!character?.id) return;
    const id = character.id;
    Alert.alert(
      `Delete ${character.firstName}?`,
      "Their dialogs in passages stay as written.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            onDeleted();
            void edit.deleteCharacter(id).then((ok) => {
              if (!ok) Alert.alert("Not deleted", "Please try again.");
            });
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(trimmed) && !crop.uploading}
      error={error}
      fill
      maxHeightRatio={0.92}
      onClose={onClose}
      onConfirm={() => void save()}
      title={character ? "Edit character" : "New character"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.portrait}>
          <Avatar
            image={avatar}
            name={firstName}
            size={FACE}
            uri={avatar?.src}
          />
          <View style={styles.portraitActions}>
            <Button
              busy={crop.uploading}
              icon="image-outline"
              label={avatar ? "Adjust" : "Add portrait"}
              onPress={() => crop.open(avatar)}
              size="sm"
            />
            {avatar ? (
              <Button
                icon="close"
                label="Remove"
                onPress={() => {
                  setAvatar(null);
                  dirtyAvatar.current = true;
                }}
                size="sm"
                variant="quiet"
              />
            ) : null}
          </View>
        </View>

        <FieldLabel>First name</FieldLabel>
        <TextInput
          accessibilityLabel="First name"
          maxLength={60}
          onChangeText={setFirstName}
          placeholder="Maren"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={firstName}
        />
        <FieldLabel>Last name</FieldLabel>
        <TextInput
          accessibilityLabel="Last name"
          maxLength={60}
          onChangeText={setLastName}
          placeholder="Optional"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={lastName}
        />
        <FieldLabel>Gender</FieldLabel>
        <TextInput
          accessibilityLabel="Gender"
          maxLength={30}
          onChangeText={setGender}
          placeholder="Optional, however this story words it"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={gender}
        />
        <FieldLabel>Also known as</FieldLabel>
        <TextInput
          accessibilityLabel="Also known as"
          multiline
          onChangeText={setNicknames}
          placeholder="One nickname per line"
          placeholderTextColor={theme.textGray}
          style={[fieldStyle, styles.nicknames]}
          textAlignVertical="top"
          value={nicknames}
        />

        <FieldLabel>About</FieldLabel>
        <Pressable
          accessibilityLabel="Edit about"
          accessibilityRole="button"
          onPress={() => setWriting(true)}
          style={({ pressed }) => [
            styles.prose,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text
            numberOfLines={3}
            style={[
              styles.proseText,
              { color: preview ? theme.text : theme.textGray },
            ]}
          >
            {preview || "Who are they in this story?"}
          </Text>
          <Ionicons color={theme.textGray} name="create-outline" size={18} />
        </Pressable>

        <FieldLabel>Attributes</FieldLabel>
        {attributes.map((attribute) => (
          <View key={attribute.key} style={styles.attribute}>
            <TextInput
              accessibilityLabel="Field"
              maxLength={40}
              onChangeText={(name) => setAttribute(attribute.key, { name })}
              placeholder="Field"
              placeholderTextColor={theme.textGray}
              style={[fieldStyle, styles.attributeName]}
              value={attribute.name}
            />
            <TextInput
              accessibilityLabel="Value"
              maxLength={400}
              onChangeText={(value) => setAttribute(attribute.key, { value })}
              placeholder="Value"
              placeholderTextColor={theme.textGray}
              style={[fieldStyle, styles.attributeValue]}
              value={attribute.value}
            />
            <IconButton
              accessibilityLabel="Remove field"
              icon="close"
              onPress={() =>
                setAttributes((current) =>
                  current.filter((item) => item.key !== attribute.key),
                )
              }
              size={32}
            />
          </View>
        ))}
        {attributes.length < MAX_ATTRIBUTES ? (
          <PillButton
            icon="add"
            label="Add a field"
            onPress={() =>
              setAttributes((current) => [...current, draftAttribute()])
            }
          />
        ) : null}

        <FieldLabel>Dialog accent</FieldLabel>
        <Swatches onChange={setAccent} value={accent} />
        {accent ? (
          <View style={styles.accentRow}>
            <Choice
              active={useAccent}
              label={
                useAccent
                  ? "Their dialogs use this accent"
                  : "Use this accent for their dialogs"
              }
              onPress={() => setUseAccent((current) => !current)}
            />
          </View>
        ) : (
          <Hint>Tints this character's dialogs in passages.</Hint>
        )}

        {character ? (
          <DangerRow label="Delete character" onPress={remove} />
        ) : null}
      </ScrollView>

      <RichFieldEditor
        html={about}
        onClose={() => setWriting(false)}
        onDone={(html) => {
          setAbout(html);
          setWriting(false);
        }}
        placeholder="Who are they in this story?"
        title="About"
        visible={writing}
      />

      {crop.uri ? (
        <ImageCropEditor
          aspect={1}
          autoFit={crop.autoFit}
          busy={crop.saving}
          circle
          initial={crop.initial}
          onClose={crop.close}
          onConfirm={(state) => void crop.confirm(state)}
          onReplace={() => void crop.replace()}
          title="Portrait"
          uploading={crop.uploading}
          uri={crop.uri}
          visible={crop.visible}
        />
      ) : null}
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  accentRow: { flexDirection: "row" },
  attribute: { alignItems: "center", flexDirection: "row", gap: space.xs },
  attributeName: { flex: 2, minWidth: 0 },
  attributeValue: { flex: 3, minWidth: 0 },
  form: { gap: space.sm, paddingBottom: space.xl },
  nicknames: { minHeight: 72 },
  portrait: { alignItems: "center", flexDirection: "row", gap: space.md },
  portraitActions: { flex: 1, gap: space.xs },
  prose: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 64,
    padding: space.m,
  },
  proseText: { flex: 1, fontSize: fontSize.label, lineHeight: 19 },
});
