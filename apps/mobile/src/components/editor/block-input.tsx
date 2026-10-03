import { blockText, type RichBlock, type RichInline } from "@nw/richtext";
import { memo, type ReactNode, useMemo } from "react";
import {
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  type TextInputSelectionChangeEventData,
  type TextLayoutLine,
  type TextStyle,
  View,
} from "react-native";
import { nativeFace } from "@/lib/editor-fonts";
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
  px ? Math.round((px / WEB_BASE_PX) * fontSize.body) : fontSize.body;

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

/** The block's runs as styled `<Text>`, spelling out exactly `blockText`. */
const blockRuns = (block: RichBlock, theme: AppTheme): ReactNode => {
  const text = blockText(block);
  // Null rather than an empty string, so the placeholder shows.
  if (!text) return null;

  // Nothing formatted, which is what most lines are: one text node rather
  // than a wrapper per run.
  const plain = block.children.every(
    (child) => child.type === "text" && isPlain(child),
  );
  if (plain) return <Text style={{ color: theme.text }}>{text}</Text>;

  return block.children.map((child, position) => {
    // Index keys: the list is rebuilt on every keystroke and there is no
    // identity to preserve between two renders of it.
    const key = `${position}-${child.type}`;

    if (child.type === "break") return <Text key={key}>{"\n"}</Text>;

    if (child.type === "mention") {
      return (
        <Text
          key={key}
          style={{
            backgroundColor: theme.accent.tint,
            color: theme.accent.text,
            fontWeight: "700",
          }}
        >
          @{child.name}
        </Text>
      );
    }

    const underline = child.marks.includes("underline");
    const strike = child.marks.includes("strike");
    const bold = child.marks.includes("bold");
    const italic = child.marks.includes("italic");
    const face = nativeFace(child.fontFamily, bold, italic);

    return (
      <Text
        key={key}
        style={[
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
                    ? "underline line-through"
                    : underline
                      ? "underline"
                      : "line-through",
              }
            : null,
        ]}
      >
        {child.text}
      </Text>
    );
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

  if (block.type === "listItem") {
    return (
      <View style={styles.listRow}>
        <Text
          style={[
            styles.marker,
            { color: theme.textGray, fontSize: size, lineHeight },
          ]}
        >
          {block.marker ?? "•"}
        </Text>
        <View style={styles.fill}>{children}</View>
      </View>
    );
  }

  if (block.type === "quote") {
    return (
      <View style={[styles.quote, { borderLeftColor: theme.accent.surface }]}>
        {children}
      </View>
    );
  }

  return <>{children}</>;
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
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  /** Set for one render to place the caret; cleared by the editor after. */
  selection?: { start: number; end: number };
  inputRef: (index: number, input: TextInput | null) => void;
  editable?: boolean;
}

const BlockInputView = ({
  block,
  editable = true,
  index,
  inputRef,
  onBlur,
  onChangeText,
  onFocus,
  onKeyPress,
  onSelectionChange,
  placeholder,
  selection,
}: BlockInputProps) => {
  const theme = useAppTheme();

  const text = blockText(block);
  const { lineHeight, size } = blockSizing(block);
  const children = useMemo(() => blockRuns(block, theme), [block, theme]);

  return (
    <BlockFrame block={block} lineHeight={lineHeight} size={size}>
      <TextInput
        autoCapitalize="sentences"
        // The outer list scrolls; a field that scrolled too would trap the
        // finger on long paragraphs.
        blurOnSubmit={false}
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
    paddingHorizontal: 0,
    paddingVertical: space.xs,
    textAlignVertical: "top",
  },
  italic: { fontStyle: "italic" },
  listRow: { flexDirection: "row", gap: space.sm },
  marker: { minWidth: 18, paddingTop: space.xs, textAlign: "right" },
  quote: { borderLeftWidth: 3, paddingLeft: space.sm },
});
