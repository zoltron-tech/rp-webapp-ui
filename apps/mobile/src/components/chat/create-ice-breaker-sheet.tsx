import { Ionicons } from "@expo/vector-icons";
import {
  ICE_BREAKER_COLORS,
  ICE_BREAKER_MAX_LENGTH,
  iceBreakerSources,
} from "@nw/chat";
import { useSession } from "@nw/features";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/avatar";
import { useIceBreakerPaint } from "@/components/chat/ice-breaker-paint";
import { MarkdownInput } from "@/components/chat/markdown-input";
import {
  QuickAddMuseError,
  QuickAddMuseRow,
} from "@/components/chat/quick-add-muse-row";
import { SourcePicker } from "@/components/chat/source-picker";
import { GradientSurface } from "@/components/gradient-surface";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { useCreateIceBreaker } from "@/hooks/use-ice-breakers";
import { useQuickAddMuse } from "@/hooks/use-quick-add-muse";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Writing an ice breaker.
 *
 * Three choices — who it is from, what it says, and what colour it is — in the
 * order web asks them, because the sender changes what you would write.
 *
 * ## It shows you the bubble
 *
 * The field *is* the bubble, painted with the gradient the rail will paint it
 * with: pick a colour and the box you are typing into fills, so the choice is
 * made against the thing being made. The swatches are painted the same way for
 * the same reason — a flat circle is a poor promise of a lit bubble.
 *
 * Uncoloured, the bubble is the accent gradient under a dashed border, which is
 * what web draws for a bubble with no colour chosen (`IceBreakerMessageBubble`:
 * `linear-gradient(135deg, var(--accent-4), var(--accent-3))`, `1.5px dashed`,
 * turning solid on focus). Dashed reads as unfinished, which is what an unsent
 * draft is.
 *
 * ## Formatting, live
 *
 * Ice breakers are stored as plain text, markers and all — `**bold**` reaches
 * the server as those nine characters. Web still formats them as you type
 * (`ChatRichInput`, flattened back by `htmlToIceBreakerMarkdown` on save), so
 * this composer does too, through the same `MarkdownInput` the chat composer
 * uses. Nothing is rewritten under the caret: what you typed is what is sent.
 *
 * ## The counter, and the swatches
 *
 * The count is always on, as it is on web, and turns to the error colour before
 * the limit rather than at it — the server rejects a long message outright, so
 * the warning has to arrive while there is still something to do about it.
 *
 * The nine swatches stay on one row at the 375pt baseline. Wrapping stranded a
 * lone swatch on a second line, which reads as a separate control.
 */

/** The last stretch, where the count turns to the error colour. Web: 20. */
const COUNTER_WARN = 20;

/** Nine of these have to fit a 375pt screen's content width, side by side. */
const SWATCH = 28;

/** The chosen sender's face on the bubble's corner: small, a marker only. */
const SENDER = 22;

/** One colour, painted with the gradient it will actually produce. */
const Swatch = ({
  color,
  onPress,
  selected,
}: {
  color: string;
  onPress: () => void;
  selected: boolean;
}) => {
  const theme = useAppTheme();
  const paint = useIceBreakerPaint(color);

  return (
    <Pressable
      accessibilityLabel={`Colour ${color}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={space.xs}
      onPress={onPress}
    >
      <GradientSurface
        from={paint.from}
        style={[
          styles.swatch,
          {
            borderColor: selected ? theme.text : paint.border,
            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          },
        ]}
        to={paint.to}
      >
        {selected ? (
          <Ionicons color="#ffffff" name="checkmark" size={14} />
        ) : null}
      </GradientSurface>
    </Pressable>
  );
};

export const CreateIceBreakerSheet = ({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const { novelist } = useSession();
  const create = useCreateIceBreaker();
  const addMuse = useQuickAddMuse();

  const sources = useMemo(() => iceBreakerSources(novelist), [novelist]);
  const [sourceId, setSourceId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [museName, setMuseName] = useState("");
  const [addingMuse, setAddingMuse] = useState(false);

  const paint = useIceBreakerPaint(color, "accent");
  const source =
    sources.find((entry) => entry.sourceId === sourceId) ?? sources[0];

  // Reset between openings: a half-written prompt from last time is not a
  // draft anybody expects the sheet to have kept.
  const resetAddMuse = addMuse.reset;
  useEffect(() => {
    if (visible) return;
    setMessage("");
    setColor(null);
    setSourceId(undefined);
    setAddingMuse(false);
    setMuseName("");
    resetAddMuse();
  }, [resetAddMuse, visible]);

  const trimmed = message.trim();
  const remaining = ICE_BREAKER_MAX_LENGTH - message.length;
  const canCreate =
    Boolean(trimmed) &&
    trimmed.length <= ICE_BREAKER_MAX_LENGTH &&
    Boolean(source) &&
    !create.isPending;

  const submit = async () => {
    if (!canCreate || !source) return;
    try {
      await create.mutateAsync({ color, message: trimmed, source });
      onClose();
    } catch {
      Alert.alert(
        "Not posted",
        "The ice breaker could not be created. Try again.",
      );
    }
  };

  const createMuse = () => {
    const name = museName.trim();
    if (!name || addMuse.isPending) return;

    addMuse
      .mutateAsync(name)
      .then((muse) => {
        // Selected straight away: someone who has just named a character meant
        // to post as them, and making them find the new face is a second step
        // for nothing.
        setSourceId(muse.id ?? undefined);
        setAddingMuse(false);
        setMuseName("");
      })
      .catch(() => {
        // Shown under the field by `QuickAddMuseError`. An alert over a sheet
        // with an open keyboard is a lot of ceremony for a retry.
      });
  };

  return (
    <BottomSheet
      headerAction={
        // Cancel beside confirm: the header action replaces the sheet's own
        // close button.
        <View style={styles.actions}>
          <IconButton
            accessibilityLabel="Cancel"
            disabled={create.isPending}
            hitSlop={space.xs}
            icon="close"
            onPress={onClose}
            tone="glass"
          />
          <IconButton
            accessibilityLabel="Post ice breaker"
            busy={create.isPending}
            disabled={!canCreate}
            hitSlop={space.xs}
            icon="send"
            iconSize={16}
            onPress={() => void submit()}
            tone="primary"
          />
        </View>
      }
      maxHeightRatio={0.82}
      onClose={onClose}
      subtitle="Anyone can answer it and start a conversation"
      // Web's wording, which asks for a line rather than announcing a form.
      title="What's on your mind?"
      visible={visible}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <SourcePicker
            label="Who's sending this?"
            onAddMuse={() => setAddingMuse(true)}
            onSelect={(next) => setSourceId(next.sourceId)}
            selected={source}
            sources={sources}
          />

          {addingMuse ? (
            <QuickAddMuseRow
              busy={addMuse.isPending}
              onCancel={() => {
                setAddingMuse(false);
                setMuseName("");
                resetAddMuse();
              }}
              onChange={setMuseName}
              onConfirm={createMuse}
              value={museName}
            />
          ) : null}

          {addMuse.isError ? (
            <QuickAddMuseError message="The character could not be created. Try again." />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textGray }]}>
            Ice breaker message
          </Text>

          <View style={styles.bubbleWrap}>
            <GradientSurface
              from={paint.from}
              style={[
                styles.bubble,
                {
                  // Web: dashed until the field has focus, solid while it has it.
                  borderColor: focused
                    ? paint.coloured
                      ? "rgba(255,255,255,0.6)"
                      : theme.accent.solid
                    : paint.coloured
                      ? "rgba(255,255,255,0.35)"
                      : paint.border,
                  borderStyle: focused ? "solid" : "dashed",
                },
              ]}
              to={paint.to}
            >
              <MarkdownInput
                color={paint.ink}
                maxLength={ICE_BREAKER_MAX_LENGTH}
                // Against a filled bubble the theme's grey disappears; a washed
                // white is the only muted ink that reads on all eight colours.
                mutedColor={
                  paint.coloured ? "rgba(255,255,255,0.6)" : theme.textGray
                }
                onBlur={() => setFocused(false)}
                onChangeText={setMessage}
                onFocus={() => setFocused(true)}
                placeholder="Say something to break the ice..."
                style={styles.input}
                value={message}
              />
            </GradientSurface>

            {/*
            Who this goes out as, pinned to the bubble's corner. The picker
            above scrolls sideways, and with a few characters the chosen face
            can be off its edge — and once the keyboard is up the picker may
            be off the sheet altogether. Outside the gradient, which clips.
          */}
            {source ? (
              <View
                accessibilityLabel={`Sending as ${source.name}`}
                accessible
                style={[
                  styles.sender,
                  { backgroundColor: paint.to, borderColor: paint.to },
                ]}
              >
                <Avatar
                  image={source.avatar}
                  name={source.name}
                  size={SENDER}
                  uri={source.avatar?.src ?? source.image}
                />
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.counter,
              {
                color: remaining <= COUNTER_WARN ? theme.error : theme.textGray,
              },
            ]}
          >
            {message.length} / {ICE_BREAKER_MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textGray }]}>
            Bubble colour
          </Text>

          <View style={styles.swatches}>
            <Pressable
              accessibilityLabel="Default colour"
              accessibilityRole="button"
              accessibilityState={{ selected: color === null }}
              hitSlop={space.xs}
              onPress={() => setColor(null)}
              style={[
                styles.swatch,
                {
                  backgroundColor: theme.material.fillTranslucent,
                  borderColor:
                    color === null
                      ? theme.text
                      : theme.material.edgeTranslucent,
                  borderWidth: color === null ? 2 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <Ionicons color={theme.textGray} name="ban-outline" size={14} />
            </Pressable>

            {ICE_BREAKER_COLORS.map((entry) => (
              <Swatch
                color={entry}
                key={entry}
                // Tapping the chosen colour again clears it, which is the only
                // way back to the default without hunting for the ban icon.
                onPress={() => setColor(color === entry ? null : entry)}
                selected={color === entry}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", gap: space.sm },
  body: {
    gap: space.md,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
  },
  bubble: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
    // Clears the sender's face, which overlaps this corner.
    paddingTop: SENDER / 2 + space.sm,
  },
  // Room above the bubble for the sender's face to stand proud of its corner.
  bubbleWrap: { paddingTop: SENDER / 2 },
  counter: {
    alignSelf: "flex-end",
    fontSize: fontSize.meta,
    fontWeight: "700",
  },
  input: {
    fontSize: fontSize.body,
    minHeight: 72,
    padding: 0,
    textAlignVertical: "top",
  },
  label: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  section: { gap: space.xs },
  // Half over the bubble's top edge, ringed in the bubble's own colour so it
  // reads as attached to it.
  sender: {
    borderRadius: radius.full,
    borderWidth: 2,
    left: space.m,
    position: "absolute",
    top: 0,
  },
  swatch: {
    alignItems: "center",
    // Web's `border-radius: 20%` — a rounded square, so a swatch is never
    // mistaken for one of the faces above it.
    borderRadius: radius.md,
    height: SWATCH,
    justifyContent: "center",
    width: SWATCH,
  },
  swatches: {
    alignItems: "center",
    flexDirection: "row",
    // One row at the 375pt baseline: nine 28pt squares and the gaps
    // `space-between` distributes, rather than a wrap that strands one.
    justifyContent: "space-between",
  },
});
