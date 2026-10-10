import { Ionicons } from "@expo/vector-icons";
import type {
  CodexRelationship,
  CodexTone,
  CodexToneLineStyle,
  RelationshipTone,
} from "@nw/types";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { PillButton } from "@/components/settings";
import { FaceAvatar, type StoryFace } from "@/components/story/character-sheet";
import { ToneSwatch } from "@/components/story/relationship-bits";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import type { StoryCodexEdit } from "@/hooks/use-story-codex-edit";
import { withAlpha } from "@/lib/color";
import {
  buildTonePalette,
  CODEX_COLORS,
  LINE_STYLE_DASH,
  LINE_STYLE_LABELS,
  LINE_STYLES,
  MAX_CODEX_TONES,
  MAX_RELATIONSHIP_LABEL,
  MAX_TONE_LABEL,
  nodeKey,
  type ResolvedTone,
  STRENGTH_LABELS,
} from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `RelationshipSheet`: who, to whom, in what words, in which tone, how
 * heavily — and, while at it, a new tone of the story's own.
 *
 * One sheet for creating and editing. A co-author gets the form; anyone else
 * who taps an edge gets the same facts laid out to read, since the mesh is
 * public wherever the story is.
 *
 * Two things web gets wrong are right here: the saved payload carries
 * `toneId` (web drops it, so a custom tone never sticks) and `detail`
 * (web nulls it on every edit).
 *
 * Deleting asks first. Web deletes on the tap; a phone has no undo and the
 * button sits where a thumb rests.
 */

type Draft = {
  from: string | null;
  to: string | null;
  label: string;
  tone: RelationshipTone;
  toneId: string | null;
  isDirected: boolean;
  strength: 1 | 2 | 3;
};

const STRENGTHS = [
  { label: STRENGTH_LABELS[0], value: "1" },
  { label: STRENGTH_LABELS[1], value: "2" },
  { label: STRENGTH_LABELS[2], value: "3" },
] as const;

const LINE_OPTIONS = LINE_STYLES.map((style) => ({
  label: LINE_STYLE_LABELS[style],
  value: style,
}));

export const RelationshipSheet = ({
  canEdit,
  edit,
  faces,
  initial,
  onClose,
  relationship,
  tones,
  visible,
}: {
  canEdit: boolean;
  edit: StoryCodexEdit;
  faces: readonly StoryFace[];
  /** Pre-chosen ends for a new relationship (a focused character, say). */
  initial?: { from?: string; to?: string } | null;
  onClose: () => void;
  /** The one being edited; null to create. */
  relationship: CodexRelationship | null;
  tones: readonly CodexTone[];
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const light = theme.name === "light";
  const palette = useMemo(() => buildTonePalette(tones, light), [tones, light]);
  const isEdit = Boolean(relationship?.id);

  const [draft, setDraft] = useState<Draft>(() => blank(faces, initial));
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<"ends" | "label" | null>(null);
  const [busy, setBusy] = useState(false);

  // The tone maker, folded into the sheet as on web.
  const [makingTone, setMakingTone] = useState(false);
  const [toneLabel, setToneLabel] = useState("");
  const [toneColor, setToneColor] = useState<string>(CODEX_COLORS[0]);
  const [toneStyle, setToneStyle] = useState<CodexToneLineStyle>("SOLID");
  const [toneBusy, setToneBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDraft(
      relationship
        ? {
            from: nodeKey(relationship.fromId, relationship.fromType),
            isDirected: relationship.isDirected,
            label: relationship.label,
            strength: clampStrength(relationship.strength),
            to: nodeKey(relationship.toId, relationship.toType),
            tone: relationship.tone,
            toneId: relationship.toneId ?? null,
          }
        : blank(faces, initial),
    );
    setError(null);
    setProblem(null);
    setMakingTone(false);
    setToneLabel("");
    setToneColor(CODEX_COLORS[0]);
    setToneStyle("SOLID");
  }, [faces, initial, relationship, visible]);

  const faceOf = (key: string | null) =>
    faces.find((face) => nodeKey(face.id, face.refType) === key) ?? null;

  const sameEnds = draft.from !== null && draft.from === draft.to;
  const complete =
    draft.from !== null &&
    draft.to !== null &&
    !sameEnds &&
    draft.label.trim().length > 0;

  const save = async () => {
    if (!canEdit || busy) return;
    if (!draft.from || !draft.to || sameEnds) {
      setProblem("ends");
      return;
    }
    if (!draft.label.trim()) {
      setProblem("label");
      return;
    }
    const from = faceOf(draft.from);
    const to = faceOf(draft.to);
    if (!from || !to) {
      setProblem("ends");
      return;
    }
    setProblem(null);
    setBusy(true);
    setError(null);
    const saved = await edit.saveRelationship({
      detail: relationship?.detail ?? null,
      fromId: from.id,
      fromType: from.refType,
      id: relationship?.id ?? null,
      isDirected: draft.isDirected,
      label: draft.label.trim(),
      strength: draft.strength,
      toId: to.id,
      tone: draft.tone,
      toneId: draft.toneId,
      toType: to.refType,
    });
    setBusy(false);
    if (!saved) {
      setError("Could not save that relationship. Try again.");
      return;
    }
    onClose();
  };

  const remove = () => {
    if (!relationship?.id) return;
    const target = relationship.id;
    Alert.alert(
      "Delete relationship?",
      `"${relationship.label}" will be removed from the story's mesh. This cannot be undone.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy(true);
            const ok = await edit.deleteRelationship(target);
            setBusy(false);
            if (!ok) {
              setError("Could not delete it. Try again in a moment.");
              return;
            }
            onClose();
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const addTone = async () => {
    const label = toneLabel.trim();
    if (!label || toneBusy) return;
    setToneBusy(true);
    const saved = await edit.saveTone({
      color: toneColor,
      id: null,
      label,
      lineStyle: toneStyle,
      ordinal: tones.length,
    });
    setToneBusy(false);
    if (!saved?.id) {
      setError(
        "Could not add that tone. Bond, Strain and Neutral are taken; try another name.",
      );
      return;
    }
    setError(null);
    setDraft((current) => ({ ...current, toneId: saved.id }));
    setMakingTone(false);
    setToneLabel("");
  };

  const retireTone = (tone: ResolvedTone) => {
    Alert.alert(
      `Retire "${tone.label}"?`,
      "Relationships drawn in it fall back to their built-in tone. The story keeps them.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const ok = await edit.deleteTone(tone.key);
            if (!ok) {
              setError("Could not retire that tone. Try again.");
              return;
            }
            setDraft((current) =>
              current.toneId === tone.key
                ? { ...current, toneId: null }
                : current,
            );
          },
          style: "destructive",
          text: "Retire",
        },
      ],
    );
  };

  const selectedTone = palette.find((tone) =>
    draft.toneId ? tone.key === draft.toneId : tone.key === draft.tone,
  );

  const pickFace = (which: "from" | "to", key: string) => {
    setDraft((current) => ({ ...current, [which]: key }));
    setProblem((was) => (was === "ends" ? null : was));
  };

  const readOnly = !canEdit;

  return (
    <FormSheet
      busy={busy}
      canConfirm={!readOnly}
      confirmLabel={isEdit ? "Save" : "Create"}
      error={error}
      fill
      onClose={onClose}
      onConfirm={readOnly ? undefined : () => void save()}
      subtitle={
        readOnly
          ? "Only members of this story can change its relationships."
          : faces.length < 2
            ? "A story needs two characters before they can stand toward each other."
            : undefined
      }
      title={isEdit ? "Relationship" : "New relationship"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {(["from", "to"] as const).map((which) => (
          <View key={which} style={styles.block}>
            <Text style={[styles.label, { color: theme.textGray }]}>
              {which === "from" ? "From" : "To"}
            </Text>
            <View style={styles.chips}>
              {faces.map((face) => {
                const key = nodeKey(face.id, face.refType);
                const on = draft[which] === key;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    disabled={readOnly}
                    key={key}
                    onPress={() => pickFace(which, key)}
                    style={[
                      styles.faceChip,
                      {
                        backgroundColor: on
                          ? theme.accent.surface
                          : theme.material.fill,
                        borderColor: on
                          ? theme.accent.solid
                          : theme.material.edge,
                      },
                    ]}
                  >
                    <FaceAvatar face={face} size={22} />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.faceName,
                        { color: on ? theme.accent.textStrong : theme.text },
                      ]}
                    >
                      {face.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        {problem === "ends" || sameEnds ? (
          <Problem text="Pick two different characters." />
        ) : null}

        <TextField
          accessibilityLabel="What are they to each other, required"
          autoCapitalize="none"
          counterMax={MAX_RELATIONSHIP_LABEL}
          editable={!readOnly}
          hint={
            problem === "label" ? "Say what they are to each other." : undefined
          }
          invalid={problem === "label"}
          label="What are they to each other?"
          maxLength={MAX_RELATIONSHIP_LABEL}
          onChangeText={(next) => {
            setDraft((current) => ({ ...current, label: next }));
            if (next.trim())
              setProblem((was) => (was === "label" ? null : was));
          }}
          placeholder="sworn enemies · raised him · owes a debt"
          value={draft.label}
        />

        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.textGray }]}>Tone</Text>
          <View style={styles.chips}>
            {palette.map((tone) => {
              const on = selectedTone?.key === tone.key;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  disabled={readOnly}
                  key={tone.key}
                  onPress={() =>
                    setDraft((current) =>
                      tone.isSystem
                        ? {
                            ...current,
                            tone: tone.key as RelationshipTone,
                            toneId: null,
                          }
                        : { ...current, toneId: tone.key },
                    )
                  }
                  style={[
                    styles.toneChip,
                    {
                      backgroundColor: on
                        ? withAlpha(tone.color, 0.18)
                        : theme.material.fill,
                      borderColor: on ? tone.color : theme.material.edge,
                    },
                  ]}
                >
                  <ToneSwatch tone={tone} width={22} />
                  <Text
                    style={[
                      styles.toneName,
                      { color: on ? tone.color : theme.text },
                    ]}
                  >
                    {tone.label}
                  </Text>
                </Pressable>
              );
            })}
            {!readOnly && !makingTone && tones.length < MAX_CODEX_TONES ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setMakingTone(true)}
                style={[
                  styles.toneChip,
                  styles.newTone,
                  { borderColor: theme.material.edge },
                ]}
              >
                <Ionicons color={theme.textGray} name="add" size={14} />
                <Text style={[styles.toneName, { color: theme.textGray }]}>
                  New tone
                </Text>
              </Pressable>
            ) : null}
          </View>
          {selectedTone?.description ? (
            <Text style={[styles.hint, { color: theme.textGray }]}>
              {selectedTone.description}
            </Text>
          ) : null}
          {!readOnly && selectedTone && !selectedTone.isSystem ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => retireTone(selectedTone)}
            >
              <Text style={[styles.retire, { color: theme.error }]}>
                Retire "{selectedTone.label}" from this story
              </Text>
            </Pressable>
          ) : null}

          {makingTone ? (
            <View
              style={[
                styles.toneMaker,
                {
                  backgroundColor: theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <TextField
                autoCapitalize="none"
                counterMax={MAX_TONE_LABEL}
                label="What is this tone called?"
                maxLength={MAX_TONE_LABEL}
                onChangeText={setToneLabel}
                placeholder="blood oath · unrequited · same regiment"
                value={toneLabel}
              />
              <View style={styles.swatches}>
                {CODEX_COLORS.map((color) => {
                  const on = color === toneColor;
                  return (
                    <Pressable
                      accessibilityLabel={`Colour ${color}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      key={color}
                      onPress={() => setToneColor(color)}
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: color,
                          borderColor: on ? theme.text : "transparent",
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <SegmentedTabs
                onChange={(value) => setToneStyle(value)}
                options={LINE_OPTIONS}
                value={toneStyle}
              />
              <View style={styles.preview}>
                <ToneSwatch
                  tone={{
                    color: toneColor,
                    dash: LINE_STYLE_DASH[toneStyle],
                    isSystem: false,
                    key: "preview",
                    label: toneLabel,
                  }}
                  width={120}
                />
              </View>
              <View style={styles.toneActions}>
                <PillButton
                  label="Cancel"
                  onPress={() => {
                    setMakingTone(false);
                    setToneLabel("");
                  }}
                />
                <PillButton
                  busy={toneBusy}
                  disabled={!toneLabel.trim()}
                  icon="add"
                  label={toneBusy ? "Adding…" : "Add tone"}
                  onPress={() => void addTone()}
                  tone="accent"
                />
              </View>
            </View>
          ) : null}
          <Text style={[styles.hint, { color: theme.textGray }]}>
            The tone is the colour and the line. What they are to each other is
            the words above.
          </Text>
        </View>

        <View
          style={[
            styles.switchRow,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <View style={styles.switchText}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {draft.isDirected ? "One-way" : "Mutual"}
            </Text>
            <Text style={[styles.hint, { color: theme.textGray }]}>
              {draft.isDirected
                ? "Draws an arrow from the first to the second."
                : "No arrow — it goes both ways."}
            </Text>
          </View>
          <Switch
            disabled={readOnly}
            onValueChange={(on) =>
              setDraft((current) => ({ ...current, isDirected: on }))
            }
            thumbColor="#ffffff"
            trackColor={{
              false: theme.material.fillPressed,
              true: theme.accent.solid,
            }}
            value={draft.isDirected}
          />
        </View>

        <View style={styles.block}>
          <Text style={[styles.label, { color: theme.textGray }]}>
            How much it defines them
          </Text>
          <SegmentedTabs
            onChange={(value) =>
              !readOnly &&
              setDraft((current) => ({
                ...current,
                strength: clampStrength(Number(value)),
              }))
            }
            options={STRENGTHS}
            value={String(draft.strength) as "1" | "2" | "3"}
          />
        </View>

        {isEdit && !readOnly ? (
          <View style={styles.danger}>
            <PillButton
              disabled={busy}
              icon="trash-outline"
              label="Delete relationship"
              onPress={remove}
              tone="danger"
            />
          </View>
        ) : null}
      </ScrollView>
    </FormSheet>
  );
};

const Problem = ({ text }: { text: string }) => {
  const theme = useAppTheme();
  return (
    <View accessibilityLiveRegion="polite" style={styles.problem}>
      <Ionicons color={theme.error} name="alert-circle" size={14} />
      <Text style={[styles.problemLabel, { color: theme.error }]}>{text}</Text>
    </View>
  );
};

const clampStrength = (value: number): 1 | 2 | 3 =>
  Math.min(3, Math.max(1, Math.round(value) || 2)) as 1 | 2 | 3;

const blank = (
  faces: readonly StoryFace[],
  initial?: { from?: string; to?: string } | null,
): Draft => {
  const keys = faces.map((face) => nodeKey(face.id, face.refType));
  const from = initial?.from ?? keys[0] ?? null;
  const to = initial?.to ?? keys.find((key) => key !== from) ?? null;
  return {
    from,
    isDirected: false,
    label: "",
    strength: 2,
    to,
    tone: "NEUTRAL",
    toneId: null,
  };
};

const styles = StyleSheet.create({
  block: { gap: space.sm },
  body: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  danger: { alignItems: "flex-start", marginTop: space.sm },
  faceChip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingLeft: 3,
    paddingRight: space.ms,
    paddingVertical: 3,
  },
  faceName: { fontSize: fontSize.label, fontWeight: "600", maxWidth: 140 },
  hint: { fontSize: fontSize.caption },
  label: { fontSize: fontSize.caption, fontWeight: "600" },
  newTone: { borderStyle: "dashed" },
  preview: { alignItems: "center", paddingVertical: space.xs },
  problem: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    marginTop: -space.xs,
  },
  problemLabel: { flex: 1, fontSize: fontSize.caption, fontWeight: "600" },
  retire: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  swatch: { borderRadius: radius.full, borderWidth: 2, height: 28, width: 28 },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  switchLabel: { fontSize: fontSize.body, fontWeight: "600" },
  switchRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.m,
  },
  switchText: { flex: 1, gap: 2 },
  toneActions: {
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "flex-end",
  },
  toneChip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.ms,
    paddingVertical: 5,
  },
  toneMaker: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  toneName: { fontSize: fontSize.caption, fontWeight: "600" },
});
