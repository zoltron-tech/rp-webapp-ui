import { SCRIM_ALPHA } from "@nw/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  hasMarkdown,
  type MessageSenderChoice,
  markdownToHtml,
  messagePreview,
} from "@nw/chat";
import type { Message } from "@nw/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { GlassSurface } from "@/components/glass-surface";
import { applyFormat, FormatBar } from "@/components/chat/format-bar";
import { MarkdownInput } from "@/components/chat/markdown-input";
import { MediaTray, type TrayTab } from "@/components/chat/media-tray";
import { mediaLabel } from "@/components/chat/message-actions";
import { MessageThumb, messageMediaOf } from "@/components/chat/message-media";
import { SenderPicker } from "@/components/chat/sender-picker";
import { useAttachments } from "@/hooks/use-attachments";
import {
  lastKeyboardHeight,
  useKeyboardHeight,
} from "@/hooks/use-keyboard-height";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The message composer.
 *
 * Rebuilt to the shape of the web composer, because the two are the same
 * control and people move between them: the sender's face on the left, the
 * field in the middle with its actions tucked inside the trailing edge, and a
 * media row that unfolds above it. What is different is only what has to be —
 * a phone has no hover, no popovers and a keyboard that eats half the screen.
 *
 * ## What sends what
 *
 * Four kinds of message leave this component and they are not interchangeable:
 *
 *  - **Text.** Sent as typed unless it uses `**` / `*` / `~~` / backticks, in
 *    which case it is converted to the same HTML web's editor would have
 *    produced (`@nw/chat/markdown`). Plain text stays plain deliberately —
 *    wrapping every message in `<div>` would stop `isMediaOnlyMessage` seeing a
 *    bare GIF URL and would change what the inbox preview says.
 *  - **GIFs, stickers and clips.** The CDN URL *is* the message body, exactly
 *    as on web. They send immediately on tap, without touching the draft.
 *  - **Attachments.** Uploaded to S3 as they are picked and sent as the
 *    message's `attachments`, with whatever text is in the field as the caption.
 *
 * ## Lifting above the keyboard
 *
 * Not `KeyboardAvoidingView` — `app.json` sets `edgeToEdgeEnabled`, so the
 * window is never resized and the avoiding view has nothing to measure. See
 * `use-keyboard-height.ts` for the full account.
 *
 * The lift is a **transform**, driven by one animated value the keyboard and
 * the media tray both write into, and it moves *before it is told to*:
 *
 *  - Android only says where the keyboard is once it has finished arriving
 *    (`keyboardDidShow`; there is no `Will` event). Waiting for that left the
 *    composer behind the keyboard for the whole slide and then snapped it up.
 *    So the moment the field is focused the composer rises by the keyboard's
 *    *last* height, in step with the keyboard's own animation, and corrects
 *    itself when the real number lands — on one device with one keyboard
 *    that is a correction of zero.
 *  - The tray writes its height into the same value as it slides, so a tray
 *    replacing a keyboard is one continuous movement rather than a drop and
 *    a rise by two different mechanisms.
 *
 * A margin would have re-laid out the list on every frame of that. The
 * message list is told the settled amount once (`onInsetChange`) and pads
 * its foot by it, which is the only layout the whole exchange costs.
 */

/** About the Android keyboard's own slide, so the two move as one. */
const KEYBOARD_IN_MS = 220;
const KEYBOARD_OUT_MS = 160;
/** How long to hold a guessed lift before deciding no keyboard is coming. */
const PREDICTION_GRACE_MS = 700;

/**
 * The field grows with the text between these, then scrolls.
 *
 * Bounds, not a computed height. Measuring `onContentSizeChange` and writing
 * the result back as a `height` is the obvious way to do this and it shakes:
 * the reported content size includes the padding, so the next render is a pixel
 * or two taller, which reports a new content size, which renders again — a loop
 * that never settles and reads as the composer twitching on every keystroke.
 * A multiline `TextInput` already sizes itself to its content; it only needs to
 * be told where to stop.
 */
const MAX_INPUT_HEIGHT = 120;
const MIN_INPUT_HEIGHT = 40;

export interface ComposerSubmission {
  attachments: { url: string }[] | null;
  text: string;
}

export const Composer = ({
  conversationId,
  disabled,
  onCancelReply,
  onInsetChange,
  onSelectSender,
  onSend,
  placeholder,
  replyingTo,
  selectedSender,
  senders = [],
  sending,
  statusNote,
}: {
  conversationId: string | undefined;
  disabled?: boolean;
  onCancelReply?: () => void;
  /**
   * How much of the screen's foot the composer, the keyboard and the tray
   * currently cover, for the list behind to pad by. Reported when it settles.
   */
  onInsetChange?: (inset: number) => void;
  /** Returns true when the message was accepted; the draft clears only then. */
  onSend: (submission: ComposerSubmission) => boolean | Promise<boolean>;
  onSelectSender?: (sender: MessageSenderChoice) => void;
  placeholder?: string;
  /** The message this one answers, shown as a cancellable banner. */
  replyingTo?: Message | null;
  /** Who the message goes out as. Omit to hide the sender control entirely. */
  selectedSender?: MessageSenderChoice | null;
  senders?: MessageSenderChoice[];
  sending?: boolean;
  /** A line above the input — "Reconnecting", say. Hidden when absent. */
  statusNote?: string | null;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const [draft, setDraft] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  /*
   * The lift. See "Lifting above the keyboard" above.
   *
   * `keyboardLift` is how far the field's bottom edge has to rise to sit on
   * the keyboard: Android reports the keyboard less the navigation bar, and
   * the composer keeps its own navigation-bar padding, so the two cancel and
   * the lift is the reported height itself; iOS reports the whole keyboard,
   * so the padding is taken back off. `predicted` is the guess made on focus
   * from the last keyboard seen, retired when the real height arrives or
   * when none does.
   */
  const [predicted, setPredicted] = useState(false);
  const liftOf = useCallback(
    (height: number) =>
      Platform.OS === "ios" ? Math.max(0, height - insets.bottom) : height,
    [insets.bottom],
  );
  const keyboardLift =
    keyboardHeight > 0
      ? liftOf(keyboardHeight)
      : predicted
        ? liftOf(lastKeyboardHeight())
        : 0;
  const keyboardUp = keyboardLift > 0;
  /** The keyboard's top edge from the screen's bottom, for the tray. */
  const keyboardTop =
    keyboardHeight > 0
      ? Platform.OS === "ios"
        ? keyboardHeight
        : keyboardHeight + insets.bottom
      : 0;

  const keyboardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(keyboardAnim, {
      duration: keyboardLift > 0 ? KEYBOARD_IN_MS : KEYBOARD_OUT_MS,
      easing: Easing.out(Easing.cubic),
      toValue: keyboardLift,
      useNativeDriver: true,
    }).start();
  }, [keyboardAnim, keyboardLift]);

  useEffect(() => {
    if (keyboardHeight > 0) setPredicted(false);
  }, [keyboardHeight]);
  useEffect(() => {
    if (!predicted || keyboardHeight > 0) return;
    const id = setTimeout(() => setPredicted(false), PREDICTION_GRACE_MS);
    return () => clearTimeout(id);
  }, [keyboardHeight, predicted]);

  // The tray's share of the lift: its height while it is open (`progress`
  // 0 → 1), both written by the tray itself. See `MediaTray`.
  const trayProgress = useRef(new Animated.Value(0)).current;
  const trayHeight = useRef(new Animated.Value(0)).current;
  const [traySettled, setTraySettled] = useState(0);
  const liftUp = useMemo(
    () =>
      Animated.multiply(
        Animated.add(keyboardAnim, Animated.multiply(trayProgress, trayHeight)),
        -1,
      ),
    [keyboardAnim, trayHeight, trayProgress],
  );

  useEffect(() => {
    onInsetChange?.(keyboardLift + traySettled);
  }, [keyboardLift, onInsetChange, traySettled]);

  /**
   * Where the caret is, and where to put it after a format button.
   *
   * The live position is a ref because it changes on every cursor move and
   * nothing renders from it. `caret` is state, and set for exactly one render:
   * a permanently controlled `selection` fights the platform every time you tap
   * to move the cursor, so it is handed to the input once and taken away again
   * the moment the input reports back.
   */
  const selectionRef = useRef({ end: 0, start: 0 });
  const [caret, setCaret] = useState<{ end: number; start: number }>();

  const media = useAttachments(conversationId);

  /*
   * Two small animations, both of them load-bearing rather than decorative.
   *
   * The `+` rotates into an ×, which is what says the same button closes the
   * row it opened — swapping one icon for another reads as two buttons in one
   * place. The send button scales in when there is finally something to send,
   * so its appearance is noticed at the edge of vision rather than found.
   */
  const plusRotation = useRef(new Animated.Value(0)).current;
  const sendScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(plusRotation, {
      bounciness: 4,
      speed: 18,
      toValue: actionsOpen ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [actionsOpen, plusRotation]);

  // Naming who you are speaking as is the whole point of the control: "Send
  // message as Ada..." is the difference between posting in character and
  // posting by accident.
  const prompt =
    placeholder ??
    (selectedSender
      ? `Send message as ${selectedSender.name.split(" ")[0]}...`
      : "Write a message...");

  /**
   * The quoted message as one line.
   *
   * Through the shared summariser, so the banner and the quote drawn inside a
   * sent bubble say the same thing about the same message — "GIF" rather than
   * a CDN URL, and words rather than the markup around them.
   */
  const replyPreview = useMemo(() => {
    const preview = messagePreview(replyingTo, "noun");
    const media = messageMediaOf(replyingTo);
    // One piece of media is named for what it is — "Sticker", not "Photo" —
    // the same words the long-press sheet uses. See `mediaLabel`.
    return (media && preview.describes && mediaLabel(media)) || preview.text;
  }, [replyingTo]);

  const trimmed = draft.trim();
  const hasAttachments = media.attachments.length > 0;
  const canSend =
    (Boolean(trimmed) || (hasAttachments && !media.isUploading)) &&
    !sending &&
    !disabled;

  /*
   * Kept mounted while it scales away, or the button would vanish on the frame
   * the draft is cleared and there would be nothing left to animate.
   */
  const [sendVisible, setSendVisible] = useState(false);
  const wantsSend = canSend || Boolean(sending) || media.isUploading;

  useEffect(() => {
    if (wantsSend) setSendVisible(true);
    Animated.spring(sendScale, {
      bounciness: wantsSend ? 10 : 0,
      speed: 24,
      toValue: wantsSend ? 1 : 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !wantsSend) setSendVisible(false);
    });
  }, [sendScale, wantsSend]);

  // Opening the tray closes the keyboard and vice versa: they occupy the same
  // space, and both at once would push the composer off the top of the screen.
  const openTray = useCallback((tab: TrayTab) => {
    Keyboard.dismiss();
    setPredicted(false);
    setActionsOpen(false);
    setTrayTab(tab);
  }, []);

  const closeTrayToKeyboard = useCallback(() => {
    // The keyboard is on its way; start rising for it now, and pad the list
    // for it in the same render the tray starts to leave (see `closeTray`).
    onInsetChange?.(liftOf(lastKeyboardHeight()));
    setTrayTab(null);
    setPredicted(true);
    inputRef.current?.focus();
  }, [liftOf, onInsetChange]);

  const format = useCallback(
    (token: string) => {
      const { caret: next, text } = applyFormat(
        draft,
        selectionRef.current,
        token,
      );
      setDraft(text);
      setCaret({ end: next, start: next });
      selectionRef.current = { end: next, start: next };
    },
    [draft],
  );

  /**
   * Set while the field is let go of only to be taken straight back, so the
   * blur in between is not read as the reader leaving the field.
   */
  const refocusing = useRef(false);

  // A reply is answered with the keyboard up: being dropped into a thread and
  // then having to tap the field is a step nobody wants.
  //
  // One movement, whatever state the field is in. The first version always
  // blurred a focused field and focused it again, and the blur dropped the
  // lift it had just predicted — the composer rose, fell and rose again, and
  // with the keyboard already open the keyboard itself went down and back up.
  useEffect(() => {
    if (!replyingTo) return;
    setTrayTab(null);
    const input = inputRef.current;
    if (!input) return;

    // Already typing: the keyboard is where the reply wants it.
    if (input.isFocused() && Keyboard.isVisible()) return;

    setPredicted(true);
    // Android keeps the field focused when the keyboard is dismissed with
    // the back button, and `focus()` on a focused field does nothing — so
    // the keyboard would not come back for the reply. Let go first, without
    // telling the lift.
    if (input.isFocused()) {
      refocusing.current = true;
      input.blur();
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    input.focus();
  }, [replyingTo]);

  /*
   * One send per draft.
   *
   * `submit` reads the draft from the render it was made in, so a second tap
   * on Send before the cleared field has re-rendered sent the same words
   * again. The lock is taken on send and let go when the draft next changes —
   * cleared, retyped, or put back after a failure.
   */
  const submitLock = useRef(false);
  useEffect(() => {
    submitLock.current = false;
  }, [draft]);

  const submit = useCallback(async () => {
    if (!canSend || submitLock.current) return;
    submitLock.current = true;
    const text = trimmed;
    const attachments = media.uploadedUrls.map((url) => ({ url }));

    // The text is cleared optimistically so the next message can be typed
    // immediately, and put back by the caller returning false — losing what
    // someone typed is far worse than a moment of duplicate text on screen.
    //
    // State only, never the native field as well: a keystroke that has not
    // reached JS yet when Send is handled would be wiped with it, and the end
    // of a word typed just before the tap vanished from the message and the
    // field both.
    setDraft("");
    setActionsOpen(false);

    const accepted = await onSend({
      attachments: attachments.length ? attachments : null,
      // Converted only when there is something to convert; see the note above.
      text: hasMarkdown(text) ? markdownToHtml(text) : text,
    });

    // The attachments are cleared *after* acceptance rather than alongside the
    // text. A rejected send puts the words back in the field, and the pictures
    // have to still be under them — there is nowhere else for them to come
    // from, and re-picking them means re-uploading them.
    if (accepted) media.clear();
    else setDraft(text);
  }, [canSend, media, onSend, trimmed]);

  /*
   * Closing the tray, with the list told in the same render.
   *
   * The list pads its foot by the tray's height (`onInsetChange`). Left to
   * the effect below, the new padding arrived two renders after the tray
   * began to slide away — and for those renders the tray uncovered a thread
   * still padded for it: nothing on screen but the newest bubble pinned under
   * the header. Reported here, the padding and the closing tab land in one
   * commit, and the slide starts from the effect that commit runs.
   */
  const closeTray = useCallback(
    (lift: number) => {
      onInsetChange?.(lift);
      setTrayTab(null);
    },
    [onInsetChange],
  );

  /** GIFs, stickers and clips: the URL is the message, and it goes at once. */
  const sendMedia = useCallback(
    (url: string) => {
      closeTray(keyboardLift);
      setActionsOpen(false);
      void onSend({ attachments: null, text: url });
    },
    [closeTray, keyboardLift, onSend],
  );

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            // With the tab bar hidden, nothing else reserves the system
            // navigation area, so the composer does — always: lifted, that
            // padding is what puts the field's edge exactly on the keyboard
            // (see `keyboardLift`), and a padding that came and went would be
            // a layout jump on every keyboard.
            paddingBottom: insets.bottom,
            transform: [{ translateY: liftUp }],
          },
        ]}
      >
        {/*
          The bar's glass, laid behind the rows rather than wrapped around them:
          it fills the whole box, the system navigation padding included, and
          nothing inside the composer counts as nested glass.
        */}
        <GlassSurface
          bordered="top"
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          variant="bar"
        />

        {/* A pill, not a stray line of grey. A sentence floating above the
            input reads as part of the draft; a chip reads as the app talking. */}
        {statusNote ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.status,
                {
                  backgroundColor: theme.glass.fillHover,
                  borderColor: theme.glass.edge,
                },
              ]}
            >
              <Ionicons
                color={theme.textGray}
                name="cloud-offline-outline"
                size={12}
              />
              <Text style={[styles.statusLabel, { color: theme.textGray }]}>
                {statusNote}
              </Text>
            </View>
          </View>
        ) : null}

        {replyingTo ? (
          <View
            style={[
              styles.reply,
              {
                backgroundColor: theme.accent.tint,
                borderLeftColor: theme.accent.solid,
              },
            ]}
          >
            <Ionicons
              color={theme.accent.text}
              name="arrow-undo"
              size={14}
              style={styles.replyIcon}
            />
            <View style={styles.replyText}>
              <Text
                numberOfLines={1}
                style={[styles.replyAuthor, { color: theme.accent.text }]}
              >
                {replyingTo.sender?.name || replyingTo.sender?.username}
              </Text>
              {/* The words, not the markup. A reply to a formatted message
                  showed `<div><strong>…` here, which is the message's source
                  rather than the message. */}
              <Text
                numberOfLines={1}
                style={[styles.replyBody, { color: theme.textGray }]}
              >
                {replyPreview}
              </Text>
            </View>
            {/* What is being answered, when it is a picture: "GIF" alone
                does not say which one. */}
            <MessageThumb message={replyingTo} size={36} />
            <Pressable
              accessibilityLabel="Cancel reply"
              hitSlop={space.sm}
              onPress={onCancelReply}
            >
              <Ionicons color={theme.textGray} name="close" size={18} />
            </Pressable>
          </View>
        ) : null}

        {hasAttachments ? (
          <View style={styles.attachments}>
            <View style={styles.attachmentHeader}>
              <Ionicons
                color={theme.textGray}
                name="images-outline"
                size={13}
              />
              <Text style={[styles.attachmentCount, { color: theme.textGray }]}>
                {media.isUploading
                  ? "Uploading…"
                  : media.failedCount > 0
                    ? `${media.failedCount} failed`
                    : `${media.attachments.length} attached`}
              </Text>
              <Pressable
                accessibilityLabel="Remove all attachments"
                hitSlop={space.sm}
                onPress={media.clear}
              >
                <Text style={[styles.clearAll, { color: theme.accent.text }]}>
                  Clear
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.attachmentRow}
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              {media.attachments.map((attachment) => (
                <Pressable
                  accessibilityLabel={
                    attachment.failed
                      ? "Retry this upload"
                      : "Attached — remove with the cross"
                  }
                  // A failed tile is the retry button. Nothing else here is
                  // tappable, so there is no action to compete with, and a
                  // separate retry control on a 56pt square is unreachable.
                  disabled={!attachment.failed}
                  key={attachment.id}
                  onPress={() => media.retry(attachment.id)}
                  style={[
                    styles.thumb,
                    {
                      borderColor: attachment.failed
                        ? theme.error
                        : theme.glass.edge,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: attachment.localUri }}
                    style={styles.thumbImage}
                  />
                  {attachment.uploading ? (
                    <View style={styles.thumbOverlay}>
                      <ActivityIndicator color="#ffffff" size="small" />
                    </View>
                  ) : null}
                  {attachment.failed ? (
                    <View style={styles.thumbOverlay}>
                      <Ionicons color="#ffffff" name="refresh" size={18} />
                    </View>
                  ) : null}
                  {/* A video is not obviously a video from one frame of it. */}
                  {!attachment.uploading &&
                  !attachment.failed &&
                  attachment.contentType.startsWith("video/") ? (
                    <View style={styles.thumbBadge}>
                      <Ionicons color="#ffffff" name="play" size={10} />
                    </View>
                  ) : null}
                  <Pressable
                    accessibilityLabel="Remove attachment"
                    hitSlop={space.xs}
                    onPress={() => media.remove(attachment.id)}
                    style={styles.thumbRemove}
                  >
                    <Ionicons color="#ffffff" name="close" size={12} />
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* The media row, web's `MediaToolbar`: hidden until the `+` is pressed,
            so the resting composer is one line tall on a 667pt screen. */}
        {actionsOpen && !disabled ? (
          <View style={styles.actions}>
            <ActionButton
              icon="images-outline"
              label="GIF"
              onPress={() => openTray("gif")}
              tint="#0394fc"
            />
            <ActionButton
              icon="happy-outline"
              label="Sticker"
              onPress={() => openTray("sticker")}
              tint="#c9478f"
            />
            <ActionButton
              icon="film-outline"
              label="Clip"
              onPress={() => openTray("clip")}
              tint="#8b5cf6"
            />
            {/* Both fold the row away: the picker takes over the screen, and
                coming back to a still-open row hides the strip of thumbnails
                that is the whole result of what you just did. */}
            <ActionButton
              icon="image-outline"
              label="Photo"
              onPress={() => {
                setActionsOpen(false);
                void media.pick();
              }}
              tint="#22c55e"
            />
            <ActionButton
              icon="camera-outline"
              label="Camera"
              onPress={() => {
                setActionsOpen(false);
                void media.capture();
              }}
              tint="#f59e0b"
            />
          </View>
        ) : null}

        {/*
          Who you are about to speak as, when it is not you.

          The placeholder says it too, but a placeholder disappears the moment
          you start typing — which is exactly when it matters. Posting a
          paragraph in the wrong character is not a small mistake in a
          role-play app, and it is invisible until it is sent, so the state
          gets a persistent line of its own rather than a hint that vanishes.
          Tapping it opens the picker, because the first thing you want after
          noticing is to change it.
        */}
        {selectedSender?.type === "MUSE" ? (
          <Pressable
            accessibilityHint="Change who this message is sent as"
            accessibilityLabel={`Speaking as ${selectedSender.name}`}
            accessibilityRole="button"
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [
              styles.inCharacter,
              {
                backgroundColor: theme.accent.tint,
                borderColor: theme.accent.surfaceHover,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons color={theme.accent.text} name="sparkles" size={12} />
            <Text
              numberOfLines={1}
              style={[styles.inCharacterLabel, { color: theme.accent.text }]}
            >
              Speaking as {selectedSender.name}
            </Text>
            <Ionicons
              color={theme.accent.text}
              name="swap-horizontal"
              size={13}
            />
          </Pressable>
        ) : null}

        {/* Only while the keyboard is up: a formatting row over a resting
            composer is a row of buttons for nothing — and it appears in the
            same frame the composer starts to rise, not a beat before it. */}
        {focused && keyboardUp && !disabled ? (
          <FormatBar onFormat={format} />
        ) : null}

        <View style={styles.row}>
          {selectedSender ? (
            <Pressable
              hitSlop={space.xs}
              accessibilityHint="Choose who this message is sent as"
              accessibilityLabel={`Sending as ${selectedSender.name}`}
              accessibilityRole="button"
              disabled={senders.length < 2}
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.senderButton,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.glass.fillHover,
                  borderColor: theme.glass.edge,
                },
              ]}
            >
              <Avatar
                name={selectedSender.name}
                size={30}
                uri={selectedSender.image}
              />
              {senders.length > 1 ? (
                <Ionicons color={theme.textGray} name="chevron-up" size={10} />
              ) : null}
            </Pressable>
          ) : null}

          <View
            style={[
              styles.field,
              {
                backgroundColor: theme.glass.field,
                // The field says when it has the keyboard. With a media row,
                // a tray and a sheet all able to take focus away, "am I still
                // typing into this?" is a question the composer should answer
                // without being asked.
                borderColor: focused
                  ? theme.accent.solid
                  : theme.glass.fieldEdge,
              },
            ]}
          >
            <MarkdownInput
              editable={!disabled}
              onBlur={() => {
                // Let go of only to be focused again for a reply: stay up.
                if (refocusing.current) return;
                setFocused(false);
                setPredicted(false);
              }}
              onChangeText={setDraft}
              onFocus={() => {
                refocusing.current = false;
                setFocused(true);
                setTrayTab(null);
                // Rise now, ahead of the keyboard's report.
                setPredicted(true);
              }}
              // Android keeps a field focused after the back button dismisses
              // the keyboard, so tapping it again is not a focus — but it is
              // a keyboard on its way, all the same.
              onPressIn={() => {
                if (focused && !keyboardUp) setPredicted(true);
              }}
              onSelectionChange={(event) => {
                selectionRef.current = event.nativeEvent.selection;
                // Handing the caret back to the platform: it has been placed,
                // and holding it would pin the cursor there.
                if (caret) setCaret(undefined);
              }}
              placeholder={prompt}
              ref={inputRef}
              selection={caret}
              style={styles.input}
              value={draft}
            />

            {/*
              Both actions sit inside the field's trailing edge, as they do on
              web, rather than alongside it — the field is then the full width
              of the composer, which is what a phone has least of.

              `hitSlop` does the work the small icons would otherwise fail to
              do: web can afford a 28px target because it has a pointer, and
              these are the same size with a 44pt tap area around them.
            */}
            <Pressable
              accessibilityLabel={actionsOpen ? "Hide media" : "Add media"}
              accessibilityRole="button"
              accessibilityState={{ expanded: actionsOpen }}
              disabled={disabled}
              hitSlop={space.sm}
              onPress={() => {
                setActionsOpen((open) => !open);
                if (trayTab) closeTray(keyboardLift);
              }}
              style={styles.inlineAction}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: plusRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "45deg"],
                      }),
                    },
                  ],
                }}
              >
                {/* One icon turning, not two icons swapping: the rotation is
                    what says this is the same control in two states. */}
                <Ionicons
                  color={actionsOpen ? theme.accent.text : theme.textGray}
                  name="add-circle-outline"
                  size={24}
                />
              </Animated.View>
            </Pressable>

            {/* Web fades its send button in once there is something to send,
                and out again when the field empties. Same rule here: an always
                lit send on an empty composer invites a tap that does nothing. */}
            {sendVisible ? (
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <Pressable
                  accessibilityLabel="Send message"
                  accessibilityRole="button"
                  disabled={!canSend}
                  hitSlop={space.sm}
                  onPress={() => void submit()}
                  style={({ pressed }) => [
                    styles.send,
                    {
                      backgroundColor: canSend
                        ? theme.accent.solid
                        : theme.accent.surfaceActive,
                      opacity: pressed && canSend ? 0.8 : 1,
                    },
                  ]}
                >
                  {sending || media.isUploading ? (
                    <ActivityIndicator color={theme.accent.onSolid} size="small" />
                  ) : (
                    <Ionicons color={theme.accent.onSolid} name="send" size={15} />
                  )}
                </Pressable>
              </Animated.View>
            ) : null}
          </View>
        </View>
      </Animated.View>

      <MediaTray
        height={trayHeight}
        keyboardTop={keyboardTop}
        onClose={() => closeTray(keyboardLift)}
        onHeightChange={setTraySettled}
        onRequestKeyboard={closeTrayToKeyboard}
        onSelect={sendMedia}
        onTabChange={setTrayTab}
        progress={trayProgress}
        tab={trayTab}
      />

      {selectedSender && onSelectSender ? (
        <SenderPicker
          onClose={() => setPickerOpen(false)}
          onSelect={onSelectSender}
          selected={selectedSender}
          senders={senders}
          visible={pickerOpen}
        />
      ) : null}
    </>
  );
};

/** One entry in the media row: a tinted circle and its name underneath. */
const ActionButton = ({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  tint: string;
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: theme.glass.fillHover, borderColor: tint },
        ]}
      >
        <Ionicons color={tint} name={icon} size={20} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.textGray }]}>
        {label}
      </Text>
    </Pressable>
  );
};

/** Chips straight on media: web's `MEDIA_CHIP`, no blur. */
const MEDIA_CHIP = `rgba(0,0,0,${SCRIM_ALPHA.mediaChip})`;

const styles = StyleSheet.create({
  action: { alignItems: "center", flex: 1, gap: 2 },
  actionIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  actionLabel: { fontSize: 10, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    gap: space.xs,
    paddingBottom: space.sm,
    paddingTop: space.xs,
  },
  attachmentCount: { flex: 1, fontSize: 10, fontWeight: "700" },
  attachmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
  },
  attachmentRow: { gap: space.xs },
  attachments: { gap: space.xs, paddingBottom: space.sm },
  clearAll: { fontSize: 10, fontWeight: "700" },
  container: {
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  field: {
    alignItems: "flex-end",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    paddingRight: space.xs,
  },
  inCharacter: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    maxWidth: "100%",
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  inCharacterLabel: { flexShrink: 1, fontSize: 10, fontWeight: "700" },
  inlineAction: { paddingBottom: space.sm },
  input: {
    maxHeight: MAX_INPUT_HEIGHT,
    minHeight: MIN_INPUT_HEIGHT,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  reply: {
    alignItems: "center",
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  replyAuthor: { fontSize: fontSize.caption, fontWeight: "700" },
  replyBody: { fontSize: fontSize.caption },
  replyIcon: { marginTop: 1 },
  replyText: { flex: 1, gap: 1 },
  row: { alignItems: "flex-end", flexDirection: "row", gap: space.sm },
  send: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 30,
    justifyContent: "center",
    marginBottom: space.sm + 1,
    marginLeft: space.xs,
    width: 30,
  },
  senderButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 2,
    height: 40,
    paddingLeft: space.xs,
    paddingRight: space.xs + 2,
  },
  status: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  statusLabel: { fontSize: 10, fontWeight: "600" },
  statusRow: { alignItems: "center", paddingBottom: space.xs },
  thumb: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    overflow: "hidden",
    width: 56,
  },
  thumbBadge: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.full,
    bottom: 3,
    height: 16,
    justifyContent: "center",
    left: 3,
    position: "absolute",
    width: 16,
  },
  thumbImage: { height: "100%", width: "100%" },
  thumbOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  thumbRemove: {
    alignItems: "center",
    backgroundColor: MEDIA_CHIP,
    borderBottomLeftRadius: radius.sm,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 18,
  },
});
