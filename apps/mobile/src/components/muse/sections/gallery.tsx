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
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { useMuseMedia, useMuseMediaMetadata } from "@/hooks/use-muse";
import { MAX_GALLERY_BYTES, pickMedia, uploadFile } from "@/lib/media-upload";
import type { MuseLook } from "@/lib/muse-appearance";
import { radius } from "@/theme";

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

  const tile = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;
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
    const accepted = picked.filter(
      (file) => file.fileSize <= MAX_GALLERY_BYTES,
    );
    if (accepted.length < picked.length) {
      Alert.alert("Some files were skipped", "Files over 30 MB were left out.");
    }
    if (accepted.length === 0) return;

    setProgress({ done: 0, total: accepted.length });
    const urls: string[] = [];
    for (const file of accepted) {
      const url = await uploadFile(api, file, museId);
      if (url) urls.push(url);
      setProgress((current) =>
        current ? { ...current, done: current.done + 1 } : current,
      );
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
    if (urls.length < accepted.length) {
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
      <MusePanel accent={accent} hideBackground={look.hideExpandedBackground}>
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
              ) : (
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
              ? media.map((url, index) => (
                  <Pressable
                    accessibilityLabel={
                      isVideoUrl(url) ? "Play video" : "Open picture"
                    }
                    accessibilityRole="imagebutton"
                    key={url}
                    onPress={() => setOpen(index)}
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
                      </>
                    )}
                  </Pressable>
                ))
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

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    bottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    position: "absolute",
    right: 4,
  },
  badgeLabel: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  fill: { height: "100%", width: "100%" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    width: "100%",
  },
  progress: { alignItems: "center", flexDirection: "row", gap: 6 },
  progressLabel: { color: PANEL.secondary, fontSize: 11, fontWeight: "600" },
  tile: {
    backgroundColor: PANEL.shimmer,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  video: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
  },
});
