import type { ComponentType, ReactElement, ReactNode } from "react";
import { parseRichText } from "./parse";
import type { RichAlign, RichInline, RichNode } from "./types";

/**
 * The document, walked once, into whatever components the client supplies.
 *
 * The walk is the shared part: which block wraps which runs, where a mention
 * chip goes, how a list marker is placed. The components are not, and cannot
 * be — web wants `<p>` and its existing CSS classes, native wants `<Text>` and
 * style objects, and pretending otherwise is how a shared renderer ends up
 * looking wrong on both.
 *
 * So the client passes a small set of components and gets its own markup out.
 * Web can hand back exactly the tags and class names it renders today, which is
 * what makes adopting this a no-op there rather than a redesign.
 */

export interface RichTextRunProps {
  children: ReactNode;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  color?: string;
  /** The highlight behind the run. */
  background?: string;
  /** Size in CSS pixels; absent means the default. */
  fontSize?: number;
  /** The family the author chose, as `@nw/fonts` names it; absent is default. */
  fontFamily?: string;
  href?: string;
}

export interface RichTextMentionProps {
  id: string;
  kind: "NOVELIST" | "MUSE";
  name: string;
  image?: string;
}

export interface RichTextBlockProps {
  children: ReactNode;
  /** The block's `text-align`, when the editor stored one. */
  align?: RichAlign;
  /** The largest run size in the block, for clients that must set line height. */
  fontSize?: number;
  /** 1–6 on a heading, undefined elsewhere. */
  level?: number;
  /** The bullet or number on a list item. */
  marker?: string;
}

export interface RichTextComponents {
  Root: ComponentType<{ children: ReactNode }>;
  Paragraph: ComponentType<RichTextBlockProps>;
  Heading: ComponentType<RichTextBlockProps>;
  Quote: ComponentType<RichTextBlockProps>;
  ListItem: ComponentType<RichTextBlockProps>;
  Run: ComponentType<RichTextRunProps>;
  Mention: ComponentType<RichTextMentionProps>;
  /** A hard line break. Takes no props; `key` is React's own. */
  Break: ComponentType<Record<string, unknown>>;
  Image: ComponentType<{
    src: string;
    alt?: string;
    align?: RichAlign;
    /** Percentage of the text column the author sized it to. */
    widthPercent?: number;
    /** Pixel caps the image carries on itself, for anything pasted in. */
    maxWidth?: number;
    maxHeight?: number;
    /** `data-wrap`, for a client that reproduces the editor's markup. */
    wrap?: string;
  }>;
}

const inlineKey = (child: RichInline, index: number): string =>
  `${child.type}-${index}`;

const renderInline = (
  children: RichInline[],
  components: RichTextComponents,
): ReactNode[] =>
  children.map((child, index) => {
    const key = inlineKey(child, index);

    if (child.type === "break") return <components.Break key={key} />;

    if (child.type === "mention") {
      return (
        <components.Mention
          id={child.id}
          image={child.image}
          key={key}
          kind={child.kind}
          name={child.name}
        />
      );
    }

    return (
      <components.Run
        background={child.background}
        bold={child.marks.includes("bold")}
        code={child.marks.includes("code")}
        color={child.color}
        fontFamily={child.fontFamily}
        fontSize={child.fontSize}
        href={child.href}
        italic={child.marks.includes("italic")}
        key={key}
        strike={child.marks.includes("strike")}
        underline={child.marks.includes("underline")}
      >
        {child.text}
      </components.Run>
    );
  });

export const renderRichText = (
  nodes: RichNode[],
  components: RichTextComponents,
): ReactElement => {
  const { Root } = components;

  return (
    <Root>
      {nodes.map((node, index) => {
        const key = `${node.type}-${index}`;

        if (node.type === "image") {
          return (
            <components.Image
              align={node.align}
              alt={node.alt}
              key={key}
              maxHeight={node.maxHeight}
              maxWidth={node.maxWidth}
              src={node.src}
              widthPercent={node.widthPercent}
              wrap={node.wrap}
            />
          );
        }

        const Block =
          node.type === "heading"
            ? components.Heading
            : node.type === "quote"
              ? components.Quote
              : node.type === "listItem"
                ? components.ListItem
                : components.Paragraph;

        return (
          <Block
            align={node.align}
            fontSize={node.fontSize}
            key={key}
            level={node.level}
            marker={node.marker}
          >
            {renderInline(node.children, components)}
          </Block>
        );
      })}
    </Root>
  );
};

/** Parse and render in one step, for the common case. */
export const RichTextView = ({
  components,
  html,
}: {
  components: RichTextComponents;
  html: string | null | undefined;
}): ReactElement => renderRichText(parseRichText(html), components);
