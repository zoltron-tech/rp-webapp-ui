import { type MarkdownMark, tokenizeMarkdown } from "@nw/chat";
import { forwardRef, useMemo } from "react";
import {
  type NativeSyntheticEvent,
  StyleSheet,
  type TextInputSelectionChangeEventData,
  type TextStyle,
} from "react-native";
import { Text, TextInput } from "@/components/text";
import { fontSize, monospace, useAppTheme } from "@/theme";

/**
 * The message field, formatted as you type.
 *
 * `**bold**` is bold in the box, `*italic*` is italic, and the asterisks stay
 * on screen in a muted grey so it is obvious they are markup and obvious how to
 * remove them. Nothing is rewritten under the caret.
 *
 * ## Children, and no `value`
 *
 * React Native styles an input's text by taking `<Text>` children — that part
 * is documented and works on both platforms. What is *not* documented anywhere
 * you would find it is that the two cannot be combined with a `value` prop:
 * Android's `TextInput` asserts `Cannot specify both value and children` and
 * takes the app down on the first keystroke, and iOS quietly forwards children
 * to the native view while `text` fights them.
 *
 * So this input is driven by its children alone. The draft still lives in React
 * state and still flows one way — state renders the tokens, the tokens are the
 * input's contents — it simply arrives as children instead of as `value`.
 * Clearing the draft after a send empties the children, which empties the
 * field, so the composer needs nothing special for it.
 *
 * The tokens must therefore reproduce the typed string *exactly*, which is why
 * `tokenizeMarkdown` is written to be lossless: what it returns is not a
 * description of the text, it is the text.
 *
 * ## Why not a mirror behind a transparent input
 *
 * The other common trick. It fails here for a reason worth writing down: bold
 * and italic glyphs are wider than regular ones, so a styled mirror wraps at
 * different points than the plain field underneath it, and the caret drifts
 * further from the text with every formatted word. It works for the mention
 * highlighters it is normally used for because those only change colour.
 */

/**
 * Weight, slant and decoration only — never size or family.
 *
 * A different font size inside an input changes the line height of the line it
 * is on, which on Android reflows the whole field mid-keystroke. Code spans get
 * a monospace *look* from colour and background instead.
 */
const MARK_STYLES: Record<MarkdownMark, TextStyle> = {
  bold: { fontWeight: "700" },
  code: { fontFamily: monospace },
  italic: { fontStyle: "italic" },
  strike: { textDecorationLine: "line-through" },
};

export interface MarkdownInputProps {
  /**
   * The text colour, when it is not the theme's.
   *
   * The ice-breaker composer types into a colour-filled bubble, where the
   * theme's ink is unreadable. Passed rather than derived because only the
   * caller knows what it filled the box behind this with.
   */
  color?: string;
  editable?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  /** The touch that will focus, or re-summon the keyboard for, the field. */
  onPressIn?: () => void;
  onSelectionChange?: (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void;
  /** The markup characters and the placeholder, when not the theme's grey. */
  mutedColor?: string;
  placeholder: string;
  /** Set for one render to move the caret; cleared again by the caller. */
  selection?: { start: number; end: number };
  style?: TextStyle | TextStyle[];
  value: string;
}

export const MarkdownInput = forwardRef<TextInput, MarkdownInputProps>(
  function MarkdownInput(
    {
      color,
      editable = true,
      maxLength,
      mutedColor,
      onBlur,
      onChangeText,
      onFocus,
      onPressIn,
      onSelectionChange,
      placeholder,
      selection,
      style,
      value,
    },
    ref,
  ) {
    const theme = useAppTheme();
    const ink = color ?? theme.text;
    const muted = mutedColor ?? theme.textGray;

    const children = useMemo(() => {
      // Null rather than an empty string, so the placeholder shows.
      if (!value) return null;
      const tokens = tokenizeMarkdown(value);

      // Nothing formatted, which is what almost every message is: one text node
      // instead of a wrapper per run.
      if (!tokens.some((token) => token.delimiter)) {
        return <Text style={{ color: ink }}>{value}</Text>;
      }

      return tokens.map((token, index) => (
        <Text
          // Index keys: the list is rebuilt from scratch on every keystroke and
          // there is no identity to preserve between two renders of it.
          key={`${index}-${token.text}`}
          style={[
            { color: token.delimiter ? muted : ink },
            ...token.marks.map((mark) => MARK_STYLES[mark]),
            token.marks.includes("code")
              ? { backgroundColor: theme.glass.fillHover }
              : null,
          ]}
        >
          {token.text}
        </Text>
      ));
    }, [ink, muted, theme.glass.fillHover, value]);

    return (
      <TextInput
        editable={editable}
        maxLength={maxLength}
        multiline
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onPressIn={onPressIn}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={muted}
        ref={ref}
        selection={selection}
        // The caret and the selection tint are set explicitly: the text colour
        // now lives on the children, so the input has nothing to derive them
        // from and Android falls back to its own blue.
        selectionColor={theme.accent.surfaceHover}
        style={[styles.input, style]}
        // No `value`. See the note above — with children it is a crash on
        // Android, not a preference.
      >
        {children}
      </TextInput>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    // Fills the row it is in. Without it the field is only as wide as the text,
    // and the `+` and send buttons beside it walk left with every character
    // instead of staying at the composer's trailing edge.
    flex: 1,
    fontSize: fontSize.body,
    textAlignVertical: "top",
  },
});
