import type { MarkdownMark } from "@nw/chat";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontSize, monospace, radius, space, useAppTheme } from "@/theme";

/**
 * Bold, italic, strike and code, for people who do not type asterisks.
 *
 * Markdown shorthand is fast once you know it and invisible until you do, so
 * the shorthand is not the only way in: select some words, tap **B**, and the
 * asterisks are written for you — in the field, where you can see and delete
 * them. Nothing here is a hidden state the text does not carry.
 *
 * Only shown while the field has focus, and it replaces nothing: the row sits
 * above the input and folds away with the keyboard, so a resting composer is
 * still one line tall on a 667pt screen.
 */

export interface FormatAction {
  mark: MarkdownMark;
  /** What goes on both sides of the selection. */
  token: string;
  label: string;
  style: "bold" | "italic" | "strike" | "code";
}

export const FORMAT_ACTIONS: FormatAction[] = [
  { label: "B", mark: "bold", style: "bold", token: "**" },
  { label: "I", mark: "italic", style: "italic", token: "*" },
  { label: "S", mark: "strike", style: "strike", token: "~~" },
  { label: "`", mark: "code", style: "code", token: "`" },
];

/**
 * Wraps the selection, or opens an empty pair at the caret.
 *
 * Returns the new text and where the caret should end up: inside the pair when
 * there was no selection, and after the closing token when there was. Both are
 * what a text editor does, and getting the second one wrong leaves the caret in
 * the middle of the word you just emboldened.
 */
export const applyFormat = (
  text: string,
  selection: { start: number; end: number },
  token: string,
): { text: string; caret: number } => {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const before = text.slice(0, start);
  const middle = text.slice(start, end);
  const after = text.slice(end);

  if (!middle) {
    return {
      caret: start + token.length,
      text: `${before}${token}${token}${after}`,
    };
  }

  /*
   * Already wrapped? Unwrap it.
   *
   * Tapping **B** twice on the same words should give them back, not
   * `****bold****` — which is not bold at all, because the tokenizer refuses a
   * delimiter with another delimiter inside it.
   */
  if (
    before.endsWith(token) &&
    after.startsWith(token) &&
    !middle.startsWith(token)
  ) {
    return {
      caret: end - token.length,
      text: `${before.slice(0, -token.length)}${middle}${after.slice(token.length)}`,
    };
  }

  return {
    caret: end + token.length * 2,
    text: `${before}${token}${middle}${token}${after}`,
  };
};

export const FormatBar = ({
  onFormat,
}: {
  onFormat: (token: string) => void;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      {FORMAT_ACTIONS.map((action) => (
        <Pressable
          accessibilityLabel={action.mark}
          accessibilityRole="button"
          key={action.mark}
          onPress={() => onFormat(action.token)}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed
                ? theme.glass.fillPressed
                : theme.glass.fillHover,
              borderColor: theme.glass.edge,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: theme.text },
              action.style === "bold" ? styles.bold : null,
              action.style === "italic" ? styles.italic : null,
              action.style === "strike" ? styles.strike : null,
              action.style === "code" ? styles.code : null,
            ]}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bold: { fontWeight: "800" },
  button: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    height: 28,
    justifyContent: "center",
    width: 32,
  },
  code: { fontFamily: monospace },
  italic: { fontStyle: "italic" },
  label: { fontSize: fontSize.label, fontWeight: "600" },
  row: { flexDirection: "row", gap: space.xs, paddingBottom: space.xs },
  strike: { textDecorationLine: "line-through" },
});
