import { css } from "styled-components";

/**
 * The style-agnostic data model for an inserted dialog. Only `museId`, the
 * chosen `font`, and the rich-text line are persisted. The sender's name,
 * accent and avatar are NOT stored — they are resolved from the muse id at
 * render time (name/accent from the thread's server-provided map, avatar from
 * the muse avatar endpoint). `name` here is a transient composer-only display
 * value and is stripped before saving.
 */
/** Which side the avatar/dialog sits on. Persisted; defaults to "left". */
export type DialogOrientation = "left" | "right";

export type DialogEmbedData = {
  /** Muse id, or null for an anonymous dialog. */
  museId: string | null;
  /** Composer-only display name of the sender ("Anonymous" when no muse). */
  name: string;
  /** The spoken dialog line, as rich-text HTML (may carry bold/italic/underline). */
  text: string;
  /** Optional font family chosen for the whole line. */
  font?: string | null;
  /** Side the avatar/dialog sits on. Persisted; "left" when unset. Ignored by
   *  the minimal (quote) designs, which look the same either way. */
  orientation?: DialogOrientation;
  /** Muse's accent (hex); resolved at render time, not persisted. */
  accent?: string | null;
  /** Whether the muse's accent should be applied; resolved at render time. */
  useAccent?: boolean;
};

/**
 * A selectable sender for an embedded dialog. `avatar` is a plain image URL
 * shown in the muse picker (the embedded dialog's own avatar comes from the
 * muse avatar endpoint). The composer supplies the available muses to the
 * editor so the sender can be changed inline on a selected dialog.
 */
export type DialogMuse = {
  id: string;
  name: string;
  avatar: string | null;
  /** Muse's accent hex, or null when unset / the muse opted out of its accent.
   *  Used to tint the colored card/bubble designs in the composer preview. */
  accent?: string | null;
};

const RP_SERVICE_URL = process.env.RP_SERVICE_URL ?? "";

/** URL of a muse's avatar image (served by the portfolio service). */
export const museAvatarUrl = (
  museId: string | null | undefined,
): string | null =>
  museId ? `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/avatar` : null;

/** Builds a blank Anonymous dialog to embed and edit inline. */
export const createEmptyDialogData = (): DialogEmbedData => ({
  font: null,
  museId: null,
  name: "Anonymous",
  orientation: "left",
  text: "",
});

/** Marks a DOM node as regenerated presentation chrome (never persisted). */
const CHROME_ATTR = "data-dialog-chrome";

/** Trash-icon markup for the always-visible "delete dialog" control. */
const DELETE_ICON_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>`;

/** Builds the top-right "delete this dialog" button (non-editable chrome). */
export const createDialogDeleteButton = (): HTMLButtonElement => {
  const del = document.createElement("button");
  del.type = "button";
  del.className = "dialog-delete";
  del.contentEditable = "false";
  del.title = "Delete dialog";
  del.setAttribute("aria-label", "Delete dialog");
  del.setAttribute(CHROME_ATTR, "delete");
  del.innerHTML = DELETE_ICON_SVG;
  return del;
};

/**
 * Reads the persisted dialog model out of a `.dialog-embed` element: the muse
 * id, chosen font, and the spoken line. The sender name (transient) is read for
 * the composer; the reader resolves the real name/accent from the muse map.
 */
export const readDialogData = (root: HTMLElement): DialogEmbedData => {
  const text = root.querySelector<HTMLElement>(".dialog-text");
  return {
    font: root.dataset.font || null,
    museId: root.dataset.museId || null,
    name: root.dataset.museName || "Anonymous",
    orientation: root.dataset.orientation === "right" ? "right" : "left",
    text: text?.innerHTML ?? "",
  };
};

/**
 * Creates the canonical, presentation-free dialog node: a `.dialog-embed`
 * root carrying the muse id + font on attributes, with a single `.dialog-text`
 * child holding the rich-text line. This is the shape that gets persisted (the
 * transient `data-muse-name` is stripped on serialize).
 */
export const createDialogModel = (data: DialogEmbedData): HTMLDivElement => {
  const root = document.createElement("div");
  root.className = "dialog-embed";
  root.setAttribute("data-dialog-embed", "");
  root.dataset.museId = data.museId ?? "";
  root.dataset.museName = data.name;
  if (data.font) root.dataset.font = data.font;
  // Only the non-default side is written; "left" is the implicit default.
  if (data.orientation === "right") root.dataset.orientation = "right";

  const text = document.createElement("span");
  text.className = "dialog-text";
  // Rich HTML of the spoken line (bold/italic/underline). No presentation.
  text.innerHTML = data.text;

  root.appendChild(text);
  return root;
};

/**
 * Reduces a `.dialog-embed` back to its canonical model shape in place:
 * keeps only `.dialog-text` (with its rich content) and the data attributes,
 * dropping all regenerated chrome and presentation flags. Returns the
 * `.dialog-text` element (or null if the embed is malformed).
 */
const normalizeToModel = (root: HTMLElement): HTMLElement | null => {
  const text = root.querySelector<HTMLElement>(".dialog-text");
  if (!text) return null;

  // Migrate legacy dialogs that baked the ❝ ❞ marks (now drawn via CSS) into
  // a plain-text line. Only touch pure-text content so formatting is safe.
  if (text.children.length === 0) {
    const match = text.textContent?.match(/^\s*❝\s?([\s\S]*?)\s?❞\s*$/);
    if (match) text.textContent = match[1];
  }

  // Lift the line out to be the sole child, then drop every chrome sibling.
  root.appendChild(text);
  Array.from(root.children).forEach((child) => {
    if (child !== text) child.remove();
  });

  // Strip presentation from the line itself.
  text.removeAttribute("contenteditable");
  text.style.removeProperty("font-family");
  text.className = "dialog-text";

  return text;
};

/** Down-chevron shown on the avatar while editing to signal it's a dropdown. */
const CHEVRON_SVG = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;

/**
 * Builds the avatar chrome (image or initial) from the model's data attrs,
 * wrapped so a dropdown caret can overlay it while the dialog is being edited.
 */
const buildAvatarChrome = (root: HTMLElement): HTMLElement => {
  const avatarUrl = museAvatarUrl(root.dataset.museId || null);
  const name = root.dataset.museName || "?";

  const wrap = document.createElement("span");
  wrap.className = "dialog-avatar-wrap";
  wrap.setAttribute(CHROME_ATTR, "avatar");

  if (avatarUrl) {
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.alt = name;
    img.className = "dialog-avatar";
    wrap.appendChild(img);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "dialog-avatar-fallback";
    fallback.textContent = (name || "?").charAt(0).toUpperCase();
    wrap.appendChild(fallback);
  }

  const caret = document.createElement("span");
  caret.className = "dialog-avatar-caret";
  caret.innerHTML = CHEVRON_SVG;
  wrap.appendChild(caret);

  return wrap;
};

/**
 * Renders the visual chrome for a `.dialog-embed` from its data model. First
 * normalizes the node back to the model shape (so it is idempotent and can
 * upgrade legacy/old-format embeds), then rebuilds avatar + body + sender
 * around the `.dialog-text` line.
 *
 * `editable` controls whether the spoken line can be edited inline and whether
 * the delete control is shown — the composer passes `true`, the read-only
 * renderer passes `false`.
 */
export const mountDialogEmbed = (
  root: HTMLElement,
  { editable }: { editable: boolean },
): void => {
  const text = normalizeToModel(root);
  if (!text) return;

  root.setAttribute("contenteditable", "false");

  // The editable card always uses the ambient (novelist) accent; clear any
  // inline accent a colored design preview may have left on the embed.
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent-hover");

  if (editable) {
    text.setAttribute("contenteditable", "true");
  } else {
    text.removeAttribute("contenteditable");
  }

  // Apply the chosen font as presentation only (stripped again on serialize).
  const font = root.dataset.font || "";
  if (font) text.style.fontFamily = font;

  const avatar = buildAvatarChrome(root);

  const body = document.createElement("div");
  body.className = "dialog-body";
  body.setAttribute(CHROME_ATTR, "body");

  const sender = document.createElement("span");
  sender.className = "dialog-sender";
  sender.setAttribute(CHROME_ATTR, "sender");
  sender.textContent = root.dataset.museName || "Anonymous";

  // Bracket the editable line with decorative quotes that live OUTSIDE the
  // editable text (drawn on the wrapping .dialog-line, see dialogEmbedCss).
  const line = document.createElement("div");
  line.className = "dialog-line";
  line.setAttribute(CHROME_ATTR, "line");
  line.appendChild(text);

  // root -> [avatar, body -> [line -> dialog-text, sender], (delete)]. The
  // delete control sits at the top-right and stays visible while editing.
  body.appendChild(line);
  body.appendChild(sender);
  root.appendChild(avatar);
  root.appendChild(body);
  if (editable) root.appendChild(createDialogDeleteButton());
};

/**
 * Builds a fully-mounted dialog embed for insertion into the composer: the
 * canonical model plus editable chrome. Used when the author inserts a new
 * dialog at the cursor.
 */
export const createDialogEmbed = (
  data: DialogEmbedData,
  { editable = true }: { editable?: boolean } = {},
): HTMLDivElement => {
  const root = createDialogModel(data);
  mountDialogEmbed(root, { editable });
  return root;
};

/**
 * Mounts the visual chrome on every dialog embed inside `root`. Call after
 * loading saved thread HTML — with `editable: true` in the composer (so saved
 * and legacy dialogs become inline-editable/deletable) or `editable: false`
 * in the read-only renderer.
 */
export const hydrateDialogEmbeds = (
  root: HTMLElement,
  opts: { editable: boolean },
): void => {
  root.querySelectorAll<HTMLElement>(".dialog-embed").forEach((embed) => {
    // Never carry a stale "selected" edit state in from saved content.
    embed.removeAttribute("data-selected");
    mountDialogEmbed(embed, opts);
  });
};

/**
 * Returns a copy of `html` with every dialog embed reduced back to its
 * canonical, style-agnostic model (data attributes + the rich-text line),
 * discarding all regenerated presentation chrome. This is what gets persisted.
 */
export const serializeDialogEmbeds = (html: string): string => {
  if (!html) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  tmp.querySelectorAll<HTMLElement>(".dialog-embed").forEach((root) => {
    normalizeToModel(root);
    root.removeAttribute("contenteditable");
    root.removeAttribute("data-selected");
    // Sender name/avatar/accent are resolved at render time from the muse id,
    // so they are never persisted (name is only a composer-side display value).
    root.removeAttribute("data-muse-name");
    root.removeAttribute("data-muse-avatar");
    root.removeAttribute("data-muse-accent");
    root.removeAttribute("data-muse-use-accent");
  });
  return tmp.innerHTML;
};

/** .dialog-embed styles shared by editable and saved/rendered contexts. */
export const dialogEmbedCss = css`
  .dialog-embed {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 8px 0;
    padding: 10px 12px;
    border-radius: 12px;
    border-left: 3px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    user-select: none;
    transition: outline-color 0.15s ease, box-shadow 0.15s ease;

    /* Right-oriented: mirror the row so the avatar sits on the right, the
       accent rule moves to the right edge and the line/sender align right. */
    &[data-orientation="right"] {
      flex-direction: row-reverse;
      border-left: none;
      border-right: 3px solid var(--accent);

      .dialog-body {
        align-items: flex-end;
      }

      .dialog-text {
        text-align: right;
      }

      /* Keep the delete control clear of the avatar (now on the right). */
      .dialog-delete {
        right: auto;
        left: 6px;
      }
    }

    /* Highlighted while being edited (see the floating edit toolbar). */
    &[data-selected="true"] {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent);

      /* Make the avatar read as a dropdown for the sender: ring + caret. */
      .dialog-avatar-wrap {
        cursor: pointer;
        box-shadow: 0 0 0 2px var(--accent);
      }

      .dialog-avatar-caret {
        display: inline-flex;
      }
    }

    .dialog-avatar-wrap {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
      border-radius: 50%;
      transition: box-shadow 0.15s ease;
    }

    .dialog-avatar-caret {
      display: none;
      position: absolute;
      right: -3px;
      bottom: -3px;
      align-items: center;
      justify-content: center;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      color: #fff;
      background-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg-2);
      pointer-events: none;
    }

    .dialog-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    .dialog-avatar-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        var(--accent) 0%,
        var(--accent-hover) 70%
      );
      color: var(--text);
      font-weight: var(--font-weight-bold);
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }

    /* Wraps the editable line so the quotes sit OUTSIDE the text area. */
    .dialog-line {
      display: flex;
      align-items: flex-start;
      gap: 5px;

      &::before,
      &::after {
        flex-shrink: 0;
        color: var(--accent);
        font-family: var(--font);
        font-style: normal;
        font-size: 1.35em;
        line-height: 1;
        opacity: 0.65;
      }

      &::before {
        content: "❝";
      }

      &::after {
        content: "❞";
        align-self: flex-end;
      }
    }

    .dialog-text {
      flex: 1 1 auto;
      font-style: italic;
      white-space: pre-wrap;
      word-break: break-word;
      min-width: 1ch;
      /* Author can select / edit this line even though the block is atomic. */
      user-select: text;
      cursor: text;
      outline: none;
      border-radius: 4px;

      &:focus {
        box-shadow: inset 0 0 0 1.5px var(--accent);
      }
    }

    .dialog-sender {
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-semi-bold);
      color: var(--accent);
    }

    /* Always-visible delete control, pinned to the top-right of the dialog. */
    .dialog-delete {
      all: unset;
      position: absolute;
      top: 6px;
      right: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      color: var(--text-secondary, var(--text));
      background-color: color-mix(in srgb, var(--bg-4) 85%, transparent);
      cursor: pointer;
      transition: background-color 0.12s ease-in-out, color 0.12s ease-in-out;

      svg {
        width: 13px;
        height: 13px;
      }

      &:hover,
      &:focus-visible {
        color: #fff;
        background-color: var(--tomato-5, #e5484d);
      }

      &:active {
        background-color: var(--tomato-6, #cc3d42);
      }
    }
  }
`;
