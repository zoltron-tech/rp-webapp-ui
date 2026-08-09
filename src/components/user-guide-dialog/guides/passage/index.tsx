import type { UserGuide } from "../../types";
import {
  ComposerStage,
  DialogDesignStage,
  DialogInsertStage,
  ImageSizeStage,
  ImageWrapStage,
} from "./stages";

/**
 * "Writing a passage" — the guide behind the composer's own Guide button.
 *
 * The composer holds more than it shows: a full text toolbar, embedded muse
 * dialogs with their own designs, and a picture bar that only appears once a
 * picture is selected. Nothing about that is discoverable by looking, so the
 * stages work each of them in turn.
 */
export const PASSAGE_GUIDE: UserGuide = {
  id: "passage-composer",
  steps: [
    {
      body: "A passage is one block of the chapter: prose, dialog, pictures. Write it, add to the page, and it joins the story.",
      id: "the-composer",
      points: [
        "The row above the editor attaches a picture, a GIF, or a muse dialog.",
        "The toolbar formats whatever you have selected.",
        "@ mentions a novelist or a muse and links to them.",
      ],
      stage: (
        <ComposerStage
          flow={["editor", "tool:attach", "tool:gif", "tool:dialog", "save"]}
        />
      ),
      stageNote: "The real composer, with a sample passage in it.",
      title: "The passage composer",
    },
    {
      body: "Select any text, then use the toolbar. It carries a font, three sizes, bold, italic, underline, highlight, alignment, lists and quote marks.",
      id: "formatting",
      points: [
        "Heading, Subheading and Normal are the three sizes — headings centre a title well.",
        "Highlight takes a colour; the swatch grid's last cell clears it.",
        "Alignment applies to the paragraph the cursor is in.",
      ],
      stage: (
        <ComposerStage
          flow={[
            "fmt:font",
            "fmt:size",
            "fmt:bold",
            "fmt:italic",
            "fmt:highlight",
            "fmt:align",
          ]}
        />
      ),
      stageNote: "Each control, in turn.",
      title: "Formatting text",
    },
    {
      body: "Insert dialog drops a spoken line where the cursor is and selects it. Its own bar appears above it, and the avatar opens the list of who could be saying it.",
      id: "dialog",
      points: [
        "Pick a speaker from your muses, or from the story's own characters. Left alone, the line stays anonymous.",
        "Type straight into the line; bold, italic and underline work inside it.",
        "The two alignment buttons put the avatar on the left or the right — one speaker each side reads as a conversation.",
        "Insert as many as the scene needs; each keeps its own speaker and side.",
      ],
      stage: <DialogInsertStage />,
      stageNote: "Inserted, given a speaker, typed, then turned around.",
      title: "Adding dialog",
    },
    {
      body: "Dialog style sets how every dialog in the passage is drawn for readers — cards, coloured cards, chat bubbles, or bare quotes.",
      id: "dialog-style",
      points: [
        "It applies to the whole passage, not to one line.",
        "The coloured variants use the speaker's own accent colour.",
        "Minimal quotes drop the avatar and card entirely.",
      ],
      stage: <DialogDesignStage />,
      stageNote: "The same two lines — one each way — in every style.",
      title: "How dialogs look",
    },
    {
      body: "The paperclip attaches a picture from your device; the GIF button searches for one. Both land where the cursor is, and upload as you keep writing.",
      id: "media",
      points: [
        "Pictures up to 10MB.",
        "Remove one before saving and it is deleted again — nothing is left behind.",
      ],
      stage: <ComposerStage flow={["tool:attach", "tool:gif", "editor"]} />,
      title: "Pictures and GIFs",
    },
    {
      body: "Tap a picture in the editor and its bar appears. Wrap decides how the prose flows around it; alignment places it when it is full width.",
      id: "image-wrap",
      points: [
        "Full width — text above and below.",
        "Wrap left or right — the prose runs beside it.",
        "Align left, centre or right applies to a full-width picture only.",
        "ALT describes the picture for screen readers.",
      ],
      stage: <ImageWrapStage />,
      stageNote: "Wrap, then alignment, then alt text.",
      title: "Placing a picture",
    },
    {
      body: "The slider under the picture is its width, as a percentage of the page — 10% to 100%. The tick accepts it and puts the cursor back in the prose.",
      id: "image-size",
      points: [
        "The size is saved with the passage, so readers see the same framing.",
        "The bin removes the picture and its upload.",
      ],
      stage: <ImageSizeStage />,
      stageNote: "Wide, small, full — then accept.",
      title: "Sizing a picture",
    },
    {
      body: "Add to the page saves the passage and grows the chapter. Everything stays editable afterwards.",
      id: "saving",
      points: [
        "Reopen a passage from its own menu to edit it in place.",
        "An empty passage will not save.",
      ],
      stage: <ComposerStage flow={["save", "editor"]} />,
      title: "Adding it to the page",
    },
  ],
  title: "Writing a passage",
};
