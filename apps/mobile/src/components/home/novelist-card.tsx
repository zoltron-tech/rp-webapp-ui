import { Ionicons } from "@expo/vector-icons";
import { isSupportNovelist } from "@nw/chat";
import { useGlobalState } from "@nw/store";
import type { NWImage } from "@nw/types";
import { mainVerseMuses } from "@nw/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useMemo } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Image } from "@/components/image";
import { Text } from "@/components/text";
import {
  type Connection,
  type ConnectionActionName,
  useConnectionAction,
} from "@/hooks/use-connection";
import { fullName } from "@/lib/names";
import {
  accentFromPalette,
  border,
  fontSize,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * Web's `NovelistPreviewCard`, at phone width.
 *
 * The web card is read top to bottom as five bands: banner, face, identity,
 * what they bring, and the one control their connection to you calls for. This
 * is the same five, at the same order — a banner, the face lapping half over
 * its edge, name and handle centred, a stat line, their characters as faces
 * inside a ruled block, and a button that spans the card. What differs is only
 * what a phone cannot spend: no hover lift, and no badge crests (a crest is an
 * `<Svg>` per badge, and `components/badges.tsx` keeps those off list cells
 * on purpose).
 *
 * ## Two sizes, given by the rail
 *
 * The card does not know how wide it is; the rail does, because the rail is
 * what decides how many fit. The home rail hands it most of the screen so one
 * card sits in the middle with its neighbours peeking in at the sides, as
 * Facebook's suggestions do; `NOVELIST_CARD_WIDTH` is the compact size for
 * anywhere that wants a row of three.
 *
 * The two are not the same drawing scaled. Scaling the compact card up left a
 * 56pt face under a 108pt banner and a name at list size in a card the width
 * of a post — everything small, with the room between it empty. So each width
 * has its own metrics (`CardMetrics`): the wide card's banner is shorter so
 * the face, not the banner, is what the card is of; the face is half as big
 * again; the name is a heading; the character faces are at a size that shows a
 * face; and the buttons are a thumb's height, with both of a pair labelled
 * where the compact card has room for only one word.
 *
 * ## One height for every card
 *
 * Each size has a floor and the action block is pushed to the bottom with
 * `marginTop: "auto"`, web's `margin-top: auto` in the button container. A rail
 * of cards whose buttons sit at different heights is the single most obvious
 * thing wrong with a horizontal list, and the content above the button varies:
 * a novelist with no muses, a friend request built from a notification with no
 * banner and no stats at all. A horizontal list stretches its cells to the
 * tallest one, so the floor is what every card is unless one asks for more.
 *
 * ## The ⋯ beside Add Friend
 *
 * A stranger's card carries the profile's `⋯` as a square beside the Add
 * button — copy username, share, report, blacklist, block — so a suggestion
 * can be dealt with without opening the profile first. Only beside Add: a
 * friend's card has Message and the profile button, and a request's card
 * has Accept and Decline, which is already all the width holds. The menu
 * itself is the rail's (`onMore`), one sheet for every card rather than
 * one per card.
 *
 * The button is `useConnectionAction`, so an "Add" tapped here becomes
 * "Requested" without a refetch and stays that way when the same person turns
 * up in a likers list. Any button press also tells the rail through
 * `onAction`, which moves the next card into the middle — the decision on
 * this person has been made, and the next one is what the thumb wants.
 */

/** What a card needs to know. `Novelist` and `Friend` both satisfy it. */
export interface NovelistCardPerson {
  avatar?: NWImage | null;
  banner?: NWImage | null;
  connection: string | null;
  firstName: string;
  id: string;
  image: string;
  isVerified?: boolean;
  lastName: string | null;
  muses?:
    | {
        avatar?: NWImage | null;
        firstName?: string;
        id?: string | null;
        image?: string | null;
        originalVerseId?: string | null;
      }[]
    | null;
  mutualFriendCount?: number;
  palette?: number;
  username: string;
}

/** The compact width: "Cancel Request" on one line, three to a screen. */
export const NOVELIST_CARD_WIDTH = 176;

/** From this width the card is drawn with the wide metrics. */
const WIDE_FROM = 220;

/** Everything about the card that changes with its width. */
interface CardMetrics {
  /** The face's diameter. */
  avatar: number;
  /** The banner's height as a share of the width: web's 5:2 when compact. */
  banner: number;
  bodyPad: number;
  buttonHeight: number;
  buttonSize: "xs" | "sm";
  /** The floor; see "One height for every card". */
  floor: number;
  handle: number;
  /** How far each character face laps over the one before it. */
  lap: number;
  /** How many character faces before a "+N". */
  maxMuses: number;
  /** A character face's diameter. */
  museFace: number;
  name: number;
  /** The ring in the card's colour that punches the face out of the banner. */
  ring: number;
  /** The accent hairline outside it — web's second box-shadow. */
  ringOut: number;
  /** The icon-only button's width. */
  squareWidth: number;
  statIcon: number;
  statText: number;
  statsHeight: number;
  verified: number;
  wide: boolean;
}

const COMPACT: CardMetrics = {
  avatar: 56,
  banner: 0.4,
  bodyPad: space.ms,
  buttonHeight: 34,
  buttonSize: "xs",
  floor: 284,
  handle: fontSize.caption,
  lap: 8,
  maxMuses: 4,
  museFace: 26,
  name: fontSize.body,
  ring: 3,
  ringOut: 1.5,
  squareWidth: 36,
  statIcon: 11,
  statsHeight: 16,
  statText: fontSize.meta,
  verified: 15,
  wide: false,
};

const WIDE: CardMetrics = {
  avatar: 88,
  // Shorter than 5:2: at this width a 5:2 banner is a third of the card and
  // the person under it an afterthought. The face is the point.
  banner: 0.34,
  bodyPad: space.md,
  buttonHeight: 42,
  buttonSize: "sm",
  floor: 360,
  handle: fontSize.label,
  lap: 11,
  maxMuses: 5,
  museFace: 38,
  name: 18,
  ring: 3,
  ringOut: 2,
  squareWidth: 46,
  statIcon: 13,
  statsHeight: 20,
  statText: fontSize.label,
  verified: 20,
  wide: true,
};

const cardMetrics = (width: number): CardMetrics =>
  width >= WIDE_FROM ? WIDE : COMPACT;

/** The banner's height at a width. */
export const novelistCardBanner = (width: number) =>
  Math.round(width * cardMetrics(width).banner);

/** The card's floor at a width. */
export const novelistCardMinHeight = (width: number) =>
  cardMetrics(width).floor;

/**
 * The styles that follow the metrics, built once per size — `COMPACT` and
 * `WIDE` are the only two objects `cardMetrics` ever returns, so a cache keyed
 * on them is two entries.
 */
const sized = (m: CardMetrics) => ({
  face: {
    borderRadius: (m.avatar + m.ring * 2) / 2,
    borderWidth: m.ring,
  },
  ghost: {
    height: m.avatar + (m.ring + m.ringOut) * 2,
    width: m.avatar + (m.ring + m.ringOut) * 2,
  },
  ghostFaces: { height: m.museFace, width: m.museFace * 3.5 },
  handle: { fontSize: m.handle },
  museEmpty: { height: m.museFace + 2, lineHeight: m.museFace + 2 },
  museFace: { borderRadius: (m.museFace + 4) / 2 },
  museLapped: { marginLeft: -m.lap },
  museOverflow: { height: m.museFace + 4, width: m.museFace + 4 },
  name: { fontSize: m.name },
  ring: {
    borderRadius: (m.avatar + (m.ring + m.ringOut) * 2) / 2,
    borderWidth: m.ringOut,
    marginBottom: m.wide ? space.sm : space.s,
    // Half over the banner, as web's `margin-top: -26px` on a 52px avatar.
    marginTop: -(m.avatar / 2 + m.ring + m.ringOut),
  },
  stats: { height: m.statsHeight },
  statText: { fontSize: m.statText },
});
const SIZED = new Map<CardMetrics, ReturnType<typeof sized>>();
const sizedFor = (m: CardMetrics) => {
  let out = SIZED.get(m);
  if (!out) {
    out = sized(m);
    SIZED.set(m, out);
  }
  return out;
};

/**
 * The card's button: a rectangle that spans what it is given.
 *
 * Not `NovelistRow`'s `RowButton` — that is a pill, sized to its label, which
 * is right in a row where it sits beside text and wrong here, where it is the
 * card's base. Two of them (accept and decline) split the width evenly, which
 * is web's `ButtonContainer` with `gap: 8`.
 */
const CardButton = memo(
  ({
    accessibilityLabel,
    busy,
    icon,
    label,
    metrics,
    onPress,
    tone,
  }: {
    /** What an icon-only button is called. Defaults to "Open profile". */
    accessibilityLabel?: string;
    busy: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    /** Absent for the square icon-only button beside the labelled one. */
    label?: string;
    metrics: CardMetrics;
    onPress: () => void;
    tone: "primary" | "positive" | "danger" | "quiet";
  }) => (
    <Button
      accessibilityLabel={label ?? accessibilityLabel ?? "Open profile"}
      busy={busy}
      icon={icon}
      label={label}
      onPress={onPress}
      shape="rect"
      size={metrics.buttonSize}
      stretch={Boolean(label)}
      style={
        label
          ? { height: metrics.buttonHeight, paddingHorizontal: space.s }
          : {
              height: metrics.buttonHeight,
              paddingHorizontal: 0,
              width: metrics.squareWidth,
            }
      }
      variant={tone}
    />
  ),
);

const NovelistCardView = ({
  onAction,
  onChanged,
  onMore,
  person,
  width = NOVELIST_CARD_WIDTH,
}: {
  /**
   * A button was pressed — add, cancel, accept, decline, message. Called on
   * the press, not the answer: the rail moves on at once, as Facebook's does,
   * and the card keeps showing the outcome where it now sits.
   */
  onAction?: (id: string) => void;
  /** Opens the rail's `⋯` menu for this person. Omitted, there is no `⋯`. */
  onMore?: (id: string) => void;
  /**
   * Told the connection the server confirmed, for a caller whose copy of this
   * person is not in the query cache — a friend request read off a
   * notification, say — and would otherwise keep drawing the old button.
   */
  onChanged?: (id: string, connection: Connection) => void;
  person: NovelistCardPerson;
  /** The rail's to decide; see "Two sizes" above. */
  width?: number;
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const action = useConnectionAction();
  // The store's copy, not `useSession()`: that is two query observers per
  // row, and every one of them re-rendered when the session settled.
  const me = useGlobalState("novelist");
  const m = cardMetrics(width);
  const s = sizedFor(m);

  const connection = (person.connection ?? null) as Connection;
  const isSelf = me?.id === person.id;
  // Support is not somebody to add: its card opens the profile instead.
  const isSupport = isSupportNovelist(person.username);
  const accent = useMemo(
    () => accentFromPalette(person.palette),
    [person.palette],
  );
  const muses = useMemo(
    () => mainVerseMuses(person.muses ?? []),
    [person.muses],
  );
  const visibleMuses = useMemo(
    () => muses.slice(0, m.maxMuses),
    [m.maxMuses, muses],
  );
  const extraMuses = muses.length - visibleMuses.length;
  const mutual = person.mutualFriendCount ?? 0;

  const busy = action.isPending;
  const running = busy ? action.variables?.action : undefined;

  const openProfile = () =>
    router.push({
      params: { username: person.username },
      pathname: "/novelist/[username]",
    });

  const run = (name: ConnectionActionName, next: Connection, what: string) => {
    if (busy) return;
    onAction?.(person.id);
    action
      .mutateAsync({ action: name, novelist: person })
      .then(() => onChanged?.(person.id, next))
      .catch(() =>
        Alert.alert("Not saved", `${what} could not be completed. Try again.`),
      );
  };

  const message = () => {
    if (busy) return;
    onAction?.(person.id);
    action
      .mutateAsync({ action: "message", novelist: person })
      .then((conversationId) => {
        if (!conversationId) {
          Alert.alert("No conversation", "It could not be opened. Try again.");
          return;
        }
        router.push({
          params: { conversationId },
          pathname: "/(tabs)/(inbox)/[conversationId]",
        });
      })
      .catch(() =>
        Alert.alert("Not opened", "That conversation could not be opened."),
      );
  };

  return (
    <Pressable
      accessibilityLabel={fullName(person)}
      accessibilityRole="button"
      onPress={openProfile}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          minHeight: m.floor,
          opacity: pressed ? 0.85 : 1,
          width,
        },
      ]}
    >
      <View style={[styles.banner, { height: novelistCardBanner(width) }]}>
        {person.banner?.src ? (
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            recyclingKey={person.banner.src}
            source={{ uri: person.banner.src }}
            style={styles.fill}
            transition={0}
          />
        ) : (
          // Web's banner falls back to a flat `--accent-6`; a two-stop gradient
          // between that step and the faintest tint reads as deliberate rather
          // than as a missing image, which matters here where the banner is a
          // third of the card. Not the solid step: at this size a saturated
          // block is louder than any real banner and pulls the eye off the name.
          <LinearGradient
            colors={[accent.surface, accent.tint]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.fill}
          />
        )}
      </View>

      <View
        style={[
          styles.body,
          { paddingBottom: m.bodyPad, paddingHorizontal: m.bodyPad },
        ]}
      >
        {/*
          Two rings, as web's two box-shadows: the card's own colour to punch
          the face out of the banner, and a hairline of their accent outside it.
          One ring alone either floats (accent only) or dissolves into the body
          (card colour only).
        */}
        <View style={[s.ring, { borderColor: accent.surface }]}>
          <View
            style={[
              s.face,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.fill,
              },
            ]}
          >
            <Avatar
              image={person.avatar}
              name={person.firstName}
              size={m.avatar}
              uri={person.avatar?.src ?? person.image}
              username={person.username}
            />
            {person.isVerified ? (
              <View
                style={[
                  styles.verified,
                  { backgroundColor: theme.material.fill },
                ]}
              >
                <Ionicons
                  color={accent.text}
                  name="checkmark-circle"
                  size={m.verified}
                />
              </View>
            ) : null}
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={[styles.name, s.name, { color: theme.text }]}
        >
          {fullName(person)}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.handle, s.handle, { color: accent.text }]}
        >
          @{person.username}
        </Text>

        {/*
          Web's `StatsRow`: the counts spelled out with their icons, the number
          in the text colour and the word in the secondary one. Fixed height, so
          a novelist with neither stat does not shorten the card above the rule.
        */}
        <View style={[styles.stats, s.stats]}>
          {muses.length > 0 ? (
            <View style={styles.stat}>
              <Ionicons
                color={theme.textGray}
                name="pencil-outline"
                size={m.statIcon}
              />
              <Text
                numberOfLines={1}
                style={[styles.statText, s.statText, { color: theme.textGray }]}
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {muses.length}
                </Text>{" "}
                {muses.length === 1 ? "character" : "characters"}
              </Text>
            </View>
          ) : null}
          {mutual > 0 ? (
            <View style={styles.stat}>
              <Ionicons
                color={theme.textGray}
                name="people-outline"
                size={m.statIcon}
              />
              <Text
                numberOfLines={1}
                style={[styles.statText, s.statText, { color: theme.textGray }]}
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {mutual}
                </Text>{" "}
                {/* "mutual" at every size: the people icon says friends, and
                    the full phrase beside "N characters" truncated both once
                    the home rail's card shrank to 64% of the screen. */}
                mutual
              </Text>
            </View>
          ) : null}
        </View>

        {/*
          Web's `MuseBlock`: ruled top and bottom, its label in small caps, the
          faces lapped into one group. The faces are not tappable the way web's
          are — the whole card is one target for the profile, and a second
          target inside it at this size is below what a thumb can aim at.
        */}
        <View style={[styles.museBlock, { borderColor: theme.material.edge }]}>
          <Text style={[styles.museLabel, { color: theme.textGray }]}>
            CHARACTERS
          </Text>
          {visibleMuses.length > 0 ? (
            <View style={styles.museRow}>
              {visibleMuses.map((muse, index) => (
                <View
                  key={muse.id ?? `${muse.firstName}-${index}`}
                  style={[
                    styles.museFace,
                    s.museFace,
                    index > 0 && s.museLapped,
                    { borderColor: theme.material.fill },
                  ]}
                >
                  <Avatar
                    image={muse.avatar}
                    name={muse.firstName}
                    size={m.museFace}
                    uri={muse.avatar?.src ?? muse.image}
                  />
                </View>
              ))}
              {extraMuses > 0 ? (
                <View
                  style={[
                    styles.museFace,
                    s.museFace,
                    s.museLapped,
                    styles.museOverflow,
                    s.museOverflow,
                    {
                      backgroundColor: accent.tintStrong,
                      borderColor: theme.material.fill,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.museMore,
                      { color: accent.text, fontSize: m.statText },
                    ]}
                  >
                    +{extraMuses}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text
              style={[
                styles.museEmpty,
                s.museEmpty,
                { color: theme.textGray, fontSize: m.statText },
              ]}
            >
              No characters yet
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {isSelf || (isSupport && connection !== "FRIEND") ? (
            <CardButton
              busy={false}
              icon="person-outline"
              label="Open Profile"
              metrics={m}
              onPress={openProfile}
              tone="quiet"
            />
          ) : connection === "FRIEND" ? (
            // Web pairs Message with a square button to the profile; the card
            // itself already opens the profile, so the square one is what keeps
            // the friend state from being a lone wide button unlike every other.
            // The wide card has room to say what the square is.
            <>
              <CardButton
                busy={running === "message"}
                icon="chatbubble-ellipses"
                label="Message"
                metrics={m}
                onPress={message}
                tone="primary"
              />
              <CardButton
                busy={false}
                icon="person-outline"
                label={m.wide ? "Profile" : undefined}
                metrics={m}
                onPress={openProfile}
                tone="quiet"
              />
            </>
          ) : connection === "FRIEND_REQUEST_SENT" ? (
            <CardButton
              busy={running === "cancel"}
              icon="time-outline"
              label="Cancel Request"
              metrics={m}
              onPress={() => run("cancel", null, "Cancelling the request")}
              tone="quiet"
            />
          ) : connection === "FRIEND_REQUEST_RECEIVED" ? (
            <>
              <CardButton
                busy={running === "accept"}
                icon="checkmark"
                label="Accept"
                metrics={m}
                onPress={() => run("accept", "FRIEND", "Accepting")}
                tone="positive"
              />
              {/* A square on the compact card, as the profile button beside
                  Message is: two labelled halves of a 176pt card had room for
                  neither word, and the one you are being asked for is Accept.
                  The wide card has room for both. */}
              <CardButton
                accessibilityLabel="Decline"
                busy={running === "reject"}
                icon="close"
                label={m.wide ? "Decline" : undefined}
                metrics={m}
                onPress={() => run("reject", null, "Declining")}
                tone="danger"
              />
            </>
          ) : (
            <>
              <CardButton
                busy={running === "send"}
                icon="person-add"
                label="Add Friend"
                metrics={m}
                onPress={() =>
                  run("send", "FRIEND_REQUEST_SENT", "The friend request")
                }
                tone="primary"
              />
              {onMore ? (
                <CardButton
                  accessibilityLabel="More"
                  busy={false}
                  icon="ellipsis-horizontal"
                  metrics={m}
                  onPress={() => onMore(person.id)}
                  tone="quiet"
                />
              ) : null}
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const NovelistCard = memo(NovelistCardView);

/**
 * The card's shape before its people arrive: the same bands, blank. A single
 * grey box of the right height is the same cost and says less about what is
 * coming.
 */
export const NovelistCardShimmer = ({
  width = NOVELIST_CARD_WIDTH,
}: {
  width?: number;
}) => {
  const theme = useAppTheme();
  const m = cardMetrics(width);
  const s = sizedFor(m);
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.material.fill,
          borderColor: theme.material.edge,
          minHeight: m.floor,
          width,
        },
      ]}
    >
      <View
        style={[
          styles.banner,
          {
            backgroundColor: theme.material.fillPressed,
            height: novelistCardBanner(width),
          },
        ]}
      />
      <View
        style={[
          styles.body,
          { paddingBottom: m.bodyPad, paddingHorizontal: m.bodyPad },
        ]}
      >
        <View
          style={[
            s.ring,
            s.ghost,
            {
              backgroundColor: theme.material.fillPressed,
              borderColor: theme.material.fill,
            },
          ]}
        />
        <View
          style={[
            styles.ghostLine,
            styles.ghostName,
            { backgroundColor: theme.material.fillPressed, height: m.name - 2 },
          ]}
        />
        <View
          style={[
            styles.ghostLine,
            styles.ghostHandle,
            { backgroundColor: theme.material.fillPressed },
          ]}
        />
        <View style={[styles.museBlock, { borderColor: theme.material.edge }]}>
          <View
            style={[
              styles.ghostLine,
              s.ghostFaces,
              { backgroundColor: theme.material.fillPressed },
            ]}
          />
        </View>
        <View style={styles.actions}>
          <View
            style={[
              styles.ghostButton,
              {
                backgroundColor: theme.material.fillPressed,
                height: m.buttonHeight,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.s,
    // Web's `margin-top: auto`: the buttons sit on the card's floor whatever
    // the content above them came to.
    marginTop: "auto",
    paddingTop: space.sm,
    width: "100%",
  },
  banner: { width: "100%" },
  body: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  card: {
    borderRadius: radius.cardSm,
    borderWidth: border.edge,
    // Clipped: the banner is square and the card's corners are not.
    overflow: "hidden",
  },
  fill: { height: "100%", width: "100%" },
  ghostButton: { borderRadius: radius.sm, flex: 1 },
  ghostHandle: { height: 10, marginTop: space.s, width: "45%" },
  ghostLine: { borderRadius: radius.sm },
  ghostName: { marginTop: space.xxs, width: "70%" },
  handle: { marginTop: 1, opacity: 0.9 },
  museBlock: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
    marginTop: space.sm,
    paddingBottom: space.sm,
    paddingTop: space.sm - 1,
    width: "100%",
  },
  museEmpty: {
    fontStyle: "italic",
    opacity: 0.7,
  },
  museFace: { borderWidth: 2 },
  museLabel: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 1.3,
    opacity: 0.7,
  },
  museMore: { fontWeight: "700" },
  museOverflow: {
    alignItems: "center",
    justifyContent: "center",
  },
  museRow: { alignItems: "center", flexDirection: "row" },
  name: {
    fontWeight: "700",
    letterSpacing: -0.2,
    maxWidth: "100%",
  },
  // Shrinks: two counts on a 176pt card are a tight fit, and a word that
  // shortens is better than a row that runs to the card's edges.
  stat: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 3,
    minWidth: 0,
  },
  stats: {
    alignItems: "center",
    flexDirection: "row",
    // The gap is the separator: a dot between the two cost the eleven points
    // that decided whether both counts fit.
    gap: space.sm,
    justifyContent: "center",
    marginTop: space.xs + 1,
    maxWidth: "100%",
  },
  statText: { flexShrink: 1 },
  statValue: { fontWeight: "700" },
  verified: {
    borderRadius: radius.full,
    bottom: 0,
    position: "absolute",
    right: -1,
  },
});
