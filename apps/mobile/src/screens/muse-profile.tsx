import { AmbientBackground } from "@/components/ambient-background";
import { Ionicons } from "@expo/vector-icons";
import { queryKeys, useSession } from "@nw/features";
import type { Muse, MuseNavItem } from "@nw/types";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { SongSheet } from "@/components/compose/song-sheet";
import { ListStatus } from "@/components/list-status";
import { Byline } from "@/components/muse/byline";
import { MuseNavTabs } from "@/components/muse/nav-tabs";
import {
  type MuseBackdrop,
  MuseBackdropProvider,
} from "@/components/muse/panel";
import { type MuseSection, SectionMenu } from "@/components/muse/section-menu";
import { MuseCardSection } from "@/components/muse/sections/card";
import { MuseGallerySection } from "@/components/muse/sections/gallery";
import { MuseInfoSection } from "@/components/muse/sections/info";
import { MuseMoreSection } from "@/components/muse/sections/more";
import { MusePeersSection } from "@/components/muse/sections/peers";
import { MusePostsSection } from "@/components/muse/sections/posts";
import { MuseStorySection } from "@/components/muse/sections/story";
import { MuseStage } from "@/components/muse/stage";
import { VerseBar } from "@/components/muse/verse-bar";
import { NovelistHeader } from "@/components/novelist-header";
import { ProfileSongPill } from "@/components/profile-song";
import { useScrollIdle } from "@/context/scroll-activity";
import { useHideTabBar } from "@/hooks/use-hide-tab-bar";
import { useMuse } from "@/hooks/use-muse";
import { type MuseEdit, useMuseEdit } from "@/hooks/use-muse-edit";
import { findCached } from "@/lib/cache-seed";
import { withAlpha } from "@/lib/color";
import { type MuseLook, museLook, museName } from "@/lib/muse-appearance";
import {
  AccentProvider,
  border,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * A character's profile — web's `/rp/muse/[slug]`.
 *
 * ## The same page, laid out for a thumb
 *
 * Web draws a full-bleed wallpaper, a verse bar, the featured song, a 9:16
 * card, and a menu of seven sections that swap what the card shows. All of
 * that is here in the same order, with two changes for a phone:
 *
 *  - **The section menu replaces the tab bar.** The bar is hidden while this
 *    screen is up (`useHideTabBar`) and web's `SideMenu` sits where it was — a
 *    character's page is a place you go into, and its seven sections are the
 *    navigation that matters while you are there. Back is the stack header.
 *  - **One portrait frame.** Every section is drawn in the same 9:16 frame
 *    as the card (`MuseStage`), as on web, sized to clear the two edge tabs
 *    and sitting a hair inside the largest fit. The prev/next tabs dock to
 *    the screen edges at the frame's mid-height — web's mobile `MuseNavTab`,
 *    portrait behind a veil, name running down the tab, no hover peek.
 *
 * ## Switching characters stays on this screen
 *
 * Prev/next and the verse circles call `router.setParams`, as web's page
 * reuses one route segment: the header, the wallpaper and the menu stay put
 * and only the queries re-key. Pushing a new screen for each neighbour would
 * make "back" a walk through every character you had flicked past.
 *
 * ## The card and avatar are the author's framing
 *
 * `CroppedImage` reproduces web's `background-size`/`background-position`
 * model, so the card background is zoomed and placed exactly as the crop
 * dialog set it, and the avatar's crop goes through `Avatar` the same way.
 *
 * ## The owner edits in place
 *
 * Everything web's sections let the owner change without leaving the page is
 * changed here without leaving the screen: the avatar and the card image (a
 * crop tray), nicknames, fandom, details, privacy, the quote, story sections,
 * gallery media and captions, connections, and the featured song. Each write
 * goes through `useMuseEdit` or the section's own endpoint and lands in the
 * query cache, so the page re-renders from the saved object rather than an
 * optimistic guess. The character form itself (name, wallpaper, appearance
 * colours) and creating a verse are the character settings stack
 * (`app/edit-muse`), reached from MORE → Edit and the "+" beside the verses.
 */
/** Enough of a character to draw its page: a name and its pictures. */
type MuseSeed = Muse | MuseNavItem;

const isMuseLike = (value: unknown): value is MuseSeed =>
  typeof value === "object" &&
  value !== null &&
  "firstName" in value &&
  "cardBackground" in value;

/**
 * The character as some list already on the phone holds it.
 *
 * Your own characters ride on the session; a novelist's on their profile and
 * their characters list; a friend's and a stranger's on the home rails; and a
 * character already opened carries its neighbours and verses. Every one of
 * those has the name, the portrait, the card background and the accent — what
 * the page draws before any section is opened.
 */
const findCachedMuse = (
  queryClient: QueryClient,
  museId: string,
): MuseSeed | null => {
  const match = (value: unknown) =>
    isMuseLike(value) && value.id === museId ? value : undefined;
  const inList = (value: unknown) =>
    Array.isArray(value) ? value.map(match).find(Boolean) : undefined;
  return (
    findCached(
      queryClient,
      [queryKeys.session(), ["home"], ["profile"], ["muse"]],
      (entity) =>
        match(entity) ??
        inList(entity.muses) ??
        inList(entity.verses) ??
        match(entity.next) ??
        match(entity.prev),
    ) ?? null
  );
};

const pennedByOf = (value: MuseSeed | null) =>
  value && "pennedBy" in value ? ((value as Muse).pennedBy ?? null) : null;

export const MuseProfileScreen = () => {
  const { museId } = useLocalSearchParams<{ museId: string }>();
  const queryClient = useQueryClient();
  const query = useMuse(museId);
  const muse = query.data ?? null;

  /*
   * Looked up once per character. Only ever a picture of the page — the
   * wallpaper, the card, the name — never what the owner's tools act on: the
   * body still receives `muse` as null until the server has answered, so no
   * edit can start from a list's thinner copy.
   */
  const seed = useMemo(
    () => (museId ? findCachedMuse(queryClient, museId) : null),
    [museId, queryClient],
  );

  return (
    /*
     * The author's palette, not the viewer's, for the chrome round the page —
     * the header and the base colour under the wallpaper. The muse's own accent
     * (a single hex, not a palette) paints everything on the page itself.
     */
    <AccentProvider
      palette={muse?.pennedBy?.palette ?? pennedByOf(seed)?.palette}
    >
      {/* The author's light, over the viewer's the stack drew. */}
      <AmbientBackground />
      <NovelistHeader
        title={muse ? museName(muse) : seed ? museName(seed) : "Character"}
      />
      <MuseProfileBody
        error={query.error}
        loading={query.isPending}
        muse={muse}
        museId={museId ?? ""}
        onRetry={() => void query.refetch()}
        seed={seed}
      />
    </AccentProvider>
  );
};

const MuseProfileBody = ({
  error,
  loading,
  muse,
  museId,
  onRetry,
  seed,
}: {
  error: unknown;
  loading: boolean;
  muse: Muse | null;
  museId: string;
  onRetry: () => void;
  /** A cached copy to draw while `muse` loads. See `findCachedMuse`. */
  seed: MuseSeed | null;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const session = useSession();

  // The bar under this screen would be six destinations under a portrait; the
  // section menu stands where it was. Restored when the screen unmounts.
  useHideTabBar();

  // Web opens on the card on a phone and on INFO on a desktop.
  const [section, setSection] = useState<MuseSection>("CARD");

  /*
   * Which sections have been opened at all. A section's fetch is switched on
   * the first time it is shown and stays on, so flicking back to it is a cache
   * read — exactly web's "fetched once" refs.
   */
  const [visited, setVisited] = useState<ReadonlySet<MuseSection>>(
    () => new Set<MuseSection>(["CARD"]),
  );
  const choose = useCallback((next: MuseSection) => {
    setSection(next);
    setVisited((open) => (open.has(next) ? open : new Set(open).add(next)));
  }, []);

  /*
   * Kept across a switch to a neighbour or a verse, as web keeps `nav` and
   * `verseHeaderData`: the rows stay put while the next character loads
   * rather than collapsing and popping back, which would shove the card up
   * and down under the reader's thumb.
   */
  const [nav, setNav] = useState<{
    next: MuseNavItem | null;
    prev: MuseNavItem | null;
    verses: MuseNavItem[];
  }>({ next: null, prev: null, verses: [] });

  useEffect(() => {
    if (!muse) return;
    setNav({
      next: muse.next ?? null,
      prev: muse.prev ?? null,
      verses: muse.verses ?? [],
    });
  }, [muse]);

  /*
   * The neighbour's minimal payload paints the wallpaper and the card the
   * moment it is tapped, while the full muse loads — web's `previewMuse`.
   */
  const [preview, setPreview] = useState<MuseNavItem | null>(null);
  useEffect(() => {
    if (muse && preview?.id === muse.id) setPreview(null);
  }, [muse, preview]);

  const switching = preview !== null && preview.id === museId && !muse;

  const goTo = useCallback(
    (target: MuseNavItem) => {
      if (target.id === museId || switching) return;
      setPreview(target);
      router.setParams({ museId: target.id });
    },
    [museId, router, switching],
  );

  // What is drawn: the character, a tapped neighbour's preview, or — while the
  // first answer is on its way — whatever a list already had of it.
  const visual = muse ?? preview ?? (loading ? seed : null);
  const look = useMemo(() => museLook(visual), [visual]);

  const isOwnMuse = Boolean(
    session.novelist?.username &&
      muse?.pennedBy?.username === session.novelist.username,
  );

  // The owner's writes, each patching `queryKeys.muse(id)` when it lands.
  const edit = useMuseEdit(muse?.id);

  /*
   * Creating a verse is the new-character form with `originalVerseId` set
   * (`app/edit-muse/new`), behind web's tier check: verses count toward the
   * plan's character limit, so at the limit the "+" says so instead.
   */
  const museLimit = session.novelist?.tier?.museLimit ?? 0;
  const atMuseLimit = (session.novelist?.museCount ?? 0) >= museLimit;
  const createVerse = useCallback(() => {
    if (!muse?.id) return;
    if (atMuseLimit) {
      Alert.alert(
        "Character limit reached",
        `You've reached your plan's limit of ${museLimit} characters (alternate verses count toward this too). Upgrade your tier or remove a character to add a new verse.`,
      );
      return;
    }
    const root = muse.originalVerseId ?? muse.id;
    router.push({
      params: { originalVerseId: root },
      pathname: "/edit-muse/new",
    });
  }, [atMuseLimit, muse?.id, muse?.originalVerseId, museLimit, router]);

  /*
   * The empty-state drawings move only while somebody is looking at them: not
   * before the screen has settled after mount, not while a panel is being
   * scrolled, not while another screen covers this one. Their clocks are
   * JS-driven, so every frame they move is a frame the panel does not get.
   */
  const [settled, setSettled] = useState(false);
  const [focused, setFocused] = useState(true);
  const idle = useScrollIdle();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      const task = InteractionManager.runAfterInteractions(() =>
        setSettled(true),
      );
      return () => {
        task.cancel();
        setFocused(false);
      };
    }, []),
  );

  const motion = settled && focused && idle;

  // Where the wallpaper is, for the panels' frosted glass (see `MusePanel`).
  const [wallpaperFrame, setWallpaperFrame] =
    useState<MuseBackdrop["frame"]>(null);
  const backdrop = useMemo<MuseBackdrop>(
    () => ({
      blur: look.wallpaper.filters.blur,
      dim: wallpaperDim(look.wallpaper.filters.brightness),
      frame: wallpaperFrame,
      uri: look.wallpaper.uri,
    }),
    [look.wallpaper, wallpaperFrame],
  );

  // The author, kept across a prev/next or verse switch while `muse` is
  // briefly null — so the byline does not blink out and shove the card.
  const [author, setAuthor] = useState(
    muse?.pennedBy ?? pennedByOf(seed) ?? null,
  );
  useEffect(() => {
    if (muse?.pennedBy?.username) setAuthor(muse.pennedBy);
  }, [muse]);

  if (error && !muse) {
    return (
      <View style={styles.root}>
        <ListStatus error={error} onRetry={onRetry} />
      </View>
    );
  }

  if (!loading && !muse && !preview) {
    return (
      <View style={styles.root}>
        <ListStatus empty="This character could not be found." />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Wallpaper look={look} onFrame={setWallpaperFrame} />

      <MuseBackdropProvider value={backdrop}>
        <View style={styles.column}>
          {author?.username ? (
            <Byline
              accent={look.accent}
              author={author}
              textColor={look.pennedByColor}
            />
          ) : null}

          {muse || nav.verses.length > 0 ? (
            <VerseBar
              accent={look.accent}
              busy={switching}
              currentId={muse?.id ?? preview?.id ?? null}
              onCreate={isOwnMuse ? createVerse : undefined}
              onSelect={goTo}
              verses={nav.verses}
            />
          ) : null}

          {muse && (muse.featuredSong || isOwnMuse) ? (
            <SongBar
              edit={edit}
              isOwnMuse={isOwnMuse}
              look={look}
              muse={muse}
            />
          ) : null}

          <MuseStage
            tabs={
              <MuseNavTabs
                busy={switching}
                next={nav.next}
                onSelect={goTo}
                prev={nav.prev}
              />
            }
          >
            {() =>
              section === "CARD" ? (
                <MuseCardSection
                  edit={edit}
                  isOwnMuse={isOwnMuse}
                  loading={!visual}
                  look={look}
                  muse={muse}
                />
              ) : section === "INFO" ? (
                <MuseInfoSection
                  edit={edit}
                  isOwnMuse={isOwnMuse}
                  look={look}
                  motion={motion}
                  muse={muse}
                />
              ) : section === "STORY" ? (
                <MuseStorySection
                  active={visited.has("STORY")}
                  edit={edit}
                  isOwnMuse={isOwnMuse}
                  look={look}
                  motion={motion}
                  muse={muse}
                />
              ) : section === "POSTS" ? (
                <MusePostsSection
                  active={visited.has("POSTS")}
                  look={look}
                  motion={motion}
                  muse={muse}
                />
              ) : section === "PEERS" ? (
                <MusePeersSection
                  active={visited.has("PEERS")}
                  isOwnMuse={isOwnMuse}
                  look={look}
                  motion={motion}
                  muse={muse}
                />
              ) : section === "GALLERY" ? (
                <MuseGallerySection
                  active={visited.has("GALLERY")}
                  isOwnMuse={isOwnMuse}
                  look={look}
                  motion={motion}
                  muse={muse}
                />
              ) : (
                <MuseMoreSection
                  isOwnMuse={isOwnMuse}
                  look={look}
                  muse={muse}
                />
              )
            }
          </MuseStage>

          <SectionMenu look={look} onChange={choose} section={section} />
        </View>
      </MuseBackdropProvider>
    </View>
  );
};

/**
 * Web's `MuseSongBar`: the featured song between the verses and the card.
 *
 * Visitors see the player. The owner also gets web's two small controls
 * beside it — change, remove — and a dashed "Add a song" when there is none.
 * The picker is the composer's `SongSheet`, resolving a pick locally, and the
 * pick is written to the muse through `useMuseEdit`.
 */
const SongBar = ({
  edit,
  isOwnMuse,
  look,
  muse,
}: {
  edit: MuseEdit;
  isOwnMuse: boolean;
  look: MuseLook;
  muse: Muse;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const song = muse.featuredSong;

  const choose = async (picked: NonNullable<Muse["featuredSong"]>) => {
    setBusy(true);
    const ok = await edit.setSong(picked);
    setBusy(false);
    if (!ok) Alert.alert("Not saved", "The song could not be set. Try again.");
  };

  const remove = () =>
    Alert.alert("Remove song?", "Remove this character's featured song?", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: async () => {
          setBusy(true);
          const ok = await edit.removeSong();
          setBusy(false);
          if (!ok) Alert.alert("Not removed", "Try again in a moment.");
        },
        style: "destructive",
        text: "Remove",
      },
    ]);

  const tone = look.accent
    ? withAlpha(look.accent, 0.35)
    : "rgba(255,255,255,0.28)";

  return (
    <View style={styles.song}>
      {song ? (
        <View style={styles.songRow}>
          <View style={styles.songPill}>
            <ProfileSongPill song={song} />
          </View>
          {isOwnMuse ? (
            <View style={[styles.songControls, { borderColor: tone }]}>
              <Pressable
                accessibilityLabel="Change song"
                accessibilityRole="button"
                disabled={busy}
                hitSlop={space.xs}
                onPress={() => setPickerOpen(true)}
                style={styles.songControl}
              >
                <Ionicons
                  color="rgba(255,255,255,0.85)"
                  name="pencil"
                  size={12}
                />
              </Pressable>
              <View style={styles.songControlRule} />
              <Pressable
                accessibilityLabel="Remove song"
                accessibilityRole="button"
                disabled={busy}
                hitSlop={space.xs}
                onPress={remove}
                style={styles.songControl}
              >
                {busy ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons
                    color="rgba(255,255,255,0.85)"
                    name="trash-outline"
                    size={12}
                  />
                )}
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : isOwnMuse ? (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.songAdd,
            { opacity: pressed || busy ? 0.7 : 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons
              color="rgba(255,255,255,0.8)"
              name="musical-notes-outline"
              size={13}
            />
          )}
          <Text style={styles.songAddLabel}>Add a song</Text>
        </Pressable>
      ) : null}

      {isOwnMuse ? (
        <SongSheet
          onClose={() => setPickerOpen(false)}
          onSelect={(picked) => void choose(picked)}
          title={song ? "Change song" : "Add a song"}
          visible={pickerOpen}
        />
      ) : null}
    </View>
  );
};

/**
 * Web's `Banner`: the wallpaper (or the main image) behind everything,
 * blurred, dimmed and desaturated by the muse's own filter values.
 *
 * Blur is `expo-image`'s own. Brightness is a black wash at `1 − brightness`,
 * which is what a `brightness()` filter under 100% amounts to on a picture
 * that is already blurred to a smear. Greyscale has no counterpart without a
 * shader; on a picture this soft the difference is a tint, and it is dropped.
 */
/** The black wash a `brightness()` under 100% amounts to, capped at 90%. */
const wallpaperDim = (brightness: number) =>
  Math.min(Math.max(1 - brightness / 100, 0), 0.9);

const Wallpaper = ({
  look,
  onFrame,
}: {
  look: MuseLook;
  /** Told the wallpaper's box in window coordinates, for the panels' glass. */
  onFrame: (frame: MuseBackdrop["frame"]) => void;
}) => {
  const { filters, uri } = look.wallpaper;
  const dim = wallpaperDim(filters.brightness);
  const ref = useRef<View>(null);

  return (
    <View
      onLayout={() =>
        ref.current?.measureInWindow((x, y, width, height) =>
          onFrame({ height, width, x, y }),
        )
      }
      pointerEvents="none"
      ref={ref}
      style={StyleSheet.absoluteFill}
    >
      {uri ? (
        <Image
          blurRadius={Math.min(filters.blur, 40)}
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={uri}
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          transition={300}
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(0,0,0,${dim.toFixed(2)})` },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  column: { flex: 1 },
  root: { flex: 1 },
  song: { paddingHorizontal: space.md, paddingTop: space.xs },
  songAdd: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.lg - 4,
    borderStyle: "dashed",
    borderWidth: 1.5,
    flexDirection: "row",
    gap: space.s,
    justifyContent: "center",
    paddingVertical: space.sm + 1,
  },
  songAddLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  songControl: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 26,
  },
  songControlRule: {
    backgroundColor: "rgba(255,255,255,0.18)",
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  songControls: {
    backgroundColor: "rgba(0,0,0,0.62)",
    borderRadius: radius.full,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  songPill: { flex: 1 },
  songRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
