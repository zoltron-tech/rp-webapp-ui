import { Ionicons } from "@expo/vector-icons";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { updateStoryBoardEvent } from "@nw/api/endpoints/story";
import { useApi } from "@nw/features";
import type { NWImage, StoryBoardEvent } from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import { toCropFilter, wsrvImage } from "@nw/utils";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardLift } from "@/components/compose/prompt-composer";
import { SongSheet } from "@/components/compose/song-sheet";
import { CroppedImage } from "@/components/cropped-image";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { IconButton } from "@/components/icon-button";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { PillButton } from "@/components/settings";
import { BottomSheet } from "@/components/sheet";
import { Asterism } from "@/components/story/asterism";
import { StoryDateField } from "@/components/story/story-date-field";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import {
  ASTERISM_OPTIONS,
  asterismLabel,
  DEFAULT_ASTERISM,
  descriptionHtml,
  plainText,
  STORY_COVER_ZOOM_MAX_PCT,
} from "@/lib/story";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * A chapter, made or changed — web's `EditStoryboardEventDataCard`.
 *
 * The same fields in the same order: cover, title, where and when, the
 * description, the two scene dividers and the chapter's song. Web shows it as
 * a dialog, or a tray on a narrow screen; with seven fields and a rich-text
 * one among them it is a screen here, with the composer's bar on top — close
 * on the left, the save on the right — and the form scrolling under it above
 * the keyboard.
 *
 * Two fields open something of their own rather than editing in the form:
 * the description, which gets the full editor and its toolbar (a rich-text
 * field inside a scrolling form is a scroll inside a scroll), and the cover,
 * which goes through the same pick → upload → crop flow as a muse's pictures,
 * at a book cover's 2:3.
 *
 * Nothing is written until Save. The order of chapters is not this form's:
 * the server appends a new chapter and keeps an existing one where it is.
 */

const MAX_NAME = 50;
const MAX_LOCATION = 200;
const MAX_DESCRIPTION = 4000;
const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };

export const ChapterEditor = ({
  chapter,
  onClose,
  onSaved,
  storyId,
}: {
  /** The chapter being edited, or null for a new one. */
  chapter: StoryBoardEvent | null;
  onClose: () => void;
  onSaved: (chapter: StoryBoardEvent, created: boolean) => void;
  storyId: string;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(chapter?.name ?? "");
  const [location, setLocation] = useState(chapter?.location ?? "");
  const [eventTime, setEventTime] = useState(chapter?.eventTime ?? null);
  const [description, setDescription] = useState(() =>
    descriptionHtml(chapter?.description),
  );
  const [avatar, setAvatar] = useState<NWImage | null>(
    chapter?.avatar ??
      (chapter?.image
        ? {
            crop: toCropFilter(chapter.image, 50, 50, 1),
            filterValues: NEUTRAL_FILTERS,
            src: chapter.image,
          }
        : null),
  );
  const [overture, setOverture] = useState(
    chapter?.overtureAsterism ?? DEFAULT_ASTERISM,
  );
  const [passage, setPassage] = useState(
    chapter?.passageAsterism ?? DEFAULT_ASTERISM,
  );
  const [song, setSong] = useState<ProfileSong | null>(chapter?.song ?? null);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheet, setSheet] = useState<
    "overture" | "passage" | "song" | "description" | null
  >(null);
  const describing = useRef<RichTextEditorHandle>(null);

  /** Covers uploaded from here that no saved chapter refers to yet. */
  const uploads = useRef(new Set<string>());

  const crop = useImageCropFlow({
    onSave: async (src, state) => {
      if (src !== chapter?.avatar?.src && src !== chapter?.image) {
        uploads.current.add(src);
      }
      setAvatar({
        crop: toCropFilter(src, state.x, state.y, state.scale),
        filterValues: NEUTRAL_FILTERS,
        src,
      });
      setDirty(true);
      return true;
    },
    // Beside the story's other media, as web stores it.
    prefix: storyId,
  });

  const descriptionLength = useMemo(
    () => plainText(description).length,
    [description],
  );
  const tooLong = descriptionLength > MAX_DESCRIPTION;
  const canSave = name.trim().length > 0 && !tooLong && !saving;

  const edit =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setDirty(true);
    };

  const dropUploads = useCallback(
    (keep?: string | null) => {
      for (const url of uploads.current) {
        if (url !== keep) void deleteMedia(api, url);
      }
      uploads.current.clear();
    },
    [api],
  );

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const response = await updateStoryBoardEvent(api, {
      avatar,
      createdAt: null,
      description,
      eventTime,
      id: chapter?.id ?? null,
      image: avatar?.src ?? null,
      location: location.trim() || null,
      name: name.trim(),
      ordinal: chapter?.ordinal ?? 1,
      overtureAsterism: overture,
      passageAsterism: passage,
      song,
      storyBoardId: storyId,
    }).catch(() => ({ message: "error" }) as const);
    setSaving(false);

    if ("message" in response) {
      Alert.alert(
        "Could not save",
        ("reason" in response && response.reason) ||
          "The chapter was not saved. Please try again.",
      );
      return;
    }
    dropUploads(response.avatar?.src ?? response.image);
    onSaved(response, !chapter);
    onClose();
  };

  const requestClose = () => {
    if (!dirty) {
      onClose();
      return;
    }
    Alert.alert(
      "Discard unsaved changes?",
      "You have unsaved changes that will be lost if you leave.",
      [
        { style: "cancel", text: "Stay" },
        {
          onPress: () => {
            dropUploads();
            onClose();
          },
          style: "destructive",
          text: "Discard",
        },
      ],
    );
  };

  const cover = wsrvImage(avatar?.src, { fit: "inside", h: 600, w: 400 });
  const preview = useMemo(() => plainText(description), [description]);
  const dividerFor = sheet === "overture" || sheet === "passage" ? sheet : null;
  // Held while the tray slides away, so its rows do not change under it.
  const shownDivider = useRef<"overture" | "passage">("overture");
  if (dividerFor) shownDivider.current = dividerFor;

  return (
    <Modal
      animationType="slide"
      onRequestClose={requestClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible
    >
      <View style={[styles.shell, { backgroundColor: theme.background }]}>
        <KeyboardLift
          backgroundColor={theme.background}
          insetBottom={insets.bottom}
          insetTop={0}
          trayOpen={false}
        >
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: theme.glass.opaque,
                borderBottomColor: theme.glass.edge,
                paddingTop: insets.top + space.sm,
              },
            ]}
          >
            <IconButton
              accessibilityLabel="Close"
              hitSlop={space.sm}
              icon="close"
              iconSize={20}
              onPress={requestClose}
              size={36}
              tone="glass"
            />
            <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
              {chapter ? "Edit chapter" : "New chapter"}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              hitSlop={space.sm}
              onPress={() => void save()}
              style={({ pressed }) => [
                styles.send,
                {
                  backgroundColor: canSave
                    ? pressed
                      ? theme.accent.fillPressed
                      : theme.accent.fill
                    : theme.accent.fillDisabled,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  color={theme.accent.onFillDisabled}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.sendLabel,
                    {
                      color: canSave
                        ? theme.accent.onFill
                        : theme.accent.onFillDisabled,
                    },
                  ]}
                >
                  {chapter ? "Save" : "Create"}
                </Text>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Cover ─────────────────────────────────────────────────── */}
            <View style={styles.coverRow}>
              <Pressable
                accessibilityLabel={cover ? "Change cover" : "Upload cover"}
                accessibilityRole="button"
                onPress={() => crop.open(avatar)}
                style={[
                  styles.cover,
                  {
                    backgroundColor: theme.material.fillPressed,
                    borderColor: theme.material.edge,
                  },
                ]}
              >
                {cover ? (
                  <CroppedImage
                    crop={avatar?.crop}
                    maxScalePct={STORY_COVER_ZOOM_MAX_PCT}
                    style={StyleSheet.absoluteFill}
                    uri={cover}
                  />
                ) : (
                  <Ionicons
                    color={theme.textGray}
                    name="camera-outline"
                    size={24}
                  />
                )}
              </Pressable>
              <View style={styles.coverMeta}>
                <Text style={[styles.coverTitle, { color: theme.text }]}>
                  Cover
                </Text>
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  Shown on the chapter card and header
                </Text>
                <View style={styles.buttons}>
                  <PillButton
                    icon="camera-outline"
                    label={cover ? "Change cover" : "Upload cover"}
                    onPress={() => crop.open(avatar)}
                  />
                  {cover ? (
                    <PillButton
                      label="Remove"
                      onPress={() => edit(setAvatar)(null)}
                    />
                  ) : null}
                </View>
              </View>
            </View>

            <TextField
              counterMax={MAX_NAME}
              label="Title"
              maxLength={MAX_NAME}
              onChangeText={edit(setName)}
              placeholder="Chapter name"
              value={name}
            />

            <TextField
              label="Location (optional)"
              maxLength={MAX_LOCATION}
              onChangeText={edit(setLocation)}
              placeholder="Where does it take place..."
              value={location}
            />

            <Section label="Date & time">
              <StoryDateField
                initial={chapter?.eventTime ?? null}
                onChange={edit(setEventTime)}
              />
            </Section>

            <Section
              aside={`${descriptionLength}/${MAX_DESCRIPTION}`}
              asideError={tooLong}
              label="Description"
            >
              <Pressable
                accessibilityHint="Opens the editor"
                accessibilityLabel="Description"
                accessibilityRole="button"
                onPress={() => setSheet("description")}
                style={({ pressed }) => [
                  styles.box,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : theme.glass.field,
                    borderColor: tooLong ? theme.error : theme.glass.fieldEdge,
                  },
                ]}
              >
                <Text
                  numberOfLines={4}
                  style={[
                    styles.boxText,
                    { color: preview ? theme.text : theme.textGray },
                  ]}
                >
                  {preview || "What happens in this chapter..."}
                </Text>
                <Ionicons color={theme.textGray} name="create-outline" size={18} />
              </Pressable>
            </Section>

            <Section label="Scene dividers">
              <DividerRow
                label="Opening divider"
                onPress={() => setSheet("overture")}
                value={overture}
              />
              <DividerRow
                label="Between passages"
                onPress={() => setSheet("passage")}
                value={passage}
              />
            </Section>

            <Section label="Chapter song (optional)">
              {song ? (
                <View
                  style={[
                    styles.box,
                    {
                      backgroundColor: theme.glass.field,
                      borderColor: theme.glass.fieldEdge,
                    },
                  ]}
                >
                  <Ionicons
                    color={theme.accent.text}
                    name="musical-note"
                    size={18}
                  />
                  <View style={styles.songText}>
                    <Text
                      numberOfLines={1}
                      style={[styles.songTitle, { color: theme.text }]}
                    >
                      {song.title}
                    </Text>
                    {song.artist ? (
                      <Text
                        numberOfLines={1}
                        style={[styles.hint, { color: theme.textGray }]}
                      >
                        {song.artist}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
              <View style={styles.buttons}>
                <PillButton
                  icon="musical-notes-outline"
                  label={song ? "Change song" : "Add a song"}
                  onPress={() => setSheet("song")}
                />
                {song ? (
                  <PillButton
                    label="Remove"
                    onPress={() => edit(setSong)(null)}
                  />
                ) : null}
              </View>
            </Section>
          </ScrollView>
        </KeyboardLift>

        <EditorModal
          confirmLabel="Done"
          onClose={() => setSheet(null)}
          onConfirm={() => {
            const html = describing.current?.getHtml();
            if (html !== undefined && html !== description) {
              edit(setDescription)(html);
            }
            setSheet(null);
          }}
          title="Description"
          visible={sheet === "description"}
        >
          {sheet === "description" ? (
            <RichTextEditor
              initialHtml={description}
              placeholder="What happens in this chapter..."
              ref={describing}
            />
          ) : null}
        </EditorModal>

        <BottomSheet
          ignoreKeyboard
          maxHeightRatio={0.72}
          onClose={() => setSheet(null)}
          subtitle={
            shownDivider.current === "overture"
              ? "After the title, before the description"
              : "Before every passage in this chapter"
          }
          title={
            shownDivider.current === "overture"
              ? "Opening divider"
              : "Between passages"
          }
          visible={dividerFor !== null}
        >
          <ScrollView contentContainerStyle={styles.options}>
            {ASTERISM_OPTIONS.map((option) => {
              const current =
                shownDivider.current === "overture" ? overture : passage;
              const selected = option.value === current;
              return (
                <Pressable
                  accessibilityLabel={`${option.label}. ${option.description}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => {
                    edit(
                      shownDivider.current === "overture"
                        ? setOverture
                        : setPassage,
                    )(option.value);
                    setSheet(null);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.accent.tint
                        : pressed
                          ? theme.glass.fillPressed
                          : theme.material.fillTranslucent,
                      borderColor: selected
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <View style={styles.optionHead}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: selected
                            ? theme.accent.textStrong
                            : theme.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons
                        color={theme.accent.textStrong}
                        name="checkmark"
                        size={18}
                      />
                    ) : null}
                  </View>
                  {option.value === "none" ? (
                    <Text style={[styles.hint, { color: theme.textGray }]}>
                      {option.description}
                    </Text>
                  ) : (
                    <Asterism tight value={option.value} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </BottomSheet>

        <SongSheet
          onClose={() => setSheet(null)}
          onSelect={edit(setSong)}
          title="Add a chapter song"
          visible={sheet === "song"}
        />

        <ImageCropEditor
          aspect={2 / 3}
          autoFit={crop.autoFit}
          busy={crop.saving}
          initial={crop.initial}
          onClose={crop.close}
          onConfirm={(state) => void crop.confirm(state)}
          onReplace={() => void crop.replace()}
          title="Adjust chapter cover"
          uploading={crop.uploading}
          uri={crop.uri}
          visible={crop.visible}
        />
      </View>
    </Modal>
  );
};

const Section = ({
  aside,
  asideError = false,
  children,
  label,
}: {
  aside?: string;
  asideError?: boolean;
  children: ReactNode;
  label: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionLabel, { color: theme.textGray }]}>
          {label}
        </Text>
        {aside ? (
          <Text
            style={[
              styles.hint,
              { color: asideError ? theme.error : theme.textGray },
            ]}
          >
            {aside}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
};

const DividerRow = ({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: string;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${label}: ${asterismLabel(value)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.box,
        {
          backgroundColor: pressed ? theme.glass.fillPressed : theme.glass.field,
          borderColor: theme.glass.fieldEdge,
        },
      ]}
    >
      <View style={styles.songText}>
        <Text style={[styles.hint, { color: theme.textGray }]}>{label}</Text>
        <Text style={[styles.songTitle, { color: theme.text }]}>
          {asterismLabel(value)}
        </Text>
      </View>
      <Ionicons color={theme.textGray} name="chevron-down" size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.m,
    paddingVertical: space.sm,
  },
  boxText: { flex: 1, fontSize: fontSize.body, lineHeight: 20 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  cover: {
    alignItems: "center",
    aspectRatio: 2 / 3,
    borderCurve: "continuous",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    justifyContent: "center",
    overflow: "hidden",
    width: 84,
  },
  coverMeta: { flex: 1, gap: space.xs, minWidth: 0 },
  coverRow: { alignItems: "center", flexDirection: "row", gap: space.md },
  coverTitle: { fontSize: fontSize.body, fontWeight: "700" },
  form: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  hint: { fontSize: fontSize.caption },
  option: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  optionHead: { alignItems: "center", flexDirection: "row", gap: space.sm },
  optionLabel: { flex: 1, fontSize: fontSize.body, fontWeight: "600" },
  options: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  section: { gap: space.sm },
  sectionHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: { ...type.eyebrow },
  send: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    minWidth: 64,
    paddingHorizontal: space.md,
  },
  sendLabel: { fontSize: fontSize.label, fontWeight: "700" },
  shell: { flex: 1 },
  songText: { flex: 1, gap: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.body, fontWeight: "600" },
  title: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: "700",
    textAlign: "center",
  },
  topBar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
