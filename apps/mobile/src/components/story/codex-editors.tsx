import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type {
  CodexCategory,
  CodexEntry,
  CodexGroup,
  StoryBoardEvent,
} from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IconButton } from "@/components/icon-button";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import type { StoryFace } from "@/components/story/character-sheet";
import {
  Choice,
  DangerRow,
  FieldLabel,
  Hint,
  IconChoices,
  Swatches,
  useFieldStyle,
} from "@/components/story/form-bits";
import { RichFieldEditor } from "@/components/story/rich-field-editor";
import { Text, TextInput } from "@/components/text";
import type { StoryCodexEdit } from "@/hooks/use-story-codex-edit";
import { codexIcon, plainText } from "@/lib/story";
import { CODEX_COLORS } from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Writing the codex: an entry, a category, the order of the categories, and a
 * group — web's `EntrySheet`, `CategorySheet`, `CategoryManager` and
 * `GroupSheet`, each a tray. The screen only opens these for a story member.
 *
 * Categories reorder with an up and a down, as chapters do: a drag inside a
 * tray that itself drags away is three gestures on one axis.
 */

const DEFAULT_ICON = "sparkles";
/** The server's floor: a group of one is just that character. */
const MIN_GROUP_MEMBERS = 2;

const failed = (what: string) =>
  `Could not save that ${what}. Please try again.`;

const confirmDelete = (title: string, message: string, run: () => void) =>
  Alert.alert(title, message, [
    { style: "cancel", text: "Cancel" },
    { onPress: run, style: "destructive", text: "Delete" },
  ]);

export const EntryEditor = ({
  categories,
  chapters,
  defaultCategoryId,
  edit,
  entry,
  onClose,
  onSaved,
  visible,
}: {
  categories: CodexCategory[];
  /** Every chapter of the story, for "Appears in". */
  chapters: StoryBoardEvent[];
  defaultCategoryId: string | null;
  edit: StoryCodexEdit;
  /** Null when creating. */
  entry: CodexEntry | null;
  onClose: () => void;
  onSaved: (entry: CodexEntry) => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState<string | null>(null);
  const [chapterIds, setChapterIds] = useState<string[]>([]);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(entry?.name ?? "");
    setCategoryId(
      entry?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? null,
    );
    setDescription(entry?.description ?? "");
    setIcon(entry?.icon ?? DEFAULT_ICON);
    setColor(entry?.color ?? CODEX_COLORS[0]);
    setChapterIds(entry?.chapterIds ?? []);
    setError(null);
  }, [categories, defaultCategoryId, entry, visible]);

  const trimmed = name.trim();
  const preview = plainText(description);

  const toggleChapter = (id: string) =>
    setChapterIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [...current, id],
    );

  const save = async () => {
    if (!categoryId || !trimmed) return;
    setError(null);
    const saved = await edit.saveEntry({
      categoryId,
      chapterIds,
      color,
      description: description || null,
      icon,
      id: entry?.id ?? null,
      name: trimmed,
    });
    if (!saved) {
      setError(failed("entry"));
      return;
    }
    onSaved(saved);
  };

  const remove = () => {
    if (!entry?.id) return;
    const id = entry.id;
    confirmDelete(
      `Delete ${entry.name}?`,
      "The entry is removed for everyone in this story.",
      () => {
        onClose();
        void edit.deleteEntry(id).then((ok) => {
          if (!ok) Alert.alert("Not deleted", "Please try again.");
        });
      },
    );
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(trimmed && categoryId)}
      error={error}
      fill
      maxHeightRatio={0.9}
      onClose={onClose}
      onConfirm={() => void save()}
      title={entry ? "Edit entry" : "New entry"}
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
          placeholder="The Drowned Coast"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />

        <FieldLabel>Category</FieldLabel>
        <View style={styles.choices}>
          {categories.map((category) => (
            <Choice
              active={categoryId === category.id}
              key={category.id}
              label={category.name}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>

        <FieldLabel>Icon</FieldLabel>
        <IconChoices onChange={setIcon} value={icon} />

        <FieldLabel>Colour</FieldLabel>
        <Swatches onChange={setColor} value={color} />

        <FieldLabel>Description</FieldLabel>
        <Pressable
          accessibilityLabel="Edit description"
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
            {preview || "What is it, and why does it matter?"}
          </Text>
          <Ionicons color={theme.textGray} name="create-outline" size={18} />
        </Pressable>

        <FieldLabel>Appears in</FieldLabel>
        {chapters.length === 0 ? (
          <Hint>This story has no chapters yet.</Hint>
        ) : (
          <View style={styles.choices}>
            {chapters.map((chapter) => (
              <Choice
                active={chapterIds.includes(chapter.id ?? "")}
                key={chapter.id}
                label={chapter.name}
                onPress={() => chapter.id && toggleChapter(chapter.id)}
              />
            ))}
          </View>
        )}

        {entry ? <DangerRow label="Delete entry" onPress={remove} /> : null}
      </ScrollView>

      <RichFieldEditor
        html={description}
        onClose={() => setWriting(false)}
        onDone={(html) => {
          setDescription(html);
          setWriting(false);
        }}
        placeholder="What is it, and why does it matter?"
        title="Description"
        visible={writing}
      />
    </FormSheet>
  );
};

/** Create, rename or re-icon one category; delete it once it is empty. */
export const CategorySheet = ({
  category,
  edit,
  entryCount,
  onClose,
  visible,
}: {
  /** Null when creating. */
  category: CodexCategory | null;
  edit: StoryCodexEdit;
  entryCount: number;
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(category?.name ?? "");
    setIcon(category?.icon ?? DEFAULT_ICON);
    setError(null);
  }, [category, visible]);

  const trimmed = name.trim();

  const save = async () => {
    const saved = await edit.saveCategory({
      icon,
      id: category?.id ?? null,
      isSystem: category?.isSystem ?? false,
      name: trimmed,
      ordinal: category?.ordinal ?? 0,
    });
    if (saved) onClose();
    else setError(failed("category"));
  };

  const remove = () => {
    if (!category?.id) return;
    const id = category.id;
    confirmDelete(`Delete ${category.name}?`, "It holds no entries.", () => {
      onClose();
      void edit.deleteCategory(id).then((ok) => {
        if (!ok) Alert.alert("Not deleted", "Please try again.");
      });
    });
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={Boolean(trimmed)}
      error={error}
      fill
      onClose={onClose}
      onConfirm={() => void save()}
      title={category ? "Edit category" : "New category"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel>Name</FieldLabel>
        <TextInput
          accessibilityLabel="Name"
          maxLength={40}
          onChangeText={setName}
          placeholder="Factions"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />
        <FieldLabel>Icon</FieldLabel>
        <IconChoices onChange={setIcon} value={icon} />
        {category && entryCount > 0 ? (
          <Hint>
            {`This category still holds ${entryCount} ${
              entryCount === 1 ? "entry" : "entries"
            }. Move them elsewhere first.`}
          </Hint>
        ) : null}
        {category && entryCount === 0 ? (
          <DangerRow label="Delete category" onPress={remove} />
        ) : null}
      </ScrollView>
    </FormSheet>
  );
};

/** The tabs in order. Moving only restages; the tick tells the server once. */
export const CategoriesSheet = ({
  categories,
  edit,
  entryCounts,
  onClose,
  onEdit,
  onNew,
  visible,
}: {
  categories: CodexCategory[];
  edit: StoryCodexEdit;
  entryCounts: Map<string, number>;
  onClose: () => void;
  onEdit: (category: CodexCategory) => void;
  onNew: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [order, setOrder] = useState(categories);

  // Each opening starts from the saved order.
  useEffect(() => {
    if (visible) setOrder(categories);
  }, [categories, visible]);

  const dirty = order.some(
    (category, index) => category.id !== categories[index]?.id,
  );

  const move = (index: number, by: -1 | 1) => {
    const to = index + by;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[index], next[to]] = [next[to], next[index]];
    setOrder(next);
  };

  const save = async () => {
    if (!dirty) {
      onClose();
      return;
    }
    const ok = await edit.reorderCategories(
      order.flatMap((category) => (category.id ? [category.id] : [])),
    );
    if (ok) onClose();
    else Alert.alert("Not saved", "The new order was not saved. Try again.");
  };

  return (
    <FormSheet
      busy={edit.pending}
      fill
      maxHeightRatio={0.8}
      onClose={onClose}
      onConfirm={() => void save()}
      title="Categories"
      visible={visible}
    >
      <ScrollView contentContainerStyle={styles.form}>
        {order.map((category, index) => {
          const count = entryCounts.get(category.id ?? "") ?? 0;
          return (
            <View
              key={category.id}
              style={[
                styles.managerRow,
                {
                  backgroundColor: theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <MaterialCommunityIcons
                color={theme.accent.text}
                name={
                  codexIcon(
                    category.icon,
                  ) as keyof typeof MaterialCommunityIcons.glyphMap
                }
                size={18}
              />
              <Pressable
                accessibilityLabel={`Edit ${category.name}`}
                accessibilityRole="button"
                onPress={() => onEdit(category)}
                style={styles.managerName}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.managerLabel, { color: theme.text }]}
                >
                  {category.name}
                </Text>
                <Text style={[styles.managerCount, { color: theme.textGray }]}>
                  {`${count} ${count === 1 ? "entry" : "entries"}`}
                </Text>
              </Pressable>
              <IconButton
                accessibilityLabel={`Move ${category.name} up`}
                disabled={index === 0}
                icon="chevron-up"
                onPress={() => move(index, -1)}
                size={32}
              />
              <IconButton
                accessibilityLabel={`Move ${category.name} down`}
                disabled={index === order.length - 1}
                icon="chevron-down"
                onPress={() => move(index, 1)}
                size={32}
              />
            </View>
          );
        })}
        <PillButton icon="add" label="New category" onPress={onNew} />
      </ScrollView>
    </FormSheet>
  );
};

const memberKey = (member: { id: string; refType: string }) =>
  `${member.refType}:${member.id}`;

export const GroupSheet = ({
  edit,
  faces,
  group,
  onClose,
  takenColors,
  visible,
}: {
  edit: StoryCodexEdit;
  /** Every character in the story, from both pools. */
  faces: StoryFace[];
  /** Null when starting a new group. */
  group: CodexGroup | null;
  onClose: () => void;
  /** So a second group does not open on the first one's colour. */
  takenColors: string[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CODEX_COLORS[0]);
  const [members, setMembers] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(group?.name ?? "");
    setColor(
      group?.color ??
        CODEX_COLORS.find((hex) => !takenColors.includes(hex)) ??
        CODEX_COLORS[0],
    );
    setMembers(new Set((group?.members ?? []).map(memberKey)));
    setError(null);
  }, [group, visible]);

  const chosen = useMemo(
    () =>
      faces.filter((face) =>
        members.has(memberKey({ id: face.id, refType: face.refType })),
      ),
    [faces, members],
  );
  const trimmed = name.trim();
  const valid = Boolean(trimmed) && chosen.length >= MIN_GROUP_MEMBERS;

  const toggle = (face: StoryFace) =>
    setMembers((current) => {
      const next = new Set(current);
      const key = memberKey({ id: face.id, refType: face.refType });
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const save = async () => {
    const saved = await edit.saveGroup({
      color,
      id: group?.id ?? null,
      members: chosen.map((face) => ({ id: face.id, refType: face.refType })),
      name: trimmed,
      ordinal: group?.ordinal ?? 0,
    });
    if (saved) onClose();
    else setError(failed("group"));
  };

  const remove = () => {
    if (!group?.id) return;
    const id = group.id;
    Alert.alert(`Disband ${group.name}?`, "The characters stay in the story.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          onClose();
          void edit.deleteGroup(id).then((ok) => {
            if (!ok) Alert.alert("Not deleted", "Please try again.");
          });
        },
        style: "destructive",
        text: "Disband",
      },
    ]);
  };

  return (
    <FormSheet
      busy={edit.pending}
      canConfirm={valid}
      error={error}
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      onConfirm={() => void save()}
      title={group ? "Group" : "New group"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {faces.length < MIN_GROUP_MEMBERS ? (
          <Hint>
            A group gathers two or more of this story's characters: muses, which
            join the cast when they speak in a passage, and the story's own.
          </Hint>
        ) : (
          <>
            <FieldLabel>What is this group called?</FieldLabel>
            <TextInput
              accessibilityLabel="Group name"
              maxLength={40}
              onChangeText={setName}
              placeholder="House Corvin"
              placeholderTextColor={theme.textGray}
              style={fieldStyle}
              value={name}
            />
            <FieldLabel>Colour</FieldLabel>
            <Swatches onChange={setColor} value={color} />
            <FieldLabel>Who is in it?</FieldLabel>
            <View style={styles.choices}>
              {faces.map((face) => (
                <Choice
                  active={members.has(
                    memberKey({ id: face.id, refType: face.refType }),
                  )}
                  color={color}
                  key={memberKey({ id: face.id, refType: face.refType })}
                  label={face.name}
                  onPress={() => toggle(face)}
                />
              ))}
            </View>
            {chosen.length < MIN_GROUP_MEMBERS ? (
              <Hint>
                Pick at least two. A group of one is just that character.
              </Hint>
            ) : null}
            {group ? (
              <DangerRow label="Disband group" onPress={remove} />
            ) : null}
          </>
        )}
      </ScrollView>
    </FormSheet>
  );
};

const styles = StyleSheet.create({
  choices: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  form: { gap: space.sm, paddingBottom: space.xl },
  managerCount: { fontSize: fontSize.caption },
  managerLabel: { fontSize: fontSize.body, fontWeight: "600" },
  managerName: { flex: 1, minWidth: 0 },
  managerRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
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
