import {
  inlineLength,
  parseRichText,
  type RichAlign,
  type RichBlock,
  type RichImageBlock,
  type RichInline,
  type RichNode,
  type RichTextComponents,
  renderRichText,
  sliceInlines,
} from "@nw/richtext";
import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextLayoutLine,
  type TextStyle,
  View,
} from "react-native";
import { getNovelistById } from "@nw/api/endpoints/novelists";
import { useApi } from "@nw/features";
import { wsrvImage } from "@nw/utils/image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/avatar";
import { Image } from "@/components/image";
import { Text } from "@/components/text";
import { LinkEmbed } from "@/components/link-embeds";
import { nativeFace } from "@/lib/editor-fonts";
import { openImage } from "@/lib/image-viewer";
import { hasLinkEmbeds, splitRichTextAroundLinks } from "@/lib/link-embeds";
import { openExternalLink } from "@/lib/safe-link";
import {
  type AppTheme,
  fontSize,
  MEDIA_CHIP,
  monospace,
  radius,
  space,
  useAppTheme,
} from "@/theme";

/**
 * Rich text on a phone.
 *
 * The document is parsed by `@nw/richtext` — the same parse the web About runs
 * — and this file is only the half that cannot be shared: which React Native
 * component each node becomes.
 *
 * Two constraints shape it. Inline runs are `<Text>`, and the one inline that
 * is not — a mention chip, a face and a name on a pill — is a small view laid
 * out inside the line, which React Native does for a view of fixed size; and
 * an `<Image>` has no intrinsic size until it loads, so images are blocks with
 * a measured aspect ratio rather than inline runs.
 *
 * Spacing follows the browser rather than looking tidy on its own terms. The
 * editor writes one `<div>` per line and a `<div>` has no default margin, so
 * blocks stack with nothing between them and `line-height: 1.6` does the work.
 * A gap here would put daylight between every line of a profile that was
 * written as a single block of text.
 *
 * ## Text beside a picture
 *
 * A picture set to "Text right" or "Text left" (`wrap: inline-left` /
 * `inline-right`) is floated on web, and the paragraphs after it run beside it
 * until its bottom edge, then take the full width again. React Native has no
 * floats, so `FloatGroup` does what the browser does, by measuring: the
 * picture and the blocks after it (up to the next picture) are laid out once
 * in the column beside it, the block that crosses the picture's bottom edge is
 * cut at the last line that fits — from its own `onTextLayout` lines — and
 * everything after the cut is drawn again at full width underneath. Web caps a
 * floated picture at half the measure on a small screen; so does this.
 */

/**
 * Parsed documents, by their markup.
 *
 * A feed cell is re-bound to a different prompt every time it is recycled,
 * and the prompt it showed a moment ago comes back when the reader scrolls
 * up. Each bind used to be a fresh parse of the HTML — a tokeniser walk over
 * a few kilobytes — for a document that had not changed, because a
 * `useMemo` can only remember the one component it lives in. The markup is
 * the identity of the document, so it is the key here, and a scroll back up
 * a feed is a map lookup per card rather than a parse.
 *
 * Bounded, and evicted oldest-first: a `Map` iterates in insertion order, so
 * the first key is the one that has gone longest without being written.
 */
const PARSED = new Map<string, RichNode[]>();
const PARSED_LIMIT = 400;

export const parseCached = (html: string | null | undefined): RichNode[] => {
  if (!html) return EMPTY_NODES;
  const hit = PARSED.get(html);
  if (hit) return hit;
  const nodes = parseRichText(html);
  if (PARSED.size >= PARSED_LIMIT) {
    const oldest = PARSED.keys().next().value;
    if (oldest !== undefined) PARSED.delete(oldest);
  }
  PARSED.set(html, nodes);
  return nodes;
};

const EMPTY_NODES: RichNode[] = [];

/** How many blocks a document has — what a fold with a block budget asks. */
export const richTextBlockCount = (html: string | null | undefined): number =>
  parseCached(html).length;

/**
 * Measured image shapes, by URL, for the whole process.
 *
 * The first frame of an image is laid out at a guess and corrected on load;
 * a profile About with a dozen pictures used to jump a dozen times, and
 * again on every remount. Remembered here, the second look is right first.
 */
const RATIOS = new Map<string, number>();

/**
 * A mention chip sized to the text, not to web's 22px face.
 *
 * React Native does not grow a fixed-height line for an inline view, and the
 * body line is 24pt: a 20–24pt chip filled it and stood up against the line
 * above. 16pt — a 14pt face with 1pt above and below — is the height of the
 * text's own ascent and descent, so it reads as a word, with room either side.
 */
const MENTION_AVATAR = 14;
const MENTION_HEIGHT = MENTION_AVATAR + 2;

/**
 * How far the chip is moved down from where React Native puts it.
 *
 * An inline view rests its bottom on the baseline, so the chip stands
 * entirely above it, higher than the words. Capitals and the middle of
 * lower case sit around 0.35em above the baseline; moving the chip's centre
 * there lines it up with the text. Measured from the baseline, not from the
 * line box, so it holds whatever line height the paragraph has.
 */
const MENTION_DROP = Math.round(MENTION_HEIGHT / 2 - fontSize.prose * 0.35);

/**
 * Web's saved `.mention-tag`, drawn inline in the line: a pill in the accent
 * (`--accent` into `--accent-hover`, 135°), the face, and the name in bold.
 * The chip is text-sized and centred on the text (`MENTION_DROP`).
 *
 * The chip carries an id: a character's is its route, but a novelist's
 * profile is keyed by username, which has to be asked for first.
 */
const MentionLink = ({
  id,
  image,
  kind,
  name,
}: {
  id: string;
  image?: string;
  kind: "NOVELIST" | "MUSE";
  name: string;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();

  const open = async () => {
    if (kind === "MUSE") {
      router.push({ params: { museId: id }, pathname: "/muse/[museId]" });
      return;
    }
    const novelist = await getNovelistById(api, id).catch(() => null);
    if (novelist && "username" in novelist && novelist.username) {
      router.push({
        params: { username: novelist.username },
        pathname: "/novelist/[username]",
      });
    }
  };

  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="link"
      disabled={!id}
      onPress={() => void open()}
      style={({ pressed }) => [styles.mention, { opacity: pressed ? 0.7 : 1 }]}
    >
      <LinearGradient
        colors={[theme.accent.surface, theme.accent.surfaceHover]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.7]}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Avatar
        name={name}
        size={MENTION_AVATAR}
        uri={
          image
            ? wsrvImage(image, {
                fit: "cover",
                h: MENTION_AVATAR * 3,
                w: MENTION_AVATAR * 3,
              })
            : null
        }
      />
      <Text
        numberOfLines={1}
        style={[styles.mentionText, { color: theme.text }]}
      >
        {name}
      </Text>
    </Pressable>
  );
};

/** Web's `richTextContentBase`: `line-height: 1.6`. */
const LINE_HEIGHT = Math.round(fontSize.prose * 1.6);

/** The editor's "Normal" size, which everything else is authored relative to. */
const WEB_BASE_PX = 16;

/** Web's float margin beside the picture (`14px`) and under it (`8px`). */
const FLOAT_GAP = 14;
const FLOAT_BOTTOM = 8;

/** Web's small-screen cap on a floated picture: half the measure. */
const FLOAT_MAX_PERCENT = 50;

/** How long to wait for a block's line layout before drawing it whole. */
const LINES_TIMEOUT_MS = 250;

/**
 * A size the author chose, in points this app uses.
 *
 * Rescaled rather than copied: the web body is 16px and this app's is 15, so
 * pasting the CSS pixels straight in would make every sized run a fraction
 * larger than the text around it. The ratio is what the author picked.
 */
const toNativeSize = (px: number | undefined): number | undefined =>
  px ? Math.round((px / WEB_BASE_PX) * fontSize.prose) : undefined;

/**
 * A block's line height: web's `line-height: 1.6` of its size.
 *
 * React Native sets one line height for a whole block, where a browser's
 * unitless 1.6 is per line. Taking the block's largest run spaced *every*
 * wrapped line by one big word — the whole post read as if it were bigger.
 * So a block whose runs share one size gets 1.6 of that size, and a block that
 * mixes sizes is left to its natural line heights: each line as tall as what
 * is on it, the big run's line taller, nothing overlapping.
 */
const blockLines = (size: number | undefined, mixed: boolean | undefined) =>
  mixed
    ? styles.naturalLines
    : size
      ? { lineHeight: Math.round((toNativeSize(size) ?? 0) * 1.6) }
      : null;

/** Flex mapping of `text-align`, for laying an image out in its block. */
const ALIGN_ITEMS: Record<RichAlign, "flex-start" | "center" | "flex-end"> = {
  center: "center",
  justify: "flex-start",
  left: "flex-start",
  right: "flex-end",
};

const HEADING_SIZE: Record<number, number> = {
  1: 24,
  2: 21,
  3: 19,
  4: 17,
  5: 16,
  6: 15,
};

/**
 * Where a block being measured beside a floated picture reports its lines.
 * Null everywhere else, so an ordinary document asks for no text layout.
 */
const LineLayout = createContext<((lines: TextLayoutLine[]) => void) | null>(
  null,
);

/** A block's text, telling a `FloatGroup` where its lines broke, if asked. */
const BlockText = ({
  children,
  style,
}: {
  children: ReactNode;
  style: StyleProp<TextStyle>;
}) => {
  const onLines = useContext(LineLayout);
  return (
    <Text
      onTextLayout={
        onLines ? (event) => onLines(event.nativeEvent.lines) : undefined
      }
      style={style}
    >
      {children}
    </Text>
  );
};

/**
 * An embedded image.
 *
 * No placeholder colour behind it: a great many of these are transparent GIFs,
 * and a tinted box turns the transparency into a visible grey card the author
 * never put there. The cost is that a slow image is invisible rather than a
 * grey rectangle, which is the right trade for artwork.
 *
 * `contain` for the same reason — `cover` crops, and cropping someone's
 * carefully sized profile art is worse than letter-boxing it.
 */
/**
 * Whether a picture is a GIF by its URL — the same extension rule the chat
 * media helpers use, applied before the bytes are fetched.
 */
const isGif = (src: string) =>
  /\.gif(?:[?#].*)?$/i.test(src) || /[?&]n=-1(?:&|$)/.test(src);

/**
 * The widest an About picture is ever drawn, in source pixels: a phone
 * column at 3×. An author's 1500px GIF decoded at that size is four times the
 * pixels — per frame — of one bounded here.
 */
const RICH_IMAGE_MAX_PX = 1200;

/**
 * A GIF through the image proxy, as its first frame or as every frame.
 *
 * `wsrvImage` only touches the app's own bucket; an About links pictures
 * from anywhere, so this builds the proxy URL for any host. `n=1` is one
 * frame — a still, decoded once; `n=-1` is the animation, bounded to the
 * column. `we=1` keeps a source that is smaller than the bound at its own
 * size; `il=1` is a progressive encode, which the still arrives faster as.
 */
const proxiedGif = (src: string, animated: boolean): string => {
  const params = new URLSearchParams({
    fit: "inside",
    n: animated ? "-1" : "1",
    output: animated ? "gif" : "webp",
    url: src,
    w: String(RICH_IMAGE_MAX_PX),
    we: "1",
  });
  return `https://wsrv.nl/?${params.toString()}`;
};

const RichImage = ({
  align,
  maxHeight,
  maxWidth,
  src,
  widthPercent,
}: {
  align?: RichAlign;
  maxHeight?: number;
  maxWidth?: number;
  src: string;
  widthPercent?: number;
}) => {
  // Until the real dimensions arrive, 16:9 is the least surprising box: it is
  // wrong for a portrait, but it never collapses to nothing or fills the
  // screen — unless this picture has been measured before, in which case the
  // first frame is already right.
  const [ratio, setRatio] = useState(() => RATIOS.get(src) ?? 16 / 9);

  /*
   * A GIF is a still until it is tapped.
   *
   * Most of the pictures in an About are GIFs, and every one of them used to
   * decode every frame, at the author's own size, for as long as the profile
   * was open — behind the fold, under the "Read more", all of it. That is
   * most of what made a profile with a decorated About expensive to leave
   * on screen. This is Discord's "play GIFs on tap" rule: the first frame,
   * bounded to the column, with a GIF mark in the corner; a tap plays it,
   * another tap stops it. The proxy does the bounding and the single frame,
   * so the phone never downloads the full animation for a still — and if the
   * proxy cannot reach the host, the picture falls back to its own URL.
   */
  const gif = isGif(src);
  const [playing, setPlaying] = useState(false);
  const [direct, setDirect] = useState(false);
  const uri = gif && !direct ? proxiedGif(src, playing) : src;
  // The picture is reloaded on play; the frames of a still are not the
  // frames of the animation, so this is a new source rather than a toggle.
  const playable = gif && !direct;
  // A tap on a picture opens it, as web's does. An inline emoji stays an emoji.
  const viewable = !playable && (maxWidth === undefined || maxWidth > 64);

  /**
   * Three ways an image knows how wide it is, in the order they are trusted.
   *
   * A percentage means the editor placed it and sized it against the text
   * column. A pixel cap means it came from somewhere else and brought its own
   * dimensions — a Discord emoji is 32px and stays 32px. Neither means it is a
   * plain image, which fills the column as a browser would.
   */
  const width =
    widthPercent !== undefined
      ? (`${widthPercent}%` as const)
      : maxWidth !== undefined
        ? maxWidth
        : ("100%" as const);

  return (
    <View
      style={[
        styles.imageRow,
        { alignItems: align ? ALIGN_ITEMS[align] : "flex-start" },
      ]}
    >
      <Pressable
        accessibilityHint={
          playable ? (playing ? "Stops the GIF" : "Plays the GIF") : undefined
        }
        accessibilityRole={playable || viewable ? "button" : "image"}
        // Never `disabled`, even with nothing to do: a disabled Pressable
        // passes the tap to the fold around it, and web keeps image taps
        // from folding or unfolding the post (`handleContentClick`).
        onPress={
          playable
            ? () => setPlaying((value) => !value)
            : viewable
              ? () => openImage(src)
              : undefined
        }
        style={[
          styles.image,
          { aspectRatio: ratio, width },
          maxHeight !== undefined ? { maxHeight } : null,
        ]}
      >
        <Image
          // `expo-image`, for the same reason the avatar uses it: a decoded
          // bitmap cache that outlives this view, so the picture in an About
          // is decoded once per process rather than once per visit.
          cachePolicy="memory-disk"
          contentFit="contain"
          onError={() => {
            if (gif && !direct) setDirect(true);
          }}
          onLoad={({ source }) => {
            if (source?.width && source?.height) {
              const next = source.width / source.height;
              RATIOS.set(src, next);
              setRatio(next);
            }
          }}
          playing={gif ? playing : undefined}
          recyclingKey={uri}
          source={{ uri }}
          style={styles.fill}
          transition={0}
        />
        {playable && !playing ? (
          <View pointerEvents="none" style={styles.gifMark}>
            <Text style={styles.gifMarkLabel}>GIF</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

/**
 * The component table for a theme, built once per theme object.
 *
 * It used to be a `useMemo` inside every `RichText`, which meant nine closures
 * allocated per mount — and a feed mounts one of these per card, per comment,
 * per recycle. The theme is one shared object for the whole tree (see
 * `AppThemeProvider`), so it is the natural key; a `WeakMap` lets a theme that
 * is replaced take its table with it.
 */
const TABLES = new WeakMap<AppTheme, RichTextComponents>();

const tableFor = (theme: AppTheme): RichTextComponents => {
  const hit = TABLES.get(theme);
  if (hit) return hit;

  const table: RichTextComponents = {
    Break: () => <Text>{"\n"}</Text>,
    Heading: ({ align, children, level }) => (
      <BlockText
        style={[
          styles.heading,
          {
            color: theme.text,
            fontSize: HEADING_SIZE[level ?? 2] ?? 21,
            textAlign: align,
          },
        ]}
      >
        {children}
      </BlockText>
    ),
    /*
     * Keyed on `src`, which the shared renderer cannot do: its keys are
     * `image-<index>`, so in a recycled list cell the image at index 0 of the
     * incoming document reuses the instance that was showing the image at
     * index 0 of the outgoing one. That instance is holding the *previous*
     * picture's measured aspect ratio in state, so the new one is laid out in
     * the old one's box until its own `onLoad` arrives — a stretched frame
     * that then jumps. A key makes the swap a remount, which is what it is.
     */
    Image: ({ align, maxHeight, maxWidth, src, widthPercent }) => (
      <RichImage
        align={align}
        key={src}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        src={src}
        widthPercent={widthPercent}
      />
    ),
    ListItem: ({ align, children, fontSize: size, marker, mixedSizes }) => (
      <View style={styles.listItem}>
        <Text style={[styles.marker, { color: theme.textGray }]}>
          {marker ?? "•"}
        </Text>
        <BlockText
          style={[
            styles.paragraph,
            styles.beside,
            { color: theme.text, textAlign: align },
            blockLines(size, mixedSizes),
          ]}
        >
          {children}
        </BlockText>
      </View>
    ),
    Mention: ({ id, image, kind, name }) => (
      <MentionLink id={id} image={image} kind={kind} name={name} />
    ),
    // A block with nothing in it is the blank line someone typed between two
    // paragraphs. An empty `<Text>` has no height, so it needs a space to
    // occupy the line a browser would give it.
    Paragraph: ({ align, children, fontSize: size, mixedSizes }) => (
      <BlockText
        style={[
          styles.paragraph,
          { color: theme.text, textAlign: align },
          blockLines(size, mixedSizes),
        ]}
      >
        {Array.isArray(children) && children.length === 0 ? " " : children}
      </BlockText>
    ),
    Quote: ({ align, children, fontSize: size, mixedSizes }) => (
      <View style={[styles.quote, { borderLeftColor: theme.accent.surface }]}>
        <BlockText
          style={[
            styles.paragraph,
            { color: theme.textGray, textAlign: align },
            blockLines(size, mixedSizes),
          ]}
        >
          {children}
        </BlockText>
      </View>
    ),
    Root: ({ children }) => <View style={styles.root}>{children}</View>,
    Run: ({
      background,
      bold,
      children,
      code,
      color,
      fontFamily,
      fontSize: size,
      href,
      italic,
      strike,
      underline,
    }) => {
      // The family the author chose, from the same files web draws it with.
      // A loaded face is one file per weight and slant, so the marks go into
      // the name rather than onto the style — see `nativeFace`.
      const face = nativeFace(fontFamily, Boolean(bold), Boolean(italic));
      return (
        <Text
          // Written by whoever authored the text: see `lib/safe-link`.
          onPress={href ? () => openExternalLink(href) : undefined}
          style={[
            face ? { fontFamily: face.fontFamily } : null,
            bold && !face?.baked && styles.bold,
            size ? { fontSize: toNativeSize(size) } : null,
            background ? { backgroundColor: background } : null,
            italic && !face?.baked && styles.italic,
            // Code carries a tint as well as a face. Monospace alone is nearly
            // invisible against body text at this size, and on a phone the
            // background is what actually says "this is code" — the composer
            // draws it the same way, so a span does not change appearance
            // between being typed and being sent.
            code
              ? [styles.code, { backgroundColor: theme.material.fill }]
              : null,
            (underline || strike) && {
              textDecorationLine:
                underline && strike
                  ? "underline line-through"
                  : underline
                    ? "underline"
                    : "line-through",
            },
            href ? { color: theme.accent.text } : color ? { color } : null,
          ]}
        >
          {children}
        </Text>
      );
    },
  };

  TABLES.set(theme, table);
  return table;
};

// ─── Floats ──────────────────────────────────────────────────────────────────

type FloatSide = "left" | "right";

type Segment =
  | { kind: "flow"; nodes: RichNode[] }
  | {
      blocks: RichBlock[];
      image: RichImageBlock;
      kind: "float";
      side: FloatSide;
    };

const floatSide = (node: RichNode): FloatSide | null =>
  node.type !== "image"
    ? null
    : node.wrap === "inline-left"
      ? "left"
      : node.wrap === "inline-right"
        ? "right"
        : null;

/**
 * The document cut into runs that flow normally and floated pictures with
 * the blocks that may wrap them — everything up to the next picture, since a
 * picture below starts a layout of its own.
 */
const segmentsOf = (nodes: RichNode[]): Segment[] | null => {
  if (!nodes.some((node) => floatSide(node) !== null)) return null;
  const segments: Segment[] = [];
  let flow: RichNode[] = [];
  let index = 0;
  while (index < nodes.length) {
    const node = nodes[index];
    const side = floatSide(node);
    if (side === null || node.type !== "image") {
      flow.push(node);
      index += 1;
      continue;
    }
    if (flow.length > 0) segments.push({ kind: "flow", nodes: flow });
    flow = [];
    const blocks: RichBlock[] = [];
    index += 1;
    while (index < nodes.length && nodes[index].type !== "image") {
      blocks.push(nodes[index] as RichBlock);
      index += 1;
    }
    segments.push({ blocks, image: node, kind: "float", side });
  }
  if (flow.length > 0) segments.push({ kind: "flow", nodes: flow });
  return segments;
};

const lengthOf = (children: RichInline[]) =>
  children.reduce((total, child) => total + inlineLength(child), 0);

/** A block cut at a character offset: what fits beside, and what follows. */
const cutBlock = (block: RichBlock, at: number): [RichBlock, RichBlock] => {
  const total = lengthOf(block.children);
  const head = sliceInlines(block.children, 0, at);
  const tail = sliceInlines(block.children, at, total);
  // The line broke at a space; the next line does not start with it.
  const first = tail[0];
  if (first?.type === "text") {
    tail[0] = { ...first, text: first.text.replace(/^\s+/, "") };
  }
  return [
    { ...block, children: head },
    // A list item's second half carries on under its text, without a second
    // marker.
    {
      ...block,
      children: tail,
      marker: block.type === "listItem" ? " " : block.marker,
    },
  ];
};

interface Plan {
  key: string;
  /** Whole blocks beside the picture. */
  beside: number;
  /** Where the block after those is cut, or null when it goes below whole. */
  cut: number | null;
}

/**
 * A floated picture and the text that runs beside it — web's `float`, done by
 * measuring (see the file comment).
 */
const FloatGroup = ({
  blocks,
  image,
  side,
  table,
}: {
  blocks: RichBlock[];
  image: RichImageBlock;
  side: FloatSide;
  table: RichTextComponents;
}) => {
  const [width, setWidth] = useState(0);
  const [ratio, setRatio] = useState(() => RATIOS.get(image.src) ?? 16 / 9);
  const [plan, setPlan] = useState<Plan | null>(null);

  const percent = Math.min(
    image.widthPercent ?? FLOAT_MAX_PERCENT,
    FLOAT_MAX_PERCENT,
  );
  const imageWidth = Math.round((width * percent) / 100);
  const imageHeight = imageWidth / ratio + FLOAT_BOTTOM;
  const columnWidth = Math.max(0, width - imageWidth - FLOAT_GAP);
  const key = `${width}:${ratio.toFixed(4)}:${blocks.length}`;
  const ready = plan?.key === key;

  // What the measuring pass has heard so far, for the current `key`.
  const measured = useRef<{
    key: string;
    lines: (TextLayoutLine[] | undefined)[];
    frames: ({ height: number; y: number } | undefined)[];
  }>({ frames: [], key: "", lines: [] });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const decide = useCallback(
    (force: boolean) => {
      const state = measured.current;
      if (state.key !== key || width === 0) return;
      if (state.frames.length < blocks.length) return;
      for (let i = 0; i < blocks.length; i += 1) {
        if (!state.frames[i]) return;
      }

      let beside = blocks.length;
      let cut: number | null = null;
      for (let i = 0; i < blocks.length; i += 1) {
        const frame = state.frames[i];
        if (!frame) return;
        if (frame.y >= imageHeight) {
          beside = i;
          break;
        }
        if (frame.y + frame.height <= imageHeight) continue;

        // This block crosses the picture's bottom edge: cut it at a line.
        const lines = state.lines[i];
        if (!lines) {
          if (!force) {
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => decide(true), LINES_TIMEOUT_MS);
            return;
          }
          beside = i + 1;
          break;
        }
        let offset = 0;
        for (const line of lines) {
          if (frame.y + line.y + line.height > imageHeight) break;
          offset += line.text.length;
        }
        const total = lengthOf(blocks[i].children);
        if (offset <= 0) beside = i;
        else if (offset >= total) beside = i + 1;
        else {
          beside = i;
          cut = offset;
        }
        break;
      }

      if (timer.current) clearTimeout(timer.current);
      setPlan({ beside, cut, key });
    },
    [blocks, imageHeight, key, width],
  );

  // A new measure — width, picture shape or document — starts a new pass.
  if (measured.current.key !== key) {
    measured.current = { frames: [], key, lines: [] };
  }

  const onRootLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== width) setWidth(next);
  };

  const picture = (
    <View style={{ width: imageWidth }}>
      <Image
        cachePolicy="memory-disk"
        contentFit="contain"
        onLoad={({ source }) => {
          if (source?.width && source?.height) {
            const next = source.width / source.height;
            RATIOS.set(image.src, next);
            if (Math.abs(next - ratio) > 0.001) setRatio(next);
          }
        }}
        recyclingKey={image.src}
        source={{ uri: image.src }}
        style={[styles.image, styles.floatImage, { aspectRatio: ratio }]}
        transition={0}
      />
    </View>
  );

  const row = (content: ReactNode) => (
    <View
      style={[
        styles.floatRow,
        { flexDirection: side === "left" ? "row" : "row-reverse" },
      ]}
    >
      {picture}
      <View style={{ width: columnWidth }}>{content}</View>
    </View>
  );

  // Nothing to wrap: the picture on its side, as a float with no text after it.
  if (blocks.length === 0) {
    return (
      <View onLayout={onRootLayout} style={styles.root}>
        {width > 0 ? row(null) : null}
      </View>
    );
  }

  if (!ready) {
    return (
      <View onLayout={onRootLayout} style={[styles.root, styles.measuring]}>
        {width > 0
          ? row(
              blocks.map((block, index) => (
                <LineLayout.Provider
                  key={index}
                  value={(lines) => {
                    if (measured.current.key !== key) return;
                    measured.current.lines[index] = lines;
                    decide(false);
                  }}
                >
                  <View
                    onLayout={(event) => {
                      if (measured.current.key !== key) return;
                      const { height, y } = event.nativeEvent.layout;
                      measured.current.frames[index] = { height, y };
                      decide(false);
                    }}
                  >
                    {renderRichText([block], table)}
                  </View>
                </LineLayout.Provider>
              )),
            )
          : null}
      </View>
    );
  }

  const besideBlocks = blocks.slice(0, plan.beside);
  let belowBlocks = blocks.slice(plan.beside);
  if (plan.cut !== null && belowBlocks.length > 0) {
    const [head, tail] = cutBlock(belowBlocks[0], plan.cut);
    besideBlocks.push(head);
    belowBlocks = [tail, ...belowBlocks.slice(1)];
  }

  return (
    <View onLayout={onRootLayout} style={styles.root}>
      {row(
        besideBlocks.length > 0 ? renderRichText(besideBlocks, table) : null,
      )}
      {belowBlocks.length > 0 ? renderRichText(belowBlocks, table) : null}
    </View>
  );
};

/**
 * Whether a document is long enough that a feed should fold it.
 *
 * Decided from the markup rather than by measuring, so the answer is a fact
 * about the prompt and not about the cell it happens to be drawn in — a
 * recycling list cannot hold a measured "this overflowed" per row. Blocks
 * count as well as characters because ten one-word lines are as tall as one
 * long paragraph.
 */
export const isLongRichText = (html: string | null | undefined): boolean => {
  if (!html) return false;
  if (html.length > LONG_CHARS) return true;
  return parseCached(html).length > LONG_BLOCKS;
};

const LONG_CHARS = 900;
const LONG_BLOCKS = 8;

/** How much of a folded document is drawn. */
export const FOLDED_BLOCKS = 6;

const RichTextView = ({
  html,
  maxBlocks,
}: {
  html: string | null | undefined;
  /**
   * Draw only the first this-many blocks.
   *
   * For a folded feed card: what is behind the fold is not merely hidden but
   * not laid out, which is the difference between a two-thousand-word prompt
   * costing a screen of text shaping and costing six lines of it.
   */
  maxBlocks?: number;
}) => {
  const theme = useAppTheme();
  const parsed = parseCached(html);
  const nodes =
    maxBlocks !== undefined && parsed.length > maxBlocks
      ? parsed.slice(0, maxBlocks)
      : parsed;

  if (nodes.length === 0) return null;

  const table = tableFor(theme);

  /*
   * A link back into Novelist World — a character, a prompt, a story — is
   * drawn as a card rather than as its URL. A card is a `<View>`, which
   * cannot sit inside a paragraph's `<Text>`, so the document is cut around
   * each link (`splitRichTextAroundLinks`) and the pieces are stacked: words,
   * card, words. Nearly every document has no such link and takes the first
   * exit.
   */
  const pieces = splitRichTextAroundLinks(nodes);
  if (!hasLinkEmbeds(pieces))
    return <RichTextFlow nodes={nodes} table={table} />;

  return (
    <View style={styles.root}>
      {pieces.map((piece, index) =>
        piece.kind === "link" ? (
          <LinkEmbed
            key={`${piece.link.kind}-${piece.link.id}-${index}`}
            link={piece.link}
          />
        ) : (
          <RichTextFlow key={index} nodes={piece.nodes} table={table} />
        ),
      )}
    </View>
  );
};

/** The document (or a run of it) with its floated pictures laid out. */
const RichTextFlow = ({
  nodes,
  table,
}: {
  nodes: RichNode[];
  table: RichTextComponents;
}) => {
  const segments = segmentsOf(nodes);
  // No floated picture — nearly every document — is the plain walk.
  if (!segments) return renderRichText(nodes, table);

  return (
    <View style={styles.root}>
      {segments.map((segment, index) =>
        segment.kind === "flow" ? (
          <View key={index}>{renderRichText(segment.nodes, table)}</View>
        ) : (
          <FloatGroup
            blocks={segment.blocks}
            image={segment.image}
            key={index}
            side={segment.side}
            table={table}
          />
        ),
      )}
    </View>
  );
};

/**
 * Memoised: both props are primitives, and the walk above is the whole
 * document. A heart on a card, a menu opening on a thread, a profile's scroll
 * flag — each re-rendered the parent and re-walked text that had not changed.
 */
export const RichText = memo(RichTextView);

const styles = StyleSheet.create({
  /*
   * Only the text beside a list marker takes the remaining width. `flex: 1`
   * used to be on every paragraph, and under a height-capped container
   * (a folded feed card) Yoga read its `flexBasis: 0` as "share the cap
   * between the blocks" — six blocks in 210pt was a line and a half each.
   */
  beside: { flex: 1 },
  bold: { fontWeight: "700" },
  // Body size, not `label`: a smaller face inside a line of normal text drops
  // below the baseline and reads as a rendering fault rather than as a style.
  code: { fontFamily: monospace, fontSize: fontSize.prose },
  fill: { height: "100%", width: "100%" },
  floatImage: {
    marginBottom: FLOAT_BOTTOM,
    marginTop: space.xxs,
    width: "100%",
  },
  floatRow: { alignItems: "flex-start", gap: FLOAT_GAP, width: "100%" },
  /** Web's GIF mark on a still: a small chip in the picture's corner. */
  gifMark: {
    backgroundColor: MEDIA_CHIP,
    borderRadius: radius.sm,
    bottom: space.xs,
    left: space.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
    position: "absolute",
  },
  gifMarkLabel: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  heading: { fontWeight: "700", lineHeight: 28, marginTop: space.sm },
  image: { borderRadius: radius.md, overflow: "hidden" },
  imageRow: { marginVertical: space.xs, width: "100%" },
  italic: { fontStyle: "italic" },
  listItem: { flexDirection: "row", gap: space.sm },
  marker: { fontSize: fontSize.prose, lineHeight: LINE_HEIGHT, minWidth: 16 },
  /** The measuring pass is laid out but not seen. */
  measuring: { opacity: 0 },
  /* Web's `.mention-tag`: padding 1px 6px 1px 2px, gap 4px, 70px at least. */
  mention: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 3,
    height: MENTION_HEIGHT,
    marginHorizontal: 2,
    minWidth: 52,
    overflow: "hidden",
    paddingBottom: 1,
    paddingLeft: 1,
    paddingRight: 6,
    paddingTop: 1,
    transform: [{ translateY: MENTION_DROP }],
  },
  mentionText: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    lineHeight: MENTION_HEIGHT - 2,
  },
  /** A block that mixes sizes: each line as tall as what is on it. */
  naturalLines: { lineHeight: undefined },
  paragraph: { fontSize: fontSize.prose, lineHeight: LINE_HEIGHT },
  quote: {
    borderLeftWidth: 3,
    marginVertical: space.xs,
    paddingLeft: space.sm,
  },
  root: { width: "100%" },
});
