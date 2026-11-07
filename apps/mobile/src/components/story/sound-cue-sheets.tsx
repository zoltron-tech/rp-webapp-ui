import { deleteSoundCue, saveSoundCue } from "@nw/api/endpoints/story";
import { getOwnMusic } from "@nw/api/endpoints/songs";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE, type ChapterSoundscape, type SoundCue } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import { Slider } from "@/components/slider";
import {
  Choice,
  DangerRow,
  FieldLabel,
  Hint,
  Swatches,
  useFieldStyle,
} from "@/components/story/form-bits";
import { Text, TextInput } from "@/components/text";
import { asColor } from "@/lib/color";
import { CODEX_COLORS } from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A chapter's sound cues — web's `StorySoundscapeBoard` and `CueSheet`.
 *
 * Web drags bars along a ruler of passages and trims on a waveform. Neither is
 * a real gesture at this width, so a cue's range is two sliders and its clip two
 * numbers, in seconds. Only the author's own uploaded songs are offered: a
 * Spotify embed has no seek or volume for a clipped, fading cue to use.
 */

/** Web's new-cue span, starting on the passage being read. */
const DEFAULT_SPAN = 2;

const seconds = (text: string): number | null => {
  const value = Number.parseFloat(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const CueEditor = ({
  cue,
  defaultStart,
  eventId,
  onClose,
  passageCount,
  visible,
}: {
  /** Null when adding. */
  cue: SoundCue | null;
  defaultStart: number;
  eventId: string;
  onClose: () => void;
  passageCount: number;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const fieldStyle = useFieldStyle();
  const key = queryKeys.chapterSoundscape(eventId);

  const music = useQuery({
    enabled: visible,
    queryFn: async () => {
      const result = await getOwnMusic(api);
      return result && !("message" in result) ? result : [];
    },
    queryKey: queryKeys.ownMusic(),
  });

  const [name, setName] = useState("");
  const [songId, setSongId] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [clipStart, setClipStart] = useState("");
  const [clipEnd, setClipEnd] = useState("");
  const [volume, setVolume] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [fadeIn, setFadeIn] = useState(2);
  const [fadeOut, setFadeOut] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const last = Math.max(0, passageCount - 1);

  useEffect(() => {
    if (!visible) return;
    setName(cue?.name ?? "");
    setSongId(cue?.songId ?? null);
    setColor(cue?.color ?? CODEX_COLORS[0]);
    setStart(cue?.startThreadOrdinal ?? defaultStart);
    setEnd(
      cue?.endThreadOrdinal ?? Math.min(defaultStart + DEFAULT_SPAN, last),
    );
    setClipStart(cue?.clipStartSec != null ? String(cue.clipStartSec) : "");
    setClipEnd(cue?.clipEndSec != null ? String(cue.clipEndSec) : "");
    setVolume(cue?.volume ?? 1);
    setIsLoop(cue?.isLoop ?? false);
    setFadeIn(cue?.fadeInSec ?? 2);
    setFadeOut(cue?.fadeOutSec ?? 2);
    setError(null);
  }, [cue, defaultStart, last, visible]);

  const trimmed = name.trim();
  const passage = (value: number) => `P${value + 1}`;

  const save = async () => {
    if (!trimmed || !songId) return;
    setBusy(true);
    setError(null);
    const result = await saveSoundCue(api, eventId, {
      clipEndSec: seconds(clipEnd),
      clipStartSec: seconds(clipStart),
      color,
      endThreadOrdinal: Math.max(start, end),
      fadeInSec: fadeIn,
      fadeOutSec: fadeOut,
      id: cue?.id ?? null,
      isLoop,
      name: trimmed,
      songId,
      sourceType: "LIBRARY_SONG",
      startThreadOrdinal: Math.min(start, end),
      volume,
    }).catch(() => null);
    setBusy(false);
    if (!result || "message" in result) {
      setError("Could not save that cue. Please try again.");
      return;
    }
    const saved = result as SoundCue;
    queryClient.setQueryData<ChapterSoundscape | null>(key, (current) =>
      current
        ? {
            ...current,
            cues: current.cues.some((item) => item.id === saved.id)
              ? current.cues.map((item) =>
                  item.id === saved.id ? saved : item,
                )
              : [...current.cues, saved],
          }
        : current,
    );
    onClose();
  };

  const remove = () => {
    if (!cue?.id) return;
    const id = cue.id;
    Alert.alert(`Delete ${cue.name}?`, "It stops playing for every reader.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          onClose();
          void deleteSoundCue(api, id)
            .catch(() => null)
            .then((result) => {
              if (result?.message !== API_MESSAGE.Success) {
                Alert.alert("Not deleted", "Please try again.");
                return;
              }
              queryClient.setQueryData<ChapterSoundscape | null>(
                key,
                (current) =>
                  current
                    ? {
                        ...current,
                        cues: current.cues.filter((item) => item.id !== id),
                      }
                    : current,
              );
            });
        },
        style: "destructive",
        text: "Delete",
      },
    ]);
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={Boolean(trimmed && songId)}
      error={error}
      fill
      maxHeightRatio={0.9}
      onClose={onClose}
      onConfirm={() => void save()}
      title={cue ? "Cue" : "New cue"}
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
          placeholder="Rain on the harbour"
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />

        <FieldLabel>Song</FieldLabel>
        {music.data?.length === 0 ? (
          <Hint>
            Your music library is empty. Upload a song on the website first.
          </Hint>
        ) : (
          <View style={styles.choices}>
            {(music.data ?? []).map((song) => (
              <Choice
                active={songId === song.id}
                key={song.id}
                label={song.name}
                onPress={() => setSongId(song.id)}
              />
            ))}
          </View>
        )}

        {passageCount > 1 ? (
          <>
            <Slider
              format={passage}
              label="From passage"
              max={last}
              min={0}
              onChange={setStart}
              value={start}
            />
            <Slider
              format={passage}
              label="To passage"
              max={last}
              min={0}
              onChange={setEnd}
              value={end}
            />
          </>
        ) : null}

        <FieldLabel>Clip, in seconds</FieldLabel>
        <View style={styles.clip}>
          <TextInput
            accessibilityLabel="Clip start, in seconds"
            keyboardType="decimal-pad"
            onChangeText={setClipStart}
            placeholder="Start"
            placeholderTextColor={theme.textGray}
            style={[fieldStyle, styles.clipField]}
            value={clipStart}
          />
          <TextInput
            accessibilityLabel="Clip end, in seconds"
            keyboardType="decimal-pad"
            onChangeText={setClipEnd}
            placeholder="End"
            placeholderTextColor={theme.textGray}
            style={[fieldStyle, styles.clipField]}
            value={clipEnd}
          />
        </View>
        <Hint>Leave these empty to play the whole track.</Hint>

        <Slider
          format={(value) => `${Math.round(value * 100)}%`}
          label="Volume"
          max={1}
          min={0}
          onChange={setVolume}
          step={0.05}
          value={volume}
        />
        <Slider
          format={(value) => `${value}s`}
          label="Fade in"
          max={10}
          min={0}
          onChange={setFadeIn}
          step={0.5}
          value={fadeIn}
        />
        <Slider
          format={(value) => `${value}s`}
          label="Fade out"
          max={10}
          min={0}
          onChange={setFadeOut}
          step={0.5}
          value={fadeOut}
        />
        <View style={styles.choices}>
          <Choice
            active={isLoop}
            label="Loop while the reader is here"
            onPress={() => setIsLoop((current) => !current)}
          />
        </View>

        <FieldLabel>Colour</FieldLabel>
        <Swatches onChange={setColor} value={color} />

        {cue ? <DangerRow label="Delete cue" onPress={remove} /> : null}
      </ScrollView>
    </FormSheet>
  );
};

/** The chapter's cues, in a list. A member's way into them. */
export const SoundCuesSheet = ({
  cues,
  currentPassage,
  eventId,
  onClose,
  passageCount,
  visible,
}: {
  cues: SoundCue[];
  /** New cues start on the passage being read. */
  currentPassage: number;
  eventId: string;
  onClose: () => void;
  passageCount: number;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [editor, setEditor] = useState<{ cue: SoundCue | null } | null>(null);
  const ordered = useMemo(
    () => [...cues].sort((a, b) => a.startThreadOrdinal - b.startThreadOrdinal),
    [cues],
  );

  return (
    <>
      <BottomSheet
        fill
        ignoreKeyboard
        maxHeightRatio={0.7}
        onClose={onClose}
        subtitle="Sound that plays as readers reach these passages."
        title="Soundscape"
        visible={visible}
      >
        <ScrollView contentContainerStyle={styles.list}>
          {ordered.length === 0 ? <Hint>No cues yet.</Hint> : null}
          {ordered.map((cue) => (
            <Pressable
              accessibilityLabel={`Edit ${cue.name}`}
              accessibilityRole="button"
              key={cue.id}
              onPress={() => setEditor({ cue })}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.material.fillPressed
                    : theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: asColor(cue.color) ?? theme.accent.solid },
                ]}
              />
              <Text
                numberOfLines={1}
                style={[styles.rowName, { color: theme.text }]}
              >
                {cue.name}
              </Text>
              <Text style={[styles.rowRange, { color: theme.textGray }]}>
                {`P${cue.startThreadOrdinal + 1}–P${cue.endThreadOrdinal + 1}`}
              </Text>
            </Pressable>
          ))}
          <PillButton
            icon="add"
            label="New cue"
            onPress={() => setEditor({ cue: null })}
          />
        </ScrollView>
      </BottomSheet>

      <CueEditor
        cue={editor?.cue ?? null}
        defaultStart={currentPassage}
        eventId={eventId}
        onClose={() => setEditor(null)}
        passageCount={passageCount}
        visible={editor !== null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  choices: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  clip: { flexDirection: "row", gap: space.sm },
  clipField: { flex: 1, minWidth: 0 },
  dot: { borderRadius: 6, height: 12, width: 12 },
  form: { gap: space.sm, paddingBottom: space.xl },
  list: { gap: space.sm, paddingBottom: space.lg, paddingHorizontal: space.md },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.sm,
  },
  rowName: { flex: 1, fontSize: fontSize.body, fontWeight: "600" },
  rowRange: { fontSize: fontSize.caption },
});
