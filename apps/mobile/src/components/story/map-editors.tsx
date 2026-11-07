import { MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  CodexCategory,
  CodexEntry,
  StoryMap,
  StoryMapPin,
} from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "@/components/button";
import { Image } from "@/components/image";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { SearchField } from "@/components/search-field";
import {
  DangerRow,
  FieldLabel,
  Hint,
  useFieldStyle,
} from "@/components/story/form-bits";
import { Text, TextInput } from "@/components/text";
import { useApi } from "@nw/features";
import type { StoryMapEdit } from "@/hooks/use-story-map-edit";
import { asColor } from "@/lib/color";
import {
  MEDIA_REJECTED_MESSAGE,
  pickImage,
  uploadFile,
} from "@/lib/media-upload";
import { codexIcon } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/** Web's limit: a map is a big picture, but not an unbounded one. */
const MAX_MAP_BYTES = 25 * 1024 * 1024;

/** Upload, rename, replace or delete one map — web's `MapSheet`. */
export const MapSheet = ({
  edit,
  map,
  onClose,
  onDeleted,
  onSaved,
  storyId,
  visible,
}: {
  edit: StoryMapEdit;
  /** Null when uploading a new map. */
  map: StoryMap | null;
  onClose: () => void;
  onDeleted: () => void;
  onSaved: (map: StoryMap) => void;
  storyId: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(map?.name ?? "");
    setImage(map?.image ?? null);
    setUploading(false);
    setError(null);
  }, [map, visible]);

  const choose = async () => {
    setError(null);
    const file = await pickImage();
    if (!file) return;
    if (file.fileSize > MAX_MAP_BYTES) {
      setError("That map is over 25MB. Please export it a little smaller.");
      return;
    }
    setUploading(true);
    const uploaded = await uploadFile(api, file, storyId);
    setUploading(false);
    if (uploaded.url) setImage(uploaded.url);
    else if (uploaded.rejected) setError(MEDIA_REJECTED_MESSAGE);
    else setError("Could not upload that map. Please try again.");
  };

  const trimmed = name.trim();

  const save = async () => {
    const saved = await edit.saveMap({
      id: map?.id ?? null,
      image,
      name: trimmed,
      ordinal: map?.ordinal ?? 0,
      pins: map?.pins ?? [],
    });
    if (saved) onSaved(saved);
    else setError("Could not save that map. Please try again.");
  };

  const remove = () => {
    if (!map?.id) return;
    const id = map.id;
    const pins = map.pins.length;
    Alert.alert(
      `Delete ${map.name}?`,
      pins > 0
        ? `Its ${pins} ${pins === 1 ? "pin goes" : "pins go"} with it.`
        : "This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            onDeleted();
            void edit.deleteMap(id).then((ok) => {
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
      canConfirm={Boolean(trimmed) && !uploading && Boolean(map || image)}
      error={error}
      fill
      onClose={onClose}
      onConfirm={() => void save()}
      title={map ? "Edit map" : "Upload a map"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel>Name</FieldLabel>
        <TextInput
          accessibilityLabel="Name"
          maxLength={80}
          onChangeText={setName}
          placeholder="The Known World"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />
        {image ? (
          <Image
            contentFit="contain"
            source={{
              uri: image.startsWith("http")
                ? wsrvImage(image, { fit: "inside", h: 400, w: 800 })
                : image,
            }}
            style={[styles.preview, { backgroundColor: theme.material.fill }]}
          />
        ) : null}
        <Button
          busy={uploading}
          icon="image-outline"
          label={image ? "Replace the image" : "Choose an image"}
          onPress={() => void choose()}
        />
        <Hint>
          Pins are stored as a position on this image, so replacing it keeps
          every pin where it was, as long as the new image has the same shape.
        </Hint>
        {map ? (
          <DangerRow
            label={
              map.pins.length > 0
                ? `Delete map and its ${map.pins.length} pins`
                : "Delete map"
            }
            onPress={remove}
          />
        ) : null}
      </ScrollView>
    </FormSheet>
  );
};

/**
 * What a pin points at: a codex entry, or a label of its own — web's
 * `PinSheet`. Places lead the list, because a pin on a map is nearly always one.
 */
export const PinEditor = ({
  categories,
  edit,
  entries,
  mapId,
  onClose,
  pin,
  point,
  visible,
}: {
  categories: CodexCategory[];
  edit: StoryMapEdit;
  entries: CodexEntry[];
  mapId: string | null;
  onClose: () => void;
  /** Null while naming a new pin at `point`. */
  pin: StoryMapPin | null;
  point: { x: number; y: number } | null;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setEntryId(pin?.codexEntryId ?? null);
    setLabel(pin?.label ?? "");
    setQuery("");
    setError(null);
  }, [pin, visible]);

  const ranked = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const placesId = categories.find(
      (category) => category.name.toLowerCase() === "places",
    )?.id;
    return entries
      .filter((entry) => !needle || entry.name.toLowerCase().includes(needle))
      .sort((a, b) => {
        const order =
          Number(a.categoryId !== placesId) - Number(b.categoryId !== placesId);
        return order || a.name.localeCompare(b.name);
      });
  }, [categories, entries, query]);

  const trimmed = label.trim();
  const where = pin ? { x: pin.x, y: pin.y } : point;
  const canSave = Boolean(where && (entryId || trimmed));

  const save = async () => {
    if (!mapId || !where) return;
    const saved = await edit.savePin(mapId, {
      codexEntryId: entryId,
      id: pin?.id ?? null,
      // An entry supplies the name, and stays the single source of it.
      label: entryId ? null : trimmed,
      x: where.x,
      y: where.y,
    });
    if (saved) onClose();
    else setError("Could not save that pin. Please try again.");
  };

  const remove = () => {
    if (!pin?.id) return;
    const id = pin.id;
    Alert.alert("Remove this pin?", "The codex entry is not affected.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          onClose();
          void edit.deletePin(id).then((ok) => {
            if (!ok) Alert.alert("Not removed", "Please try again.");
          });
        },
        style: "destructive",
        text: "Remove",
      },
    ]);
  };

  const row = (
    key: string,
    name: string,
    detail: string,
    active: boolean,
    onPress: () => void,
    glyph?: CodexEntry,
  ) => (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      key={key}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: active ? theme.accent.tint : theme.material.fill,
          borderColor: active ? theme.accent.solid : theme.material.edge,
        },
      ]}
    >
      {glyph ? (
        <MaterialCommunityIcons
          color={asColor(glyph.color) ?? theme.accent.text}
          name={
            codexIcon(
              glyph.icon,
            ) as keyof typeof MaterialCommunityIcons.glyphMap
          }
          size={18}
        />
      ) : null}
      <Text numberOfLines={1} style={[styles.rowName, { color: theme.text }]}>
        {name}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.rowDetail, { color: theme.textGray }]}
      >
        {detail}
      </Text>
    </Pressable>
  );

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={canSave}
      error={error}
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      onConfirm={() => void save()}
      title={pin ? "Pin" : "New pin"}
      visible={visible}
    >
      <SearchField
        onChangeText={setQuery}
        placeholder="Search places, items, lore…"
        value={query}
      />
      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {row("label", "Just a label", "no codex entry", entryId === null, () =>
          setEntryId(null),
        )}
        {ranked.map((entry) =>
          row(
            entry.id ?? entry.name,
            entry.name,
            categories.find((category) => category.id === entry.categoryId)
              ?.name ?? "",
            entryId === entry.id,
            () => setEntryId(entry.id),
            entry,
          ),
        )}
        {ranked.length === 0 ? (
          <Hint>
            Nothing in the codex matches. Add it to the codex first, or pin it
            with a label of its own.
          </Hint>
        ) : null}
      </ScrollView>
      {entryId === null ? (
        <View style={styles.label}>
          <FieldLabel>Label</FieldLabel>
          <TextInput
            accessibilityLabel="Label"
            maxLength={60}
            onChangeText={setLabel}
            placeholder="The old harbour"
            placeholderTextColor={theme.textGray}
            style={fieldStyle}
            value={label}
          />
        </View>
      ) : null}
      {pin ? <DangerRow label="Remove pin" onPress={remove} /> : null}
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  form: { gap: space.sm, paddingBottom: space.xl },
  label: { gap: space.xs },
  list: { gap: space.xs },
  preview: { borderRadius: radius.md, height: 140, width: "100%" },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  rowDetail: { flexShrink: 1, fontSize: fontSize.caption },
  rowName: { flex: 1, fontSize: fontSize.label, fontWeight: "600" },
});
