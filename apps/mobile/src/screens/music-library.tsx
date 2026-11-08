import { syncMyBadges } from "@nw/api/endpoints/badges";
import {
  createSong,
  deleteSong,
  getOwnMusic,
  updateSong,
} from "@nw/api/endpoints/songs";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import type { Song } from "@nw/types/music";
import { uploadCapsHint } from "@nw/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { Button } from "@/components/button";
import { AudioCard } from "@/components/chat/audio-card";
import { EmptyScene } from "@/components/empty-feed";
import { IconButton } from "@/components/icon-button";
import { ListStatus } from "@/components/list-status";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { PillButton } from "@/components/settings";
import {
  FieldLabel,
  Hint,
  Swatches,
  useFieldStyle,
} from "@/components/story/form-bits";
import { Text, TextInput } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { withAlpha } from "@/lib/color";
import {
  type PickedMedia,
  pickAudio,
  pickedOversizeMessage,
  uploadFile,
} from "@/lib/media-upload";
import { CODEX_COLORS } from "@/lib/story-mesh";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Your songs — web's music tab and `EditMusicCard`.
 *
 * The list only ever shows your own: `getOwnMusic` answers for the caller, as
 * on web, so this is reached from your own menu and nobody else's profile.
 *
 * Badges are re-counted after an upload or a delete, as web does: holding a
 * song is what earns Musician. Songs play on the card, through the app's one
 * playback slot, rather than web's global player: a bar over every screen has
 * no room at this size, and leaving the screen stops a song as it stops a clip.
 */

const keyExtractor = (song: Song) => song.id;

interface DraftTag {
  color: string;
  label: string;
}

const SongEditor = ({
  onClose,
  onSaved,
  song,
  visible,
}: {
  onClose: () => void;
  onSaved: () => void;
  /** Null when uploading a new one. */
  song: Song | null;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  // The service's audio cap, for the hint; left out while unknown.
  const audioHint = uploadCapsHint(useUploadCaps(), ["audio"]);
  const fieldStyle = useFieldStyle();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<DraftTag[]>([]);
  const [tagLabel, setTagLabel] = useState("");
  const [tagColor, setTagColor] = useState<string>(CODEX_COLORS[0]);
  const [file, setFile] = useState<(PickedMedia & { name: string }) | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(song?.name ?? "");
    setDescription(song?.description ?? "");
    setTags((song?.tags ?? []).map(({ color, label }) => ({ color, label })));
    setTagLabel("");
    setFile(null);
    setError(null);
  }, [song, visible]);

  const choose = async () => {
    setError(null);
    const picked = await pickAudio().catch(() => undefined);
    if (picked === undefined) {
      setError("Uploading a song needs the newest version of the app.");
      return;
    }
    if (!picked) return;
    // The service's audio cap (AWS_COST_SECURITY_PLAN.md D7).
    const tooLarge = await pickedOversizeMessage(api, picked);
    if (tooLarge) {
      setError(tooLarge);
      return;
    }
    setFile(picked);
    if (!name.trim()) setName(picked.name.replace(/\.[^.]+$/, ""));
  };

  const addTag = () => {
    const label = tagLabel.trim();
    if (!label || tags.some((tag) => tag.label === label)) return;
    setTags((current) => [...current, { color: tagColor, label }]);
    setTagLabel("");
  };

  const trimmed = name.trim();

  const save = async () => {
    if (!trimmed || (!song && !file)) return;
    setBusy(true);
    setError(null);
    const input = {
      description: description.trim() || null,
      name: trimmed,
      tags,
    };

    let result: unknown;
    if (song) {
      result = await updateSong(api, song.id, input).catch(() => null);
    } else {
      // Audio: never screened, so never `rejected`. A refusal (size cap,
      // today's limit, storage full) has already been explained in an alert.
      const uploaded = file ? await uploadFile(api, file) : null;
      const url = uploaded?.url ?? null;
      if (!url) {
        setBusy(false);
        if (!uploaded?.refused) {
          setError("The song could not be uploaded. Please try again.");
        }
        return;
      }
      result = await createSong(api, { ...input, url }).catch(() => null);
    }
    setBusy(false);
    if (!result || result === API_MESSAGE.UncategorizedError) {
      setError("The song could not be saved. Please try again.");
      return;
    }
    onSaved();
  };

  return (
    <FormSheet
      busy={busy}
      canConfirm={Boolean(trimmed) && Boolean(song || file)}
      error={error}
      fill
      maxHeightRatio={0.85}
      onClose={onClose}
      onConfirm={() => void save()}
      title={song ? "Edit song" : "Upload a song"}
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {song ? null : (
          <>
            <Button
              icon="musical-notes-outline"
              label={file ? file.name : "Choose an audio file"}
              onPress={() => void choose()}
            />
            {audioHint ? <Hint>{`Audio files, ${audioHint}.`}</Hint> : null}
            {/* APP_STORE_REVIEW_PLAN.md M12: uploads are the uploader's
                responsibility, and they are told so before they pick a file. */}
            <Hint>
              Only upload music you made or have the rights to share. Songs that
              infringe someone's rights can be reported and removed.
            </Hint>
          </>
        )}
        <FieldLabel>Name</FieldLabel>
        <TextInput
          accessibilityLabel="Name"
          maxLength={100}
          onChangeText={setName}
          placeholderTextColor={theme.textGray}
          style={fieldStyle}
          value={name}
        />
        <FieldLabel>Description</FieldLabel>
        <TextInput
          accessibilityLabel="Description"
          maxLength={500}
          multiline
          onChangeText={setDescription}
          placeholderTextColor={theme.textGray}
          style={[fieldStyle, styles.description]}
          textAlignVertical="top"
          value={description}
        />
        <FieldLabel>Tags</FieldLabel>
        {tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.map((tag) => (
              <Pressable
                accessibilityLabel={`Remove tag ${tag.label}`}
                accessibilityRole="button"
                key={tag.label}
                onPress={() =>
                  setTags((current) =>
                    current.filter((item) => item.label !== tag.label),
                  )
                }
                style={[
                  styles.tag,
                  {
                    backgroundColor: withAlpha(tag.color, 0.18),
                    borderColor: tag.color,
                  },
                ]}
              >
                <Text style={[styles.tagLabel, { color: theme.text }]}>
                  {`${tag.label}  ×`}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.tagRow}>
          <TextInput
            accessibilityLabel="New tag"
            maxLength={30}
            onChangeText={setTagLabel}
            onSubmitEditing={addTag}
            placeholder="Add a tag"
            placeholderTextColor={theme.textGray}
            returnKeyType="done"
            style={[fieldStyle, styles.tagField]}
            value={tagLabel}
          />
          <IconButton
            accessibilityLabel="Add tag"
            disabled={!tagLabel.trim()}
            icon="add"
            onPress={addTag}
            size={36}
          />
        </View>
        <Swatches onChange={setTagColor} value={tagColor} />
      </ScrollView>
    </FormSheet>
  );
};

export const MusicLibraryScreen = () => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);
  const key = queryKeys.ownMusic();

  const query = useQuery({
    queryFn: async (): Promise<Song[]> => {
      const result = await getOwnMusic(api);
      if (!result) return [];
      if ("message" in result) throw new Error(String(result.message));
      return result;
    },
    queryKey: key,
  });
  const pull = usePullToRefresh(query.refetch);

  const [editor, setEditor] = useState<{ song: Song | null } | null>(null);
  const [menuFor, setMenuFor] = useState<Song | null>(null);

  /** A song came or went: Musician may have changed hands. */
  const afterChange = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: key });
    void syncMyBadges(api)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: queryKeys.myBadges() }),
      )
      .catch(() => undefined);
  }, [api, key, queryClient]);

  const remove = useCallback(
    (song: Song) =>
      Alert.alert(`Delete ${song.name}?`, "This cannot be undone.", [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            void deleteSong(api, song.id)
              .catch(() => null)
              .then((result) => {
                if (result?.message === API_MESSAGE.Success) afterChange();
                else Alert.alert("Not deleted", "Please try again.");
              });
          },
          style: "destructive",
          text: "Delete",
        },
      ]),
    [afterChange, api],
  );

  const items: ActionItem[] = menuFor
    ? [
        {
          icon: "create-outline",
          label: "Edit",
          onSelect: () => setEditor({ song: menuFor }),
        },
        { separator: true },
        {
          icon: "trash-outline",
          label: "Delete",
          onPress: () => {
            setMenuFor(null);
            remove(menuFor);
          },
          variant: "danger",
        },
      ]
    : [];

  const renderItem = useCallback(
    ({ item }: { item: Song }) => (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.material.fill,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <View style={styles.head}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {item.name}
          </Text>
          <IconButton
            accessibilityLabel={`Options for ${item.name}`}
            icon="ellipsis-horizontal"
            onPress={() => setMenuFor(item)}
            size={32}
          />
        </View>
        {item.description ? (
          <Text
            numberOfLines={2}
            style={[styles.body, { color: theme.textGray }]}
          >
            {item.description}
          </Text>
        ) : null}
        <AudioCard label={item.name} url={item.url} />
        {item.tags.length > 0 ? (
          <View style={styles.tags}>
            {item.tags.map((tag) => (
              <View
                key={tag.id || tag.label}
                style={[
                  styles.tag,
                  {
                    backgroundColor: withAlpha(tag.color, 0.18),
                    borderColor: tag.color,
                  },
                ]}
              >
                <Text style={[styles.tagLabel, { color: theme.text }]}>
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    ),
    [theme],
  );

  return (
    <View style={styles.fill}>
      <FlatList
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        data={query.data ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ListStatus
            empty={
              <EmptyScene
                scene="open-book"
                subtitle="Upload a song and it will show up here, ready to play on your profile."
                title="No songs yet"
              />
            }
            error={query.error}
            loading={query.isPending}
            onRetry={() => void query.refetch()}
          />
        }
        ListHeaderComponent={
          <View style={styles.tools}>
            <PillButton
              icon="cloud-upload-outline"
              label="Upload a new song"
              onPress={() => setEditor({ song: null })}
              tone="accent"
            />
          </View>
        }
        onRefresh={pull.onRefresh}
        refreshing={pull.refreshing}
        renderItem={renderItem}
      />

      <ActionMenu
        items={items}
        onClose={() => setMenuFor(null)}
        title={menuFor?.name ?? "Song"}
        visible={menuFor !== null}
      />
      <SongEditor
        onClose={() => setEditor(null)}
        onSaved={() => {
          setEditor(null);
          afterChange();
        }}
        song={editor?.song ?? null}
        visible={editor !== null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: { fontSize: fontSize.label, lineHeight: 19 },
  card: {
    borderRadius: radius.card,
    borderWidth: border.edge,
    gap: space.sm,
    padding: space.m,
  },
  content: { gap: space.m, padding: space.md },
  description: { minHeight: 72 },
  fill: { flex: 1 },
  form: { gap: space.sm, paddingBottom: space.xl },
  head: { alignItems: "center", flexDirection: "row", gap: space.sm },
  name: { flex: 1, fontSize: fontSize.body, fontWeight: "700" },
  tag: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  tagField: { flex: 1, minWidth: 0 },
  tagLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  tagRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  tools: { flexDirection: "row" },
});
