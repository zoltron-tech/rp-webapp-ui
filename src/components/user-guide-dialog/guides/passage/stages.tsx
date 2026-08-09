"use client";

import { type FC, useEffect, useRef, useState } from "react";
import { FaAlignCenter, FaAlignLeft, FaAlignRight } from "react-icons/fa6";
import { GrAttachment } from "react-icons/gr";
import { MdGif } from "react-icons/md";
import {
  RiChatQuoteLine,
  RiCheckLine,
  RiDeleteBin6Line,
  RiFontColor,
} from "react-icons/ri";
import { RxFontBold, RxFontItalic } from "react-icons/rx";
import { TbFloatLeft, TbFloatNone, TbFloatRight } from "react-icons/tb";
import * as T from "@/components/event-thread-input/styles";
import { RichTextEditor } from "@/components/rich-text-editor-input";
import type { DialogDesign } from "@/components/rich-text-editor-input/dialog-designs";
import { DialogDesignSelect } from "@/components/rich-text-editor-input/dialog-designs/dialog-design-select";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import * as E from "@/components/rich-text-editor-input/styled";
import {
  mark,
  ring,
  StagePointer,
  useQueryMarks,
  useStageFlow,
  useStageMarks,
} from "@/components/user-guide-dialog/stage-motion";
import {
  DIALOG_ONLY_HTML,
  dialogHtml,
  PASSAGE_HTML,
  SAMPLE_DIALOG_EMPHASIS,
  SAMPLE_DIALOG_LINE,
  SAMPLE_IMAGE,
  SAMPLE_SPEAKERS,
} from "./mock-data";
import * as G from "./stage-styles";

/**
 * The passage guide's stages.
 *
 * The composer stages mount the *real* rich-text editor with a sample passage
 * in it, rather than a mock of its toolbar: it has two dozen controls, and a
 * hand-drawn copy of them would be wrong within a release. The pointer finds
 * those controls the way a reader would — by what they are called.
 *
 * The image stages are built from the editor's own control-bar parts, because
 * those bars only exist while an image is selected, which an inert model cannot
 * do.
 */

/** The editor's toolbar controls, addressed by the titles they already carry. */
const TOOLBAR_MARKS: Record<string, string> = {
  "fmt:align": '[title="Text Alignment"]',
  "fmt:bold": '[title="Bold"]',
  "fmt:font": '[title="Font family"]',
  "fmt:highlight": '[title="Highlight"]',
  "fmt:italic": '[title="Italic"]',
  "fmt:list": '[title="Bulleted List"]',
  "fmt:quote": '[title="Insert quotation mark"]',
  "fmt:size": '[title="Font size"]',
};

/**
 * The composer, whole: the media row, the dialog-style select, the editor with
 * its toolbar, and the save row.
 */
export const ComposerStage: FC<{ flow?: string[] }> = ({
  flow = ["tool:attach"],
}) => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(flow.length, 2600);

  useQueryMarks(root, marks, TOOLBAR_MARKS, []);

  const at = flow[aim] ?? flow[0];
  const ringed = flow[beat] ?? flow[0];

  return (
    <G.Flow ref={root}>
      <G.Composer>
        <G.ToolRow>
          <G.AttachButton
            ref={mark(marks, "tool:attach")}
            className={ring(ringed === "tool:attach")}
            title="Attach image"
          >
            <GrAttachment />
          </G.AttachButton>

          <T.ToolButton
            ref={mark(marks, "tool:gif")}
            className={ring(ringed === "tool:gif")}
            type="button"
            title="Insert GIF"
          >
            <MdGif />
          </T.ToolButton>

          <T.DialogInsertButton
            ref={mark(marks, "tool:dialog")}
            className={ring(ringed === "tool:dialog")}
            type="button"
            title="Insert a muse dialog"
          >
            <RiChatQuoteLine />
            <span className="label">Insert dialog</span>
          </T.DialogInsertButton>

          <T.DialogDesignSlot
            ref={mark(marks, "tool:design")}
            className={ring(ringed === "tool:design")}
          >
            <DialogDesignSelect value="card" onChange={() => {}} />
          </T.DialogDesignSlot>
        </G.ToolRow>

        <div
          ref={mark(marks, "editor")}
          className={ring(ringed === "editor")}
          style={{ borderRadius: 12 }}
        >
          <RichTextEditor
            placeholder="Type your story here… @ to mention novelists or muses"
            value={PASSAGE_HTML}
            dialogMuses={SAMPLE_SPEAKERS}
            dialogDesign="card"
            onChange={() => {}}
            desktopRounded
          />
        </div>

        <G.SaveRow>
          <button type="button" className="cancel">
            Cancel
          </button>
          <button
            ref={mark(marks, "save")}
            className={`save ${ring(ringed === "save") ?? ""}`.trim()}
            type="button"
          >
            Add to the page
          </button>
        </G.SaveRow>
      </G.Composer>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

/**
 * The beats of making a dialog: an empty passage, the button, the embed, its
 * speaker, its words, its emphasis, and the side it faces.
 */
const DIALOG_BEATS = [
  "tool:dialog",
  "tool:dialog",
  "menu:speaker",
  "embed",
  "bar:bold",
  "bar:right",
] as const;

const BEAT_INSERTED = 1;
const BEAT_SPEAKER = 2;
const BEAT_TYPING = 3;
const BEAT_BOLD = 4;
const BEAT_RIGHT = 5;

/** How fast the sample line is typed, per character. */
const TYPING_MS = 55;

/**
 * Adding a dialog, from nothing.
 *
 * The passage starts empty: Insert dialog puts an embed in and selects it, its
 * bar appears, a speaker is picked from the list the avatar opens, the line is
 * typed, a word is emphasised, and the avatar is sent to the other side.
 *
 * Hand-driven rather than mounted on the real editor: every one of those steps
 * is a selection or a keystroke inside a contenteditable, which an inert model
 * cannot produce. The embed itself is still drawn by the app's own dialog
 * design, so what a reader ends up with is honest — including the orientation.
 */
export const DialogInsertStage: FC = () => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(DIALOG_BEATS.length, 2600);
  const [typed, setTyped] = useState(0);

  const at = DIALOG_BEATS[aim] ?? DIALOG_BEATS[0];
  const ringed = DIALOG_BEATS[beat] ?? DIALOG_BEATS[0];

  const inserted = beat >= BEAT_INSERTED;
  const named = beat >= BEAT_SPEAKER;
  const menuOpen = beat === BEAT_INSERTED || beat === BEAT_SPEAKER;

  // The line arrives a letter at a time on its own beat, and is simply there
  // on the beats after it.
  useEffect(() => {
    if (beat < BEAT_TYPING) {
      setTyped(0);
      return;
    }
    if (beat > BEAT_TYPING) {
      setTyped(SAMPLE_DIALOG_LINE.length);
      return;
    }
    setTyped(0);
    const timer = window.setInterval(() => {
      setTyped((count) => {
        if (count >= SAMPLE_DIALOG_LINE.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, TYPING_MS);
    return () => window.clearInterval(timer);
  }, [beat]);

  const line =
    beat >= BEAT_BOLD
      ? `${SAMPLE_DIALOG_LINE}<b>${SAMPLE_DIALOG_EMPHASIS}</b>`
      : SAMPLE_DIALOG_LINE.slice(0, typed);

  const speaker = named ? SAMPLE_SPEAKERS[0].name : "Anonymous";

  return (
    <G.Flow ref={root}>
      <G.Composer>
        <G.ToolRow>
          <T.DialogInsertButton
            ref={mark(marks, "tool:dialog")}
            className={ring(ringed === "tool:dialog")}
            type="button"
            title="Insert a muse dialog"
          >
            <RiChatQuoteLine />
            <span className="label">Insert dialog</span>
          </T.DialogInsertButton>
        </G.ToolRow>

        <G.Surface>
          The lantern guttered as she stepped inside.
          {!inserted && <G.Caret />}
          {inserted && (
            <G.SelectedEmbed
              ref={mark(marks, "embed")}
              className={ring(ringed === "embed")}
            >
              <RichTextRenderer
                savedText={dialogHtml(
                  speaker,
                  line || "&nbsp;",
                  beat >= BEAT_RIGHT ? "right" : "left",
                )}
                dialogDesign="card"
                disableCollapse
                overlayHidden
              />
            </G.SelectedEmbed>
          )}
        </G.Surface>

        {inserted && (
          <G.BarRow>
            <E.DialogControlsBar>
              <E.DialogBarButton type="button" title="Font: Arial">
                Ff
              </E.DialogBarButton>
              <E.DialogBarDivider />
              <E.DialogBarButton
                ref={mark(marks, "bar:bold")}
                className={ring(ringed === "bar:bold")}
                type="button"
                title="Bold"
                $active={beat >= BEAT_BOLD}
              >
                <RxFontBold size={17} />
              </E.DialogBarButton>
              <E.DialogBarButton type="button" title="Italic">
                <RxFontItalic size={17} />
              </E.DialogBarButton>
              <E.DialogBarButton type="button" title="Underline">
                <RiFontColor size={17} />
              </E.DialogBarButton>
              <E.DialogBarDivider />
              <E.DialogBarButton
                type="button"
                title="Avatar on the left"
                $active={beat < BEAT_RIGHT}
              >
                <FaAlignLeft size={13} />
              </E.DialogBarButton>
              <E.DialogBarButton
                ref={mark(marks, "bar:right")}
                className={ring(ringed === "bar:right")}
                type="button"
                title="Avatar on the right"
                $active={beat >= BEAT_RIGHT}
              >
                <FaAlignRight size={13} />
              </E.DialogBarButton>
            </E.DialogControlsBar>
          </G.BarRow>
        )}

        {menuOpen && (
          <G.SenderMenu>
            <E.DialogMuseOptionItem type="button" $selected={!named}>
              <span className="muse-av fallback">?</span>
              Anonymous
            </E.DialogMuseOptionItem>
            <E.DialogMuseGroupLabel>Your muses</E.DialogMuseGroupLabel>
            {SAMPLE_SPEAKERS.filter(
              (sender) => sender.source !== "CHARACTER",
            ).map((sender, position) => (
              <E.DialogMuseOptionItem
                key={sender.id}
                ref={position === 0 ? mark(marks, "menu:speaker") : undefined}
                className={
                  position === 0 ? ring(ringed === "menu:speaker") : undefined
                }
                type="button"
                $selected={position === 0 && named}
              >
                <span className="muse-av fallback">
                  {sender.name.charAt(0).toUpperCase()}
                </span>
                {sender.name}
              </E.DialogMuseOptionItem>
            ))}
            <E.DialogMuseGroupLabel>Story characters</E.DialogMuseGroupLabel>
            {SAMPLE_SPEAKERS.filter(
              (sender) => sender.source === "CHARACTER",
            ).map((sender) => (
              <E.DialogMuseOptionItem key={sender.id} type="button">
                <span className="muse-av fallback">
                  {sender.name.charAt(0).toUpperCase()}
                </span>
                {sender.name}
              </E.DialogMuseOptionItem>
            ))}
          </G.SenderMenu>
        )}
      </G.Composer>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

/** The designs a dialog can be read in, tried one after another. */
const DESIGN_BEATS: DialogDesign[] = [
  "card",
  "card-colored",
  "bubble",
  "quote",
];

/**
 * The dialog-style select, working: one line of dialog, redrawn in each design
 * as the flow steps through them.
 */
export const DialogDesignStage: FC = () => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { beat } = useStageFlow(DESIGN_BEATS.length, 2600);

  const design = DESIGN_BEATS[beat] ?? DESIGN_BEATS[0];
  /* One target throughout: the select is what the flow keeps working. */
  const at = "design:select";

  return (
    <G.Flow ref={root}>
      <G.Composer>
        <G.ToolRow>
          <T.DialogDesignSlot
            ref={mark(marks, "design:select")}
            className={ring(true)}
          >
            <DialogDesignSelect value={design} onChange={() => {}} />
          </T.DialogDesignSlot>
        </G.ToolRow>

        <G.Preview>
          <G.PreviewLabel>How readers see it</G.PreviewLabel>
          <RichTextRenderer
            savedText={DIALOG_ONLY_HTML}
            dialogDesign={design}
            disableCollapse
            overlayHidden
          />
        </G.Preview>
      </G.Composer>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

type WrapMode = "full" | "inline-left" | "inline-right";
type Align = "left" | "center" | "right";

const WRAP_BEATS: { mark: string; wrap: WrapMode; align: Align }[] = [
  { align: "center", mark: "wrap:full", wrap: "full" },
  { align: "center", mark: "wrap:left", wrap: "inline-left" },
  { align: "center", mark: "wrap:right", wrap: "inline-right" },
  { align: "left", mark: "align:left", wrap: "full" },
  { align: "center", mark: "align:center", wrap: "full" },
  { align: "right", mark: "align:right", wrap: "full" },
  { align: "center", mark: "image:alt", wrap: "full" },
];

/**
 * The bar that appears over a selected image: how the prose flows around it,
 * where it sits, and its alt text. The real bar, driven by the flow.
 */
export const ImageWrapStage: FC = () => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(WRAP_BEATS.length, 2200);

  const current = WRAP_BEATS[beat] ?? WRAP_BEATS[0];
  const at = (WRAP_BEATS[aim] ?? WRAP_BEATS[0]).mark;
  const ringed = current.mark;
  const floated = current.wrap !== "full";

  return (
    <G.Flow ref={root}>
      <G.ImageStage>
        <E.ImagePositionBar>
          <E.ImageWrapLabel>Wrap</E.ImageWrapLabel>
          <E.ImageAlignButton
            ref={mark(marks, "wrap:full")}
            className={ring(ringed === "wrap:full")}
            type="button"
            $active={current.wrap === "full"}
            title="Full width — text above and below"
          >
            <TbFloatNone size={15} />
          </E.ImageAlignButton>
          <E.ImageAlignButton
            ref={mark(marks, "wrap:left")}
            className={ring(ringed === "wrap:left")}
            type="button"
            $active={current.wrap === "inline-left"}
            title="Wrap text — image on the left"
          >
            <TbFloatLeft size={15} />
          </E.ImageAlignButton>
          <E.ImageAlignButton
            ref={mark(marks, "wrap:right")}
            className={ring(ringed === "wrap:right")}
            type="button"
            $active={current.wrap === "inline-right"}
            title="Wrap text — image on the right"
          >
            <TbFloatRight size={15} />
          </E.ImageAlignButton>

          <E.ImageBarDivider />

          <E.ImageAltButton
            ref={mark(marks, "image:alt")}
            className={ring(ringed === "image:alt")}
            type="button"
            $active={ringed === "image:alt"}
            title="Alt text"
          >
            ALT
          </E.ImageAltButton>
        </E.ImagePositionBar>

        {/* Block alignment, which the editor only offers on a full-width
            image — a floated one is placed by the side it wraps to. */}
        <E.ImagePositionBar style={{ opacity: floated ? 0.4 : 1 }}>
          <E.ImageAlignButton
            ref={mark(marks, "align:left")}
            className={ring(ringed === "align:left")}
            type="button"
            $active={!floated && current.align === "left"}
            title="Align left"
          >
            <FaAlignLeft size={13} />
          </E.ImageAlignButton>
          <E.ImageAlignButton
            ref={mark(marks, "align:center")}
            className={ring(ringed === "align:center")}
            type="button"
            $active={!floated && current.align === "center"}
            title="Align center"
          >
            <FaAlignCenter size={13} />
          </E.ImageAlignButton>
          <E.ImageAlignButton
            ref={mark(marks, "align:right")}
            className={ring(ringed === "align:right")}
            type="button"
            $active={!floated && current.align === "right"}
            title="Align right"
          >
            <FaAlignRight size={13} />
          </E.ImageAlignButton>
        </E.ImagePositionBar>

        <G.WrapDemo
          $wrap={
            current.wrap === "inline-left"
              ? "left"
              : current.wrap === "inline-right"
                ? "right"
                : "full"
          }
          style={{ textAlign: floated ? undefined : current.align }}
        >
          <img
            src={SAMPLE_IMAGE}
            alt=""
            style={{ width: floated ? "40%" : "55%" }}
          />
          Rain had been in the lantern since dusk, and the light it gave was the
          colour of weak tea. By the time they reached the estuary the tide was
          already turning, and the road behind them had gone under.
        </G.WrapDemo>
      </G.ImageStage>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

const SIZE_BEATS: { mark: string; size: number }[] = [
  { mark: "size:slider", size: 80 },
  { mark: "size:slider", size: 45 },
  { mark: "size:slider", size: 100 },
  { mark: "size:accept", size: 100 },
  { mark: "size:delete", size: 100 },
];

/** The resize bar: the picture's width, in per cent of the page. */
export const ImageSizeStage: FC = () => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(SIZE_BEATS.length, 2000);

  const current = SIZE_BEATS[beat] ?? SIZE_BEATS[0];
  const at = (SIZE_BEATS[aim] ?? SIZE_BEATS[0]).mark;

  return (
    <G.Flow ref={root}>
      <G.ImageStage>
        <G.SampleImage src={SAMPLE_IMAGE} alt="" $width={current.size} />

        <E.ImageResizeBar>
          <E.ImageDeleteButton
            ref={mark(marks, "size:delete")}
            className={ring(current.mark === "size:delete")}
            type="button"
            title="Remove image"
          >
            <RiDeleteBin6Line size={15} />
          </E.ImageDeleteButton>
          <input
            ref={mark(marks, "size:slider")}
            className={ring(current.mark === "size:slider")}
            type="range"
            min={10}
            max={100}
            step={1}
            value={current.size}
            onChange={() => {}}
            style={{
              accentColor: "var(--accent)",
              flex: 1,
              minWidth: 0,
            }}
          />
          <E.ImageResizeLabel>{current.size}%</E.ImageResizeLabel>
          <E.ImageAcceptButton
            ref={mark(marks, "size:accept")}
            className={ring(current.mark === "size:accept")}
            type="button"
            title="Accept size"
          >
            <RiCheckLine size={15} />
          </E.ImageAcceptButton>
        </E.ImageResizeBar>
      </G.ImageStage>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};
