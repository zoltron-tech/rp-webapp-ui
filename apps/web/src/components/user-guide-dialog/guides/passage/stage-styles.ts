import styled from "styled-components";

/**
 * Frames for the passage guide's stages.
 *
 * As with the storyboard guide, only the frame lives here: the composer, its
 * toolbar, the image control bars and the dialog designs inside these frames
 * are the app's own components, imported from where they really live.
 */

/** The root a stage's pointer is measured against. */
export const Flow = styled.div`
  position: relative;
  min-width: 0;
`;

/** The composer as it sits on a manuscript page: no box, just the page. */
export const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
`;

/** Attach / GIF / Insert dialog, and the dialog-style select beside them. */
export const ToolRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

/** The file-attach control, which is a label over a hidden input in the app. */
export const AttachButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  color: var(--text-secondary);
`;

/** "Add to the page" — the composer's own save row. */
export const SaveRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;

  .cancel {
    padding: 0.4rem 0.8rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: var(--font-size-small);
  }

  .save {
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: #fff;
    font-size: var(--font-size-small);
  }
`;

/**
 * The picture, with the editor's own control bars over it.
 *
 * In the composer these bars are absolutely positioned against the selected
 * image; here the image and the bars are simply stacked, since the point is
 * what the bars *hold*, not where they float.
 */
export const ImageStage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
`;

export const SampleImage = styled.img<{ $width: number }>`
  width: ${(p) => p.$width}%;
  border-radius: 8px;
  display: block;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

/** Prose beside a wrapped image, so the wrap modes read as wrap modes. */
export const WrapDemo = styled.div<{ $wrap: "full" | "left" | "right" }>`
  width: 100%;
  font-size: var(--font-size-small);
  line-height: 1.6;
  color: var(--text-secondary);

  img {
    border-radius: 8px;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    ${(p) =>
      p.$wrap === "full"
        ? "display: block; margin: 0 auto 0.4rem;"
        : `float: ${p.$wrap}; margin: 0 ${p.$wrap === "left" ? "0.7rem" : "0"} 0.4rem ${
            p.$wrap === "right" ? "0.7rem" : "0"
          };`}
  }

  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

/**
 * The editor's own writing surface, without the editor.
 *
 * The dialog step has to show an embed being made — inserted, given a speaker,
 * typed into, turned around — and none of that can be driven inside an inert
 * copy of the real editor. So the surface is drawn here and the embed inside it
 * is rendered by the app's own dialog designs.
 */
export const Surface = styled.div`
  min-height: 132px;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: var(--bg-1);
  border: 1px solid var(--bg-6);
  font-size: var(--font-size-input);
  line-height: 1.6;
  color: var(--text);
`;

/** Where the embed sits while it is the selected one. */
export const SelectedEmbed = styled.div`
  margin-top: 0.5rem;
  border-radius: 12px;
`;

/** The bar the editor floats over a selected dialog, placed in flow here. */
export const BarRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;

  /* The real bar is absolutely positioned against the embed; this stage stacks
     it instead, so only its placement is overridden. */
  & > * {
    position: static;
  }
`;

/** The speaker list, as the avatar's own popover shows it. */
export const SenderMenu = styled.div`
  width: 12rem;
  margin: 0.4rem auto 0;
  padding: 0.35rem;
  border-radius: 0.5rem;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
`;

/** The typing caret, so an empty line reads as one waiting for words. */
export const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  vertical-align: text-bottom;
  background: var(--accent);
  animation: blink 1s steps(2, start) infinite;

  @keyframes blink {
    to {
      visibility: hidden;
    }
  }
`;

/** A read-only preview of what the passage looks like once posted. */
export const Preview = styled.div`
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-2);
  border: 1px solid var(--bg-6);
`;

export const PreviewLabel = styled.span`
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;
