import {
  applyTextChange,
  backgroundIn,
  blockLength,
  blockText,
  BULLET_POINT_CATEGORIES,
  DEFAULT_ORDERED_LIST_STYLE,
  DEFAULT_UNORDERED_LIST_STYLE,
  diffText,
  documentFromHtml,
  documentToHtml,
  emptyParagraph,
  FONT_SIZES,
  fontFamilyIn,
  insertImageAfter,
  insertMention,
  marksIn,
  mentionQuery,
  mergeBlocks,
  normalizeDocument,
  ORDERED_LIST_STYLES,
  QUOTATION_MARK_CATEGORIES,
  removeBlock,
  replaceBlock,
  replaceRange,
  type RichAlign,
  type RichBlock,
  type RichDocument,
  type RichImageBlock,
  type RichMark,
  type RichRange,
  richTextIsEmpty,
  type RunStyle,
  setBlockAlign,
  setBlockFontSize,
  setFontFamily,
  setHighlight,
  setListStyle,
  styleAt,
  toggleList,
  toggleMark,
  updateImage,
} from "@nw/richtext";
import { mixColors } from "@nw/theme";
import type { MentionDataItem, MentionTab } from "@nw/types";
import { LinearGradient } from "expo-linear-gradient";
import {
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  KeyboardController,
  KeyboardEvents,
} from "react-native-keyboard-controller";
import { Text, TextInput } from "@/components/text";
import { BlockInput } from "@/components/editor/block-input";
import { FontSheet } from "@/components/editor/font-sheet";
import {
  highlightStyle,
  highlightSwatch,
} from "@/components/editor/highlight";
import { HighlightSheet } from "@/components/editor/highlight-sheet";
import { ImageBlock, ImageControls } from "@/components/editor/image-block";
import { MentionList } from "@/components/editor/mention-list";
import { SymbolSheet } from "@/components/editor/symbol-sheet";
import {
  EditorToolbar,
  type ToolbarActions,
  type ToolbarState,
} from "@/components/editor/toolbar";
import { WrappedBlockInput } from "@/components/editor/wrapped-block-input";
import { BottomSheet } from "@/components/sheet";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The rich-text editor — web's `RichTextEditor`, without a browser.
 *
 * Web's is 3,200 lines because a `contenteditable` is a thing you *negotiate*
 * with: every toolbar button runs an `execCommand`, reads the DOM back, and
 * patches what the browser did with it. This one is a few hundred because the
 * document is data and the edits are functions (`@nw/richtext/document`) —
 * what is left here is wiring keystrokes and taps to those functions and
 * putting the caret back where it belongs afterwards.
 *
 * ## The shape
 *
 * A scrolling column of blocks. Each text block is a `BlockInput` — a native
 * field whose contents are the block's runs — and each image is an
 * `ImageBlock`. Under the column, the mention strip when an `@` is being
 * typed, then the toolbar. The composer that mounts this lifts the whole thing
 * above the keyboard.
 *
 * ## Where the caret is
 *
 * Two answers, for two audiences. `active` is state, because the toolbar
 * renders from it — which buttons are lit is a function of the block and the
 * selection. `activeRef` is the same thing as a ref, because key handlers need
 * the *current* selection at the moment of the keystroke, and a closure over
 * state is one render behind.
 *
 * The caret is *placed* through `caret`, which is handed to one field for one
 * render and taken back the moment the field reports its selection — the
 * pattern `chat/composer.tsx` uses, for the reason it gives: a permanently
 * controlled `selection` fights the platform every time you tap.
 *
 * ## The typing style
 *
 * Tapping **B** with nothing selected does not change the document; it
 * changes what the *next* character will be. Web keeps that in the browser's
 * typing state; here it is `pending` — a style pinned to a block and an
 * offset, applied to the next insertion at exactly that spot and discarded the
 * moment the caret goes anywhere else. That last rule is web's
 * (`handleSelectionChange` clears `pendingFontRef` on a real move), and it is
 * what stops a bold you set on line three from ambushing you on line seven.
 *
 * ## Enter and Backspace
 *
 * Neither is a key event this editor can rely on for text — Enter arrives as
 * a `\n` inside `onChangeText`, and reading intent out of "the text was X and
 * is now Y" is `applyTextChange`'s job in `@nw/richtext`, where it is tested
 * keystroke by keystroke. Backspace at the very start of a block is the one
 * place `onKeyPress` is needed, because there is no text change to observe;
 * it merges the block into the one above, or removes the image above.
 */

export interface RichTextEditorHandle {
  clear: () => void;
  focus: () => void;
  getHtml: () => string;
  /** A picture, after the line the caret is on. Web's `insertGif` too. */
  insertImage: (src: string) => void;
  /** An uploaded picture's temporary URL swapped for its final one. */
  replaceImageSrc: (previous: string, next: string) => void;
  removeImageBySrc: (src: string) => void;
}

export interface RichTextEditorProps {
  /** The saved HTML to start from. Read once, on mount. */
  initialHtml?: string;
  /** Called with the saved HTML — "" when the document is empty — on edit. */
  /** The serialised document, on every change. Costs a full serialise. */
  onChange?: (html: string, doc: RichDocument) => void;
  /**
   * The document and whether it is empty, on every change — without the HTML.
   *
   * For a caller that only needs to know *whether* there is something to send
   * while the writer types, and asks for the HTML (`getHtml`) when it sends.
   * Serialising the whole document on every keystroke was the single largest
   * fixed cost of a character.
   */
  onDocumentChange?: (doc: RichDocument, empty: boolean) => void;
  placeholder: string;
  mentionTabs?: MentionTab[];
  /** Image sources still on their way to storage; drawn with a spinner. */
  uploadingSources?: ReadonlySet<string>;
  editable?: boolean;
  /**
   * The reply shape: grows from one line to a cap rather than filling the
   * screen, and shows its toolbar only while a line has the keyboard.
   *
   * A composer that answers something has to keep that something on screen
   * above it, so the editor cannot own the height. Web's `compact` prop.
   */
  compact?: boolean;
  /** Rendered after the last block, inside the scroll. */
  footer?: ReactNode;
  /**
   * Told when a line takes or loses the keyboard. For a caller that lifts its
   * own layout for the keyboard, so it can start rising on focus instead of
   * waiting for Android to report the keyboard's height after the slide.
   */
  onFocusChange?: (focused: boolean) => void;
}

type Sheet =
  | "font"
  | "size"
  | "highlight"
  | "bullets"
  | "ordered"
  | "quotes"
  | null;

interface Caret {
  index: number;
  selection: RichRange;
}

const ALIGN_CYCLE: RichAlign[] = ["left", "center", "right", "justify"];

let blockKeySeed = 0;
// The suffix keeps keys unique across a Fast Refresh, which resets the counter
// while the editor keeps the keys it already handed out.
const nextBlockKey = () =>
  `b${(blockKeySeed += 1)}-${Math.random().toString(36).slice(2, 6)}`;

const sameKind = (a: RichDocument[number], b: RichDocument[number]) =>
  (a.type === "image") === (b.type === "image");

/**
 * The keys for `next`, carried over from `previous` wherever a block is the
 * same block.
 *
 * Document operations are immutable and leave untouched blocks as the same
 * objects, so the blocks before and after an edit match by identity. What is
 * left in the middle is the edit: its blocks take the old middle's keys in
 * order while they are the same kind of thing, and new keys after that — a
 * split keeps the upper line's field and mounts one below, a merge keeps the
 * upper line's and removes the lower.
 */
const carryKeys = (
  previous: RichDocument,
  keys: string[],
  next: RichDocument,
): string[] => {
  let head = 0;
  while (
    head < previous.length &&
    head < next.length &&
    previous[head] === next[head]
  ) {
    head += 1;
  }
  let tail = 0;
  while (
    tail < previous.length - head &&
    tail < next.length - head &&
    previous[previous.length - 1 - tail] === next[next.length - 1 - tail]
  ) {
    tail += 1;
  }

  const out: string[] = keys.slice(0, head);
  const oldEnd = previous.length - tail;
  const newEnd = next.length - tail;
  for (let at = head; at < newEnd; at += 1) {
    const from = head + (at - head);
    out.push(
      from < oldEnd && sameKind(previous[from], next[at])
        ? keys[from]
        : nextBlockKey(),
    );
  }
  return out.concat(keys.slice(oldEnd));
};

/** Web's small-screen cap on a picture text wraps around: half the width. */
const FLOAT_MAX_PERCENT = 50;

const isTextBlock = (
  node: RichDocument[number] | undefined,
): node is RichBlock => node !== undefined && node.type !== "image";

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    compact = false,
    editable = true,
    footer,
    initialHtml,
    mentionTabs = [],
    onChange,
    onDocumentChange,
    onFocusChange,
    placeholder,
    uploadingSources,
  },
  handle,
) {
  const theme = useAppTheme();

  const [doc, setDoc] = useState<RichDocument>(() =>
    documentFromHtml(initialHtml),
  );
  const docRef = useRef(doc);
  docRef.current = doc;

  /*
   * A key per block that survives the blocks around it changing.
   *
   * Keys used to be positions. Take a line out — a merge on Backspace, a
   * picture removed — and every line after it was handed the next one's text,
   * while the last key, often the line with the caret, was unmounted. A
   * focused field leaving the tree takes the keyboard with it, which is what
   * closed it mid-delete. Carried over by identity, the lines that did not
   * change keep their fields and only the one that went is removed.
   */
  const keyed = useRef<{ doc: RichDocument; keys: string[] } | null>(null);
  /**
   * A split made this render, by the index of its upper line.
   *
   * The field the writer is in becomes the *new* line, and the line above
   * gets a fresh field. Two reasons, both about not moving the focus:
   *
   * - The keyboard stays exactly where it is. Handing the caret to a newly
   *   mounted field is a focus change, and on Android that restarts the
   *   keyboard's connection — it dipped and came back on every Return.
   * - A keyboard that types the newline leaves it in the field. Kept as the
   *   upper line, that field's block was unchanged, so nothing told it to
   *   drop the newline and one Return showed as two lines. As the lower line
   *   its block is different, so its text is replaced and the newline goes.
   *
   * Not when the lower line's text is what the field already held (Return at
   * the very start of a line): then it is the upper line whose text changes,
   * and the keys stay as they are.
   */
  const splitAt = useRef<number | null>(null);
  /** The line whose field is emptied right after the next commit. */
  const clearAfterCommit = useRef<number | null>(null);
  useLayoutEffect(() => {
    const at = clearAfterCommit.current;
    if (at === null) return;
    clearAfterCommit.current = null;
    inputs.current.get(at)?.clear();
  });
  if (!keyed.current) {
    keyed.current = { doc, keys: doc.map(() => nextBlockKey()) };
  } else if (keyed.current.doc !== doc) {
    const before = keyed.current.keys.length;
    const keys = carryKeys(keyed.current.doc, keyed.current.keys, doc);
    const at = splitAt.current;
    if (at !== null && keys.length === before + 1 && at + 1 < keys.length) {
      [keys[at], keys[at + 1]] = [keys[at + 1], keys[at]];
    }
    splitAt.current = null;
    keyed.current = { doc, keys };
  }
  const blockKeys = keyed.current.keys;

  const [active, setActive] = useState<Caret | null>(null);
  const activeRef = useRef<Caret | null>(null);
  const [pending, setPending] = useState<
    (Caret & { offset: number; style: RunStyle }) | null
  >(null);
  /*
   * Read by the handlers below through a ref. As a dependency it gave
   * `handleChangeText` a new identity every time a style was pinned and again
   * when the next character spent it — and that handler is a prop of every
   * line, so each of those re-rendered the whole document.
   */
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  /**
   * The style the writer is typing in, remembered.
   *
   * A character takes its style from the one before it, and an empty line has
   * none — so a font chosen for a post was lost on any empty line reached
   * without typing into it: Return a few times and Backspace back, or delete
   * a line's text and start again, and the writing was in the default face.
   * This is what an empty line types in instead: the last style chosen from
   * the toolbar, typed in, or found under the caret. It changes when the
   * writer changes it, or moves the caret into text set differently.
   */
  const sticky = useRef<RunStyle>({ marks: [] });

  /** What a character typed at this caret would be set in. */
  const typingStyleAt = useCallback(
    (block: RichBlock, index: number, offset: number): RunStyle => {
      const pinned = pendingRef.current;
      if (pinned && pinned.index === index && pinned.offset === offset) {
        return pinned.style;
      }
      if (blockLength(block) === 0) {
        // Size is the line's own property, not the remembered style's.
        return { ...sticky.current, fontSize: block.fontSize };
      }
      return styleAt(block, offset);
    },
    [],
  );
  const [caret, setCaret] = useState<Caret | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [mention, setMention] = useState<{
    at: number;
    index: number;
    query: string;
  } | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  /** Whether any line has the keyboard. Only the compact shape reads it. */
  const [focused, setFocused] = useState(false);
  /** Held in a ref so the focus handlers below stay stable across renders. */
  const onFocusChangeRef = useRef(onFocusChange);
  onFocusChangeRef.current = onFocusChange;

  /**
   * The canvas's wash: the card surface at the top, and at the bottom the
   * same surface with a tenth of the accent mixed in. Faint on purpose —
   * text sits on it for as long as a post takes to write, and a gradient
   * loud enough to notice is a gradient loud enough to tire of.
   */
  const wash = useMemo(
    () =>
      [
        mixColors(theme.accent.solid, 0.03, theme.material.fill),
        mixColors(theme.accent.solid, 0.1, theme.material.fill),
      ] as const,
    [theme],
  );

  const inputs = useRef(new Map<number, TextInput>());
  const focusAfterRender = useRef<Caret | null>(null);
  const focusRetry = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Looks again a moment after a focus, and raises the keyboard if it is not up. */
  const ensureKeyboard = useCallback((index: number) => {
    if (focusRetry.current) clearTimeout(focusRetry.current);
    /*
     * Looks after a sheet has had time to leave (its slide is 180ms), and if
     * the keyboard is not up, takes the focus properly: lets go of whatever
     * focus React believes the field has — one taken while the sheet's window
     * was still up never reached it — and focuses a moment later, as two
     * steps. Then looks once more, for the phone that was slower than that.
     *
     * Two steps and not a blur-and-focus in one go: the keyboard-hidden
     * listener below answers a blur by blurring whatever is focused, and
     * would take the new focus away with it.
     */
    const raise = (attemptsLeft: number) => {
      focusRetry.current = null;
      if (KeyboardController.isVisible()) return;
      const field = inputs.current.get(index);
      if (!field) return;
      if (field.isFocused()) field.blur();
      focusRetry.current = setTimeout(() => {
        inputs.current.get(index)?.focus();
        focusRetry.current =
          attemptsLeft > 0
            ? setTimeout(() => raise(attemptsLeft - 1), 700)
            : null;
      }, 80);
    };
    focusRetry.current = setTimeout(() => raise(1), 280);
  }, []);
  /*
   * A line never stays focused without a keyboard.
   *
   * Android can put the keyboard away and leave the field focused — the back
   * button does, and so does a sheet opening over the editor. Tapping a field
   * that is already focused is not a focus, so nothing brought the keyboard
   * back: the writer tapped the page and nothing happened. When the keyboard
   * goes, the focus goes with it, and the next tap or `focus()` is a real one.
   */
  useEffect(() => {
    const subscription = KeyboardEvents.addListener("keyboardDidHide", () => {
      const input = TextInput.State.currentlyFocusedInput();
      if (input) TextInput.State.blurTextInput(input);
    });
    return () => subscription.remove();
  }, []);

  const lastBulletStyle = useRef(DEFAULT_UNORDERED_LIST_STYLE);
  const lastOrderedStyle = useRef(DEFAULT_ORDERED_LIST_STYLE);

  // The caller's callback, held so the effect below never re-fires because
  // the composer rebuilt an inline function.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onDocumentChangeRef = useRef(onDocumentChange);
  onDocumentChangeRef.current = onDocumentChange;
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onDocumentChangeRef.current?.(doc, richTextIsEmpty(doc));
    onChangeRef.current?.(documentToHtml(doc), doc);
  }, [doc]);

  // A block that was created or merged this render gets the caret once its
  // field exists — which is now.
  useEffect(() => {
    const target = focusAfterRender.current;
    if (!target) return;
    focusAfterRender.current = null;
    inputs.current.get(target.index)?.focus();
    activeRef.current = target;
    setActive(target);
    setCaret(target);
    /*
     * A field mounted this render — the line after a picture just put in —
     * or one focused while a media tray or the photo picker is still closing
     * takes the call before it can show a keyboard, and Android drops it. So
     * look again a moment later: not focused, focus; focused with no keyboard,
     * blur and focus, which is what raises it.
     */
    ensureKeyboard(target.index);
  });

  useEffect(
    () => () => {
      if (focusRetry.current) clearTimeout(focusRetry.current);
    },
    [],
  );

  const setActiveBoth = useCallback((next: Caret | null) => {
    const current = activeRef.current;
    // The same caret is not news: a text change and the selection event that
    // follows it both report it, and a new object here re-rendered the editor
    // and its toolbar a second time for one character.
    if (
      current &&
      next &&
      current.index === next.index &&
      current.selection.start === next.selection.start &&
      current.selection.end === next.selection.end
    ) {
      return;
    }
    activeRef.current = next;
    setActive(next);
  }, []);

  const focusBlock = useCallback((index: number, selection: RichRange) => {
    focusAfterRender.current = { index, selection };
  }, []);

  // ─── Typing ──────────────────────────────────────────────────────────────

  const handleChangeText = useCallback(
    (index: number, next: string, previous: string) => {
      const current = docRef.current;
      const block = current[index];
      if (!isTextBlock(block)) return;
      const pending = pendingRef.current;

      const diff = diffText(previous, next);
      const at = diff.start;
      /*
       * What the inserted text is set in.
       *
       * A pinned style, when the caret is where it was pinned. Otherwise, for
       * a *replacement* — the keyboard correcting a word, or swapping it for
       * a suggestion — the style of the text being replaced. Left to the
       * default, a replacement took the style of whatever came before it: the
       * space in front of the word, usually, so a corrected word dropped its
       * font and its bold. A plain insertion takes the style at the caret, as
       * before.
       */
      const typing =
        pending && pending.index === index && pending.offset === at
          ? pending.style
          : diff.end > diff.start && diff.inserted.length > 0
            ? styleAt(block, diff.start + 1)
            : blockLength(block) === 0
              ? typingStyleAt(block, index, at)
              : undefined;
            const change = applyTextChange(block, previous, next, typing);
      // What was just typed in is what the next empty line types in.
      if (diff.inserted.length > 0 && diff.inserted !== "\n") {
        sticky.current = typing ?? styleAt(block, at);
      }

      if (change.kind === "split") {
        // Return on an empty list item ends the list: the item becomes a
        // plain line where it stands, rather than that and a blank one under.
        if (block.type === "listItem" && blockLength(block) === 0) {
          setDoc(normalizeDocument(replaceBlock(current, index, change.left)));
          clearAfterCommit.current = index;
          setMention(null);
          return;
        }
        setDoc(
          normalizeDocument(
            replaceBlock(current, index, change.left, change.right),
          ),
        );
        /*
         * A keyboard that reports Return as an action goes through
         * `handleSubmit` instead and never types the newline. One that types
         * it lands here; see `splitAt` for how the newline leaves the field.
         *
         * The new line types in what the old one was typing in: the font, the
         * marks, the highlight. An empty line has no character to take a style
         * from, so without this Enter dropped back to the default face — a
         * post set in Times New Roman went back to the interface font on
         * every new paragraph. Pinned at the start of the new line, it is
         * spent on the first character and inherited from there; moving the
         * caret elsewhere clears it, as any pinned style is cleared.
         */
        if (previous.length === 0) {
          /*
           * Return on an empty line. Both halves are empty, so whichever
           * line this field becomes, its text is what it was before the key
           * and React has nothing to send it: the newline the keyboard typed
           * stayed, and the caret went down one line and then another.
           * `clear()` is the field's own way of being emptied, and keeps the
           * keyboard's connection. It is called once the new line above has
           * been committed (`clearAfterCommit`), so the two land together:
           * called here it raced the commit, and for a frame the caret sat a
           * line too low.
           */
          clearAfterCommit.current = index + 1;
          splitAt.current = index;
        } else if (blockText(change.right) !== previous) {
          splitAt.current = index;
        }
        const start = { end: 0, start: 0 };
        setPending({
          index: index + 1,
          offset: 0,
          selection: start,
          style: typing ?? typingStyleAt(block, index, at),
        });
        setMention(null);
        focusBlock(index + 1, start);
        return;
      }

      setDoc(replaceBlock(current, index, change.block));

      // The style was spent on the character it was set for; the next one
      // takes its style from that character. A deletion spends nothing.
      const inserted = next.length > previous.length;
      setPending(
        inserted || !pending ? null : { ...pending, offset: change.caret },
      );

      const selection = { end: change.caret, start: change.caret };
      setActiveBoth({ index, selection });

      // The field shows what was typed; the block may say otherwise — a chip
      // was taken whole, say. The caret then has to be put where the block
      // thinks it is, not where the keyboard left it.
      if (blockText(change.block) !== next) setCaret({ index, selection });

      const query = mentionQuery(blockText(change.block), change.caret);
      setMention(query ? { ...query, index } : null);
    },
    [focusBlock, setActiveBoth, typingStyleAt],
  );

  /**
   * Return: the block splits at the caret, and the new line takes the caret.
   *
   * The field reports the key and does not insert anything (`BlockInput`), so
   * the split is made here from the caret the editor already tracks. A
   * selection is deleted first, as typing over it would.
   */
  const handleSubmit = useCallback(
    (index: number) => {
      const current = docRef.current;
      let block = current[index];
      if (!isTextBlock(block)) return;

      const at = activeRef.current;
      const length = blockLength(block);
      const selection =
        at && at.index === index
          ? {
              end: Math.min(Math.max(at.selection.start, at.selection.end), length),
              start: Math.min(Math.min(at.selection.start, at.selection.end), length),
            }
          : { end: length, start: length };

      const style = typingStyleAt(block, index, selection.start);

      let offset = selection.start;
      if (selection.end > selection.start) {
        const cut = replaceRange(block, selection, "", style);
        block = cut.block;
        offset = cut.caret;
      }

      const text = blockText(block);
      const change = applyTextChange(
        block,
        text,
        `${text.slice(0, offset)}
${text.slice(offset)}`,
      );
      if (change.kind !== "split") return;

      if (blockText(change.right) !== text) splitAt.current = index;
      setDoc(
        normalizeDocument(
          replaceBlock(current, index, change.left, change.right),
        ),
      );
      // The new line types in what this one was typing in.
      const start = { end: 0, start: 0 };
      setPending({ index: index + 1, offset: 0, selection: start, style });
      setMention(null);
      focusBlock(index + 1, start);
    },
    [focusBlock],
  );

  const handleSelectionChange = useCallback(
    (index: number, selection: RichRange) => {
      setActiveBoth({ index, selection });
      // Handing the caret back to the platform: it has been placed.
      setCaret((placed) => (placed?.index === index ? null : placed));
      /*
       * A pinned style is dropped when the caret leaves the spot it was
       * pinned at — judged only by the line it was pinned on. Another line's
       * selection event says nothing about it: after Return the line above
       * still reports its caret moving past the newline, and that used to
       * clear the style just carried down to the new line. Moving to another
       * line is a focus, and `handleFocus` clears it there.
       */
      setPending((current) =>
        current &&
        current.index === index &&
        (current.offset !== selection.start ||
          selection.start !== selection.end)
          ? null
          : current,
      );

      const block = docRef.current[index];
      if (!isTextBlock(block) || selection.start !== selection.end) {
        setMention(null);
        return;
      }
      // The caret is in text: that text's style is the one being typed in
      // now. Not while a style is pinned right here — it has not been typed
      // yet, and the text beside it would overwrite the choice.
      const pinned = pendingRef.current;
      if (
        blockLength(block) > 0 &&
        !(
          pinned &&
          pinned.index === index &&
          pinned.offset === selection.start
        )
      ) {
        sticky.current = styleAt(block, selection.start);
      }
      const query = mentionQuery(blockText(block), selection.start);
      setMention(query ? { ...query, index } : null);
    },
    [setActiveBoth],
  );

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key !== "Backspace") return;
      const at = activeRef.current;
      if (!at || at.index !== index) return;
      if (at.selection.start !== 0 || at.selection.end !== 0) return;
      if (index === 0) return;

      const current = docRef.current;
      const above = current[index - 1];
      const block = current[index];
      if (!isTextBlock(block)) return;

      if (above.type === "image") {
        // Backspace into a picture removes it, as a browser removes a
        // non-editable block the caret backs into.
        setDoc(removeBlock(current, index - 1));
        setSelectedImage(null);
        focusBlock(index - 1, { end: 0, start: 0 });
        return;
      }

      const joinAt = blockLength(above);
      const merged = mergeBlocks(above, block);
      // The focus goes up first, while both lines still exist. Left where it
      // was, the line being removed would leave the tree focused and the
      // keyboard would close under a writer who is still deleting.
      inputs.current.get(index - 1)?.focus();
      setDoc(
        normalizeDocument([
          ...current.slice(0, index - 1),
          merged,
          ...current.slice(index + 1),
        ]),
      );
      setPending(null);
      focusBlock(index - 1, { end: joinAt, start: joinAt });
    },
    [focusBlock],
  );

  const handleFocus = useCallback(
    (index: number) => {
      setSelectedImage(null);
      setFocused(true);
      // A style pinned on another line does not follow the caret here.
      setPending((current) =>
        current && current.index !== index ? null : current,
      );
      onFocusChangeRef.current?.(true);
      if (activeRef.current?.index !== index) {
        setActiveBoth({ index, selection: { end: 0, start: 0 } });
      }
    },
    [setActiveBoth],
  );

  // Blur keeps `active`: a sheet opening takes the focus, and its pick has to
  // land on the block the caret was in when the sheet was asked for. Only
  // the `focused` flag moves, and only the compact toolbar reads it.
  const handleBlur = useCallback(() => {
    setFocused(false);
    onFocusChangeRef.current?.(false);
  }, []);

  const registerInput = useCallback(
    (index: number, input: TextInput | null) => {
      if (input) inputs.current.set(index, input);
      else inputs.current.delete(index);
    },
    [],
  );

  // ─── The toolbar ─────────────────────────────────────────────────────────

  /** The block the toolbar is about, or null on an image or nowhere. */
  const target = useMemo(() => {
    if (!active) return null;
    const block = doc[active.index];
    return isTextBlock(block) ? { block, ...active } : null;
  }, [active, doc]);

  const toolbarState = useMemo<ToolbarState>(() => {
    if (!target) {
      return {
        align: "left",
        fontFamily: undefined,
        fontSize: undefined,
        hasText: false,
        highlight: null,
        list: null,
        marks: [],
      };
    }
    const pinned =
      pending &&
      pending.index === target.index &&
      pending.offset === target.selection.start &&
      target.selection.start === target.selection.end
        ? pending.style
        : blockLength(target.block) === 0
          ? // An empty line shows what it will type in.
            sticky.current
          : null;
    return {
      align: target.block.align ?? "left",
      fontFamily: pinned
        ? pinned.fontFamily
        : fontFamilyIn(target.block, target.selection),
      fontSize: target.block.fontSize,
      hasText: true,
      // The swatch, not the stored tint: it colours the toolbar's button and
      // marks the cell in the sheet.
      highlight: highlightSwatch(
        pinned
          ? (pinned.background ?? null)
          : backgroundIn(target.block, target.selection),
      ),
      list:
        target.block.type === "listItem"
          ? (target.block.list ?? { ordered: false })
          : null,
      marks: pinned ? pinned.marks : marksIn(target.block, target.selection),
    };
  }, [pending, target]);

  /** Applies a change to the active block and puts the caret back on it. */
  const editTarget = useCallback(
    (
      update: (block: RichBlock, selection: RichRange) => RichBlock,
      selectionAfter?: RichRange,
    ) => {
      const at = activeRef.current;
      const current = docRef.current;
      if (!at) return;
      const block = current[at.index];
      if (!isTextBlock(block)) return;
      setDoc(replaceBlock(current, at.index, update(block, at.selection)));
      focusBlock(at.index, selectionAfter ?? at.selection);
    },
    [focusBlock],
  );

  const pinStyle = useCallback(
    (change: (style: RunStyle) => RunStyle) => {
      const at = activeRef.current;
      if (!at) return;
      const block = docRef.current[at.index];
      if (!isTextBlock(block)) return;
      const style = change(
        typingStyleAt(block, at.index, at.selection.start),
      );
      sticky.current = style;
      setPending({
        index: at.index,
        offset: at.selection.start,
        selection: at.selection,
        style,
      });
      inputs.current.get(at.index)?.focus();
      // Called as a sheet closes, when the first focus can be dropped.
      ensureKeyboard(at.index);
    },
    [ensureKeyboard, typingStyleAt],
  );

  /** A sheet dismissed without a choice: back to the line, keyboard up. */
  const closeSheet = useCallback(() => {
    setSheet(null);
    const at = activeRef.current;
    if (!at) return;
    inputs.current.get(at.index)?.focus();
    ensureKeyboard(at.index);
  }, [ensureKeyboard]);

  const actions = useMemo<ToolbarActions>(
    () => ({
      onAlign: () => {
        editTarget((block) => {
          const current = block.align ?? "left";
          const next =
            ALIGN_CYCLE[
              (ALIGN_CYCLE.indexOf(current) + 1) % ALIGN_CYCLE.length
            ];
          return setBlockAlign(block, next);
        });
      },
      onFont: () => setSheet("font"),
      onHighlight: () => setSheet("highlight"),
      onList: (ordered) => {
        const at = activeRef.current;
        if (!at) return;
        const style = ordered
          ? lastOrderedStyle.current
          : lastBulletStyle.current;
        setDoc(
          toggleList(
            docRef.current,
            at.index,
            ordered,
            style ===
              (ordered
                ? DEFAULT_ORDERED_LIST_STYLE
                : DEFAULT_UNORDERED_LIST_STYLE)
              ? undefined
              : style,
          ),
        );
        focusBlock(at.index, at.selection);
      },
      onListStyle: (ordered) => setSheet(ordered ? "ordered" : "bullets"),
      onMark: (mark: RichMark) => {
        const at = activeRef.current;
        if (!at) return;
        if (at.selection.start === at.selection.end) {
          pinStyle((style) => ({
            ...style,
            marks: style.marks.includes(mark)
              ? style.marks.filter((entry) => entry !== mark)
              : [...style.marks, mark],
          }));
          return;
        }
        editTarget((block, selection) => toggleMark(block, selection, mark));
      },
      onQuotes: () => setSheet("quotes"),
      onSize: () => setSheet("size"),
    }),
    [editTarget, focusBlock, pinStyle],
  );

  // ─── Sheets ──────────────────────────────────────────────────────────────

  const pickSize = useCallback(
    (px: number | undefined) => {
      setSheet(null);
      editTarget((block) => setBlockFontSize(block, px));
    },
    [editTarget],
  );

  /**
   * Web's `handleFontChange`: over a selection the family is written onto
   * the words; at a caret it is pinned for what is typed next.
   */
  const pickFont = useCallback(
    (family: string | undefined) => {
      setSheet(null);
      const at = activeRef.current;
      if (!at) return;
      if (at.selection.start === at.selection.end) {
        pinStyle((style) => ({ ...style, fontFamily: family }));
        return;
      }
      editTarget((block, selection) => setFontFamily(block, selection, family));
    },
    [editTarget, pinStyle],
  );

  const pickHighlight = useCallback(
    (value: string | null) => {
      setSheet(null);
      const at = activeRef.current;
      if (!at) return;
      const swatch = value ? highlightStyle(value) : null;
      if (at.selection.start === at.selection.end) {
        pinStyle((style) => ({
          ...style,
          background: swatch?.background,
          color: swatch?.color,
        }));
        return;
      }
      editTarget((block, selection) => setHighlight(block, selection, swatch));
    },
    [editTarget, pinStyle],
  );

  const pickListStyle = useCallback(
    (ordered: boolean, value: string) => {
      setSheet(null);
      const at = activeRef.current;
      if (!at) return;
      if (ordered) lastOrderedStyle.current = value;
      else lastBulletStyle.current = value;
      const isDefault =
        value ===
        (ordered ? DEFAULT_ORDERED_LIST_STYLE : DEFAULT_UNORDERED_LIST_STYLE);
      setDoc(
        setListStyle(docRef.current, at.index, isDefault ? undefined : value),
      );
      focusBlock(at.index, at.selection);
    },
    [focusBlock],
  );

  const pickQuote = useCallback(
    (symbol: string) => {
      setSheet(null);
      const at = activeRef.current;
      if (!at) return;
      let landed = at.selection.end;
      editTarget((block, selection) => {
        const result = replaceRange(
          block,
          selection,
          symbol,
          styleAt(block, selection.start),
        );
        landed = result.caret;
        return result.block;
      }, undefined);
      focusBlock(at.index, { end: landed, start: landed });
    },
    [editTarget, focusBlock],
  );

  const pickMention = useCallback(
    (item: MentionDataItem) => {
      const query = mention;
      if (!query) return;
      const current = docRef.current;
      const block = current[query.index];
      if (!isTextBlock(block)) return;
      const end = query.at + 1 + query.query.length;
      const result = insertMention(block, query.at, end, {
        id: item.id,
        image: item.image || undefined,
        kind: item.type,
        name: item.displayName,
      });
      setDoc(replaceBlock(current, query.index, result.block));
      setMention(null);
      focusBlock(query.index, { end: result.caret, start: result.caret });
    },
    [focusBlock, mention],
  );

  // ─── Images ──────────────────────────────────────────────────────────────

  const handleImageChange = useCallback(
    (index: number, patch: Partial<Omit<RichImageBlock, "type" | "src">>) => {
      setDoc(updateImage(docRef.current, index, patch));
      // Wrapping (or unwrapping) re-parents the line after the picture, which
      // mounts its field afresh. A keyboard still up is attached to the field
      // that went away, and would type into nothing; put the caret back where
      // it was so the keyboard follows it into the new field.
      const at = activeRef.current;
      if (patch.wrap !== undefined && at && Keyboard.isVisible()) {
        focusBlock(at.index, at.selection);
      }
    },
    [focusBlock],
  );

  const handleImageRemove = useCallback((index: number) => {
    setDoc(removeBlock(docRef.current, index));
    setSelectedImage(null);
  }, []);

  /** The tick under a picture: done with it, back to the words after it. */
  const handleImageDone = useCallback(
    (index: number) => {
      setSelectedImage(null);
      const current = docRef.current;
      const after = current.findIndex(
        (node, at) => at > index && node.type !== "image",
      );
      if (after >= 0) {
        focusBlock(after, { end: 0, start: 0 });
        return;
      }
      for (let at = index - 1; at >= 0; at -= 1) {
        const node = current[at];
        if (isTextBlock(node)) {
          const end = blockLength(node);
          focusBlock(at, { end, start: end });
          return;
        }
      }
    },
    [focusBlock],
  );

  useImperativeHandle(
    handle,
    () => ({
      clear: () => {
        setDoc([emptyParagraph()]);
        setPending(null);
        setMention(null);
        setSelectedImage(null);
        setActiveBoth(null);
      },
      focus: () => {
        const index =
          activeRef.current?.index ??
          docRef.current.findIndex((node) => node.type !== "image");
        const target = Math.max(index, 0);
        inputs.current.get(target)?.focus();
        // Called as a media tray closes: the first focus can land before the
        // window will show a keyboard.
        ensureKeyboard(target);
      },
      getHtml: () => documentToHtml(docRef.current),
      insertImage: (src: string) => {
        const current = docRef.current;
        const at = activeRef.current?.index;
        // After the caret's line, or at the end when nothing has been focused.
        let index = at ?? current.length - 1;
        if (!isTextBlock(current[index])) index = current.length - 1;
        const result = insertImageAfter(current, index, { src });
        setDoc(result.doc);
        // Straight back to writing, on the line under the picture: tapping
        // the picture is what opens its size and alignment controls.
        setSelectedImage(null);
        focusBlock(result.caret, { end: 0, start: 0 });
      },
      removeImageBySrc: (src: string) => {
        setDoc(
          normalizeDocument(
            docRef.current.filter(
              (node) => node.type !== "image" || node.src !== src,
            ),
          ),
        );
        setSelectedImage(null);
      },
      replaceImageSrc: (previous: string, next: string) => {
        setDoc(
          docRef.current.map((node) =>
            node.type === "image" && node.src === previous
              ? { ...node, src: next }
              : node,
          ),
        );
      },
    }),
    [ensureKeyboard, focusBlock, setActiveBoth],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  const firstText = doc.findIndex((node) => node.type !== "image");

  // Declared before the rows that read it: it sat after the loop, where the
  // rows saw it undefined and the placeholder never showed.
  const empty =
    doc.length === 1 && doc[0].type !== "image" && blockLength(doc[0]) === 0;

  /*
   * The style an empty line with the caret is about to type in, handed to its
   * field so the first character is *drawn* in it. Without this the keyboard
   * draws the character in the default face and the style arrives a moment
   * later, when the block comes back from here: a visible flick from one font
   * to another at the start of every line.
   */
  const emptyTyping = useMemo<RunStyle | null>(() => {
    if (!target || blockLength(target.block) > 0) return null;
    const pinned =
      pending &&
      pending.index === target.index &&
      pending.offset === target.selection.start
        ? pending.style
        : sticky.current;
    return { ...pinned };
    // `toolbarState` moves whenever the remembered style could have.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  }, [pending, target, toolbarState]);

  const textProps = (node: RichBlock, index: number) => ({
    block: node,
    editable,
    index,
    inputRef: registerInput,
    onBlur: handleBlur,
    onChangeText: handleChangeText,
    onFocus: handleFocus,
    onKeyPress: handleKeyPress,
    onSelectionChange: handleSelectionChange,
    onSubmit: handleSubmit,
    placeholder: index === firstText && empty ? placeholder : undefined,
    typing: emptyTyping && active?.index === index ? emptyTyping : undefined,
    selection: caret?.index === index ? caret.selection : undefined,
  });

  const renderText = (node: RichBlock, index: number) => (
    <BlockInput key={blockKeys[index]} {...textProps(node, index)} />
  );

  /*
   * A picture set to "Text right" or "Text left" sits beside the line after
   * it, as web floats it — capped at half the width, as web caps a float on a
   * small screen — and that line runs beside it to the picture's bottom edge,
   * then on underneath at full width (`WrappedBlockInput`). Its controls go
   * under the lot.
   */
  const blocks: ReactNode[] = [];
  for (let index = 0; index < doc.length; index += 1) {
    const node = doc[index];
    if (node.type !== "image") {
      blocks.push(renderText(node, index));
      continue;
    }
    const side =
      node.wrap === "inline-left"
        ? "row"
        : node.wrap === "inline-right"
          ? "row-reverse"
          : null;
    const next = doc[index + 1];
    const imageProps = {
      image: node,
      index,
      onChange: handleImageChange,
      onDone: handleImageDone,
      onRemove: handleImageRemove,
      onSelect: setSelectedImage,
    };
    const selected = selectedImage === index;
    const uploading = uploadingSources?.has(node.src) ?? false;

    if (side && next && next.type !== "image") {
      const percent = Math.min(
        node.widthPercent ?? FLOAT_MAX_PERCENT,
        FLOAT_MAX_PERCENT,
      );
      blocks.push(
        <View key={`float-${blockKeys[index]}`} style={styles.float}>
          <WrappedBlockInput
            {...textProps(next, index + 1)}
            percent={percent}
            picture={
              <ImageBlock
                {...imageProps}
                float
                selected={selected}
                uploading={uploading}
              />
            }
            side={side}
          />
          {selected ? <ImageControls {...imageProps} /> : null}
        </View>,
      );
      index += 1;
      continue;
    }

    blocks.push(
      <ImageBlock
        {...imageProps}
        key={blockKeys[index]}
        selected={selected}
        uploading={uploading}
      />,
    );
  }

  return (
    <View style={compact ? styles.rootCompact : styles.root}>
      {/*
        The page you write on: a rounded surface with a soft wash of the
        account's accent running down it, and an edge that brightens while a
        line has the keyboard. A bare field on the sheet's background read as
        a form; a surface with a little depth reads as somewhere to write.
        The gradient is a shader (`expo-linear-gradient`), not an SVG, so it
        costs nothing while typing.
      */}
      <View
        style={[
          styles.canvas,
          compact ? styles.canvasCompact : styles.canvasFull,
          {
            borderColor: focused
              ? theme.accent.surfaceHover
              : theme.material.edge,
          },
        ]}
      >
        <LinearGradient
          colors={wash}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentFill]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          style={compact ? styles.scrollCompact : styles.scroll}
        >
          {blocks}
          {/*
          The empty space under the last line is part of the page: tapping it
          puts the caret at the end, as tapping below the text in any editor
          does. It grows to fill whatever the lines leave — the first version
          was a fixed strip, and a tap below it landed on nothing, so the
          keyboard only ever came up for a tap on the text itself.
        */}
          <Pressable
            onPress={() => {
              const last = docRef.current.length - 1;
              const block = docRef.current[last];
              if (!isTextBlock(block)) return;
              const end = blockLength(block);
              inputs.current.get(last)?.focus();
              setCaret({ index: last, selection: { end, start: end } });
            }}
            style={compact ? styles.tailCompact : styles.tail}
          />
          {footer}
        </ScrollView>
      </View>

      {mention && mentionTabs.length > 0 ? (
        <View style={styles.mention}>
          <MentionList
            onSelect={pickMention}
            query={mention.query}
            tabs={mentionTabs}
          />
        </View>
      ) : null}

      {/*
        Always there on a full page; only while typing on a compact one, where
        a permanent bar under a one-line field would be a row of buttons for
        nothing. Kept while a sheet is up, since the sheet took the focus.
      */}
      {editable && (!compact || focused || sheet !== null) ? (
        <EditorToolbar actions={actions} state={toolbarState} />
      ) : null}

      <BottomSheet

        ignoreKeyboard
        maxHeightRatio={0.4}
        onClose={closeSheet}
        title="Text size"
        visible={sheet === "size"}
      >
        <View style={styles.sizes}>
          {FONT_SIZES.map((entry) => {
            const selected = toolbarState.fontSize === entry.px;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={entry.label}
                onPress={() => pickSize(entry.px)}
                style={({ pressed }) => [
                  styles.sizeRow,
                  {
                    backgroundColor: selected
                      ? theme.accent.tint
                      : pressed
                        ? theme.material.fillPressed
                        : theme.material.fill,
                    borderColor: selected
                      ? theme.accent.solid
                      : theme.material.edge,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected ? theme.accent.text : theme.text,
                    fontSize:
                      entry.px === 43
                        ? 26
                        : entry.px === 27
                          ? 20
                          : fontSize.prose,
                    fontWeight: entry.px ? "700" : "400",
                  }}
                >
                  {entry.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <FontSheet
        active={toolbarState.fontFamily}
        onClose={closeSheet}
        onSelect={pickFont}
        visible={sheet === "font"}
      />

      <HighlightSheet
        active={toolbarState.highlight}
        onClose={closeSheet}
        onSelect={pickHighlight}
        visible={sheet === "highlight"}
      />

      <SymbolSheet
        categories={BULLET_POINT_CATEGORIES}
        onClose={closeSheet}
        onSelect={(value) => pickListStyle(false, value)}
        selected={toolbarState.list?.style ?? DEFAULT_UNORDERED_LIST_STYLE}
        subtitle="For the list the caret is in"
        title="Bullet style"
        visible={sheet === "bullets"}
      />

      <SymbolSheet
        categories={[{ name: "Numbering", symbols: ORDERED_LIST_STYLES }]}
        onClose={closeSheet}
        onSelect={(value) => pickListStyle(true, value)}
        selected={toolbarState.list?.style ?? DEFAULT_ORDERED_LIST_STYLE}
        subtitle="For the list the caret is in"
        title="Numbering style"
        visible={sheet === "ordered"}
      />

      <SymbolSheet
        categories={QUOTATION_MARK_CATEGORIES}
        onClose={closeSheet}
        onSelect={pickQuote}
        subtitle="Inserted at the caret"
        title="Quotation marks"
        visible={sheet === "quotes"}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    borderRadius: radius.lg,
    borderWidth: border.edge,
    marginHorizontal: space.m,
    overflow: "hidden",
  },
  canvasCompact: { marginBottom: space.sm, marginTop: space.sm },
  canvasFull: { flex: 1, marginBottom: space.sm, marginTop: space.sm },
  content: { paddingHorizontal: space.md - 2, paddingTop: space.ms },
  contentFill: { flexGrow: 1 },
  float: { marginVertical: space.xs },
  mention: { paddingHorizontal: space.sm, paddingVertical: space.xs },
  root: { flex: 1 },
  // No flex: docked under a post, the editor is as tall as its lines and
  // nothing else — `flex: 1` in a container that has no spare room is zero.
  rootCompact: {},
  scroll: { flex: 1 },
  // Content-sized between a floor and a cap: a reply starts a few lines
  // tall so it reads as somewhere to write, grows as it is written and then
  // scrolls, leaving the post it answers on screen above it.
  scrollCompact: { flexGrow: 0, maxHeight: 260, minHeight: 140 },
  sizeRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    minHeight: 52,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  sizes: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  tail: { flexGrow: 1, minHeight: 120 },
  tailCompact: { flexGrow: 1, minHeight: 20 },
});
