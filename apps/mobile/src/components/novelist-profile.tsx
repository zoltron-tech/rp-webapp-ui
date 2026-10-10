import { Ionicons } from "@expo/vector-icons";
import { isSupportNovelist } from "@nw/chat";
import { useSession } from "@nw/features";
import { mixColors } from "@nw/theme";
import type { Fandom, Friend, Muse, Novelist } from "@nw/types";
import { mainVerseMuses, toFormattedDate } from "@nw/utils";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Animated,
  InteractionManager,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useBannerStretch } from "@/animation/effects";
import { Avatar } from "@/components/avatar";
import { BadgeSheet } from "@/components/badge-sheet";
import { BadgeRow, ScoreIcon } from "@/components/badges";
import { CollapsibleRichText } from "@/components/collapsible-rich-text";
import { CroppedImage } from "@/components/cropped-image";
import { getNoteEmojiRotate, NoteEmojiIcon } from "@/components/note-emoji";
import { ProfileActions } from "@/components/profile-actions";
import { ProfileSongPill } from "@/components/profile-song";
import { Text } from "@/components/text";
import { useTabBarContentStyle, useTabBarScroll } from "@/context/tab-bar";
import { useProfileSong } from "@/hooks/use-profile-song";
import { fullName } from "@/lib/names";
import { border, fontSize, radius, space, type, useAppTheme } from "@/theme";

/**
 * A novelist's profile, laid out the way the web profile page is.
 *
 * One component for both the signed-in person's own profile and anyone else's:
 * the web page is the same route either way (`/rp/profile/[slug]`), and the
 * only thing being your own profile changes there is which action buttons
 * appear. Splitting it in two here would guarantee the two drift.
 *
 * The measurements are web's own, taken from its ≤800px rules rather than
 * guessed: a 5:2 banner (5:1 when there is none to show), a 104px avatar with a
 * 5px ring lifted 58px into the banner, and the XP chip pinned to its corner.
 *
 * The order down the page is web's, and the order carries meaning: who this is,
 * who you both know, what they sound like, what they write, who they write, who
 * they know. Each block was a gap here until it was filled:
 *
 *  - **Mutual friends** — the one line on a stranger's profile that is about
 *    *you*, which is why web puts it directly under the counts rather than down
 *    with the friends list.
 *  - **The song above About** — merged into one block, not stacked near each
 *    other. Web squares the corners between them on purpose: someone's song is
 *    part of their introduction.
 *  - **Fandom chips** — what they write in, before the characters they write.
 *  - **Characters** — web's `MuseListItem` row: a face, a name, and the fandom
 *    as a coloured chip, in a divided list rather than as loose cards.
 *  - **The friends pill** — a single rounded row with the faces stacked and
 *    overlapping, which reads as one destination. A grid of avatars read as
 *    content, and there was no way to tell it was a link.
 *
 * What the web page carries and this still does not, with reasons rather than
 * omissions:
 *
 * - **Friend/block/report actions** are writes. Phase 4 brings the first write
 *   path; a button that cannot be undone on this client is worse than none.
 * - **Add a character** is a link to a screen that does not exist here yet, so
 *   the section header omits it rather than offering a dead end.
 * - **Stories, posts and the activity feed** are their own screens with
 *   their own fetches, reached from the rows under "Their work".
 * - **The note's emoji** is a key into a hand-drawn SVG icon set
 *   (`note-emoji-set.tsx`), not a character — there is nothing to render
 *   without porting that artwork too.
 */

/** Web's `AvatarMobile`: 104px with a 5px ring of the page background. */
const AVATAR_SIZE = 104;
const AVATAR_RING = 5;

/** Web's `AvatarHeader` lift at ≤800px. */
const HEADER_LIFT = -58;

/**
 * What web's `Banner` does when a novelist has no banner: blur their avatar.
 *
 * Web blurs the full picture in CSS. Here the stand-in is fetched at 64
 * pixels wide and stretched: a blur is a convolution over every pixel, so
 * blurring a 3,000-pixel original on the UI thread was the most expensive
 * thing on the page, and a 64-pixel one stretched to the banner's width is
 * already soft before the (now tiny) blur touches it. Nobody looks at it —
 * it is the wash behind the avatar.
 */
const BANNER_BLUR = 6;
const BANNER_STANDIN = { fit: "cover" as const, h: 26, q: 40, w: 64 };

/**
 * The sizes this page actually draws, which the payload does not carry.
 *
 * `@nw/api` leaves the "profile" context's avatar and banner as the raw S3
 * originals, because web's crop dialogs must measure against the un-resized
 * source. This client has no crop dialog and was decoding a multi-megapixel
 * original for a 104pt face — and every friend in the payload came the same
 * way, for faces 22pt across. The proxy sizes are asked for here, at the
 * draw, and the cache entry web will share stays untouched.
 */
const PROFILE_AVATAR = {
  animated: true,
  fit: "inside" as const,
  h: 320,
  w: 320,
};

/**
 * A banner that moves is fetched smaller than one that does not.
 *
 * `BANNER_LARGE` is 1200 wide, which a still earns: it is decoded once. An
 * animated one is decoded again for every frame, at that size, for as long
 * as it plays, and GIF banners are low-resolution sources to begin with — a
 * 5:2 strip at 900 wide is 44% fewer pixels per frame than 1200 and draws
 * the same on a phone.
 */
const ANIMATED_BANNER = {
  animated: true,
  fit: "inside" as const,
  h: 360,
  w: 900,
};

/** Past this scroll offset the hero is off screen and its GIFs may rest. */
const HERO_REACH = 320;

const isGifUrl = (url: string | null | undefined): boolean =>
  /\.gif(?:[?#].*)?$/i.test(url ?? "");

/**
 * `inside`, never `cover`: a stored crop is percentages of the un-cropped
 * picture, so a proxy size that squares it off first would move every face
 * the person had positioned. Bounding keeps the aspect and the crop maths.
 */
const SMALL_FACE = { fit: "inside" as const, h: 120, w: 120 };

const MUSE_PREVIEW_COUNT = 3;

/** Web's `FriendsAvatarStack`: five 28px faces, overlapping by 4. */
const FRIEND_STACK_COUNT = 5;
const FRIEND_STACK_AVATAR = 28;
const FRIEND_STACK_OVERLAP = -6;

/** Web shows three mutual faces beside the count. */
const MUTUAL_PREVIEW_COUNT = 3;

/**
 * How many fandom chips show before "See all".
 *
 * Web collapses at two because its chips sit in a narrow column beside the
 * feed. A phone is all column, and three fit two lines at the 375pt baseline.
 */
const COLLAPSED_FANDOM_COUNT = 3;

/**
 * A stored note colour, or nothing.
 *
 * The field is free text written by another client, and React Native throws on
 * a colour string it cannot parse rather than ignoring it the way CSS does —
 * so an unrecognised value has to be dropped here instead of reaching a style.
 */
const asColor = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^#[0-9a-f]{3,8}$/i.test(trimmed) || /^rgba?\(/i.test(trimmed)
    ? trimmed
    : undefined;
};

export const NovelistProfile = ({
  novelist,
  style,
}: {
  novelist: Novelist;
  style?: ViewStyle;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const session = useSession();
  const song = useProfileSong(novelist.id);
  const [showAllFandoms, setShowAllFandoms] = useState(false);

  /*
   * The crests move only while there is nothing better to spend the frame on.
   *
   * Their clocks are JS-driven (`react-native-svg` props cannot take the
   * native driver), so a crest costs script time every frame it moves. Off
   * until the screen has settled after mount, off while the page is being
   * scrolled, and off when another screen is on top of this one — which
   * leaves them moving exactly when someone is looking at them.
   */
  const [settled, setSettled] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [focused, setFocused] = useState(true);

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

  const scrollStart = useCallback(() => setScrolling(true), []);
  /*
   * Whether the hero — banner and avatar — is still on screen, read at the
   * end of each scroll rather than on every frame: a GIF that has been
   * scrolled away is one the page does not need to keep decoding.
   */
  const [heroHidden, setHeroHidden] = useState(false);
  const scrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrolling(false);
      setHeroHidden(event.nativeEvent.contentOffset.y > HERO_REACH);
    },
    [],
  );
  const crestsAnimated = settled && focused && !scrolling;
  /*
   * When an animated avatar or banner runs: Discord's rule for animated
   * profiles, which is "while you are looking at it". Not while the page is
   * settling in, not under a finger that is scrolling, not once it has been
   * scrolled away, and not under another screen. A GIF is a decode per
   * frame on the CPU — the one on this page's avatar measured three
   * quarters of a core on its own — so the frames it does not need to draw
   * are the whole saving.
   */
  const heroPlaying = settled && focused && !scrolling && !heroHidden;

  /*
   * Somebody else's badges open in a tray; your own open the catalogue.
   *
   * Not a preference — `GET /badge` answers for the caller, so the shelf screen
   * cannot be shown for anyone else without showing your own badges under their
   * name. What a profile does carry is the list of badges that novelist has
   * earned, which is already on screen as the row this opens from, so the tray
   * costs no request.
   */
  const [badgesOpen, setBadgesOpen] = useState(false);

  // The bar floats over this page: `tabBarScroll` is what sizes it as the page
  // moves, and the content style is what keeps the foot of it reachable under
  // the bar. Both are no-ops on a screen that hides the bar.
  const tabBarScroll = useTabBarScroll();
  const contentStyle = useTabBarContentStyle(styles.content);

  // The banner grows under an over-scroll, pinned to the top — Discord's
  // rule. The offset feeds both this and the tab bar's collapse, so the two
  // scroll handlers are combined below. See `animation/effects`.
  const stretch = useBannerStretch(tabBarScroll.onScroll);

  const hasBanner = Boolean(novelist.banner?.src);
  const bannerUri = hasBanner
    ? wsrvImage(
        novelist.banner?.src,
        isGifUrl(novelist.banner?.src)
          ? ANIMATED_BANNER
          : IMAGE_SIZES.BANNER_LARGE,
      )
    : novelist.image && !novelist.image.endsWith(".gif")
      ? wsrvImage(novelist.image, BANNER_STANDIN)
      : "";
  const avatarUri = wsrvImage(
    novelist.avatar?.src ?? novelist.image,
    PROFILE_AVATAR,
  );
  const noteColor = asColor(novelist.note?.color);
  const muses = mainVerseMuses(novelist.muses).slice(0, MUSE_PREVIEW_COUNT);
  const friends = (novelist.friends ?? []).slice(0, FRIEND_STACK_COUNT);
  const isOwnProfile = session.novelist?.username === novelist.username;
  // Support is not playing: no XP chip, no crests, whoever is looking.
  const isSupport = isSupportNovelist(novelist.username);

  /*
   * Your own lists live in the Profile tab, everyone else's in Home.
   *
   * The same two screens either way — but pushing your own friends into the
   * Home stack lit Home while you were looking at your own page, which is the
   * tab bar disagreeing with the screen above it.
   */
  const openFriends = () =>
    isOwnProfile
      ? router.push("/(tabs)/(profile)/friends")
      : router.push({
          params: { username: novelist.username },
          pathname: "/novelist/[username]/friends",
        });

  const openMuses = () =>
    isOwnProfile
      ? router.push("/(tabs)/(profile)/muses")
      : router.push({
          params: { username: novelist.username },
          pathname: "/novelist/[username]/muses",
        });

  const openStories = () =>
    isOwnProfile
      ? router.push("/(tabs)/(profile)/stories")
      : router.push({
          params: { username: novelist.username },
          pathname: "/novelist/[username]/stories",
        });

  /*
   * The three feeds, which differ only in where they land.
   *
   * Somebody else's carry `novelistId` as well as the handle: the posts and
   * prompts endpoints are keyed by id, and this component already has the
   * novelist, so passing it saves those screens a lookup they would otherwise
   * have to do from the handle. The activity endpoint takes the handle and
   * ignores the extra.
   */
  const openFeed = (feed: "activity" | "prompts" | "posts") =>
    isOwnProfile
      ? router.push(`/(tabs)/(profile)/${feed}`)
      : router.push({
          params: { novelistId: novelist.id, username: novelist.username },
          pathname: `/novelist/[username]/${feed}`,
        });

  /*
   * People you both know.
   *
   * Computed rather than fetched, exactly as web does it: the viewer's own
   * friends are already in the session and this profile's are already in the
   * payload, so the intersection costs nothing. It is meaningless on your own
   * profile, where every friend is trivially "mutual".
   */
  const mutualFriends = useMemo(() => {
    if (isOwnProfile) return [];
    const mine = new Set((session.novelist?.friends ?? []).map((f) => f.id));
    return (novelist.friends ?? []).filter((friend) => mine.has(friend.id));
  }, [isOwnProfile, novelist.friends, session.novelist?.friends]);

  const fandoms = novelist.fandoms ?? [];
  const visibleFandoms = showAllFandoms
    ? fandoms
    : fandoms.slice(0, COLLAPSED_FANDOM_COUNT);

  const hasAbout = Boolean(novelist.about);

  const stats: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: "people-outline", text: `${novelist.friendsCount} Friends` },
    { icon: "person-outline", text: `${novelist.museCount} Characters` },
    {
      icon: "calendar-outline",
      text: `Joined ${toFormattedDate(novelist.createdAt)}`,
    },
  ];

  return (
    <>
      <Animated.ScrollView
        {...tabBarScroll}
        contentContainerStyle={contentStyle}
        onMomentumScrollEnd={scrollEnd}
        onScroll={stretch.onScroll}
        onScrollBeginDrag={scrollStart}
        onScrollEndDrag={scrollEnd}
        scrollEventThrottle={stretch.scrollEventThrottle}
        style={style}
      >
        <Animated.View
          onLayout={stretch.onBannerLayout}
          style={[
            styles.banner,
            {
              // Web: `aspect-ratio: 5 / 2`, or 5 / 1 when the banner is a blurred
              // stand-in rather than a real one.
              aspectRatio: hasBanner ? 5 / 2 : 5 / 1,
              backgroundColor: theme.material.fill,
            },
            stretch.bannerStyle,
          ]}
        >
          {bannerUri ? (
            <CroppedImage
              blurRadius={hasBanner ? 0 : BANNER_BLUR}
              // Web's `Banner`: the stored pan and zoom, or `cover`.
              crop={hasBanner ? novelist.banner?.crop : null}
              playing={heroPlaying}
              style={styles.bannerImage}
              uri={bannerUri}
            />
          ) : null}
        </Animated.View>

        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatarRing,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.background,
                },
              ]}
            >
              <Avatar
                image={novelist.avatar}
                name={novelist.firstName}
                playing={heroPlaying}
                size={AVATAR_SIZE}
                uri={avatarUri}
              />
            </View>

            {/* Web pins this to the avatar's bottom-right and nudges it clear of
              the circle with a percentage translate; these are the same offsets
              in points, since the chip's width is not known until it lays out. */}
            {isSupport ? null : (
              <View
                style={[
                  styles.xpBadge,
                  {
                    backgroundColor: mixColors(
                      theme.accent.surface,
                      0.2,
                      theme.background,
                    ),
                    borderColor: mixColors(
                      theme.accent.surface,
                      0.48,
                      theme.material.edge,
                    ),
                  },
                ]}
              >
                <ScoreIcon size={14} />
                <Text style={[styles.xpLabel, { color: theme.text }]}>
                  {novelist.totalPoints.toLocaleString()} XP
                </Text>
              </View>
            )}
          </View>

          {novelist.note?.text ? (
            <View style={styles.noteWrap}>
              {/* The thought-bubble trail: two circles walking left, back toward
                the avatar. Web draws them as ::before and ::after. */}
              <View
                style={[
                  styles.noteDotLarge,
                  { backgroundColor: noteColor ?? theme.accent.tint },
                ]}
              />
              <View
                style={[
                  styles.noteDotSmall,
                  { backgroundColor: noteColor ?? theme.accent.tint },
                ]}
              />
              <View
                style={[
                  styles.note,
                  { backgroundColor: noteColor ?? theme.accent.tintStrong },
                ]}
              >
                <Text
                  style={[
                    styles.noteText,
                    { color: noteColor ? "#ffffff" : theme.text },
                  ]}
                >
                  {novelist.note.text}
                </Text>
                {novelist.note.emoji ? (
                  <View
                    style={[
                      styles.noteEmoji,
                      getNoteEmojiRotate(novelist.note.emoji) &&
                        styles.noteEmojiTilted,
                    ]}
                  >
                    <NoteEmojiIcon emojiKey={novelist.note.emoji} size={20} />
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.identity}>
          <Text style={[styles.name, { color: theme.text }]}>
            {fullName(novelist)}
          </Text>

          {/* Handle, verification and crests on one line — web keeps the badges
            with the identity rather than with the counts below. */}
          <View style={styles.handleRow}>
            <View style={styles.handleText}>
              <Text style={[styles.handle, { color: theme.textGray }]}>
                @{novelist.username}
              </Text>
              {novelist.isVerified ? (
                <Ionicons
                  color={theme.accent.text}
                  name="checkmark-circle"
                  size={16}
                />
              ) : null}
              {/*
              The crests, at their real size and animated — see `badges.tsx`
              for why they are drawn here and nowhere in a list. 34 clears
              `DETAIL_THRESHOLD`, which is where the artwork starts being
              artwork rather than a coloured dot.

              Tapping opens the full catalogue on your own profile and the
              tray of what they have on anyone else's — see `badgesOpen` above
              for why the two destinations differ.
            */}
              <BadgeRow
                animated={crestsAnimated}
                badges={isSupport ? undefined : novelist.badges}
                onPress={
                  isOwnProfile
                    ? () => router.push("/(tabs)/(profile)/badges")
                    : () => setBadgesOpen(true)
                }
                size={34}
              />
            </View>

            {/* Web's `ProfileDropdownMenuContainer` — the connection button
              and the `⋯` — at the end of the row rather than over the banner,
              which stretches under an over-scroll and took them with it. */}
            <ProfileActions novelist={novelist} />
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.text} style={styles.stat}>
                <Ionicons color={theme.textGray} name={stat.icon} size={14} />
                <Text style={[styles.statText, { color: theme.textGray }]}>
                  {stat.text}
                </Text>
              </View>
            ))}
          </View>

          {mutualFriends.length > 0 ? (
            <Pressable
              accessibilityHint="Opens their friends"
              accessibilityRole="button"
              onPress={openFriends}
              style={({ pressed }) => [
                styles.mutualRow,
                pressed && { opacity: 0.6 },
              ]}
            >
              <AvatarStack
                avatar={22}
                overlap={-8}
                people={mutualFriends.slice(0, MUTUAL_PREVIEW_COUNT)}
                ring={theme.background}
              />
              <Text style={[styles.statText, { color: theme.textGray }]}>
                {mutualFriends.length === 1
                  ? "1 mutual friend"
                  : `${mutualFriends.length} mutual friends`}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/*
        Web's `MediaStack`: the song and About are one block, not two. The song
        loses its bottom corners and About loses its top border, so the seam
        between them disappears.
      */}
        {song || hasAbout ? (
          <View style={styles.mediaStack}>
            {song ? (
              <ProfileSongPill attachedBottom={hasAbout} song={song} />
            ) : null}

            {hasAbout ? (
              <View
                style={[
                  styles.about,
                  {
                    backgroundColor: theme.material.fill,
                    borderColor: theme.material.edge,
                    borderTopLeftRadius: song ? 0 : radius.md + 2,
                    borderTopRightRadius: song ? 0 : radius.md + 2,
                    borderTopWidth: song ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.textGray }]}>
                  About
                </Text>
                {/* Web's `AboutRichText`: folded past ~100px, "Read more..." */}
                <CollapsibleRichText
                  fadeColor={theme.material.fill}
                  html={novelist.about ?? ""}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {fandoms.length > 0 ? (
          <View style={styles.fandomSection}>
            <Text style={[styles.eyebrow, { color: theme.textGray }]}>
              Fandoms {novelist.firstName} writes in
            </Text>
            <View style={styles.chipRow}>
              {visibleFandoms.map((fandom) => (
                <FandomChip fandom={fandom} key={fandom.id} />
              ))}

              {fandoms.length > COLLAPSED_FANDOM_COUNT ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showAllFandoms }}
                  onPress={() => setShowAllFandoms((previous) => !previous)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: theme.material.fill,
                      borderColor: theme.material.edge,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: theme.textGray }]}>
                    {showAllFandoms
                      ? "See less"
                      : `See all (${fandoms.length})`}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        {muses.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader label={`Characters (${novelist.museCount})`} />

            <View
              style={[
                styles.list,
                {
                  backgroundColor: theme.material.fill,
                  borderColor: theme.material.edge,
                },
              ]}
            >
              {muses.map((muse, index) => (
                <MuseRow
                  key={muse.id ?? muse.firstName}
                  last={index === muses.length - 1}
                  muse={muse}
                  onPress={() =>
                    muse.id
                      ? router.push({
                          params: { museId: muse.id },
                          pathname: "/muse/[museId]",
                        })
                      : openMuses()
                  }
                />
              ))}
            </View>

            <SeeMore
              icon="people"
              label="See all characters"
              onPress={openMuses}
            />
          </View>
        ) : null}

        {novelist.friendsCount > 0 && friends.length > 0 ? (
          <Pressable
            accessibilityHint="Opens the full list"
            accessibilityLabel={`Friends, ${novelist.friendsCount}`}
            accessibilityRole="button"
            onPress={openFriends}
            style={({ pressed }) => [
              styles.friendsPill,
              {
                backgroundColor: pressed
                  ? theme.material.fillPressed
                  : theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Text style={[styles.friendsLabel, { color: theme.textGray }]}>
              Friends ({novelist.friendsCount})
            </Text>

            <AvatarStack
              avatar={FRIEND_STACK_AVATAR}
              overlap={FRIEND_STACK_OVERLAP}
              people={friends}
              ring={theme.material.fill}
            />

            <Ionicons color={theme.textGray} name="chevron-forward" size={18} />
          </Pressable>
        ) : null}

        {/*
        The three feeds, as rows rather than as feeds inlined here.

        Web puts all three on the profile itself behind a tab bar, and that
        works on a page where the profile is a column beside them. On a phone
        the profile is already a long scroll before any of it, and appending an
        unbounded feed would put everything above it — the characters, the
        friends — above content nobody can scroll past.

        Rows also cost no request. Between them the three feeds are fifty cards
        a page and the profile needs none of them to render, so fetching any
        here would put a round trip in front of every profile open to fill
        something most visitors scroll straight past.

        Below the friends pill, because these are about what the novelist has
        *made* and the pill is about who they know — and the identity block at
        the top of the page is what a visitor came for first.
      */}
        <View style={styles.feedSection}>
          <SectionHeader label={isOwnProfile ? "Your work" : "Their work"} />

          <View
            style={[
              styles.list,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <FeedRow
              hint="Everything they have done lately"
              icon="pulse-outline"
              label={isOwnProfile ? "Your updates" : "Recent updates"}
              onPress={() => openFeed("activity")}
            />

            {/*
            Prompts before posts. A prompt is written *in character* and is the
            thing this product is for; an out-of-character post is the novelist
            speaking as themselves, which is the aside. Web's tabs read the
            other way round, and its two labels — "Posts" then "Prompts" — sit
            over the opposite endpoints to the ones their names suggest.
          */}
            <FeedRow
              hint="Written by their characters"
              icon="chatbubbles-outline"
              label="Prompts"
              onPress={() => openFeed("prompts")}
            />

            <FeedRow
              hint="Written as themselves"
              icon="document-text-outline"
              label="OOC posts"
              onPress={() => openFeed("posts")}
            />

            <FeedRow
              hint={
                isOwnProfile
                  ? "Stories you write, alone or together"
                  : "Stories they write, alone or together"
              }
              icon="book-outline"
              label="Stories"
              last
              onPress={openStories}
            />
          </View>
        </View>
      </Animated.ScrollView>

      {/*
        Outside the scroll view because it is a `Modal` — it draws in its own
        window over everything, including the tab bar, so where it sits in this
        tree only decides when it mounts.
      */}
      <BadgeSheet
        badges={novelist.badges}
        onClose={() => setBadgesOpen(false)}
        ownerName={novelist.firstName}
        visible={badgesOpen && !isOwnProfile && !isSupport}
      />
    </>
  );
};

/**
 * One of the three feed rows under "Their work".
 *
 * A hint line under each label, because "Prompts" and "OOC posts" are the
 * product's own words and a visitor who has not used it cannot tell which is
 * which from the nouns alone — the distinction is *who is speaking*, and that
 * is what the second line says.
 */
const FeedRow = ({
  hint,
  icon,
  label,
  last = false,
  onPress,
}: {
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** The last row draws no divider under it. */
  last?: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.feedRow,
        {
          backgroundColor: pressed ? theme.material.fillPressed : "transparent",
          borderBottomColor: theme.material.edge,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.feedIcon, { backgroundColor: theme.accent.tint }]}>
        <Ionicons color={theme.accent.textStrong} name={icon} size={16} />
      </View>

      <View style={styles.feedText}>
        <Text style={[styles.feedLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.feedHint, { color: theme.textGray }]}>{hint}</Text>
      </View>

      <Ionicons color={theme.textGray} name="chevron-forward" size={18} />
    </Pressable>
  );
};

/**
 * Faces in a row, overlapping.
 *
 * Web's `FriendsAvatarStack` and `MutualFriendsList` are the same idea at two
 * sizes: each face laps the one before it and carries a ring in the colour
 * behind it, which is what stops a row of circles reading as a smear. Shared so
 * the two cannot drift.
 */
const AvatarStack = ({
  avatar,
  overlap,
  people,
  ring,
}: {
  avatar: number;
  /** Negative: how far each face laps the one before it. */
  overlap: number;
  people: Friend[];
  ring: string;
}) => (
  <View style={styles.stack}>
    {people.map((person, index) => (
      <View
        key={person.id}
        style={{
          borderColor: ring,
          borderRadius: (avatar + 4) / 2,
          borderWidth: 2,
          marginLeft: index === 0 ? 0 : overlap,
        }}
      >
        <Avatar
          image={person.avatar}
          name={person.firstName}
          size={avatar}
          // The payload carries originals here — see `PROFILE_AVATAR`.
          uri={wsrvImage(person.avatar?.src ?? person.image, SMALL_FACE)}
        />
      </View>
    ))}
  </View>
);

/** Web's `ProfileFandomChip`: a dot in the fandom's colour, in a wash of it. */
const FandomChip = ({ fandom }: { fandom: Fandom }) => {
  const theme = useAppTheme();
  const color = asColor(fandom.color) ?? theme.accent.surface;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: mixColors(color, 0.16, theme.background),
          borderColor: mixColors(color, 0.34, theme.background),
        },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text numberOfLines={1} style={[styles.chipLabel, { color: theme.text }]}>
        {fandom.name}
      </Text>
    </View>
  );
};

/** Web's `MuseSectionHeader`: a label, then a rule filling the rest of the row. */
const SectionHeader = ({ label }: { label: string }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionLabel, { color: theme.textGray }]}>
        {label}
      </Text>
      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
    </View>
  );
};

/**
 * Web's `SeeMoreLink`: a pill centred between two rules.
 *
 * Under the list rather than in the header, which is where web puts it and
 * where it belongs — it is the end of the three you were shown, not a control
 * that governs them.
 */
const SeeMore = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.seeMoreRow}>
      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.seeMore,
          {
            backgroundColor: pressed
              ? theme.material.fillPressed
              : theme.material.fill,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Ionicons color={theme.textGray} name={icon} size={14} />
        <Text style={[styles.seeMoreLabel, { color: theme.textGray }]}>
          {label}
        </Text>
        <Ionicons color={theme.textGray} name="chevron-forward" size={14} />
      </Pressable>
      <View style={[styles.rule, { backgroundColor: theme.material.edge }]} />
    </View>
  );
};

/**
 * Web's `MuseListItem`.
 *
 * A round face, the name with the surname trailing it in a lighter weight, and
 * the fandom as a filled chip in the fandom's own colour — not a line of grey
 * text. The chip is the row's only colour and it is what makes a list of
 * characters scannable by the world they belong to.
 */
const MuseRow = ({
  last,
  muse,
  onPress,
}: {
  last: boolean;
  muse: Muse;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const chipColor = asColor(muse.fandom?.color) ?? theme.material.edge;

  return (
    <Pressable
      accessibilityLabel={fullName(muse)}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.museRow,
        {
          backgroundColor: pressed ? theme.material.fillPressed : "transparent",
          borderBottomColor: theme.material.edge,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Avatar
        image={muse.avatar}
        name={muse.firstName}
        size={44}
        uri={wsrvImage(muse.avatar?.src ?? muse.image, SMALL_FACE)}
      />

      <View style={styles.museText}>
        <Text numberOfLines={1} style={styles.museNameRow}>
          <Text style={[styles.museName, { color: theme.text }]}>
            {muse.firstName}
          </Text>
          {muse.lastName ? (
            <Text style={[styles.museSurname, { color: theme.textGray }]}>
              {` ${muse.lastName}`}
            </Text>
          ) : null}
        </Text>

        {muse.fandom?.name ? (
          <View style={[styles.museFandom, { backgroundColor: chipColor }]}>
            <View style={styles.museFandomDot} />
            <Text numberOfLines={1} style={styles.museFandomLabel}>
              {muse.fandom.name}
            </Text>
          </View>
        ) : null}
      </View>

      <Ionicons color={theme.textGray} name="chevron-forward" size={18} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  about: {
    borderBottomLeftRadius: radius.md + 2,
    borderBottomRightRadius: radius.md + 2,
    borderWidth: border.edge,
    gap: space.xs,
    padding: space.md,
  },
  avatarRing: {
    borderRadius: (AVATAR_SIZE + AVATAR_RING * 2) / 2,
    borderWidth: AVATAR_RING,
  },
  // Above the note beside it: the bubble's trail of dots reaches back toward
  // the avatar and covered the XP chip on short notes.
  avatarWrap: { flexShrink: 0, zIndex: 1 },
  banner: { overflow: "hidden", width: "100%" },
  bannerImage: { height: "100%", width: "100%" },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    maxWidth: "100%",
    paddingHorizontal: space.ms,
    paddingVertical: 3,
  },
  chipDot: { borderRadius: 3, height: 6, width: 6 },
  chipLabel: { flexShrink: 1, fontSize: fontSize.caption },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  content: { paddingBottom: space.xl },
  eyebrow: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  fandomSection: {
    gap: space.sm,
    marginTop: space.lg,
    paddingHorizontal: space.md,
  },
  feedHint: { fontSize: fontSize.caption },
  feedIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  feedLabel: { fontSize: fontSize.body, fontWeight: "600" },
  feedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    minHeight: 60,
    paddingHorizontal: space.m,
  },
  // The page's gutter, as every other block here has: without it the label
  // and the list ran to the screen's edges.
  feedSection: {
    gap: space.sm,
    marginTop: space.md,
    paddingHorizontal: space.md,
  },
  feedText: { flex: 1, gap: 1 },
  friendsLabel: {
    flex: 1,
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  friendsPill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    marginHorizontal: space.md,
    marginTop: space.lg,
    minHeight: 50,
    paddingHorizontal: space.ml,
    paddingVertical: space.sm,
  },
  handle: { fontSize: fontSize.body },
  handleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
  },
  // The handle, the tick and the crests wrap among themselves; the buttons
  // after them keep their place at the row's end.
  handleText: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
    minWidth: 0,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    marginTop: HEADER_LIFT,
    paddingHorizontal: space.md,
  },
  identity: { gap: space.sm, paddingHorizontal: space.md, paddingTop: space.m },
  list: {
    borderRadius: radius.md + 2,
    borderWidth: border.edge,
    overflow: "hidden",
  },
  mediaStack: { marginHorizontal: space.md, marginTop: space.md },
  museFandom: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.xs,
    marginTop: 3,
    maxWidth: "100%",
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
  },
  museFandomDot: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 2.5,
    height: 5,
    width: 5,
  },
  museFandomLabel: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  museName: { fontSize: fontSize.body, fontWeight: "700" },
  museNameRow: { flexShrink: 1 },
  museRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.m,
    paddingVertical: space.m,
  },
  museSurname: { fontSize: fontSize.caption },
  museText: { flex: 1, minWidth: 0 },
  mutualRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  // Web's 24 at phone width.
  name: { fontSize: 24, fontWeight: "700", lineHeight: 29 },
  note: {
    borderRadius: radius.lg,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  noteDotLarge: {
    borderRadius: 6.5,
    height: 13,
    left: -11,
    marginTop: -6.5,
    position: "absolute",
    top: "50%",
    width: 13,
  },
  noteDotSmall: {
    borderRadius: 3.5,
    height: 7,
    left: -21,
    marginTop: space.s,
    position: "absolute",
    top: "50%",
    width: 7,
  },
  /** Web's `NoteBubbleEmoji`: pinned to the bubble's top-right corner. */
  noteEmoji: { position: "absolute", right: -9, top: -12 },
  noteEmojiTilted: { transform: [{ rotate: "45deg" }] },
  noteText: { fontSize: fontSize.caption, lineHeight: 16 },
  noteWrap: { flexShrink: 1, maxWidth: 180 },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  section: { gap: space.sm, marginTop: space.lg, paddingHorizontal: space.md },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
  },
  sectionLabel: type.eyebrow,
  sectionTitle: type.eyebrow,
  seeMore: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.md,
    paddingVertical: space.sm - 1,
  },
  seeMoreLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  seeMoreRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
  },
  stack: { alignItems: "center", flexDirection: "row" },
  stat: { alignItems: "center", flexDirection: "row", gap: space.xs },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  statText: { fontSize: fontSize.caption },
  xpBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    bottom: -8,
    flexDirection: "row",
    gap: space.xs,
    paddingBottom: 3,
    paddingLeft: 7,
    paddingRight: space.ms,
    paddingTop: 3,
    position: "absolute",
    right: -12,
  },
  xpLabel: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
