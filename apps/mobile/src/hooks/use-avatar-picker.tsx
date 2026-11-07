import type { NWImage } from "@nw/types";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActionMenu } from "@/components/action-menu";
import { GifGrid, StickerGrid } from "@/components/chat/media-picker";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { BottomSheet } from "@/components/sheet";
import type { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { space } from "@/theme";

type Library = "gif" | "sticker";

/**
 * Where your avatar comes from: the phone, or the GIF and sticker library —
 * web's `AvatarPickerDialog`.
 *
 * With no picture yet the choice comes first. With one, the crop editor opens on
 * it as ever, and offers the library beside "Choose another". A library pick
 * goes through the same crop as a photo, so every avatar is framed the same way.
 *
 * `sheets` is the menu and the tray, for the caller to mount.
 */
export const useAvatarPicker = (flow: ReturnType<typeof useImageCropFlow>) => {
  const [choosing, setChoosing] = useState(false);
  const [library, setLibrary] = useState<Library | null>(null);
  const [tab, setTab] = useState<Library>("gif");
  /** The pick, held until the tray has gone: iOS stacks no modal on a leaving one. */
  const picked = useRef<string | null>(null);

  const open = useCallback(
    (existing: NWImage | null | undefined) => {
      if (existing?.src) flow.open(existing);
      else setChoosing(true);
    },
    [flow],
  );

  const openLibrary = useCallback(() => {
    flow.close();
    setTab("gif");
    setLibrary("gif");
  }, [flow]);

  const pick = (url: string) => {
    picked.current = url;
    setLibrary(null);
  };

  const sheets = (
    <>
      <ActionMenu
        items={[
          {
            icon: "image-outline",
            label: "From your device",
            onSelect: () => flow.open(null),
          },
          {
            icon: "happy-outline",
            label: "GIF or sticker",
            onSelect: openLibrary,
          },
        ]}
        onClose={() => setChoosing(false)}
        title="Choose an avatar"
        visible={choosing}
      />
      <BottomSheet
        fill
        maxHeightRatio={0.85}
        onClose={() => setLibrary(null)}
        onDismissed={() => {
          const url = picked.current;
          picked.current = null;
          if (url) flow.openUrl(url);
        }}
        title="Pick from the library"
        visible={library !== null}
      >
        <View style={styles.tabs}>
          <SegmentedTabs<Library>
            onChange={setTab}
            options={[
              { label: "GIFs", value: "gif" },
              { label: "Stickers", value: "sticker" },
            ]}
            value={tab}
          />
        </View>
        <View style={styles.grid}>
          {tab === "gif" ? (
            <GifGrid onSelect={pick} />
          ) : (
            <StickerGrid onSelect={pick} />
          )}
        </View>
      </BottomSheet>
    </>
  );

  return { open, openLibrary, sheets };
};

const styles = StyleSheet.create({
  grid: { flex: 1 },
  tabs: { paddingBottom: space.sm, paddingHorizontal: space.md },
});
