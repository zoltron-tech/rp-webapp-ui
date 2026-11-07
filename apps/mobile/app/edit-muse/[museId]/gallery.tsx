import { Ionicons } from "@expo/vector-icons";
import {
  addMuseMedia,
  deleteMuseMedia,
  editMediaDescription,
} from "@nw/api/endpoints/muse";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { queryKeys, useApi } from "@nw/features";
import { API_MESSAGE, type Muse } from "@nw/types";
import type { MediaMetadata } from "@nw/types/activity";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "@/components/image";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MuseGate, useOwnedMuse } from "@/components/edit-muse/shared";
import {
  deleteManyMuseMedia,
  SelectButton,
  SelectionBar,
  SelectMark,
  useMediaSelection,
} from "@/components/muse/media-selection";
import {
  isGifUrl,
  isVideoUrl,
  MediaViewer,
} from "@/components/muse/media-viewer";
import { Notice, PillButton, SettingsGroup } from "@/components/settings";
import { useMuseMedia, useMuseMediaMetadata } from "@/hooks/use-muse";
import {
  alertMediaRejected,
  MAX_GALLERY_BYTES,
  pickMedia,
  uploadFile,
} from "@/lib/media-upload";
import { fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * Web's `GallerySection`: upload new media, manage what is there.
 *
 * Web stages files and uploads them with a button; a phone's picker is
 * already the staging step, so "Add media" uploads what was picked, with a
 * running count. Tapping a tile opens the viewer the profile uses, where the
 * owner captions a picture or deletes it. Deleting something the character is
 * wearing — the avatar, the wallpaper, the card — says so first, as on web,
 * because it will not change those fields for you.
 */

const COLUMNS = 3;
const GAP = 6;
const MAX_TOTAL = 20;

/** Web's `getInUseLabels`: what this file is doing for the character now. */
const inUseLabels = (url: string, muse: Muse) => {
  const labels: string[] = [];
  if (muse.image === url || muse.avatar?.src === url) labels.push("avatar");
  if (muse.wallpaper?.src === url) labels.push("wallpaper");
  if (muse.cardBackground?.src === url) labels.push("card image");
  return labels;
};

export default function EditMuseGallery() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Gallery muse={muse} />}
    </MuseGate>
  );
}

const Gallery = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const id = muse.id ?? "";
  const query = useMuseMedia(id, true);
  const media = query.data;
  const [open, setOpen] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  // Select mode: several tiles chosen, deleted together. See `media-selection`.
  const selection = useMediaSelection();
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (media) selection.retain(media);
  }, [media, selection.retain]);

  const [wantMeta, setWantMeta] = useState(false);
  useEffect(() => {
    if (open !== null) setWantMeta(true);
  }, [open]);
  const metadata = useMuseMediaMetadata(id, wantMeta);
  const metaByUrl = useMemo(() => {
    const map = new Map<string, MediaMetadata>();
    for (const meta of metadata.data ?? []) map.set(meta.mediaUrl, meta);
    return map;
  }, [metadata.data]);

  const count = media?.length ?? 0;
  const remaining = MAX_TOTAL - count;
  const tile = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const setMedia = (update: (list: string[]) => string[]) =>
    queryClient.setQueryData<string[]>(queryKeys.museMedia(id), (list) =>
      update(list ?? []),
    );

  const upload = async () => {
    if (progress) return;
    if (remaining <= 0) {
      Alert.alert(
        "Gallery is full",
        `${MAX_TOTAL} files is the most a gallery holds. Delete some to upload more.`,
      );
      return;
    }
    const picked = await pickMedia(remaining);
    if (picked.length === 0) return;
    const accepted = picked.filter((file) => file.fileSize <= MAX_GALLERY_BYTES);
    if (accepted.length < picked.length) {
      Alert.alert("Some files were skipped", "Files over 30 MB were left out.");
    }
    if (accepted.length === 0) return;

    setProgress({ done: 0, total: accepted.length });
    const urls: string[] = [];
    let rejected = 0;
    for (const file of accepted) {
      const result = await uploadFile(api, file, id);
      if (result.url) urls.push(result.url);
      if (result.rejected) rejected += 1;
      setProgress((current) =>
        current ? { ...current, done: current.done + 1 } : current,
      );
    }
    if (urls.length > 0) {
      const result = await addMuseMedia(api, id, urls);
      if (!result || result.message !== API_MESSAGE.Success) {
        for (const url of urls) void deleteMedia(api, url);
        Alert.alert("Not added", "The files could not be added. Try again.");
      } else {
        setMedia((list) => [...list, ...urls]);
      }
    }
    if (rejected > 0) {
      alertMediaRejected();
    } else if (urls.length < accepted.length) {
      Alert.alert("Upload failed", "Some files did not upload. Try again.");
    }
    setProgress(null);
  };

  const remove = (url: string) => {
    const labels = inUseLabels(url, muse);
    Alert.alert(
      labels.length > 0 ? "Media is in use" : "Delete media?",
      labels.length > 0
        ? `This is used as the ${labels.join(" and ")}. Deleting it removes it from the gallery but won't change those fields. Delete anyway?`
        : "This will permanently remove the file from the gallery. This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setOpen(null);
            setMedia((list) => list.filter((u) => u !== url));
            const result = await deleteMuseMedia(api, id, url);
            if (!result || result.message !== API_MESSAGE.Success) {
              Alert.alert("Not deleted", "Try again in a moment.");
              await query.refetch();
              return;
            }
            void deleteMedia(api, url);
          },
          style: "destructive",
          text: labels.length > 0 ? "Delete anyway" : "Delete",
        },
      ],
    );
  };

  /** The selected tiles, confirmed once and deleted one after another. */
  const removeSelected = () => {
    const urls = [...selection.selected];
    if (urls.length === 0 || deleting) return;
    const inUse = urls.filter((url) => inUseLabels(url, muse).length > 0);
    const noun = urls.length === 1 ? "file" : `${urls.length} files`;
    Alert.alert(
      inUse.length > 0 ? "Some media is in use" : `Delete ${noun}?`,
      inUse.length > 0
        ? `${inUse.length === 1 ? "One of these is" : `${inUse.length} of these are`} the character's avatar, wallpaper or card image. Deleting removes them from the gallery but won't change those fields. Delete ${noun} anyway?`
        : `This will permanently remove ${urls.length === 1 ? "the file" : "these files"} from the gallery. This cannot be undone.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setDeleting(true);
            setOpen(null);
            setMedia((list) => list.filter((u) => !urls.includes(u)));
            const failed = await deleteManyMuseMedia(api, id, urls);
            setDeleting(false);
            selection.stop();
            if (failed.length > 0) {
              Alert.alert(
                "Not all deleted",
                `${failed.length} of ${urls.length} could not be deleted. Try again in a moment.`,
              );
              await query.refetch();
            }
          },
          style: "destructive",
          text: inUse.length > 0 ? "Delete anyway" : "Delete",
        },
      ],
    );
  };

  const caption = async (url: string, description: string) => {
    const result = await editMediaDescription(api, id, url, description);
    if (!result || "message" in result) return false;
    queryClient.setQueryData<MediaMetadata[]>(
      [...queryKeys.museMedia(id), "metadata"],
      (list) => [
        ...(list ?? []).filter((m) => m.mediaUrl !== url),
        result as MediaMetadata,
      ],
    );
    return true;
  };

  const react = (url: string, next: { reacted: boolean; reactions: number }) =>
    queryClient.setQueryData<MediaMetadata[]>(
      [...queryKeys.museMedia(id), "metadata"],
      (list) =>
        (list ?? []).map((m) =>
          m.mediaUrl === url
            ? { ...m, reacted: next.reacted, reactionCount: next.reactions }
            : m,
        ),
    );

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <SettingsGroup
          footer={`PNG, JPG, GIF, WEBP or MP4, up to 30 MB each. ${MAX_TOTAL} files in all.`}
          title="Upload new media"
        >
          <View style={styles.uploadRow}>
            <View style={styles.uploadText}>
              <Text style={[styles.uploadTitle, { color: theme.text }]}>
                {remaining > 0
                  ? `Room for ${remaining} more ${remaining === 1 ? "file" : "files"}`
                  : "Gallery full"}
              </Text>
              <Text style={[styles.uploadHint, { color: theme.textGray }]}>
                {progress
                  ? `Uploading ${progress.done} of ${progress.total}…`
                  : "Pick several at once."}
              </Text>
            </View>
            <PillButton
              busy={progress !== null}
              disabled={remaining <= 0 || !media}
              icon="cloud-upload-outline"
              label="Add media"
              onPress={() => void upload()}
              tone="accent"
            />
          </View>
        </SettingsGroup>

        {selection.selecting && media ? (
          <SelectionBar
            busy={deleting}
            count={selection.selected.size}
            onCancel={selection.stop}
            onClear={selection.clear}
            onDelete={removeSelected}
            onSelectAll={() => selection.selectAll(media)}
            total={media.length}
          />
        ) : (
          <View style={styles.headerRow}>
            <Text style={[styles.groupTitle, { color: theme.textGray }]}>
              Current media{media ? ` · ${count}/${MAX_TOTAL}` : ""}
            </Text>
            {media && media.length > 0 ? (
              <SelectButton onPress={() => selection.start()} />
            ) : null}
          </View>
        )}

        {!media ? (
          <ActivityIndicator color={theme.primary} style={styles.spinner} />
        ) : media.length === 0 ? (
          <Notice>No media yet. Add some above.</Notice>
        ) : (
          <View
            onLayout={(event: LayoutChangeEvent) =>
              setWidth(event.nativeEvent.layout.width)
            }
            style={styles.grid}
          >
            {tile > 0
              ? media.map((url, index) => {
                  const labels = inUseLabels(url, muse);
                  const chosen = selection.selected.has(url);
                  return (
                    <Pressable
                      accessibilityLabel={
                        selection.selecting
                          ? `${chosen ? "Deselect" : "Select"} ${isVideoUrl(url) ? "video" : "picture"}`
                          : isVideoUrl(url)
                            ? "Play video"
                            : "Open picture"
                      }
                      accessibilityRole={
                        selection.selecting ? "checkbox" : "imagebutton"
                      }
                      accessibilityState={
                        selection.selecting ? { checked: chosen } : undefined
                      }
                      key={url}
                      // A long press is the quick way in: select mode, with
                      // this tile already chosen.
                      onLongPress={() => {
                        if (!selection.selecting) selection.start(url);
                      }}
                      onPress={() =>
                        selection.selecting
                          ? selection.toggle(url)
                          : setOpen(index)
                      }
                      style={({ pressed }) => [
                        styles.tile,
                        {
                          backgroundColor: theme.material.fillPressed,
                          height: tile,
                          opacity: pressed ? 0.75 : 1,
                          width: tile,
                        },
                      ]}
                    >
                      {isVideoUrl(url) ? (
                        <View style={[styles.fill, styles.video]}>
                          <Ionicons
                            color="rgba(255,255,255,0.9)"
                            name="play-circle"
                            size={28}
                          />
                        </View>
                      ) : (
                        <Image
                          cachePolicy="memory-disk"
                          contentFit="cover"
                          recyclingKey={url}
                          source={{
                            uri: wsrvImage(url, IMAGE_SIZES.COVER_MEDIUM),
                          }}
                          style={styles.fill}
                          transition={100}
                        />
                      )}
                      {isGifUrl(url) ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeLabel}>GIF</Text>
                        </View>
                      ) : null}
                      {labels.length > 0 ? (
                        <View style={styles.inUseStack}>
                          {labels.map((label) => (
                            <View key={label} style={styles.inUse}>
                              <Text numberOfLines={1} style={styles.badgeLabel}>
                                {label.toUpperCase()}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {selection.selecting ? (
                        <SelectMark
                          accent={theme.accent.solid}
                          selected={chosen}
                        />
                      ) : (
                        <Pressable
                          accessibilityLabel="Delete"
                          accessibilityRole="button"
                          hitSlop={6}
                          onPress={() => remove(url)}
                          style={styles.delete}
                        >
                          <Ionicons
                            color="#ffffff"
                            name="trash-outline"
                            size={13}
                          />
                        </Pressable>
                      )}
                    </Pressable>
                  );
                })
              : null}
          </View>
        )}
      </ScrollView>

      <MediaViewer
        index={open}
        isOwner
        media={media ?? []}
        metaByUrl={metaByUrl}
        onCaption={caption}
        onChange={setOpen}
        onClose={() => setOpen(null)}
        onDelete={remove}
        onReaction={react}
      />
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.xs,
    bottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    position: "absolute",
    right: 4,
  },
  badgeLabel: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  body: { gap: space.md, padding: space.m },
  delete: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: radius.full,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    top: 4,
    width: 26,
  },
  fill: { height: "100%", width: "100%" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  groupTitle: {
    ...type.eyebrow,
    paddingHorizontal: space.xs,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: space.xs,
  },
  inUseStack: {
    alignItems: "flex-start",
    gap: 2,
    left: 4,
    maxWidth: "70%",
    position: "absolute",
    top: 4,
  },
  inUse: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  spinner: { paddingVertical: space.lg },
  tile: { borderRadius: radius.sm, overflow: "hidden" },
  uploadHint: { fontSize: fontSize.caption },
  uploadRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    padding: space.md,
  },
  uploadText: { flex: 1, gap: space.xxs },
  uploadTitle: { fontSize: fontSize.body, fontWeight: "600" },
  video: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
  },
});
