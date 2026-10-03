import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import { ACCENT_MAP, type Accent } from "@nw/types/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SongSheet } from "@/components/compose/song-sheet";
import { ProfileHeaderEditor } from "@/components/edit-profile/profile-header-editor";
import { ProfileSongPill } from "@/components/profile-song";
import {
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import { useProfileSong } from "@/hooks/use-profile-song";
import { setPalettePreview, usePalettePreview } from "@/lib/palette-preview";
import {
  accentFromPalette,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * Web's `AppearanceSection`: the profile header (cover, photo, note), the
 * theme colour and the profile song.
 *
 * Each control saves when it is confirmed rather than behind a page-wide
 * button — the crop editor's tick, the note sheet's tick, a tap on a swatch —
 * which is how every other editor on this client already behaves.
 */

const PALETTES = Object.entries(ACCENT_MAP).map(([key, name]) => ({
  key: Number(key) as Accent,
  name,
}));

export default function AppearanceScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { novelist, user } = useSession();
  const edit = useProfileEdit();
  const song = useProfileSong(novelist?.id);

  const [songOpen, setSongOpen] = useState(false);
  const [songBusy, setSongBusy] = useState(false);

  const palette = (user?.palette ?? novelist?.palette ?? 0) as Accent;
  const preview = usePalettePreview();
  const shownPalette = preview ?? palette;

  /**
   * The colour being applied app-wide, or null once the app has it.
   *
   * A tap previews at once (`setPalettePreview` repaints only this stack) and
   * the app-wide repaint and the save wait until the taps stop — trying three
   * colours in a row costs one repaint, not three. The swatch spins until the
   * save lands, which is the cue that the rest of the app is still catching up.
   */
  const [applying, setApplyingState] = useState<Accent | null>(null);
  const applyingRef = useRef<Accent | null>(null);
  const setApplying = useCallback((next: Accent | null) => {
    applyingRef.current = next;
    setApplyingState(next);
  }, []);
  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applySeq = useRef(0);
  const committed = useRef(palette);
  committed.current = palette;
  const setPaletteRef = useRef(edit.setPalette);
  setPaletteRef.current = edit.setPalette;

  const applyPalette = useCallback(
    async (next: Accent) => {
      applyTimer.current = null;
      const mine = ++applySeq.current;
      if (next === committed.current) {
        setPalettePreview(null);
        setApplying(null);
        return;
      }
      const ok = await setPaletteRef.current(next);
      if (mine !== applySeq.current) return;
      setApplying(null);
      setPalettePreview(null);
      if (!ok) Alert.alert("Not saved", "The theme color could not be saved.");
    },
    [setApplying],
  );

  // Leaving mid-debounce still saves the colour that was last picked.
  useEffect(
    () => () => {
      const pending = applyingRef.current;
      if (!applyTimer.current || pending === null) return;
      clearTimeout(applyTimer.current);
      void setPaletteRef.current(pending).then(() => setPalettePreview(null));
    },
    [],
  );

  if (!novelist) return null;

  const saveSong = async (task: () => Promise<boolean>, failure: string) => {
    setSongBusy(true);
    const ok = await task();
    setSongBusy(false);
    if (!ok) Alert.alert("Not saved", failure);
  };

  const pickPalette = (next: Accent) => {
    if (next === shownPalette && applying === null) return;
    setPalettePreview(next);
    setApplying(next);
    if (applyTimer.current) clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => void applyPalette(next), 500);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <SettingsGroup
          footer="Tap the cover, your photo or the note to change them. Images: PNG, JPEG or GIF, up to 10 MB."
          title="Profile header"
        >
          <ProfileHeaderEditor edit={edit} novelist={novelist} />
        </SettingsGroup>

        <SettingsGroup
          footer={
            applying !== null
              ? "Applying your theme across the app…"
              : "Colors the app for you and your profile for everyone who visits it."
          }
          title="Theme color"
        >
          <View style={styles.palettes}>
            {PALETTES.map(({ key, name }) => {
              const accent = accentFromPalette(key);
              const selected = shownPalette === key;
              const loading = applying === key;
              return (
                <Pressable
                  accessibilityLabel={`${name} theme`}
                  accessibilityRole="radio"
                  accessibilityState={{ busy: loading, selected }}
                  key={key}
                  onPress={() => pickPalette(key)}
                  style={styles.palette}
                >
                  <View
                    style={[
                      styles.swatchRing,
                      {
                        borderColor: selected ? accent.solid : "transparent",
                      },
                    ]}
                  >
                    <View
                      style={[styles.swatch, { backgroundColor: accent.solid }]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : selected ? (
                        <Ionicons color="#ffffff" name="checkmark" size={18} />
                      ) : null}
                    </View>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.paletteName,
                      {
                        color: selected ? theme.text : theme.textGray,
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsGroup>

        <SettingsGroup title="Profile song">
          {song ? (
            <View style={styles.songBlock}>
              <ProfileSongPill song={song} />
            </View>
          ) : (
            <SettingsRow
              icon="musical-notes-outline"
              label="No song yet"
              subtitle="Pick a track that sounds like you."
            />
          )}
          <View style={styles.inlineActionsPadded}>
            <PillButton
              icon={song ? "swap-horizontal" : "add"}
              label={song ? "Change song" : "Add a song"}
              onPress={() => setSongOpen(true)}
              tone="accent"
            />
            {song ? (
              <PillButton
                busy={songBusy}
                icon="trash-outline"
                label="Remove"
                onPress={() =>
                  void saveSong(
                    edit.removeSong,
                    "The song could not be removed.",
                  )
                }
                tone="danger"
              />
            ) : null}
          </View>
        </SettingsGroup>
      </ScrollView>

      <SongSheet
        onClose={() => setSongOpen(false)}
        onSelect={(picked) => {
          setSongOpen(false);
          void saveSong(
            () => edit.setSong(picked),
            "The song could not be saved.",
          );
        }}
        title={song ? "Change profile song" : "Add a profile song"}
        visible={songOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg, padding: space.sm + 4 },
  inlineActionsPadded: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    padding: space.md,
  },
  palette: { alignItems: "center", gap: 4, width: "25%" },
  paletteName: { fontSize: 11, textTransform: "capitalize" },
  palettes: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    rowGap: space.md,
  },
  songBlock: { paddingHorizontal: space.md, paddingTop: space.md },
  swatch: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  swatchRing: { borderRadius: radius.full, borderWidth: 2, padding: 2 },
});
