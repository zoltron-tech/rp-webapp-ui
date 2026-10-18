import {
  blockText,
  type RichBlock,
  type RichInline,
  type RunStyle,
} from "@nw/richtext";
import { memo, type ReactNode, useMemo } from "react";
import {
  type NativeSyntheticEvent,
  StyleSheet,
  type TextInputKeyPressEventData,
  type TextInputSelectionChangeEventData,
  type TextLayoutLine,
  type TextStyle,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/text";
import { nativeFace } from "@/lib/editor-fonts";
import { misspelledStyle, splitByFlags } from "@/lib/spell/decorate";
import type { SpellFlag } from "@/lib/spell/flags";
import {
  type AppTheme,
  fontSize,
  monospace,
  space,
  useAppTheme,
} from "@/theme";

/**
 * One block of the editor: a text field drawn from the block's runs.
 *
 * The technique is `chat/markdown-input.tsx`'s, and the note there about
 * `value` versus children is load-bearing here too: React Native styles an
 * input's text by taking `<Text>` children, and Android asserts if a `value`
 * is given alongside them. So this field has no `value`. The block's runs are
 * rendered as its children, and the string those children spell out *is* the
 * field's content — which is why `blockText` and the runs must agree to the
 * character, and why the editing model is lossless about it.
 *
 * ## Why a field per block rather than one for the document
 *
 * Alignment and size are block properties in the saved format, and a native
 * field has one `textAlign` and one `fontSize`. Images cannot live inside a
 * field at all. One field per block gives each line its own alignment, its
 * own size, its own marker or rule — and puts every image between two fields
 * rather than impossibly inside one.
 *
 * The cost is that a selection cannot span blocks. On a phone that is a
 * smaller loss than it sounds: multi-paragraph selection is a drag across
 * half the screen with a thumb over the words, and the toolbar's actions are
 * mostly about the line the caret is on anyway.
 *
 * ## What is not drawn
 *
 * A run's own size, when it differs from its block's. It would change the
 * line height of the line it is on, and on Android that reflows the whole
 * field mid-keystroke (the reason `markdown-input` gives). The size is a
 * block property in this editor precisely so it never has to be drawn per
 * run; it is *kept* — the model carries it and writes it back — and drawn at
 * the block's size while being edited.
 *
 * A family *is* drawn, now that the phone loads the same files web does
 * (`@nw/fonts`). The line height is set explicitly on every field, so a face
 * with taller metrics cannot reflow the line.
 *
 * ## `BlockMeasure`
 *
 * The same block drawn as plain text, in the same frame, with the same runs
 * and metrics — for `WrappedBlockInput`, which needs to know where a line
 * breaks beside a picture before it can decide where the field is cut.
 */

/** Web's body is 16px against this app's 15; sizes are scaled, not copied. */
const WEB_BASE_PX = 16;

export const toNativeSize = (px: number | undefined): number =>
  px ? Math.round((px / WEB_BASE_PX) * fontSize.prose) : fontSize.prose;

/** Web's `line-height: 1.6` on saved content; a touch tighter for headings. */
const lineHeightFor = (size: number): number =>
  Math.round(size * (size > 24 ? 1.25 : 1.5));

/** The renderer's heading sizes, so a pasted `<h2>` edits at the size it reads. */
const HEADING_SIZE: Record<number, number> = {
  1: 24,
  2: 21,
  3: 19,
  4: 17,
  5: 16,
  6: 15,
};

const CODE_STYLE: TextStyle = { fontFamily: monospace };

/** The size and line height a block is edited at. */
const blockSizing = (block: RichBlock) => {
  const size =
    block.type === "heading"
      ? (HEADING_SIZE[block.level ?? 2] ?? 21)
      : toNativeSize(block.fontSize);
  return { lineHeight: lineHeightFor(size), size };
};

const isPlain = (run: Extract<RichInline, { type: "text" }>): boolean =>
  run.marks.length === 0 && !run.color && !run.background && !run.fontFamily;

/**
 * The block's runs as styled `<Text>`, spelling out exactly `blockText`.
 *
 * `flags` are the misspelled words as offsets into that text (see
 * `lib/spell/flags.ts`); a run is split where one falls inside it and the
 * piece is drawn in the misspelling style. The string spelled out is the
 * same either way — only the number of `<Text>` wrappers changes.
 */
const blockRuns = (
  block: RichBlock,
  theme: AppTheme,
  flags: readonly SpellFlag[] = [],
): ReactNode => {
  const text = blockText(block);
  // Null rather than an empty string, so the placeholder shows.
  if (!text) return null;
  const bad = flags.length > 0 ? misspelledStyle(theme) : null;

  // Nothing formatted, which is what most lines are: one text node rather
  // than a wrapper per run.
  const plain = block.children.every(
    (child) => child.type === "text" && isPlain(child),
  );
  if (plain) {
    if (!bad) return <Text style={{ color: theme.text }}>{text}</Text>;
    return splitByFlags(text, 0, flags).map((piece, at) => (
      <Text
        // Index keys: rebuilt on every keystroke, no identity to preserve.
        key={`${at}-${piece.flagged}`}
        style={[{ color: theme.text }, piece.flagged ? bad : null]}
      >
        {piece.text}
      </Text>
    ));
  }

  let offset = 0;
  return block.children.flatMap((child, position) => {
    // Index keys: the list is rebuilt on every keystroke and there is no
    // identity to preserve between two renders of it.
    const key = `${position}-${child.type}`;

    if (child.type === "break") {
      offset += 1;
      return [<Text key={key}>{"\n"}</Text>];
    }

    if (child.type === "mention") {
      offset += child.name.length + 1;
      return [
        <Text
          key={key}
          style={{
            backgroundColor: theme.accent.tint,
            color: theme.accent.text,
            fontWeight: "700",
          }}
        >
          @{child.name}
        </Text>,
      ];
    }

    const underline = child.marks.includes("underline");
    const strike = child.marks.includes("strike");
    const bold = child.marks.includes("bold");
    const italic = child.marks.includes("italic");
    const face = nativeFace(child.fontFamily, bold, italic);
    const style = [
      { color: child.color ?? theme.text },
      face ? { fontFamily: face.fontFamily } : null,
      // A loaded face carries its own weight and slant; see `nativeFace`.
      bold && !face?.baked ? styles.bold : null,
      italic && !face?.baked ? styles.italic : null,
      child.marks.includes("code")
        ? [CODE_STYLE, { backgroundColor: theme.material.fill }]
        : null,
      child.background ? { backgroundColor: child.background } : null,
      underline || strike
        ? {
            textDecorationLine:
              underline && strike
                ? ("underline line-through" as const)
                : underline
                  ? ("underline" as const)
                  : ("line-through" as const),
          }
        : null,
    ];
    const start = offset;
    offset += child.text.length;

    if (!bad) {
      return [
        <Text key={key} style={style}>
          {child.text}
        </Text>,
      ];
    }
    return splitByFlags(child.text, start, flags).map((piece, at) => (
      <Text
        key={`${key}-${at}-${piece.flagged}`}
        style={[style, piece.flagged ? bad : null]}
      >
        {piece.text}
      </Text>
    ));
  });
};

/** The frame a block's text sits in: a marker beside it, or a quote rule. */
const BlockFrame = ({
  block,
  children,
  lineHeight,
  size,
}: {
  block: RichBlock;
  children: ReactNode;
  lineHeight: number;
  size: number;
}) => {
  const theme = useAppTheme();

  /*
   * One tree for every kind of line. A list item, a quote and a paragraph
   * used to return three different shapes, so turning one into another
   * (the list button, Return on an empty item) unmounted the field and
   * mounted a new one: focus went, and the keyboard with it.
   */
  return (
    <View
      style={[
        styles.row,
        block.type === "quote" && [
          styles.quote,
          { borderLeftColor: theme.accent.surface },
        ],
      ]}
    >
      {block.type === "listItem" ? (
        <Text
          style={[
            styles.marker,
            { color: theme.textGray, fontSize: size, lineHeight },
          ]}
        >
          {block.marker ?? "•"}
        </Text>
      ) : null}
      <View style={styles.fill}>{children}</View>
    </View>
  );
};

export interface BlockInputProps {
  block: RichBlock;
  index: number;
  /** The first block shows the placeholder; nothing else does. */
  placeholder?: string;
  onChangeText: (index: number, next: string, previous: string) => void;
  onSelectionChange: (
    index: number,
    selection: { start: number; end: number },
  ) => void;
  onKeyPress: (index: number, key: string) => void;
  /**
   * Return was pressed. The field does not take the newline itself — see
   * `submitBehavior` below.
   */
  onSubmit?: (index: number) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  /**
   * For an empty line with the caret: the style its first character will be
   * in, so the field draws it that way itself. See `emptyTyping`.
   */
  typing?: RunStyle;
  /** Set for one render to place the caret; cleared by the editor after. */
  selection?: { start: number; end: number };
  inputRef: (index: number, input: TextInput | null) => void;
  editable?: boolean;
  /** Misspelled words, as offsets into the block's text. */
  flags?: readonly SpellFlag[];
}

const BlockInputView = ({
  block,
  editable = true,
  flags,
  index,
  inputRef,
  onBlur,
  onChangeText,
  onFocus,
  onKeyPress,
  onSelectionChange,
  onSubmit,
  placeholder,
  selection,
  typing,
}: BlockInputProps) => {
  const theme = useAppTheme();

  const text = blockText(block);
  const { lineHeight, size } = blockSizing(block);
  const children = useMemo(
    () => blockRuns(block, theme, flags),
    [block, flags, theme],
  );

  // Only while the line is empty: once it has text, the runs carry the style.
  const typingStyle = useMemo(() => {
    if (!typing || text.length > 0) return null;
    const bold = typing.marks.includes("bold");
    const italic = typing.marks.includes("italic");
    const face = nativeFace(typing.fontFamily, bold, italic);
    return [
      face ? { fontFamily: face.fontFamily } : null,
      bold && !face?.baked ? styles.bold : null,
      italic && !face?.baked ? styles.italic : null,
      typing.color ? { color: typing.color } : null,
    ];
  }, [text.length, typing]);

  /*
   * The field's own family follows its content: when every run of the line
   * is in one family, the field is set to that family too, not only while
   * the line is empty. Without this the field's typeface flipped on the
   * first character — serif while empty (`typingStyle`), the interface face
   * once the runs took over — and Android laid the line out against one
   * typeface while drawing it in another: on some phones a line set in
   * Times New Roman then ran off the edge instead of wrapping. With the field
   * and its runs agreeing, the runs' font spans are redundant and the
   * platform drops them (`ReactEditText.stripSpansOfKind`), so the line is
   * measured and drawn by the same typeface throughout.
   */
  const contentFace = useMemo(() => {
    if (text.length === 0) return null;
    let family: string | undefined;
    let first: Extract<RichInline, { type: "text" }> | undefined;
    for (const child of block.children) {
      if (child.type !== "text" || !child.text) continue;
      if (!first) {
        first = child;
        family = child.fontFamily;
      } else if (child.fontFamily !== family) {
        return null;
      }
    }
    if (!first || !family) return null;
    const face = nativeFace(
      family,
      first.marks.includes("bold"),
      first.marks.includes("italic"),
    );
    return face ? { fontFamily: face.fontFamily } : null;
  }, [block, text.length]);

  return (
    <BlockFrame block={block} lineHeight={lineHeight} size={size}>
      <TextInput
        autoCapitalize="sentences"
        // The outer list scrolls; a field that scrolled too would trap the
        // finger on long paragraphs.
        /*
         * Return is reported, not typed. Left to the field, the newline was
         * inserted natively and then the block was split in JS — but the
         * upper line's block had not changed, so nothing told its field to
         * drop the newline it had just been given. It stayed: one Return
         * showed as two lines, and Backspace then had two to cross. With
         * `submit` the field never holds the newline; the editor splits the
         * block at the caret and there is nothing to take back out.
         */
        onSubmitEditing={() => onSubmit?.(index)}
        // The key keeps its Return arrow: left to the default, a field that
        // submits is given a tick, which reads as "send".
        returnKeyType="none"
        submitBehavior="submit"
        editable={editable}
        multiline
        onBlur={() => onBlur(index)}
        onChangeText={(next) => onChangeText(index, next, text)}
        onFocus={() => onFocus(index)}
        onKeyPress={(event: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
          onKeyPress(index, event.nativeEvent.key)
        }
        onSelectionChange={(
          event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
        ) => onSelectionChange(index, event.nativeEvent.selection)}
        placeholder={placeholder}
        placeholderTextColor={theme.textGray}
        ref={(node) => inputRef(index, node)}
        scrollEnabled={false}
        selection={selection}
        selectionColor={theme.accent.surfaceHover}
        style={[
          styles.input,
          {
            fontSize: size,
            lineHeight,
            textAlign: block.align ?? "left",
          },
          contentFace,
          typingStyle,
        ]}
        // No `value`. See the note above — with children it is a crash on
        // Android, not a preference.
      >
        {children}
      </TextInput>
    </BlockFrame>
  );
};

/**
 * `block` is replaced wholesale by every edit that touches it and left alone
 * by every edit that does not, so a pointer check is the right comparison —
 * and it is what keeps a keystroke in one line from re-rendering forty others.
 */
export const BlockInput = memo(BlockInputView);

/**
 * The block as the field would lay it out, as plain text, reporting its lines.
 * Draw it in the same width as the field, out of sight.
 */
export const BlockMeasure = ({
  block,
  onLines,
}: {
  block: RichBlock;
  onLines: (lines: TextLayoutLine[]) => void;
}) => {
  const theme = useAppTheme();
  const { lineHeight, size } = blockSizing(block);
  const runs = useMemo(() => blockRuns(block, theme), [block, theme]);

  return (
    <BlockFrame block={block} lineHeight={lineHeight} size={size}>
      <Text
        onTextLayout={(event) => onLines(event.nativeEvent.lines)}
        style={[
          styles.input,
          {
            color: theme.text,
            fontSize: size,
            lineHeight,
            textAlign: block.align ?? "left",
          },
        ]}
      >
        {runs ?? " "}
      </Text>
    </BlockFrame>
  );
};

const styles = StyleSheet.create({
  bold: { fontWeight: "700" },
  fill: { flex: 1 },
  input: {
    // Android adds its own vertical padding to a multiline field; zeroing it
    // is what lets the marker's line height line up with the text's.
    //
    // No vertical padding at all: a line break inside a field is one line
    // height, and with padding a break *between* fields was a line height
    // plus eight points. Return shows the first for a frame (the keyboard's
    // newline, in the field) and then the second (the new field) — the caret
    // landed and then stepped down. Equal, there is nothing to step. It is
    // also what the published post does: paragraphs there have no gap.
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
  italic: { fontStyle: "italic" },
  marker: { minWidth: 18, textAlign: "right" },
  quote: { borderLeftWidth: 3, paddingLeft: space.sm },
  row: { flexDirection: "row", gap: space.sm },
});
