import {
  blockLength,
  blockText,
  inlineLength,
  type RichBlock,
  type RichRange,
  sliceInlines,
} from "@nw/richtext";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  StyleSheet,
  type TextInput,
  type TextLayoutLine,
  View,
} from "react-native";
import {
  BlockInput,
  type BlockInputProps,
  BlockMeasure,
} from "@/components/editor/block-input";
import { space } from "@/theme";

/**
 * The line after a picture set to "Text right" or "Text left", wrapping it
 * the way web's float does: beside the picture while there is picture beside
 * it, then full width underneath.
 *
 * A native field cannot flow around anything, so the line is drawn as two
 * fields over one block. `BlockMeasure` lays the whole block out, unseen, in
 * the column beside the picture; the lines that fit above the picture's
 * bottom edge are the top field, and the rest is the bottom field, full width.
 * Nothing about the document changes — it is still one block, and both fields
 * write to it through the editor's own handlers, their offsets moved by the
 * cut.
 *
 * ## The cut holds still while you type
 *
 * A field's text must only ever change because the keyboard changed it. The
 * keyboard keeps its own idea of the word being typed; replace the text under
 * it — which moving the cut does, to both fields — and its next keystroke is
 * applied to text that is no longer there, which is how a line turns into
 * "glows at night ws at night t".
 *
 * So while either field has the caret the cut is frozen: typing beside the
 * picture keeps the lower field's text exactly as it was (the upper field may
 * run on past the picture's edge for a moment), and typing below keeps the
 * upper field's. The cut is measured again once the line is left — a short
 * grace after a blur, so moving from one field to the other is not "leaving".
 *
 * ## One line, two fields
 *
 * - **Typing** in either field hands the editor the whole block's text, so a
 *   keystroke is the same edit it would be in one field.
 * - **Backspace** at the start of the lower field deletes the character before
 *   the cut, which a field on its own cannot see, and takes the caret up.
 * - **Focus** from the editor (`inputRef`) goes to whichever field holds the
 *   caret, through one handle that stands for both; a caret the editor places
 *   past the cut moves to the lower field.
 *
 * The cut never falls inside a mention chip: a chip is one unit, and half of
 * one is not drawable.
 */

type Side = "row" | "row-reverse";
type Part = "head" | "tail";

type Frozen =
  | { mode: "head"; tailLength: number }
  | { mode: "tail"; cut: number }
  | null;

interface Placed {
  part: Part;
  /** In that field's own offsets. */
  selection: RichRange;
}

/** How long after a blur the line counts as left, if nothing took the focus. */
const LEAVE_MS = 60;

const shift = (range: RichRange, by: number): RichRange => ({
  end: range.end + by,
  start: range.start + by,
});

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/** Where a cut at `at` may fall: pulled back to the start of a chip it splits. */
const safeCut = (block: RichBlock, at: number): number => {
  let position = 0;
  for (const child of block.children) {
    const length = inlineLength(child);
    if (child.type === "mention" && at > position && at < position + length) {
      return position;
    }
    position += length;
  }
  return at;
};

const sameLines = (a: TextLayoutLine[] | null, b: TextLayoutLine[]) =>
  a !== null &&
  a.length === b.length &&
  a.every(
    (line, i) =>
      line.text === b[i].text &&
      Math.abs(line.y - b[i].y) < 0.5 &&
      Math.abs(line.height - b[i].height) < 0.5,
  );

export const WrappedBlockInput = ({
  percent,
  picture,
  side,
  ...props
}: BlockInputProps & {
  /** How much of the width the picture takes. */
  percent: number;
  picture: ReactNode;
  side: Side;
}) => {
  const {
    block,
    index,
    inputRef,
    onBlur,
    onChangeText,
    onFocus,
    onKeyPress,
    onSelectionChange,
    selection,
  } = props;

  const full = blockText(block);
  const total = blockLength(block);

  const [pictureHeight, setPictureHeight] = useState(0);
  const [lines, setLines] = useState<TextLayoutLine[] | null>(null);

  /*
   * The measured cut: every line whose bottom is above the picture's bottom
   * edge stays beside it. The first line always does — a picture shorter than
   * one line still has that line beside it, as a float does.
   */
  const measuredCut = useMemo(() => {
    if (!lines || pictureHeight <= 0) return total;
    let offset = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (i > 0 && space.xs + line.y + line.height > pictureHeight) break;
      offset += line.text.length;
    }
    return safeCut(block, clamp(offset, total));
  }, [block, lines, pictureHeight, total]);

  const focusedPart = useRef<Part | null>(null);
  const frozen = useRef<Frozen>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Re-render once the line is left, so the measured cut is applied.
  const [, setThawed] = useState(0);

  useEffect(
    () => () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    },
    [],
  );

  const cut =
    frozen.current?.mode === "head"
      ? clamp(total - frozen.current.tailLength, total)
      : frozen.current?.mode === "tail"
        ? clamp(frozen.current.cut, total)
        : measuredCut;

  // A lower field that has the caret stays, even emptied, until it is left.
  const hasTail = cut < total || focusedPart.current === "tail";

  const cutRef = useRef(cut);
  cutRef.current = cut;
  const totalRef = useRef(total);
  totalRef.current = total;
  const hasTailRef = useRef(hasTail);
  hasTailRef.current = hasTail;

  const head = useMemo<RichBlock>(
    () =>
      cut < total
        ? { ...block, children: sliceInlines(block.children, 0, cut) }
        : block,
    [block, cut, total],
  );
  const tail = useMemo<RichBlock | null>(
    () =>
      hasTail
        ? {
            ...block,
            children: sliceInlines(block.children, cut, total),
            // A list item carries on under its text without a second marker.
            marker: block.type === "listItem" ? " " : block.marker,
          }
        : null,
    [block, cut, hasTail, total],
  );

  const headRef = useRef<TextInput | null>(null);
  const tailRef = useRef<TextInput | null>(null);
  /** The caret, in the whole block's offsets, as last reported. */
  const caret = useRef<RichRange>({ end: 0, start: 0 });

  // A caret handed to one field for one render, when it moves across the cut.
  const [placed, setPlaced] = useState<Placed | null>(null);
  const placedRef = useRef<Placed | null>(null);
  placedRef.current = placed;
  const lastHop = useRef<string | null>(null);

  // ─── One handle for the editor ───────────────────────────────────────────

  const handle = useMemo(
    () =>
      ({
        blur: () => {
          headRef.current?.blur();
          tailRef.current?.blur();
        },
        focus: () => {
          const inTail =
            hasTailRef.current && caret.current.start > cutRef.current;
          (inTail ? tailRef : headRef).current?.focus();
        },
        isFocused: () =>
          Boolean(headRef.current?.isFocused() || tailRef.current?.isFocused()),
      }) as unknown as TextInput,
    [],
  );

  useEffect(() => {
    inputRef(index, handle);
    return () => inputRef(index, null);
  }, [handle, index, inputRef]);

  // ─── Focus, and the freeze ───────────────────────────────────────────────

  const enter = (part: Part) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    focusedPart.current = part;
    if (part === "head" && frozen.current?.mode !== "head") {
      frozen.current = {
        mode: "head",
        tailLength: totalRef.current - cutRef.current,
      };
    } else if (part === "tail" && frozen.current?.mode !== "tail") {
      frozen.current = { cut: cutRef.current, mode: "tail" };
    }
  };

  const leave = (part: Part) => {
    if (focusedPart.current !== part) return;
    focusedPart.current = null;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      leaveTimer.current = null;
      if (focusedPart.current) return;
      frozen.current = null;
      setThawed((count) => count + 1);
    }, LEAVE_MS);
  };

  // ─── The two fields, mapped onto the block ───────────────────────────────

  const headText = full.slice(0, cut);
  const tailText = full.slice(cut);

  const clearPlaced = () => {
    if (placedRef.current) setPlaced(null);
  };

  const headChange = (i: number, next: string) =>
    onChangeText(i, next + tailText, full);
  const tailChange = (i: number, next: string) =>
    onChangeText(i, headText + next, full);

  const headSelect = (i: number, range: RichRange) => {
    caret.current = range;
    clearPlaced();
    onSelectionChange(i, range);
  };
  const tailSelect = (i: number, range: RichRange) => {
    const whole = shift(range, cut);
    caret.current = whole;
    clearPlaced();
    onSelectionChange(i, whole);
  };

  const tailKey = (i: number, key: string) => {
    if (
      key === "Backspace" &&
      cut > 0 &&
      caret.current.start === cut &&
      caret.current.end === cut
    ) {
      // The character before the cut is in the other field: delete it there,
      // keep the lower field's text as it is, and take the caret up.
      const at = cut - 1;
      frozen.current = { mode: "head", tailLength: total - cut };
      caret.current = { end: at, start: at };
      onChangeText(i, full.slice(0, at) + full.slice(cut), full);
      headRef.current?.focus();
      setPlaced({ part: "head", selection: { end: at, start: at } });
      return;
    }
    onKeyPress(i, key);
  };

  // ─── A caret the editor places ───────────────────────────────────────────

  let headSelection: RichRange | undefined;
  let tailSelection: RichRange | undefined;
  if (selection) {
    const inTail =
      hasTail &&
      (selection.start > cut ||
        (selection.start === cut && focusedPart.current === "tail"));
    if (inTail) tailSelection = shift(selection, -cut);
    else headSelection = selection;
  } else if (placed) {
    if (placed.part === "tail" && hasTail) tailSelection = placed.selection;
    else if (placed.part === "head") headSelection = placed.selection;
  }

  // Only a caret the editor put somewhere moves the focus between the fields —
  // never typing, which the freeze keeps on its own side of the cut.
  useEffect(() => {
    if (!selection) {
      lastHop.current = null;
      return;
    }
    const inTail = hasTail && selection.start > cut;
    const part = focusedPart.current;
    const key = `${inTail ? "tail" : "head"}:${selection.start}:${cut}`;
    if (lastHop.current === key) return;
    if (inTail && part === "head") {
      lastHop.current = key;
      caret.current = selection;
      tailRef.current?.focus();
    } else if (!inTail && part === "tail") {
      lastHop.current = key;
      caret.current = selection;
      headRef.current?.focus();
    }
  });

  const onLines = useCallback((next: TextLayoutLine[]) => {
    setLines((current) => (sameLines(current, next) ? current : next));
  }, []);

  const onPictureLayout = (event: LayoutChangeEvent) => {
    const height = Math.round(event.nativeEvent.layout.height);
    setPictureHeight((current) => (current === height ? current : height));
  };

  return (
    <View>
      <View style={[styles.row, { flexDirection: side }]}>
        <View onLayout={onPictureLayout} style={{ width: `${percent}%` }}>
          {picture}
        </View>
        <View style={styles.column}>
          <BlockInput
            {...props}
            block={head}
            inputRef={(_, node) => {
              headRef.current = node;
            }}
            onBlur={(i) => {
              leave("head");
              onBlur(i);
            }}
            onChangeText={headChange}
            onFocus={(i) => {
              enter("head");
              onFocus(i);
            }}
            onSelectionChange={headSelect}
            selection={headSelection}
          />
          {/* The whole block, laid out in this column, to find the cut. */}
          <View pointerEvents="none" style={styles.measure}>
            <BlockMeasure block={block} onLines={onLines} />
          </View>
        </View>
      </View>

      {tail ? (
        <BlockInput
          {...props}
          block={tail}
          inputRef={(_, node) => {
            tailRef.current = node;
          }}
          onBlur={(i) => {
            leave("tail");
            onBlur(i);
          }}
          onChangeText={tailChange}
          onFocus={(i) => {
            enter("tail");
            onFocus(i);
          }}
          onKeyPress={tailKey}
          onSelectionChange={tailSelect}
          placeholder={undefined}
          selection={tailSelection}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 0 },
  measure: { left: 0, opacity: 0, position: "absolute", right: 0, top: 0 },
  row: { alignItems: "flex-start", gap: 14 },
});
