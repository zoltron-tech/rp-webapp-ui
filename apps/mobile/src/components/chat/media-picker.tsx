import { SCRIM_ALPHA } from "@nw/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { rememberPreview } from "@/components/chat/message-media";
import {
  type MediaSearch,
  useClipSearch,
  useGifSearch,
  useStickerSearch,
} from "@/hooks/use-media-search";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The GIF, sticker and clip grids, as they appear inside the composer's tray.
 *
 * All three are the same screen — a search field over a grid of tappable
 * thumbnails that pages as you scroll — so they are one component with three
 * thin wrappers. The differences that remain are real ones: stickers are
 * transparent and get no tile behind them, and a clip is a video whose
 * thumbnail needs to say so.
 *
 * ## Tap sends
 *
 * Web's desktop clip dialog makes you select a clip and then press Send,
 * because it also gives you a player with a scrub bar. On a phone the tray is
 * already a deliberate two-step (open the tray, choose a thing), and a third
 * step to confirm is the sort of friction that makes people give up on sending
 * a GIF at all. Every grid here sends on tap and closes the tray.
 *
 * ## Columns are computed, not fixed
 *
 * At the 375pt baseline a three-column grid of GIFs gives ~110pt tiles, which
 * is about the smallest a GIF can be and still be recognisable. Rather than
 * hardcode three and let a larger phone show the same three enormous tiles, the
 * column count comes from the width divided by a target tile size.
 */

/** Roughly the tile size each grid aims for, before the width is divided up. */
const TARGET_TILE = { clip: 150, gif: 118, sticker: 96 };

/** Fires `loadMore` this far (in screens) from the end of the grid. */
const END_THRESHOLD = 0.6;

interface GridItem {
  id: string;
  previewUrl: string;
  sendUrl: string;
  title: string;
}

const SearchField = ({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.searchRow}>
      <View
        style={[
          styles.search,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.glass.edge,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name="search" size={16} />
        <TextInput
          // Never autofocused. The tray opens *because* the keyboard was
          // dismissed to make room for it; focusing the field here brings the
          // keyboard straight back over the grid the tray just opened to show.
          autoCorrect={false}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textGray}
          returnKeyType="search"
          style={[styles.searchInput, { color: theme.text }]}
          value={value}
        />
        {value ? (
          <Pressable
            accessibilityLabel="Clear search"
            hitSlop={space.sm}
            onPress={() => onChange("")}
          >
            <Ionicons color={theme.textGray} name="close-circle" size={16} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const MediaGrid = <TItem,>({
  emptyLabel,
  kind,
  onSelect,
  placeholder,
  search,
  toItem,
}: {
  emptyLabel: string;
  kind: keyof typeof TARGET_TILE;
  onSelect: (url: string) => void;
  placeholder: string;
  search: MediaSearch<TItem>;
  toItem: (item: TItem) => GridItem;
}) => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();

  // The tray is full-bleed, so the grid's width is the screen's less its own
  // padding. Two is the floor: a single-column grid of GIFs is a list.
  const available = width - space.sm * 2;
  const columns = Math.max(2, Math.round(available / TARGET_TILE[kind]));
  const tile = available / columns - space.xs;

  const renderItem = useCallback(
    ({ item }: { item: TItem }) => {
      const entry = toItem(item);
      return (
        <Pressable
          accessibilityLabel={entry.title || "Send"}
          accessibilityRole="button"
          onPress={() => {
            // The bubble paints this while the full file downloads.
            rememberPreview(entry.sendUrl, entry.previewUrl);
            onSelect(entry.sendUrl);
          }}
          style={({ pressed }) => [
            styles.cell,
            {
              // Stickers are transparent by design; a tile behind them turns
              // that transparency into a grey card the artist never drew.
              backgroundColor:
                kind === "sticker" ? "transparent" : theme.glass.fillHover,
              height: tile,
              opacity: pressed ? 0.6 : 1,
              width: tile,
            },
          ]}
        >
          {/* React Native's image, deliberately. Measured against expo-image
              on a fling through the sticker tray, Fresco animating a screen of
              transparent webps missed ~20% of frames and Glide ~35%. What
              helped was drawing fewer of them — see the list's window. */}
          <Image
            resizeMode={kind === "sticker" ? "contain" : "cover"}
            source={{ uri: entry.previewUrl }}
            style={styles.thumb}
          />
          {kind === "clip" ? (
            <View style={styles.clipBadge}>
              <Ionicons color="#ffffff" name="play" size={12} />
            </View>
          ) : null}
        </Pressable>
      );
    },
    [kind, onSelect, theme.glass.fillHover, tile, toItem],
  );

  return (
    <View style={styles.body}>
      <SearchField
        onChange={search.setQuery}
        placeholder={placeholder}
        value={search.query}
      />

      {/*
        A thread-thin progress line, rather than replacing the grid.

        Every keystroke starts a new search. Swapping the results for a spinner
        each time makes the tray flash white while you type a word, and the
        result you were about to tap disappears from under your thumb. The old
        results stay put, dimmed, until the new ones are ready.
      */}
      {search.loading && search.items.length > 0 ? (
        <View
          style={[styles.progress, { backgroundColor: theme.accent.solid }]}
        />
      ) : null}

      {search.loading && search.items.length === 0 ? (
        // First load of a query with nothing to keep: tinted tiles in the
        // grid's own geometry, so the layout does not jump when they fill in.
        <View style={styles.skeleton}>
          {Array.from({ length: columns * 3 }).map((_, index) => (
            <View
              // Placeholders have no identity; the index is all there is.
              key={`skeleton-${index}`}
              style={[
                styles.cell,
                {
                  backgroundColor: theme.glass.fillHover,
                  height: tile,
                  width: tile,
                },
              ]}
            />
          ))}
        </View>
      ) : (
        <FlatList
          columnWrapperStyle={columns > 1 ? styles.column : undefined}
          contentContainerStyle={styles.grid}
          data={search.items}
          // The column count is part of the layout, so a width change has to
          // remount the list — `numColumns` cannot change on a live FlatList.
          key={`${kind}-${columns}`}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => toItem(item).id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                color={theme.glass.edge}
                name="search-outline"
                size={32}
              />
              <Text style={[styles.emptyLabel, { color: theme.textGray }]}>
                {emptyLabel}
              </Text>
              {/* The way out of a dead end. Without it the only move is to
                  select the field and delete a word at a time. */}
              {search.query ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => search.setQuery("")}
                  style={({ pressed }) => [
                    styles.emptyAction,
                    {
                      backgroundColor: pressed
                        ? theme.glass.fillPressed
                        : theme.glass.fillHover,
                      borderColor: theme.glass.edge,
                    },
                  ]}
                >
                  <Text
                    style={[styles.emptyLabel, { color: theme.accent.text }]}
                  >
                    Clear search
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListFooterComponent={
            search.loadingMore ? (
              <View style={styles.status}>
                <ActivityIndicator color={theme.primary} size="small" />
              </View>
            ) : null
          }
          numColumns={columns}
          // Every tile animates, so every tile kept alive is a decoder: a
          // screen and a half each way is enough for a flick, not ten.
          initialNumToRender={columns * 5}
          maxToRenderPerBatch={columns * 3}
          windowSize={4}
          onEndReached={search.loadMore}
          onEndReachedThreshold={END_THRESHOLD}
          renderItem={renderItem}
          style={search.loading ? styles.reloading : undefined}
        />
      )}
    </View>
  );
};

/*
 * The three `toItem` adapters, at module scope.
 *
 * Not inline props: `renderItem` is memoised against them, and an adapter
 * rebuilt on every render would rebuild `renderItem` with it and re-render
 * every visible tile — on a grid of animated GIFs that is visible as stutter
 * while scrolling.
 */
const gifItem = (item: {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
}): GridItem => ({
  id: item.id,
  previewUrl: item.previewUrl,
  sendUrl: item.gifUrl,
  title: item.title,
});

const stickerItem = (item: {
  id: string;
  title: string;
  stickerUrl: string;
  previewUrl: string;
}): GridItem => ({
  id: item.id,
  previewUrl: item.previewUrl,
  sendUrl: item.stickerUrl,
  title: item.title,
});

const clipItem = (item: {
  id: string;
  title: string;
  clipUrl: string;
  previewUrl: string;
}): GridItem => ({
  id: item.id,
  // Falling back to the mp4 gives a broken tile rather than an empty one, which
  // is at least visibly wrong; Klipy occasionally returns a clip with no still.
  previewUrl: item.previewUrl || item.clipUrl,
  sendUrl: item.clipUrl,
  title: item.title,
});

export const GifGrid = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const search = useGifSearch();
  return (
    <MediaGrid
      emptyLabel="No GIFs found."
      kind="gif"
      onSelect={onSelect}
      placeholder="Search GIFs"
      search={search}
      toItem={gifItem}
    />
  );
};

export const StickerGrid = ({
  onSelect,
}: {
  onSelect: (url: string) => void;
}) => {
  const search = useStickerSearch();
  return (
    <MediaGrid
      emptyLabel="No stickers found."
      kind="sticker"
      onSelect={onSelect}
      placeholder="Search stickers"
      search={search}
      toItem={stickerItem}
    />
  );
};

/**
 * Clips, previewed rather than played.
 *
 * Klipy hands back a `webp`/`gif` preview alongside the `mp4`, and the preview
 * animates in a plain `<Image>` on both platforms — `expo.webp.animated` is
 * already on for Android. That is the whole reason this grid needs no video
 * player and therefore no new native module: a soundless looping preview is
 * what the web picker shows before you press play anyway.
 */
export const ClipGrid = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const search = useClipSearch();
  return (
    <MediaGrid
      emptyLabel="No clips found."
      kind="clip"
      onSelect={onSelect}
      placeholder="Search clips"
      search={search}
      toItem={clipItem}
    />
  );
};

/** Chips straight on media: web's `MEDIA_CHIP`, no blur. */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;

const styles = StyleSheet.create({
  body: { flex: 1 },
  cell: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
    overflow: "hidden",
  },
  clipBadge: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    bottom: space.xs,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: space.xs,
    width: 22,
  },
  column: { gap: space.xs, justifyContent: "flex-start" },
  empty: { alignItems: "center", gap: space.sm, padding: space.lg },
  emptyAction: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
  },
  emptyLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  grid: { gap: space.xs, paddingBottom: space.md, paddingHorizontal: space.sm },
  progress: { height: 2, marginHorizontal: space.sm },
  reloading: { opacity: 0.45 },
  search: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
  searchRow: { paddingBottom: space.sm, paddingHorizontal: space.sm },
  skeleton: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
    paddingHorizontal: space.sm,
  },
  status: { alignItems: "center", padding: space.lg },
  thumb: { height: "100%", width: "100%" },
});
