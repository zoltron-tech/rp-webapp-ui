import { Ionicons } from "@expo/vector-icons";
import { richTextToPlainText } from "@nw/richtext";
import {
  HEADCANON_VISIBILITY_COPY,
  type Headcanon,
  type HeadcanonCatalog,
  type HeadcanonCategory,
  type HeadcanonRequest,
  type HeadcanonVisibility,
} from "@nw/types/headcanon";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { Text, TextInput } from "@/components/text";
import { randomPrompt, type VerseOption } from "@/lib/headcanons";
import { plainText } from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { Choice, GroupLabel, Hint } from "./parts";

const VISIBILITY_ICON: Record<
  HeadcanonVisibility,
  keyof typeof Ionicons.glyphMap
> = {
  FRIENDS: "people-outline",
  ONLY_ME: "lock-closed-outline",
  PUBLIC: "earth-outline",
};

const VISIBILITIES: HeadcanonVisibility[] = ["PUBLIC", "FRIENDS", "ONLY_ME"];

/**
 * Write or edit one headcanon: an optional starter question, title, body,
 * category, verse, canon or AU, spoiler, and who can see it.
 *
 * Web's `HeadcanonEditorSheet`. On a phone it is the full-screen editor the
 * other long muse forms use (a story section, a connection) rather than a
 * tray: the rich text editor needs the room and its toolbar, and the window
 * is one fixed size whatever is typed. The options sit under the text, inside
 * the editor's own scroll, so the keyboard never covers what is being written.
 */
export const HeadcanonEditor = ({
  busy,
  catalog,
  error,
  headcanon,
  onClose,
  onSave,
  verses,
  visible,
}: {
  busy?: boolean;
  catalog: HeadcanonCatalog;
  error?: string | null;
  /** Null when writing a new one. */
  headcanon: Headcanon | null;
  onClose: () => void;
  onSave: (request: HeadcanonRequest) => void;
  /** The family's verses; the picker only shows when there is more than one. */
  verses: VerseOption[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [length, setLength] = useState(0);
  const [category, setCategory] = useState<HeadcanonCategory>("HABITS");
  const [verseId, setVerseId] = useState<string | null>(null);
  const [au, setAu] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [visibility, setVisibility] = useState<HeadcanonVisibility>("PUBLIC");
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(headcanon?.title ?? "");
    setBody(headcanon?.body ?? "");
    setLength(plainText(headcanon?.body).length);
    setCategory(headcanon?.category ?? "HABITS");
    setVerseId(headcanon?.verseId ?? null);
    setAu(headcanon?.alternateUniverse ?? false);
    setSpoiler(headcanon?.spoiler ?? false);
    setVisibility(headcanon?.visibility ?? "PUBLIC");
    setPrompt(headcanon ? null : randomPrompt());
  }, [visible, headcanon]);

  const max = catalog.limits.bodyTextMax;
  const tooLong = length > max;
  const blank = length === 0;

  const options = (
    <View style={styles.options}>
      <View style={styles.field}>
        <GroupLabel>Category</GroupLabel>
        <View style={styles.choices}>
          {catalog.categories.map((c) => (
            <Choice
              active={category === c.key}
              key={c.key}
              label={c.label}
              onPress={() => setCategory(c.key as HeadcanonCategory)}
            />
          ))}
        </View>
      </View>

      {verses.length > 1 ? (
        <View style={styles.field}>
          <GroupLabel>Verse</GroupLabel>
          <View style={styles.choices}>
            <Choice
              active={verseId === null}
              label="All verses"
              onPress={() => setVerseId(null)}
            />
            {verses.map((v) => (
              <Choice
                active={verseId === v.id}
                key={v.id}
                label={v.label}
                onPress={() => setVerseId(v.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.field}>
        <GroupLabel>Canon</GroupLabel>
        <View style={styles.choices}>
          <Choice
            active={!au}
            label="Canon-compliant"
            onPress={() => setAu(false)}
          />
          <Choice
            active={au}
            label="AU / divergent"
            onPress={() => setAu(true)}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: spoiler }}
        onPress={() => setSpoiler((s) => !s)}
        style={({ pressed }) => [
          styles.toggle,
          {
            backgroundColor: spoiler
              ? theme.accent.surface
              : pressed
                ? theme.material.fillPressed
                : theme.material.fillTranslucent,
            borderColor: spoiler
              ? theme.accent.solid
              : theme.material.edgeTranslucent,
          },
        ]}
      >
        <Ionicons
          color={spoiler ? theme.accent.text : theme.textGray}
          name="eye-off-outline"
          size={16}
        />
        <Text style={[styles.toggleLabel, { color: theme.text }]}>
          {spoiler ? "Spoiler — blurred until opened" : "Mark as a spoiler"}
        </Text>
      </Pressable>

      <View style={styles.field}>
        <GroupLabel>Who can see this</GroupLabel>
        <View style={styles.choices}>
          {VISIBILITIES.map((v) => (
            <Choice
              active={visibility === v}
              icon={VISIBILITY_ICON[v]}
              key={v}
              label={HEADCANON_VISIBILITY_COPY[v].label}
              onPress={() => setVisibility(v)}
            />
          ))}
        </View>
        <Hint>{HEADCANON_VISIBILITY_COPY[visibility].hint}</Hint>
      </View>
    </View>
  );

  return (
    <EditorModal
      busy={busy}
      canConfirm={!blank && !tooLong}
      confirmLabel="Save"
      error={error}
      onClose={onClose}
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
      title={headcanon ? "Edit headcanon" : "New headcanon"}
      visible={visible}
    >
      <View style={styles.head}>
        {prompt ? (
          <View
            style={[
              styles.prompt,
              {
                backgroundColor: theme.accent.surface,
                borderColor: theme.accent.tint,
              },
            ]}
          >
            <Ionicons color={theme.accent.text} name="dice-outline" size={16} />
            <Text style={[styles.promptText, { color: theme.text }]}>
              {prompt}
            </Text>
            <Pressable
              accessibilityLabel="Another question"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => setPrompt(randomPrompt(prompt))}
            >
              <Ionicons color={theme.accent.text} name="shuffle" size={17} />
            </Pressable>
            <Pressable
              accessibilityLabel="Hide the question"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => setPrompt(null)}
            >
              <Ionicons color={theme.textGray} name="close" size={17} />
            </Pressable>
          </View>
        ) : null}

        <TextInput
          accessibilityLabel="Title (optional)"
          maxLength={catalog.limits.titleMax}
          onChangeText={setTitle}
          placeholder="Title (optional)"
          placeholderTextColor={theme.textGray}
          returnKeyType="next"
          style={[
            styles.title,
            { borderBottomColor: theme.material.edge, color: theme.text },
          ]}
          value={title}
        />
        <Text
          style={[
            styles.count,
            { color: tooLong ? theme.error : theme.textGray },
          ]}
        >
          {length}/{max}
          {tooLong ? " · trim it a little" : ""}
        </Text>
      </View>

      <RichTextEditor
        footer={options}
        initialHtml={headcanon?.body ?? ""}
        key={`${headcanon?.id ?? "new"}-${visible}`}
        onChange={(html, doc) => {
          setBody(html);
          setLength(
            richTextToPlainText(doc).replace(/\s+/g, " ").trim().length,
          );
        }}
        placeholder={
          prompt ? "Answer it, or write anything…" : "Write the headcanon…"
        }
      />
    </EditorModal>
  );
};

const styles = StyleSheet.create({
  choices: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  count: {
    alignSelf: "flex-end",
    fontSize: fontSize.caption,
    fontWeight: "600",
  },
  field: { gap: space.sm },
  head: { gap: space.sm, paddingHorizontal: space.md, paddingTop: space.m },
  options: {
    gap: space.md,
    paddingBottom: space.xl,
    paddingHorizontal: space.md,
    paddingTop: space.lg,
  },
  prompt: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
  promptText: { flex: 1, fontSize: fontSize.label, fontStyle: "italic" },
  title: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: fontSize.lead,
    fontWeight: "700",
    paddingVertical: space.sm,
  },
  toggle: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.m,
    paddingVertical: space.ms,
  },
  toggleLabel: { fontSize: fontSize.label, fontWeight: "600" },
});
