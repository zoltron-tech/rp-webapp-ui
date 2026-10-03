import { Ionicons } from "@expo/vector-icons";
import { searchSpotifyTracks } from "@nw/api/endpoints/profile-song";
import { getOwnMusic } from "@nw/api/endpoints/songs";
import { useApi } from "@nw/features";
import type { ProfileSong, Song, SpotifyTrack } from "@nw/types/music";
import { useDebounce } from "@nw/utils/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SkeletonRows } from "@/components/list-skeletons";
import { BottomSheet } from "@/components/sheet";
import { SongRowSkeleton } from "@/components/sheet-skeletons";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A song for the post — web's `SongPickerDialog` in resolve-only mode.
 *
 * Two tabs, as on web: the novelist's own library, and the NW Library search
 * over Spotify. A pick is handed back as a `ProfileSong` built exactly as
 * web's `pickLibrary` / `pickSpotify` build one, so the prompt carries the
 * same shape whichever client attached it.
 *
 * What is not here is the preview player web puts on every row. On web that
 * is a shared `<audio>` and an off-screen Spotify iframe; here it would be an
 * `expo-video` player and a hidden web view per sheet — the profile song
 * already carries both (`profile-song.tsx`), and the post shows the picked
 * song through that same player the moment it is chosen. Previewing before
 * choosing is the one step dropped, and choosing is one tap to undo.
 */

type Tab = "library" | "spotify";

const fromLibrary = (song: Song): ProfileSong => ({
  artist: null,
  externalUrl: null,
  imageUrl: null,
  songId: song.id,
  source: "LIBRARY",
  spotifyTrackId: null,
  title: song.name,
  url: song.url,
});

const fromSpotify = (track: SpotifyTrack): ProfileSong => ({
  artist: track.artist,
  externalUrl: track.externalUrl,
  imageUrl: track.imageUrl,
  songId: null,
  source: "SPOTIFY",
  spotifyTrackId: track.id,
  title: track.title,
  url: null,
});

const Row = ({
  imageUrl,
  onPress,
  subtitle,
  title,
}: {
  imageUrl: string | null;
  onPress: () => void;
  subtitle: string | null;
  title: string;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? theme.glass.fillPressed
            : theme.material.fillTranslucent,
          borderColor: theme.material.edgeTranslucent,
        },
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.art} />
      ) : (
        <View
          style={[
            styles.art,
            styles.artFallback,
            { backgroundColor: theme.accent.tint },
          ]}
        >
          <Ionicons color={theme.accent.text} name="musical-note" size={18} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: theme.textGray }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons color={theme.textGray} name="add-circle-outline" size={20} />
    </Pressable>
  );
};

export const SongSheet = ({
  onClose,
  onSelect,
  title = "Add a song to your prompt",
  visible,
}: {
  onClose: () => void;
  onSelect: (song: ProfileSong) => void;
  /** The composer's wording by default; a muse's featured song says otherwise. */
  title?: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [tab, setTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 400);

  const library = useQuery({
    enabled: visible,
    queryFn: async (): Promise<Song[]> => {
      const result = await getOwnMusic(api);
      return Array.isArray(result) ? result : [];
    },
    queryKey: ["songs", "own"],
    staleTime: 5 * 60 * 1000,
  });

  const spotify = useQuery({
    enabled: visible && tab === "spotify" && debounced.length > 0,
    queryFn: () => searchSpotifyTracks(api, debounced),
    queryKey: ["songs", "spotify", debounced],
    staleTime: 5 * 60 * 1000,
  });

  const pick = (song: ProfileSong) => {
    onSelect(song);
    onClose();
  };

  return (
    <BottomSheet
      fill
      maxHeightRatio={0.8}
      onClose={onClose}
      title={title}
      visible={visible}
    >
      <View style={styles.tabs}>
        {(
          [
            { icon: "library-outline", id: "library", label: "My library" },
            { icon: "search-outline", id: "spotify", label: "NW Library" },
          ] as const
        ).map((entry) => {
          const active = tab === entry.id;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={entry.id}
              onPress={() => setTab(entry.id)}
              style={[
                styles.tab,
                {
                  backgroundColor: active
                    ? theme.accent.surfaceActive
                    : theme.material.fillTranslucent,
                  borderColor: active
                    ? theme.accent.solid
                    : theme.material.edgeTranslucent,
                },
              ]}
            >
              <Ionicons
                color={active ? theme.accent.textStrong : theme.textGray}
                name={entry.icon}
                size={15}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? theme.accent.textStrong : theme.textGray },
                ]}
              >
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "spotify" ? (
        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.glass.field,
              borderColor: theme.material.edgeTranslucent,
            },
          ]}
        >
          <Ionicons color={theme.textGray} name="search" size={16} />
          <TextInput
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search songs and artists"
            placeholderTextColor={theme.textGray}
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
          />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "library" ? (
          library.isPending ? (
            <SkeletonRows
              count={5}
              render={(index) => <SongRowSkeleton index={index} />}
            />
          ) : (library.data ?? []).length === 0 ? (
            <Text style={[styles.empty, { color: theme.textGray }]}>
              Nothing in your library yet. Upload songs from your profile on the
              web, or search the NW Library.
            </Text>
          ) : (
            (library.data ?? []).map((song) => (
              <Row
                imageUrl={null}
                key={song.id}
                onPress={() => pick(fromLibrary(song))}
                subtitle={song.description}
                title={song.name}
              />
            ))
          )
        ) : debounced.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            Type to search the NW Library.
          </Text>
        ) : spotify.isPending ? (
          <SkeletonRows
            count={5}
            render={(index) => <SongRowSkeleton index={index} />}
          />
        ) : (spotify.data ?? []).length === 0 ? (
          <Text style={[styles.empty, { color: theme.textGray }]}>
            No songs match "{debounced}".
          </Text>
        ) : (
          (spotify.data ?? []).map((track) => (
            <Row
              imageUrl={track.imageUrl}
              key={track.id}
              onPress={() => pick(fromSpotify(track))}
              subtitle={track.artist}
              title={track.title}
            />
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  art: { borderRadius: radius.sm, height: 40, width: 40 },
  artFallback: { alignItems: "center", justifyContent: "center" },
  empty: {
    fontSize: fontSize.label,
    lineHeight: 19,
    padding: space.md,
    textAlign: "center",
  },
  list: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm + 2,
    padding: space.sm,
  },
  rowText: { flex: 1, gap: 1 },
  search: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    marginHorizontal: space.md,
    marginTop: space.sm,
    paddingHorizontal: space.md,
  },
  searchInput: { flex: 1, fontSize: fontSize.body, paddingVertical: space.sm },
  subtitle: { fontSize: fontSize.caption },
  tab: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    gap: space.xs,
    justifyContent: "center",
    minHeight: 34,
  },
  tabLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  tabs: { flexDirection: "row", gap: space.sm, paddingHorizontal: space.md },
  title: { fontSize: fontSize.body, fontWeight: "600" },
});
