import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
} from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";
import { font } from "@/theme";

/**
 * `Text` and `TextInput` in the interface face.
 *
 * Web sets Montserrat once on `body` and every weight follows from
 * `font-weight`. Neither half of that exists here: there is no cascade to set
 * a family on, and a face loaded at runtime is one file at one weight —
 * Android answers `fontWeight: "700"` on it by smearing the regular outline
 * instead of switching file. So these read the `fontWeight` and `fontStyle` a
 * style already asks for and name the file that draws them, which is why
 * every screen imports its `Text` from here rather than from `react-native`
 * and no stylesheet had to change.
 *
 * ## What is left alone
 *
 * A style that names a `fontFamily` keeps it, weight and all: the editor's
 * faces (`lib/editor-fonts.ts`) and the monospace code spans choose their own
 * file and know whether `fontWeight` belongs on it.
 *
 * ## Nesting
 *
 * A `<Text>` inside a `<Text>` inherits natively, so one that asks for
 * nothing is given nothing and stays whatever its parent is. One that asks
 * for a weight but not a slant (or the reverse) takes the other half from its
 * parent, which is what the context carries — the parent's face, or `FOREIGN`
 * under a family this file does not own, where it stays out of the way.
 */
type Face = (typeof font)[keyof typeof font];

const FOREIGN = "foreign";

const FaceContext = createContext<Face | typeof FOREIGN | null>(null);

interface Marks {
  family: string | undefined;
  italic: boolean | undefined;
  weight: TextStyle["fontWeight"];
}

/**
 * The three properties that pick a file, read off a style without flattening
 * it: last one wins, as in `StyleSheet.flatten`, minus the object it builds.
 * This runs for every text node on every render.
 */
const readMarks = (style: StyleProp<TextStyle>, into: Marks): void => {
  if (!style) return;
  if (Array.isArray(style)) {
    for (const item of style) readMarks(item as StyleProp<TextStyle>, into);
    return;
  }

  const flat = style as TextStyle;
  if (flat.fontFamily !== undefined) into.family = flat.fontFamily;
  if (flat.fontWeight !== undefined) into.weight = flat.fontWeight;
  if (flat.fontStyle !== undefined) into.italic = flat.fontStyle === "italic";
};

type Step = "regular" | "medium" | "semibold" | "bold";

/** Web ships four weights; anything heavier than 700 is drawn as 700. */
const stepOf = (weight: TextStyle["fontWeight"]): Step => {
  if (weight === undefined || weight === "normal") return "regular";
  if (weight === "bold") return "bold";

  const value = Number(weight);
  if (!(value > 450)) return "regular";
  if (value <= 550) return "medium";
  if (value <= 650) return "semibold";
  return "bold";
};

const FACES: Record<Step, { italic: Face; upright: Face }> = {
  bold: { italic: font.boldItalic, upright: font.bold },
  medium: { italic: font.mediumItalic, upright: font.medium },
  regular: { italic: font.italic, upright: font.regular },
  semibold: { italic: font.semiboldItalic, upright: font.semibold },
};

const MARKS_OF = Object.fromEntries(
  (Object.keys(FACES) as Step[]).flatMap((step) => [
    [FACES[step].upright, { italic: false, step }],
    [FACES[step].italic, { italic: true, step }],
  ]),
) as Record<Face, { italic: boolean; step: Step }>;

/**
 * One style object per face, built once. The weight and slant are reset
 * because they are already in the file; left on, Android bolds a bold face.
 */
const FACE_STYLE = Object.fromEntries(
  Object.values(font).map((face) => [
    face,
    { fontFamily: face, fontStyle: "normal", fontWeight: "normal" },
  ]),
) as Record<Face, TextStyle>;

/**
 * Which face this node draws in, and what its children should be told.
 *
 * `undefined` for the face means "add nothing": the style chose its own
 * family, or this is nested text that inherits.
 */
const resolve = (
  style: StyleProp<TextStyle>,
  parent: Face | typeof FOREIGN | null,
): { face: Face | undefined; inherit: Face | typeof FOREIGN | null } => {
  const marks: Marks = { family: undefined, italic: undefined, weight: undefined };
  readMarks(style, marks);

  if (marks.family !== undefined) return { face: undefined, inherit: FOREIGN };
  if (parent === FOREIGN) return { face: undefined, inherit: FOREIGN };

  if (parent && marks.weight === undefined && marks.italic === undefined) {
    return { face: undefined, inherit: parent };
  }

  const inherited = parent ? MARKS_OF[parent] : undefined;
  const step =
    marks.weight === undefined
      ? (inherited?.step ?? "regular")
      : stepOf(marks.weight);
  const italic = marks.italic ?? inherited?.italic ?? false;
  const face = italic ? FACES[step].italic : FACES[step].upright;

  return { face, inherit: face };
};

/** Only a node with element children has anyone to tell. */
const hasNested = (children: ReactNode): boolean =>
  children !== null &&
  children !== undefined &&
  typeof children === "object";

export const Text = forwardRef<RNText, TextProps>(
  ({ children, style, ...rest }, ref) => {
    const parent = useContext(FaceContext);
    const { face, inherit } = resolve(style, parent);

    return (
      <RNText
        ref={ref}
        style={face ? [style, FACE_STYLE[face]] : style}
        {...rest}
      >
        {hasNested(children) && inherit !== parent ? (
          <FaceContext.Provider value={inherit}>{children}</FaceContext.Provider>
        ) : (
          children
        )}
      </RNText>
    );
  },
);
Text.displayName = "Text";

// A ref typed `useRef<Text>` means the native instance, as it always did.
export type Text = RNText;

const TextInputBase = forwardRef<RNTextInput, TextInputProps>(
  ({ children, style, ...rest }, ref) => {
    const { face, inherit } = resolve(style, null);

    return (
      <RNTextInput
        ref={ref}
        style={face ? [style, FACE_STYLE[face]] : style}
        {...rest}
      >
        {/* The editor draws its runs as `Text` children of the field. */}
        {hasNested(children) ? (
          <FaceContext.Provider value={inherit}>{children}</FaceContext.Provider>
        ) : (
          children
        )}
      </RNTextInput>
    );
  },
);
TextInputBase.displayName = "TextInput";

// `TextInput.State` (which field has focus) is read off the component.
export const TextInput = Object.assign(TextInputBase, {
  State: RNTextInput.State,
});

export type TextInput = RNTextInput;
