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
import { capForType, uploadCapsHint } from "@nw/utils";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "@/components/image";
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
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  MusePanel,
  PANEL,
  SectionEmpty,
  SectionLabel,
  Shimmer,
} from "@/components/muse/panel";
import { AddButton } from "@/components/muse/sections/info";
import { Text } from "@/components/text";
import { useMuseMedia, useMuseMediaMetadata } from "@/hooks/use-muse";
import {
  alertMediaRejected,
  loadUploadCaps,
  pickMedia,
  uploadFile,
} from "@/lib/media-upload";
import type { MuseLook } from "@/lib/muse-appearance";
import { fontSize, radius, space } from "@/theme";

/**
 * Web's `GallerySection`: everything uploaded to this character.
 *
 * Web lays the pictures out in justified rows. On a 375pt screen three squares
 * to a row is the same density without the measuring, and a tap opens the
 * viewer — the full picture on black, with the neighbours a chevron away. A
 * clip plays in the same viewer through `ClipPlayer`, which the chat already
 * mounts for its own attachments.
 *
 * ## The owner's gallery
 *
 * Web's `UploadPanel` and `MediaCaption`, folded into the section and the
 * viewer (`media-viewer.tsx`): "Add media" picks several files at once and
 * uploads them one after another with a running count; in the viewer the
 * owner captions the picture and can delete it, and everyone can heart it —
 * the caption and the count come from the metadata endpoint, fetched when the
 * viewer first opens.
 *
 * Twenty files at most, thirty megabytes each — web's limits.
 */

const COLUMNS = 3;
const GAP = 6;
const MAX_TOTAL = 20;

export const MuseGallerySection = ({
  active,
  isOwnMuse,
  look,
  motion,
  muse,
}: {
  active: boolean;
  isOwnMuse: boolean;
  look: MuseLook;
  motion: boolean;
  muse: Muse | null;
}) => {
  const { accent } = look;
  const api = useApi();
  const queryClient = useQueryClient();
  const museId = muse?.id ?? "";
  const query = useMuseMedia(muse?.id ?? undefined, active);
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
  // Leaving the section, or the muse changing under it, ends the mode.
  useEffect(() => {
    if (!active || !isOwnMuse) selection.stop();
  }, [active, isOwnMuse, selection.stop]);

  // Captions and hearts: needed the first time the viewer opens, kept after.
  const [wantMeta, setWantMeta] = useState(false);
  useEffect(() => {
    if (open !== null) setWantMeta(true);
  }, [open]);
  const metadata = useMuseMediaMetadata(muse?.id ?? undefined, wantMeta);
  const metaByUrl = useMemo(() => {
    const map = new Map<string, MediaMetadata>();
    for (const meta of metadata.data ?? []) map.set(meta.mediaUrl, meta);
    return map;
  }, [metadata.data]);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next !== width) setWidth(next);
  };

  // Rounded down: a fractional tile (say 66.44pt) made three tiles and two
  // gaps come out a hair over the row, and the third wrapped — two columns.
  const tile =
    width > 0 ? Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS) : 0;
  const count = media?.length ?? 0;
  const remaining = MAX_TOTAL - count;

  const setMedia = (update: (list: string[]) => string[]) =>
    queryClient.setQueryData<string[]>(queryKeys.museMedia(museId), (list) =>
      update(list ?? []),
    );

  const upload = async () => {
    if (!museId || progress) return;
    if (remaining <= 0) {
      Alert.alert(
        "Gallery is full",
        `${MAX_TOTAL} files is the most a gallery holds.`,
      );
      return;
    }
    const picked = await pickMedia(remaining);
    if (picked.length === 0) return;
    // The service's cap per family (AWS_COST_SECURITY_PLAN.md D7); unknown
    // caps skip nothing here, and the upload check and service decide.
    const caps = await loadUploadCaps(api);
    const accepted = picked.filter(
      (file) => file.fileSize <= capForType(file.contentType, caps),
    );
    if (accepted.length < picked.length) {
      const hint = uploadCapsHint(caps, ["image", "video"]);
      Alert.alert(
        "Some files were skipped",
        `Files over the size limit${hint ? ` (${hint})` : ""} were left out.`,
      );
    }
    if (accepted.length === 0) return;

    setProgress({ done: 0, total: accepted.length });
    const urls: string[] = [];
    let rejected = 0;
    let refused = false;
    for (const file of accepted) {
      const result = await uploadFile(api, file, museId);
      if (result.url) urls.push(result.url);
      if (result.rejected) rejected += 1;
      setProgress((current) =>
        current ? { ...current, done: current.done + 1 } : current,
      );
      // Today's limit or a full storage refuses the rest of the batch too;
      // the person has been told, so stop rather than ask again per file.
      if (result.refused) {
        refused = true;
        break;
      }
    }

    if (urls.length > 0) {
      const result = await addMuseMedia(api, museId, urls);
      if (!result || result.message !== API_MESSAGE.Success) {
        // Storage has them but the muse does not: take them back out.
        for (const url of urls) void deleteMedia(api, url);
        Alert.alert("Not added", "The files could not be added. Try again.");
      } else {
        setMedia((list) => [...list, ...urls]);
      }
    }
    if (rejected > 0) {
      alertMediaRejected();
    } else if (!refused && urls.length < accepted.length) {
      Alert.alert("Upload failed", "Some files did not upload. Try again.");
    }
    setProgress(null);
  };

  const remove = (url: string) => {
    Alert.alert(
      "Delete media?",
      "This will permanently remove the file from your gallery. This action cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setOpen(null);
            setMedia((list) => list.filter((u) => u !== url));
            const result = await deleteMuseMedia(api, museId, url);
            if (!result || result.message !== API_MESSAGE.Success) {
              Alert.alert("Not deleted", "Try again in a moment.");
              await query.refetch();
              return;
            }
            void deleteMedia(api, url);
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  /** The selected tiles, confirmed once and deleted one after another. */
  const removeSelected = () => {
    const urls = [...selection.selected];
    if (!museId || urls.length === 0 || deleting) return;
    const noun = urls.length === 1 ? "file" : `${urls.length} files`;
    Alert.alert(
      `Delete ${noun}?`,
      `This will permanently remove ${urls.length === 1 ? "the file" : "these files"} from your gallery. This action cannot be undone.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setDeleting(true);
            setOpen(null);
            setMedia((list) => list.filter((u) => !urls.includes(u)));
            const failed = await deleteManyMuseMedia(api, museId, urls);
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
          text: "Delete",
        },
      ],
    );
  };

  const caption = async (url: string, description: string) => {
    const result = await editMediaDescription(api, museId, url, description);
    if (!result || "message" in result) return false;
    queryClient.setQueryData<MediaMetadata[]>(
      [...queryKeys.museMedia(museId), "metadata"],
      (list) => {
        const rest = (list ?? []).filter((m) => m.mediaUrl !== url);
        return [...rest, result as MediaMetadata];
      },
    );
    return true;
  };

  // The heart, into the same list the caption goes into — so a like given in
  // the viewer is still there when it is reopened, without a refetch.
  const react = (
    url: string,
    next: { reacted: boolean; reactions: number },
  ) => {
    queryClient.setQueryData<MediaMetadata[]>(
      [...queryKeys.museMedia(museId), "metadata"],
      (list) =>
        (list ?? []).map((m) =>
          m.mediaUrl === url
            ? { ...m, reacted: next.reacted, reactionCount: next.reactions }
            : m,
        ),
    );
  };

  return (
    <>
      <MusePanel
        accent={accent}
        hideBackground={look.hideExpandedBackground}
        header={
          <>
            <MiniHeader look={look} muse={muse} />
            <Divider accent={accent} />
            <SectionLabel
              trailing={
                isOwnMuse && media ? (
                  progress ? (
                    <View style={styles.progress}>
                      <ActivityIndicator color={PANEL.secondary} size="small" />
                      <Text style={styles.progressLabel}>
                        {progress.done} / {progress.total}
                      </Text>
                    </View>
                  ) : selection.selecting ? undefined : (
                    <AddButton
                      label={remaining > 0 ? "Add media" : "Full"}
                      onPress={() => void upload()}
                    />
                  )
                ) : undefined
              }
            >
              Gallery
            </SectionLabel>
          </>
        }
      >
        {/*
          Its own line, not beside the heading: with Add media there as well
          the row ran out and Select ended up against the word Gallery.
        */}
        {isOwnMuse && media && media.length > 0 && !selection.selecting ? (
          <View style={styles.toolRow}>
            <Text style={styles.toolCount}>
              {count} of {MAX_TOTAL}
            </Text>
            <SelectButton dark onPress={() => selection.start()} />
          </View>
        ) : null}

        {selection.selecting && media ? (
          <View style={styles.selectionBar}>
            <SelectionBar
              busy={deleting}
              count={selection.selected.size}
              dark
              onCancel={selection.stop}
              onClear={selection.clear}
              onDelete={removeSelected}
              onSelectAll={() => selection.selectAll(media)}
              total={media.length}
            />
          </View>
        ) : null}

        {!media ? (
          <View style={styles.grid}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Shimmer height={100} key={index} width="31%" />
            ))}
          </View>
        ) : media.length === 0 ? (
          <SectionEmpty
            accent={accent}
            label="No media yet."
            motion={motion}
            scene="empty-gallery"
          />
        ) : (
          <View onLayout={onLayout} style={styles.grid}>
            {tile > 0
              ? media.map((url, index) => {
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
                      // The owner's long press is the quick way in: select
                      // mode, with this tile already chosen.
                      onLongPress={() => {
                        if (isOwnMuse && !selection.selecting) {
                          selection.start(url);
                        }
                      }}
                      onPress={() =>
                        selection.selecting
                          ? selection.toggle(url)
                          : setOpen(index)
                      }
                      style={({ pressed }) => [
                        styles.tile,
                        {
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
                        <>
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
                          {isGifUrl(url) ? (
                            <View style={styles.badge}>
                              <Text style={styles.badgeLabel}>GIF</Text>
                            </View>
                          ) : null}
                          {/* Web shows the owner what each one is used for. */}
                          {isOwnMuse && muse ? (
                            <View style={styles.inUse}>
                              {inUseLabels(url, muse).map((label) => (
                                <View key={label} style={styles.badgeInline}>
                                  <Text style={styles.badgeLabel}>{label}</Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </>
                      )}
                      {selection.selecting ? (
                        <SelectMark
                          accent={accent ?? "#ffffff"}
                          selected={chosen}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              : null}
          </View>
        )}
      </MusePanel>

      <MediaViewer
        index={open}
        isOwner={isOwnMuse}
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

/** Web's tile badges: what this file is doing for the character now. */
const inUseLabels = (url: string, muse: Muse) => {
  const labels: string[] = [];
  if (muse.image === url || muse.avatar?.src === url) labels.push("Avatar");
  if (muse.cardBackground?.src === url) labels.push("Card BG");
  if (muse.wallpaper?.src === url) labels.push("Wallpaper");
  return labels;
};

const styles = StyleSheet.create({
  badgeInline: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: radius.xs,
    paddingHorizontal: space.xs,
    paddingVertical: 1,
  },
  inUse: {
    bottom: space.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    left: space.xs,
    position: "absolute",
    right: space.xs,
  },
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
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  fill: { height: "100%", width: "100%" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    width: "100%",
  },
  progress: { alignItems: "center", flexDirection: "row", gap: space.s },
  progressLabel: {
    color: PANEL.secondary,
    fontSize: fontSize.meta,
    fontWeight: "600",
  },
  selectionBar: { marginBottom: space.m },
  tile: {
    backgroundColor: PANEL.shimmer,
    borderRadius: 6,
    overflow: "hidden",
  },
  toolCount: {
    color: PANEL.secondary,
    fontSize: fontSize.caption,
    fontWeight: "500",
  },
  toolRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: space.m,
    width: "100%",
  },
  video: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
  },
});
