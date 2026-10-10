import { Ionicons } from "@expo/vector-icons";
import {
  isMediaOnlyMessage,
  isVideoOnlyMessage,
  messagePreview,
  messageTextOf,
} from "@nw/chat";
import type { Message, MessageSender } from "@nw/types";
import { toChatTime } from "@nw/utils";
import { memo, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Avatar } from "@/components/avatar";
import {
  AttachmentMosaic,
  captionOf,
  MessageAttachments,
  MessageTextMedia,
  MOSAIC_FRAME,
  mediaItemsOf,
} from "@/components/chat/message-media";
import {
  REACTION_OVERHANG,
  type ReactionGroup,
  ReactionRow,
  useReactionGroups,
} from "@/components/chat/reactions";
import { RepliedIceBreaker } from "@/components/chat/replied-ice-breaker";
import { RichText } from "@/components/rich-text";
import { Text } from "@/components/text";
import {
  border,
  fontSize,
  MEDIA_CHIP,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * One message.
 *
 * Memoised, because a conversation re-renders on every incoming frame and on
 * every keystroke in the composer above it — without this, typing a sentence
 * re-renders every bubble in the thread once per character, which on a long
 * conversation is visible as input lag.
 *
 * The body goes through the shared rich-text renderer rather than `<Text>`:
 * messages carry the same markup an About section does, and a `<Text>` here
 * would render `<div style="text-align: center;">` as literal characters.
 *
 * ## Shape carries the grouping
 *
 * A run of messages from one person is drawn as one shape rather than as
 * identical lozenges: the corner facing the sender stays square in the middle
 * of a run and rounds off at its ends, so where a run starts and stops is
 * legible without reading a name or a clock. The timestamp appears only on the
 * last message of a run, which removes a line of grey from most bubbles and
 * leaves the one that means something.
 *
 * ## Gestures
 *
 * Four, all of them ones people arrive already knowing:
 *
 *  - **Swipe toward the centre to reply.** The direction depends on the side
 *    the bubble is on, so the gesture always drags the message *away* from its
 *    edge. It springs back and fires on release, so nothing is left open.
 *  - **Long press for the actions sheet** — react, reply, copy, retry.
 *  - **Double tap to react** with a heart, the shortcut people try first.
 *  - **Tap a reaction chip** to react with the same thing.
 *
 * All of it is `PanResponder`/`Animated` from React Native itself. See
 * `components/sheet.tsx` for why this app adds no gesture library.
 */

export interface PendingState {
  /** The message has not been acknowledged by the server yet. */
  pending?: boolean;
  /** The send failed; tapping retries. */
  failed?: boolean;
  /** Written offline, waiting in the outbox for a connection. Long press to remove. */
  queued?: boolean;
  onRetry?: () => void;
}

/** Where this message sits in its sender's run: alone, first, middle or last. */
export type RunPosition = "single" | "first" | "middle" | "last";

/** How far the bubble must travel before the reply fires on release. */
const REPLY_THRESHOLD = 56;

/** Past this the bubble stops following the finger at full speed. */
const REPLY_MAX = 76;

/** Below this, the touch is a tap or the list is being scrolled. */
const SLOP = 10;

/** Two taps closer together than this are a double tap. */
const DOUBLE_TAP_MS = 280;

/**
 * What a double tap sends — a key, not a glyph.
 *
 * The stored value is a short name (`heart`), which each client draws in its
 * own way; sending the emoji instead makes web print it raw next to its
 * hand-drawn set. See `@nw/chat/reactions`.
 */
const QUICK_REACTION = "heart";

/** The corner between two bubbles of one run — nearly square, so they join. */
const JOINED = radius.sm;

/** The corner where the tail would be, on the last bubble of a run. */
const TAIL = 4;

/**
 * The four corners, from which side the bubble is on and where it sits in a run.
 *
 * Only the two facing the sender change; the outer edge stays fully round
 * throughout, which is what keeps a run reading as one column rather than a
 * stack of separate shapes.
 *
 * The bottom corner is the interesting one, and the first version had it
 * backwards. It went *round* at the end of a run, which is the shape of a
 * bubble floating free — so a run ended by dissolving. Every messenger does the
 * opposite: the last bubble is pinched at the corner nearest its sender, which
 * is where a speech tail would attach. That pinch is what anchors a run to the
 * person who wrote it, and it is why a thread reads as two columns of speech
 * rather than as a list of cards.
 */
const cornerStyle = (mine: boolean, position: RunPosition) => {
  const full = radius.lg;
  const first = position === "first" || position === "single";
  const last = position === "last" || position === "single";

  // Round only where a run begins; pinched where it ends, joined in between.
  const top = first ? full : JOINED;
  const bottom = last ? TAIL : JOINED;

  return mine
    ? {
        borderBottomLeftRadius: full,
        borderBottomRightRadius: bottom,
        borderTopLeftRadius: full,
        borderTopRightRadius: top,
      }
    : {
        borderBottomLeftRadius: bottom,
        borderBottomRightRadius: full,
        borderTopLeftRadius: top,
        borderTopRightRadius: full,
      };
};

/**
 * A stable colour for a name in a group thread.
 *
 * Group chats are a wall of near-identical bubbles, and the sender's name above
 * each run is the only thing distinguishing them — in one accent colour, that
 * label is decoration rather than information. Hashing the username into a
 * small palette is what every group messenger does, and it works for the same
 * reason: the colour is consistent for a person across the whole thread, so it
 * becomes recognisable before the name is read.
 *
 * Hue only. The palette is fixed rather than generated so nothing lands on a
 * near-invisible value in either theme.
 */
const NAME_COLOURS = [
  "#e0736e",
  "#e0a15c",
  "#c9b458",
  "#7fb069",
  "#5eb1a6",
  "#5f9bd5",
  "#8f7fd1",
  "#c97fb8",
];

const nameColour = (seed: string | undefined): string | null => {
  if (!seed) return null;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    // Ordinary string hash. It only has to be stable and well spread; nothing
    // depends on it being hard to reverse.
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return NAME_COLOURS[Math.abs(hash) % NAME_COLOURS.length] as string;
};

/**
 * What to hash a sender's colour from.
 *
 * The username is the right answer for a novelist and the **wrong** one for a
 * muse: chat-server overwrites `username` from the authenticated connection, so
 * every muse a novelist writes as carries that novelist's handle. Hashing it
 * would paint all of one person's characters the same colour, which is the one
 * thing the colour exists to prevent.
 *
 * `sender.id` is the muse's own id, so it separates them. Going through one
 * helper is what keeps the persona chip, the group name and a quote of that
 * message agreeing on the colour instead of each picking its own field.
 */
const senderSeed = (sender: MessageSender | undefined): string | undefined =>
  sender?.messageSourceType === "MUSE" ? sender.id : sender?.username;

/**
 * Who is speaking, when it is not the person who sent it.
 *
 * A novelist can write as themselves or as any muse they have penned, and until
 * now the only client-side trace of that choice was on *incoming* messages —
 * the muse's face beside the bubble, and in a group its name inside the top of
 * it. Your own messages have no avatar and no name by design, so picking a muse
 * and sending changed nothing you could see. You could write a whole scene in
 * character and have no way to check you had, short of the composer's picker
 * still being set the way you left it.
 *
 * This is that missing line: a small nameplate above the first bubble of the
 * run, carrying the character's own face and name.
 *
 * ## Why above the bubble and not inside it
 *
 * The group sender name is drawn inside the top of the bubble, and that is
 * right for it — it labels a bubble among other people's bubbles. This labels a
 * bubble among *your* bubbles, where the question is not "who out of these
 * five" but "is this me or a character". Sitting outside the bubble is what
 * makes it read as a change of voice rather than as a line of the message, and
 * it is the same place a stage direction sits relative to a line of dialogue.
 *
 * It also has to work over a bare GIF, which has no bubble to sit inside.
 *
 * ## Only at the start of a run
 *
 * Repeating it on every bubble would be four nameplates down a four-message
 * reply, which is noise rather than information: the voice changed once. The
 * run already breaks whenever the sender id changes, so the first bubble of a
 * run is exactly where a change of character lands.
 */
const PersonaTag = ({
  mine,
  sender,
}: {
  mine: boolean;
  sender: MessageSender;
}) => {
  const theme = useAppTheme();

  // Your own character takes the accent, as everything of yours in this thread
  // does; somebody else's takes its own hashed colour, so two characters in one
  // group stay told apart.
  const colour = mine
    ? theme.accent.text
    : (nameColour(senderSeed(sender)) ?? theme.accent.text);

  return (
    <View
      style={[
        styles.persona,
        {
          alignSelf: mine ? "flex-end" : "flex-start",
          backgroundColor: mine
            ? theme.accent.tint
            : theme.material.fillPressed,
          borderColor: mine ? theme.accent.surfaceHover : theme.material.edge,
        },
      ]}
    >
      {/*
        No `username`. `Avatar` draws the presence ring from it, and the
        username on a muse message is the novelist's — so passing it would put a
        green "online" dot on a fictional character.
      */}
      <Avatar name={sender.name} size={16} uri={sender.image} />

      <Text numberOfLines={1} style={[styles.personaName, { color: colour }]}>
        {sender.name || sender.username}
      </Text>
    </View>
  );
};

const MessageBubbleComponent = ({
  failed,
  highlighted,
  message,
  mine,
  myUsername,
  onOpenMedia,
  onOpenSender,
  onReact,
  onReply,
  onRetry,
  onShowActions,
  onShowReactors,
  onJumpToQuoted,
  pending,
  position = "single",
  queued,
  showAvatar,
  showSender,
}: PendingState & {
  /** Flashed after the thread jumps here, so the eye lands on the right row. */
  highlighted?: boolean;
  message: Message;
  mine: boolean;
  /** Decides which reaction chip is drawn as yours. */
  myUsername?: string;
  /** Opens the viewer on one of the message's pictures or clips. */
  onOpenMedia?: (message: Message, index: number) => void;
  /** Opens the sender's profile from their avatar. */
  onOpenSender?: (username: string) => void;
  /** Omitted while the socket is down — a reaction has no REST fallback. */
  onReact?: (message: Message, reaction: string) => void;
  onReply?: (message: Message) => void;
  onShowActions?: (message: Message) => void;
  onShowReactors?: (groups: ReactionGroup[]) => void;
  /** Scrolls the thread to the message this one answers. */
  onJumpToQuoted?: (messageId: string) => void;
  position?: RunPosition;
  /** Groups only: the sender's name above the first of their run of messages. */
  showSender?: boolean;
  showAvatar?: boolean;
}) => {
  const theme = useAppTheme();
  const reply = message.repliedTo?.message ?? null;

  /*
   * The other thing a message can reply to.
   *
   * `repliedTo.type` picks which half of the object the server filled in, and
   * only the message half was ever read here — so a reply to an ice breaker
   * arrived as a bubble with nothing above it, in a conversation that usually
   * has no earlier message to explain it either.
   */
  const repliedIceBreaker =
    message.repliedTo?.type === "ICE_BREAKER"
      ? (message.repliedTo.iceBreaker ?? null)
      : null;
  const reactions = useReactionGroups(message.reactions, myUsername);

  /**
   * A message that is nothing but one media URL renders as the media alone.
   *
   * A GIF wrapped in a tinted, bordered bubble with the URL printed underneath
   * is what this looked like before — the sender picked a sticker and got a
   * link. Web drops the bubble for exactly this case (`isMessageOnlyUrls`), and
   * the predicate is shared so the two cannot disagree about which messages
   * qualify.
   *
   * Clips are the same case and were missed: web's rule is image-only by
   * design, so a sent clip played *and* printed
   * `https://static.klipy.com/….mp4` underneath itself. `isVideoOnlyMessage`
   * is the video half of the question, and it lives in `@nw/chat` beside the
   * image one rather than as a local guess here.
   */
  /*
   * Asked of the message's *words* (`messageTextOf`), not its source: web's
   * composer sends its contenteditable's `innerHTML`, so a GIF link typed in a
   * browser arrives as `https://….gif&nbsp;` or `<br>https://….gif`, and both
   * are one GIF link. Asking the raw string said neither was.
   */
  const words = messageTextOf(message.message);
  const videoOnly = isVideoOnlyMessage(words);
  const mediaOnly = videoOnly || isMediaOnlyMessage(words);

  // The clock earns its line only at the end of a run, or when something has
  // gone wrong and the row is saying so instead.
  const showMeta =
    failed || pending || queued || position === "last" || position === "single";

  /** The quoted message as a line of words, never as its markup or its URL. */
  const quote = reply ? messagePreview(reply, "noun") : null;

  const senderColour = nameColour(senderSeed(message.sender));

  /*
   * Written in character, and this is where that run begins.
   *
   * `position` already carries the run break — the screen ends a run whenever
   * the sender id changes — so nothing has to be passed down for this.
   */
  const showPersona =
    message.sender?.messageSourceType === "MUSE" &&
    (position === "first" || position === "single");

  /*
   * Pictures and clips the sender attached, drawn as one album that fills the
   * bubble to a thin frame (see `AttachmentMosaic`). With nothing under it —
   * no words, no file cards — the time sits over the album's corner rather
   * than on a line of its own under a wall of pictures. A name or a quote
   * above the album does not change that: the corner is still the bottom.
   */
  const media = useMemo(
    () => mediaItemsOf(message.attachments),
    [message.attachments],
  );
  const hasMosaic = media.length > 0;
  /*
   * The words under the media, with the link that *is* the media taken out:
   * a GIF pasted into a sentence was drawn as the GIF and then printed as the
   * link under it. Empty when nothing but the link was said. Under an album
   * the text's links are not drawn (`MessageTextMedia` yields to the mosaic),
   * so they stay words.
   */
  const caption = useMemo(
    () => (hasMosaic ? (message.message ?? "") : captionOf(message.message)),
    [hasMosaic, message.message],
  );
  const captionless =
    hasMosaic &&
    !caption.trim() &&
    (message.attachments?.length ?? 0) === media.length;

  // Swiping a bubble toward the centre of the screen drags it away from its own
  // edge: leftwards for your messages on the right, rightwards for theirs.
  const direction = mine ? -1 : 1;
  const translateX = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const travelled = useRef(0);
  const lastTap = useRef(0);

  /*
   * What the responder reads. It is created once, on mount, so without this
   * it kept the first render's `message` — and the reply it fired quoted
   * the message as it was before its reactions and read receipt landed.
   */
  const latest = useRef({ message, onReply });
  latest.current = { message, onReply };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) => {
        if (!latest.current.onReply) return false;
        if (Math.abs(gesture.dx) < SLOP) return false;
        if (Math.abs(gesture.dx) <= Math.abs(gesture.dy)) return false;
        // Only the direction that means "reply"; the other way does nothing,
        // and a bubble that slides both ways looks like it has two actions.
        return Math.sign(gesture.dx) === direction;
      },
      onPanResponderMove: (_event, gesture) => {
        const raw = Math.min(Math.abs(gesture.dx), REPLY_MAX + 24);
        const eased =
          raw <= REPLY_MAX ? raw : REPLY_MAX + (raw - REPLY_MAX) * 0.3;
        travelled.current = eased;
        translateX.setValue(eased * direction);
      },
      onPanResponderRelease: () => {
        const distance = travelled.current;
        travelled.current = 0;
        Animated.spring(translateX, {
          bounciness: 6,
          toValue: 0,
          useNativeDriver: true,
        }).start();
        if (distance > REPLY_THRESHOLD) {
          latest.current.onReply?.(latest.current.message);
        }
      },
      onPanResponderTerminate: () => {
        travelled.current = 0;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      // Once the bubble is sliding, it keeps the drag. Every further move
      // re-asks the ancestors, and the screen's swipe-back (`use-swipe-back`)
      // would otherwise take a rightward reply swipe away halfway through.
      onPanResponderTerminationRequest: () => false,
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;

  /*
   * The jump target announces itself and then stops.
   *
   * Scrolling to a message lands it somewhere on screen with no indication of
   * *which* row was asked for — in a run of five similar bubbles that is a
   * jump to nowhere. A brief wash of accent behind the bubble answers it, and
   * fades so the thread is not left with a permanently selected row.
   */
  useEffect(() => {
    if (!highlighted) return;
    flash.setValue(1);
    Animated.timing(flash, {
      delay: 550,
      duration: 700,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [flash, highlighted]);

  // The reply icon fades in from under the bubble as it moves, so the gesture
  // says what it will do before the finger lifts.
  const hintOpacity = translateX.interpolate({
    extrapolate: "clamp",
    inputRange: mine ? [-REPLY_THRESHOLD, 0] : [0, REPLY_THRESHOLD],
    outputRange: mine ? [1, 0] : [0, 1],
  });

  const press = (toValue: number) => {
    Animated.spring(pressScale, {
      speed: 40,
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (failed) {
      onRetry?.();
      return;
    }
    const now = Date.now();
    if (onReact && now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      onReact(message, QUICK_REACTION);
      return;
    }
    lastTap.current = now;
  };

  return (
    <View
      style={[
        styles.row,
        mine && styles.rowMine,
        // Room under the bubble for the chips hanging off its edge, so the next
        // message does not sit on top of them.
        reactions.length > 0 ? styles.rowReacted : null,
      ]}
    >
      {!mine ? (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <Pressable
              accessibilityHint="Opens their profile"
              accessibilityLabel={message.sender?.name ?? "Sender"}
              accessibilityRole="button"
              // The face beside a message is the first thing people tap to ask
              // "who is this?", and until now it did nothing at all.
              onPress={() =>
                message.sender?.username &&
                onOpenSender?.(message.sender.username)
              }
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Avatar
                name={message.sender?.name}
                size={28}
                uri={message.sender?.image}
                username={message.sender?.username}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.hint,
          mine ? styles.hintMine : styles.hintTheirs,
          { opacity: hintOpacity },
        ]}
      >
        <Ionicons color={theme.textGray} name="arrow-undo" size={16} />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.bubbleWrap,
          { transform: [{ translateX }, { scale: pressScale }] },
        ]}
      >
        {/*
          Inside the wrapper rather than beside it, so the swipe-to-reply
          transform carries the nameplate with its bubble. `ReactionRow` is
          absolutely positioned and the flash is an overlay, so this is the only
          other thing in the wrapper's flow — a short message with a long
          character name widens the bubble to match, which is what the group
          name inside the bubble has always done.
        */}
        {showPersona && message.sender ? (
          <PersonaTag mine={mine} sender={message.sender} />
        ) : null}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flash,
            { backgroundColor: theme.accent.solid, opacity: flash },
          ]}
        />

        <Pressable
          delayLongPress={280}
          onLongPress={() => onShowActions?.(message)}
          onPress={handlePress}
          // A press that dips the bubble slightly is the only feedback a long
          // press gets before the sheet opens, and without it the 280ms wait
          // feels like a dropped tap.
          onPressIn={() => press(0.97)}
          onPressOut={() => press(1)}
          style={[
            styles.bubble,
            mediaOnly
              ? styles.bubbleBare
              : {
                  backgroundColor: mine
                    ? theme.accent.surface
                    : theme.material.fillPressed,
                  borderColor: failed
                    ? theme.error
                    : mine
                      ? theme.accent.surfaceHover
                      : theme.material.edge,
                  borderWidth: border.edge,
                  ...cornerStyle(mine, position),
                },
            // An album fills the bubble to a thin frame; the words around it
            // keep their own padding instead.
            hasMosaic ? styles.bubbleMedia : null,
            // A message in flight is dimmed rather than hidden: it is on screen,
            // in order, and simply not confirmed yet. An album says so on its
            // tiles instead, where a dimmed picture only looks broken.
            { opacity: pending && !hasMosaic ? 0.6 : 1 },
          ]}
        >
          {showSender && !showPersona ? (
            <Text
              numberOfLines={1}
              style={[
                styles.sender,
                hasMosaic ? styles.padded : null,
                { color: senderColour ?? theme.accent.text },
              ]}
            >
              {message.sender?.name || message.sender?.username}
            </Text>
          ) : null}

          {repliedIceBreaker ? (
            <View style={hasMosaic ? styles.padded : null}>
              <RepliedIceBreaker iceBreaker={repliedIceBreaker} />
            </View>
          ) : null}

          {reply ? (
            <Pressable
              accessibilityHint="Goes to the message this replies to"
              accessibilityRole="button"
              // Tappable, because a quote you cannot follow is a screenshot of
              // the conversation rather than a link into it.
              onPress={() => onJumpToQuoted?.(reply.id)}
              style={({ pressed }) => [
                styles.quote,
                hasMosaic ? styles.quoteInset : null,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.glass.field,
                  borderLeftColor:
                    nameColour(senderSeed(reply.sender)) ?? theme.accent.solid,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.quoteAuthor,
                  {
                    color:
                      nameColour(senderSeed(reply.sender)) ?? theme.accent.text,
                  },
                ]}
              >
                {reply.sender?.name || reply.sender?.username}
              </Text>
              <View style={styles.quoteBodyRow}>
                {/* A quoted GIF used to be forty characters of CDN URL. Named
                    media gets an icon and its noun; words stay words. */}
                {quote?.describes ? (
                  <Ionicons
                    color={theme.textGray}
                    name={
                      quote.text === "Clip"
                        ? "film-outline"
                        : quote.text === "Audio"
                          ? "musical-notes-outline"
                          : "image-outline"
                    }
                    size={11}
                  />
                ) : null}
                <Text
                  numberOfLines={2}
                  style={[styles.quoteBody, { color: theme.textGray }]}
                >
                  {quote?.text}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {/*
            Media first, then words — the order web uses, and the order that
            matters: a GIF with a caption should show the GIF above the caption,
            not after it.
          */}
          {hasMosaic ? (
            <AttachmentMosaic
              items={media}
              onLongPress={() => onShowActions?.(message)}
              onOpen={
                onOpenMedia ? (index) => onOpenMedia(message, index) : undefined
              }
              pending={pending}
            />
          ) : (
            <MessageTextMedia
              onLongPress={() => onShowActions?.(message)}
              onOpen={
                onOpenMedia ? (index) => onOpenMedia(message, index) : undefined
              }
              text={message.message}
            />
          )}

          {/* No empty line under an album that came without words. */}
          {mediaOnly || !caption.trim() ? null : (
            <View style={hasMosaic ? styles.caption : null}>
              <RichText html={caption} />
            </View>
          )}

          {(message.attachments?.length ?? 0) > media.length ? (
            <View style={hasMosaic ? styles.padded : null}>
              <MessageAttachments attachments={message.attachments ?? []} />
            </View>
          ) : null}

          {showMeta ? (
            <View
              style={[
                styles.meta,
                mine && styles.metaMine,
                hasMosaic && !captionless ? styles.padded : null,
                // Over a bare GIF, or over the corner of an album with no words
                // under it, the row has no bubble behind it, so it gets its own
                // scrim rather than white-on-whatever.
                mediaOnly || captionless ? styles.metaOverlay : null,
                captionless ? styles.metaOnMosaic : null,
                // A clip's foot is its player's controls once it plays.
                videoOnly ? styles.metaOnClip : null,
              ]}
            >
              {failed ? (
                <>
                  <Ionicons color={theme.error} name="alert-circle" size={12} />
                  <Text style={[styles.time, { color: theme.error }]}>
                    Not sent — tap to retry
                  </Text>
                </>
              ) : queued ? (
                // Not failed, not sending: waiting. Nothing has been tried,
                // and nothing needs doing — it goes when the signal does.
                <>
                  <Ionicons
                    color={
                      mediaOnly || captionless ? "#ffffff" : theme.textGray
                    }
                    name="cloud-offline-outline"
                    size={12}
                  />
                  <Text
                    style={[
                      styles.time,
                      {
                        color:
                          mediaOnly || captionless ? "#ffffff" : theme.textGray,
                      },
                    ]}
                  >
                    Waiting for connection
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.time,
                      {
                        color:
                          mediaOnly || captionless ? "#ffffff" : theme.textGray,
                      },
                    ]}
                  >
                    {pending ? "Sending" : toChatTime(message.createdAt)}
                  </Text>
                  {/*
                    Delivery, on your own messages only.
                    
                    Three states and they are genuinely different questions: a
                    clock means the phone still has it, one tick means the
                    server does, two mean it has been read. Without this the
                    only difference between "sent" and "sitting in a dead
                    socket" was a dimmed bubble nobody reads as a status.
                  */}
                  {mine ? (
                    <Ionicons
                      color={
                        message.isRead
                          ? theme.accent.text
                          : mediaOnly || captionless
                            ? "#ffffff"
                            : theme.textGray
                      }
                      name={
                        pending
                          ? "time-outline"
                          : message.isRead
                            ? "checkmark-done"
                            : "checkmark"
                      }
                      size={13}
                    />
                  ) : null}
                </>
              )}
            </View>
          ) : null}
        </Pressable>

        <ReactionRow
          groups={reactions}
          message={message}
          mine={mine}
          onReact={onReact}
          onShowReactors={onShowReactors ?? (() => {})}
        />
      </Animated.View>
    </View>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);

/** The date rule above a run of messages, so a thread can be read back. */
export const DaySeparator = ({ label }: { label: string }) => {
  const theme = useAppTheme();
  if (!label) return null;

  return (
    <View style={styles.dayRow}>
      <View
        style={[
          styles.dayPill,
          {
            backgroundColor: theme.glass.field,
            borderColor: theme.material.edge,
          },
        ]}
      >
        <Text style={[styles.dayLabel, { color: theme.textGray }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

/** Chips straight on media: web's `MEDIA_CHIP`, no blur. */

const styles = StyleSheet.create({
  // Reserved even when the avatar is hidden, so a run of messages from one
  // person stays aligned instead of stepping left under the first bubble.
  //
  // Wider than the 28px avatar because the presence ring is drawn *outside* it
  // (2px each side), so an online sender needs 32 — at 28 the ring sat hard
  // against the bubble and the screen edge.
  avatarSlot: {
    alignItems: "center",
    marginLeft: space.xs,
    width: 32,
  },
  bubble: {
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  // A bare GIF: no fill, no border, and no padding stealing width from it.
  bubbleBare: {
    backgroundColor: "transparent",
    borderRadius: radius.lg,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  // An album: the bubble is a thin frame around it, and whatever else is in
  // the bubble carries the padding the frame gave up.
  bubbleMedia: {
    gap: space.xs + 1,
    paddingHorizontal: MOSAIC_FRAME,
    paddingVertical: MOSAIC_FRAME,
  },
  // The cap lives on the wrapper rather than the bubble: the bubble is inside
  // an animated view now, and a percentage width there measures the wrapper.
  bubbleWrap: { maxWidth: "80%" },
  // The words under an album: the bubble's own padding, less the frame.
  caption: {
    paddingBottom: space.xxs,
    paddingHorizontal: space.md - MOSAIC_FRAME,
  },
  dayLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  // A pill rather than a rule with a word in it: the thread has a wallpaper
  // behind it, and a hairline across a busy background reads as an artefact.
  dayPill: {
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.md,
    paddingVertical: 3,
  },
  dayRow: { alignItems: "center", paddingVertical: space.sm },
  // Sits behind the bubble and slightly proud of it, so the wash reads as a
  // highlight around the message rather than a tint on top of its text.
  flash: {
    borderRadius: radius.lg,
    bottom: -3,
    left: -4,
    position: "absolute",
    right: -4,
    top: -3,
  },
  hint: { alignSelf: "center", position: "absolute" },
  hintMine: { right: 0 },
  hintTheirs: { left: 40 },
  meta: { alignItems: "center", flexDirection: "row", gap: space.xs },
  // Right-aligned on your own bubbles, so the clock sits under the tail rather
  // than floating in the middle of a short message.
  metaMine: { justifyContent: "flex-end" },
  // Top corner: the bottom of a playing clip is its scrubber, mute and full
  // screen, and the clock laid over the bottom corner covered two of them.
  metaOnClip: { bottom: undefined, top: space.xs },
  // Inside the frame, so the clock sits on the picture's corner, not the bubble's.
  metaOnMosaic: {
    bottom: space.xs + MOSAIC_FRAME,
    right: space.xs + MOSAIC_FRAME,
  },
  metaOverlay: {
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    bottom: space.xs,
    paddingHorizontal: space.s,
    paddingVertical: 1,
    position: "absolute",
    right: space.xs,
  },
  padded: { paddingHorizontal: space.md - MOSAIC_FRAME },
  persona: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 5,
    marginBottom: 3,
    maxWidth: "100%",
    paddingLeft: 3,
    paddingRight: space.sm,
    paddingVertical: 3,
  },
  /*
   * Italic, and smaller than anything else in the row.
   *
   * Italic is the typographic convention for a voice that is not the speaker's
   * own, and it does the work a glyph would have done without adding a second
   * thing to read. 11pt keeps the nameplate subordinate to the message it
   * labels — it is an answer to a question you only sometimes ask.
   */
  personaName: {
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontStyle: "italic",
    fontWeight: "600",
  },
  quote: {
    borderLeftWidth: 2,
    borderRadius: radius.sm,
    gap: 1,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  quoteAuthor: { fontSize: fontSize.caption, fontWeight: "700" },
  quoteBody: { flexShrink: 1, fontSize: fontSize.caption },
  quoteBodyRow: { alignItems: "center", flexDirection: "row", gap: space.xs },
  // Above an album the quote keeps off the frame, as it would off the padding.
  quoteInset: { marginHorizontal: space.sm, marginTop: space.xs },
  row: { alignItems: "flex-end", flexDirection: "row", gap: space.sm },
  rowMine: { justifyContent: "flex-end" },
  rowReacted: { marginBottom: REACTION_OVERHANG + 4 },
  sender: { fontSize: fontSize.caption, fontWeight: "700" },
  time: { fontSize: fontSize.meta },
});
