import { Ionicons } from "@expo/vector-icons";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { getAllGenres } from "@nw/api/endpoints/story";
import { useApi, useSession } from "@nw/features";
import type { Fandom, NWImage, StoryBoard, StoryBoardMember } from "@nw/types";
import type { Genre } from "@nw/types/common";
import { toCropFilter, wsrvImage } from "@nw/utils";
import { useQuery } from "@tanstack/react-query";
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
import { Avatar } from "@/components/avatar";
import { KeyboardLift } from "@/components/compose/prompt-composer";
import { CroppedImage } from "@/components/cropped-image";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { IconButton } from "@/components/icon-button";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { FandomSheet } from "@/components/muse/edit/fandom-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { PillButton } from "@/components/settings";
import { StoryMembersSheet } from "@/components/story/story-members-sheet";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { useStoryWrite } from "@/hooks/use-story-edit";
import { asColor, withAlpha } from "@/lib/color";
import {
  descriptionHtml,
  fandomLabel,
  plainText,
  STORY_COVER_ZOOM_MAX_PCT,
} from "@/lib/story";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * A story, made or changed — web's `EditStoryboardDataCard`.
 *
 * The same fields in web's order: cover, visibility, title, description,
 * fandom, genres, then — once the story exists — its members and, for its
 * author, the way to delete it. Web shows this as a dialog or a tray; with a
 * rich-text field and two pickers among the fields it is a screen here, with
 * the chapter editor's bar on top and the form scrolling under it.
 *
 * Three fields open something of their own: the description gets the full
 * editor, the fandom its search sheet, and the members their sheet — the one
 * part of the form that writes as it goes, because web's member endpoints
 * are their own calls and not part of the save.
 *
 * Nothing else is written until Save. A cover uploaded here and then
 * abandoned is deleted on the way out, as the chapter editor does.
 *
 * ## Limits
 *
 * The server owns them and says so in `reason` — "You've reached your plan's
 * limit…" — and that is what the alert shows. The stories list gates the
 * Create button before this opens, as web's page does; the check here is the
 * backstop for a shelf that was stale.
 */

const MAX_NAME = 50;
/** Web's `MAX_DESCRIPTION_LENGTH`, in plain-text characters. */
const MAX_DESCRIPTION = 2000;
/** Web's `MAX_STORY_GENRES` — the backend cap. */
const MAX_GENRES = 5;
/** Web's `COLLAPSED_GENRE_COUNT`: how many show before "Show all". */
const COLLAPSED_GENRES = 12;
const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };

type Visibility = "members" | "public";

const VISIBILITY = [
  { icon: "lock-closed", label: "Members only", value: "members" },
  { icon: "globe-outline", label: "Public", value: "public" },
] as const;

export const StoryEditor = ({
  onClose,
  onDeleted,
  onSaved,
  story,
}: {
  onClose: () => void;
  /** The story was deleted from inside the form; the caller leaves its page. */
  onDeleted?: (storyId: string) => void;
  onSaved: (story: StoryBoard, created: boolean) => void;
  /** The story being edited, or null for a new one. */
  story: StoryBoard | null;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { novelist } = useSession();
  const write = useStoryWrite();

  const id = story?.id ?? null;
  const creatorUsername = story?.createdBy?.username ?? novelist?.username;
  const isCreator = !id || creatorUsername === novelist?.username;

  const [name, setName] = useState(story?.name ?? "");
  const [description, setDescription] = useState(() =>
    descriptionHtml(story?.description),
  );
  const [avatar, setAvatar] = useState<NWImage | null>(
    story?.avatar ??
      (story?.image
        ? {
            crop: toCropFilter(story.image, 50, 50, 1),
            filterValues: NEUTRAL_FILTERS,
            src: story.image,
          }
        : null),
  );
  const [isPublic, setIsPublic] = useState(story?.isPublic ?? false);
  const [fandom, setFandom] = useState<Fandom | null>(story?.fandom ?? null);
  const [genres, setGenres] = useState<Genre[]>(story?.genres ?? []);
  const [members, setMembers] = useState<StoryBoardMember[]>(
    story?.members ?? [],
  );
  const [showAllGenres, setShowAllGenres] = useState(false);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sheet, setSheet] = useState<
    "description" | "fandom" | "members" | null
  >(null);
  const describing = useRef<RichTextEditorHandle>(null);

  /** Covers uploaded from here that no saved story refers to yet. */
  const uploads = useRef(new Set<string>());

  const crop = useImageCropFlow({
    onSave: async (src, state) => {
      if (src !== story?.avatar?.src && src !== story?.image) {
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
    // Beside the story's other media once it has an id; a draft's cover
    // goes under the novelist until then, as web's does.
    prefix: id,
  });

  const catalogue = useQuery({
    queryFn: async (): Promise<Genre[]> => {
      const result = await getAllGenres(api);
      return Array.isArray(result) ? result : [];
    },
    queryKey: ["genres"],
    staleTime: 60 * 60 * 1000,
  });

  const descriptionLength = useMemo(
    () => plainText(description).length,
    [description],
  );
  const tooLong = descriptionLength > MAX_DESCRIPTION;
  const canSave =
    name.trim().length > 0 &&
    !tooLong &&
    !saving &&
    !deleting &&
    !crop.uploading;

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
    const result = await write.saveStory({
      avatar,
      description: description.trim() ? description : null,
      events: [],
      fandom,
      genres,
      id,
      image: avatar?.src ?? null,
      isPublic,
      members,
      name: name.trim(),
      // Round-tripped, never set here: the book cuts its own pages now.
      pageFormat: story?.pageFormat ?? null,
      tags: story?.tags ?? [],
    });
    setSaving(false);

    if ("message" in result) {
      Alert.alert(
        "Could not save",
        result.reason || "The story was not saved. Please try again.",
      );
      return;
    }
    dropUploads(result.story.avatar?.src ?? result.story.image);
    onSaved(result.story, !id);
    onClose();
  };

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert(
      `Delete ${name.trim() || "this story"}?`,
      "This permanently removes the story, its chapters and all threads. Are you sure?",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setDeleting(true);
            const ok = await write.deleteStory(id);
            setDeleting(false);
            if (!ok) {
              Alert.alert(
                "Could not delete",
                "The story was not deleted. Please try again.",
              );
              return;
            }
            dropUploads();
            onDeleted?.(id);
            onClose();
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const requestClose = () => {
    if (!dirty) {
      dropUploads();
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

  const toggleGenre = (genre: Genre) => {
    const picked = genres.some((g) => g.id === genre.id);
    if (picked) {
      edit(setGenres)(genres.filter((g) => g.id !== genre.id));
    } else if (genres.length < MAX_GENRES) {
      edit(setGenres)([...genres, genre]);
    }
  };

  const cover = wsrvImage(avatar?.src, { fit: "inside", h: 600, w: 400 });
  const preview = useMemo(() => plainText(description), [description]);
  const atGenreLimit = genres.length >= MAX_GENRES;
  const allGenres = catalogue.data ?? [];
  const collapsible = allGenres.length > COLLAPSED_GENRES;
  const pickedIds = new Set(genres.map((g) => g.id));
  // While collapsed, a chosen genre past the cut still shows — web's rule.
  const visibleGenres =
    showAllGenres || !collapsible
      ? allGenres
      : allGenres.filter(
          (genre, index) => index < COLLAPSED_GENRES || pickedIds.has(genre.id),
        );
  const hiddenGenres = allGenres.length - visibleGenres.length;

  const subtitle = id
    ? isPublic
      ? "Published · anyone can read it"
      : "Members only"
    : "Draft · not yet published";

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
            <View style={styles.titles}>
              <Text
                numberOfLines={1}
                style={[styles.title, { color: theme.text }]}
              >
                {id ? "Edit story" : "New story"}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.subtitle, { color: theme.textGray }]}
              >
                {subtitle}
              </Text>
            </View>
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
                  {id ? "Save" : "Create"}
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
                  Shown on story cards and the header
                </Text>
                <View style={styles.buttons}>
                  <PillButton
                    busy={crop.uploading}
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

            {/* ── Visibility ────────────────────────────────────────────── */}
            <Section label="Visibility">
              <SegmentedTabs<Visibility>
                onChange={(value) => edit(setIsPublic)(value === "public")}
                options={VISIBILITY}
                value={isPublic ? "public" : "members"}
              />
              <Text style={[styles.hint, { color: theme.textGray }]}>
                {isPublic
                  ? "Anyone can read this story. You can switch it back to members-only anytime."
                  : "Only members can read and write. You can publish it later."}
              </Text>
            </Section>

            {/* ── Title ─────────────────────────────────────────────────── */}
            <TextField
              counterMax={MAX_NAME}
              hint={creatorUsername ? `Author: @${creatorUsername}` : undefined}
              label="Title"
              maxLength={MAX_NAME}
              onChangeText={edit(setName)}
              placeholder="Story name"
              value={name}
            />

            {/* ── Description ───────────────────────────────────────────── */}
            <Section
              aside={`${descriptionLength}/${MAX_DESCRIPTION}`}
              asideError={tooLong}
              label="Description (optional)"
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
                  {preview || "Set the scene for your story…"}
                </Text>
                <Ionicons
                  color={theme.textGray}
                  name="create-outline"
                  size={18}
                />
              </Pressable>
            </Section>

            {/* ── Fandom ────────────────────────────────────────────────── */}
            <Section
              action={
                fandom?.id
                  ? { label: "Clear", onPress: () => edit(setFandom)(null) }
                  : undefined
              }
              label="Fandom (optional)"
            >
              <Pressable
                accessibilityHint="Opens the fandom search"
                accessibilityLabel={
                  fandom?.id
                    ? `Fandom: ${fandomLabel(fandom)}`
                    : "Choose a fandom"
                }
                accessibilityRole="button"
                onPress={() => setSheet("fandom")}
                style={({ pressed }) => [
                  styles.box,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : theme.glass.field,
                    borderColor: theme.glass.fieldEdge,
                  },
                ]}
              >
                {fandom?.id ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          asColor(fandom.color) ?? theme.material.edge,
                      },
                    ]}
                  />
                ) : (
                  <Ionicons color={theme.textGray} name="search" size={16} />
                )}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.boxText,
                    { color: fandom?.id ? theme.text : theme.textGray },
                  ]}
                >
                  {fandom?.id
                    ? fandomLabel(fandom)
                    : "Search and select a fandom…"}
                </Text>
                <Ionicons
                  color={theme.textGray}
                  name="chevron-down"
                  size={16}
                />
              </Pressable>
            </Section>

            {/* ── Genres ────────────────────────────────────────────────── */}
            <Section
              aside={`${genres.length}/${MAX_GENRES}`}
              asideError={atGenreLimit}
              label="Genres"
            >
              {catalogue.isPending ? (
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  Loading genres…
                </Text>
              ) : allGenres.length === 0 ? (
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  No genres available.
                </Text>
              ) : (
                <>
                  <View style={styles.pills}>
                    {visibleGenres.map((genre) => {
                      const picked = pickedIds.has(genre.id);
                      const color = asColor(genre.color) ?? theme.accent.solid;
                      const muted = !picked && atGenreLimit;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{
                            disabled: muted,
                            selected: picked,
                          }}
                          disabled={muted}
                          key={genre.id}
                          onPress={() => toggleGenre(genre)}
                          style={({ pressed }) => [
                            styles.pill,
                            {
                              backgroundColor: picked
                                ? withAlpha(color, 0.22)
                                : pressed
                                  ? theme.glass.fillPressed
                                  : theme.material.fillTranslucent,
                              borderColor: picked
                                ? color
                                : theme.material.edgeTranslucent,
                              opacity: muted ? 0.45 : 1,
                            },
                          ]}
                        >
                          <View
                            style={[styles.dot, { backgroundColor: color }]}
                          />
                          <Text
                            style={[
                              styles.pillLabel,
                              { color: picked ? theme.text : theme.textGray },
                            ]}
                          >
                            {genre.label}
                          </Text>
                          {picked ? (
                            <Ionicons
                              color={color}
                              name="checkmark"
                              size={14}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                  {collapsible ? (
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={space.xs}
                      onPress={() => setShowAllGenres((v) => !v)}
                      style={styles.showAll}
                    >
                      <Text
                        style={[
                          styles.showAllLabel,
                          { color: theme.accent.text },
                        ]}
                      >
                        {showAllGenres
                          ? "Show less"
                          : `Show all${hiddenGenres > 0 ? ` (+${hiddenGenres})` : ""}`}
                      </Text>
                      <Ionicons
                        color={theme.accent.text}
                        name={showAllGenres ? "chevron-up" : "chevron-down"}
                        size={14}
                      />
                    </Pressable>
                  ) : null}
                  <Text style={[styles.hint, { color: theme.textGray }]}>
                    {atGenreLimit
                      ? `You've reached the maximum of ${MAX_GENRES} genres.`
                      : `Pick up to ${MAX_GENRES} genres that fit your story.`}
                  </Text>
                </>
              )}
            </Section>

            {/* ── Members ───────────────────────────────────────────────── */}
            {id ? (
              <Section label="Members">
                <Pressable
                  accessibilityHint="Opens the members list"
                  accessibilityLabel={`${members.length} ${members.length === 1 ? "member" : "members"}`}
                  accessibilityRole="button"
                  onPress={() => setSheet("members")}
                  style={({ pressed }) => [
                    styles.box,
                    {
                      backgroundColor: pressed
                        ? theme.glass.fillPressed
                        : theme.glass.field,
                      borderColor: theme.glass.fieldEdge,
                    },
                  ]}
                >
                  <View style={styles.stack}>
                    {members.slice(0, 4).map((member, index) => (
                      <View
                        key={member.username}
                        style={[
                          styles.stackFace,
                          {
                            borderColor: theme.glass.field,
                            marginLeft: index === 0 ? 0 : -10,
                          },
                        ]}
                      >
                        <Avatar
                          name={member.username}
                          size={28}
                          uri={member.image}
                          username={member.username}
                        />
                      </View>
                    ))}
                  </View>
                  <View style={styles.songText}>
                    <Text style={[styles.songTitle, { color: theme.text }]}>
                      {members.length}{" "}
                      {members.length === 1 ? "member" : "members"}
                    </Text>
                    <Text style={[styles.hint, { color: theme.textGray }]}>
                      Manage roles & invites
                    </Text>
                  </View>
                  <Ionicons
                    color={theme.textGray}
                    name="chevron-forward"
                    size={16}
                  />
                </Pressable>
              </Section>
            ) : null}

            {/* ── Delete ────────────────────────────────────────────────── */}
            {id && isCreator ? (
              <View
                style={[
                  styles.danger,
                  {
                    backgroundColor: theme.tones.danger.fill,
                    borderColor: withAlpha(theme.error, 0.35),
                  },
                ]}
              >
                <View style={styles.songText}>
                  <Text style={[styles.songTitle, { color: theme.text }]}>
                    Delete this story
                  </Text>
                  <Text style={[styles.hint, { color: theme.textGray }]}>
                    Permanently removes the story, its chapters and all threads.
                  </Text>
                </View>
                <PillButton
                  busy={deleting}
                  icon="trash-outline"
                  label="Delete"
                  onPress={confirmDelete}
                  tone="danger"
                />
              </View>
            ) : null}
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
              placeholder="Set the scene for your story…"
              ref={describing}
            />
          ) : null}
        </EditorModal>

        <FandomSheet
          current={fandom}
          onClose={() => setSheet(null)}
          onPick={edit(setFandom)}
          visible={sheet === "fandom"}
        />

        {id ? (
          <StoryMembersSheet
            creatorUsername={creatorUsername}
            members={members}
            onClose={() => setSheet(null)}
            onMembersChange={(next) => {
              setMembers(next);
              // Written already, by the sheet: keep the story page and the
              // shelf in step without waiting for Save.
              write.setMembers(id, next);
            }}
            storyId={id}
            visible={sheet === "members"}
          />
        ) : null}

        <ImageCropEditor
          aspect={2 / 3}
          autoFit={crop.autoFit}
          busy={crop.saving}
          initial={crop.initial}
          onClose={crop.close}
          onConfirm={(state) => void crop.confirm(state)}
          onReplace={() => void crop.replace()}
          title="Adjust story cover"
          uploading={crop.uploading}
          uri={crop.uri}
          visible={crop.visible}
        />
      </View>
    </Modal>
  );
};

const Section = ({
  action,
  aside,
  asideError = false,
  children,
  label,
}: {
  /** A small link at the end of the heading row — web's "Clear". */
  action?: { label: string; onPress: () => void };
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
        {action ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={action.onPress}
          >
            <Text style={[styles.showAllLabel, { color: theme.accent.text }]}>
              {action.label}
            </Text>
          </Pressable>
        ) : aside ? (
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
  danger: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.m,
  },
  dot: { borderRadius: radius.full, height: 10, width: 10 },
  form: { gap: space.md, padding: space.md, paddingBottom: space.xl },
  hint: { fontSize: fontSize.caption },
  pill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    minHeight: 34,
    paddingHorizontal: space.m,
    paddingVertical: space.xs,
  },
  pillLabel: { fontSize: fontSize.label, fontWeight: "600" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
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
  showAll: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 2,
  },
  showAllLabel: { fontSize: fontSize.label, fontWeight: "600" },
  songText: { flex: 1, gap: 1, minWidth: 0 },
  songTitle: { fontSize: fontSize.body, fontWeight: "600" },
  stack: { flexDirection: "row" },
  stackFace: { borderRadius: radius.full, borderWidth: 2 },
  subtitle: { fontSize: fontSize.caption, textAlign: "center" },
  title: { fontSize: fontSize.body, fontWeight: "700", textAlign: "center" },
  titles: { flex: 1, gap: 1, minWidth: 0 },
  topBar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
