"use client";

import { useMemo, useRef, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { getNovelistByIdAction } from "@/app/rp/novelists/actions";
import type { DialogDesign } from "@/components/rich-text-editor-input/dialog-designs/types";
import { FONTS } from "@/components/rich-text-editor-input/editor-config";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";

/**
 * Dev tool: builds a raw INSERT for `story_board_event_thread`. Novelists and
 * muses are looked up by id and pinned as avatar chips; the selected novelist
 * becomes the thread sender, the selected muse voices the dialog embeds. Free
 * text is parsed into narration blocks and `.dialog-embed` blocks (quoted
 * speech), mirroring the persisted rich-text shape the reader expects.
 */

const DIALOG_DESIGNS: DialogDesign[] = [
  "card",
  "card-colored",
  "bubble",
  "bubble-colored",
  "quote",
  "quote-plain",
];

// Opening/closing quote chars we treat as dialogue delimiters. Straight " is
// both open and close; curly, guillemet, and heavy ❝❞ pairs are matched
// open→close.
const QUOTE_RE = /[“‟«❝"]([\s\S]*?)[”„»❞"]/g;

/** A looked-up novelist or muse, shown as a selectable avatar chip. */
type Person = { id: string; name: string; image: string | null };

/** Escapes text for safe placement in HTML element content. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Block =
  | { kind: "narration"; text: string }
  | { kind: "dialog"; text: string };

/**
 * Splits free text into ordered narration / dialog blocks. Each paragraph
 * (blank-line separated) is scanned for quoted spans; quoted spans become
 * dialog blocks, the surrounding prose becomes narration. Quote marks are
 * dropped — the reader draws them via CSS chrome.
 */
function parseBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = raw.split(/\n\s*\n/);

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    QUOTE_RE.lastIndex = 0;

    while ((match = QUOTE_RE.exec(trimmedPara)) !== null) {
      const before = trimmedPara.slice(lastIndex, match.index).trim();
      if (before) blocks.push({ kind: "narration", text: before });

      const dialog = match[1].trim();
      if (dialog) blocks.push({ kind: "dialog", text: dialog });

      lastIndex = QUOTE_RE.lastIndex;
    }

    const rest = trimmedPara.slice(lastIndex).trim();
    if (rest) blocks.push({ kind: "narration", text: rest });
  }

  return blocks;
}

/** Builds the persisted message HTML from parsed blocks + image + font. */
function buildMessageHtml(
  blocks: Block[],
  museId: string,
  font: string,
  imageUrl: string | null,
): string {
  const parts: string[] = [];
  const fontStyle = `font-family: &quot;${font}&quot;;`;

  for (const block of blocks) {
    if (block.kind === "narration") {
      parts.push(`<div style="${fontStyle}">${escapeHtml(block.text)}</div>`);
    } else {
      parts.push(
        `<div class="dialog-embed" data-dialog-embed="" data-muse-id="${escapeHtml(
          museId,
        )}" data-font="${escapeHtml(font)}"><span class="dialog-text">${escapeHtml(
          block.text,
        )}</span></div>`,
      );
    }
  }

  if (imageUrl) {
    parts.push(
      `<div style="text-align: center;"><span class="inline-image-container" contenteditable="false" style="width: 60%;">` +
        `<img class="inline-image" src="${escapeHtml(imageUrl)}" alt="Pasted image" ` +
        `style="width: 100%; height: auto; max-width: none; max-height: none;" data-width-pct="60"></span></div>`,
    );
  }

  return parts.join("");
}

/** Doubles single quotes for a Postgres string literal. */
function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

/** Avatar chip: circular image (or initial) + name, ringed when selected. */
function AvatarChip({
  person,
  selected,
  onSelect,
  onRemove,
}: {
  person: Person;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div style={S.chipWrap}>
      <button
        type="button"
        onClick={onSelect}
        style={{
          ...S.chip,
          ...(selected ? S.chipSelected : null),
        }}
        title={`${person.name} — ${person.id}`}
      >
        {person.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.image} alt={person.name} style={S.chipImg} />
        ) : (
          <span style={S.chipFallback}>
            {(person.name || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <span style={S.chipName}>{person.name}</span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        style={S.chipRemove}
        title="Remove"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default function ThreadGeneratorPage() {
  const { uploadMedia } = useUploadMedia();

  const [novelists, setNovelists] = useState<Person[]>([]);
  const [muses, setMuses] = useState<Person[]>([]);
  const [selectedNovelistId, setSelectedNovelistId] = useState("");
  const [selectedMuseId, setSelectedMuseId] = useState("");

  const [novelistIdInput, setNovelistIdInput] = useState("");
  const [museIdInput, setMuseIdInput] = useState("");
  const [novelistLoading, setNovelistLoading] = useState(false);
  const [museLoading, setMuseLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [storyboardEventId, setStoryboardEventId] = useState("");
  const [storyboardId, setStoryboardId] = useState("");
  const [text, setText] = useState("");
  const [font, setFont] = useState("Times New Roman");
  const [dialogDesign, setDialogDesign] = useState<DialogDesign>("card");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blocks = useMemo(() => parseBlocks(text), [text]);

  const addNovelist = async () => {
    const id = novelistIdInput.trim();
    if (!id) return;
    if (novelists.some((n) => n.id === id)) {
      setSelectedNovelistId(id);
      setNovelistIdInput("");
      return;
    }
    setLookupError(null);
    setNovelistLoading(true);
    const res = await getNovelistByIdAction(id);
    setNovelistLoading(false);

    if (!res || "message" in res) {
      setLookupError(`Novelist ${id} not found.`);
      return;
    }
    const person: Person = {
      id: res.id,
      name:
        `${res.firstName ?? ""} ${res.lastName ?? ""}`.trim() ||
        res.username ||
        res.id,
      image: res.avatar?.src ?? res.image ?? null,
    };
    setNovelists((prev) => [...prev, person]);
    setSelectedNovelistId(person.id);
    setNovelistIdInput("");
  };

  const addMuse = async () => {
    const id = museIdInput.trim();
    if (!id) return;
    if (muses.some((m) => m.id === id)) {
      setSelectedMuseId(id);
      setMuseIdInput("");
      return;
    }
    setLookupError(null);
    setMuseLoading(true);
    const res = await getMuseAction(id);
    setMuseLoading(false);

    if (!res || "message" in res) {
      setLookupError(`Muse ${id} not found.`);
      return;
    }
    const person: Person = {
      id: res.id ?? id,
      name:
        `${res.firstName ?? ""} ${res.lastName ?? ""}`.trim() || (res.id ?? id),
      image: res.avatar?.src ?? res.image ?? null,
    };
    setMuses((prev) => [...prev, person]);
    setSelectedMuseId(person.id);
    setMuseIdInput("");
  };

  const removeNovelist = (id: string) => {
    setNovelists((prev) => prev.filter((n) => n.id !== id));
    setSelectedNovelistId((cur) => (cur === id ? "" : cur));
  };

  const removeMuse = (id: string) => {
    setMuses((prev) => prev.filter((m) => m.id !== id));
    setSelectedMuseId((cur) => (cur === id ? "" : cur));
  };

  const sql = useMemo(() => {
    if (!selectedNovelistId || !storyboardEventId.trim() || !text.trim()) {
      return "";
    }
    const message = buildMessageHtml(blocks, selectedMuseId, font, imageUrl);
    return [
      "INSERT INTO story_board_event_thread",
      "    (id, story_board_event_id, sender_id, message, dialog_design, created_at)",
      "VALUES",
      "(",
      "    gen_random_uuid(),",
      `    '${sqlEscape(storyboardEventId.trim())}',`,
      `    '${sqlEscape(selectedNovelistId)}',`,
      `    '${sqlEscape(message)}',`,
      `    '${sqlEscape(dialogDesign)}',`,
      "    now()",
      ");",
    ].join("\n");
  }, [
    blocks,
    selectedNovelistId,
    selectedMuseId,
    storyboardEventId,
    font,
    dialogDesign,
    imageUrl,
    text,
  ]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!storyboardId.trim()) {
      setUploadError("Enter a Storyboard id first (used as the upload prefix).");
      return;
    }

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaBucket", "APP_MEDIA");
    formData.append("prefix", storyboardId.trim());
    // Unscoped: land at app-media/<storyboardId>/<file>, no user-id segment.
    formData.append("scoped", "false");

    const url = await uploadMedia(formData);
    setUploading(false);

    if (url === API_MESSAGE.MediaError) {
      setUploadError("Upload failed. Try again.");
      return;
    }
    setImageUrl(url);
  };

  const handleCopy = async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectedNovelist = novelists.find((n) => n.id === selectedNovelistId);
  const selectedMuse = muses.find((m) => m.id === selectedMuseId);

  return (
    <main style={S.page}>
      <h1 style={S.h1}>Thread SQL Generator</h1>
      <p style={S.sub}>
        Builds an INSERT for <code>story_board_event_thread</code>. Quoted
        speech becomes dialog embeds voiced by the selected muse; the rest is
        narration authored by the selected novelist.
      </p>

      {/* Novelist picker */}
      <div style={S.pickerBlock}>
        <span style={S.label}>Novelist (sender)</span>
        <div style={S.addRow}>
          <input
            style={S.input}
            value={novelistIdInput}
            onChange={(e) => setNovelistIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNovelist()}
            placeholder="Paste novelist id and Add"
          />
          <button
            type="button"
            style={S.button}
            onClick={addNovelist}
            disabled={novelistLoading || !novelistIdInput.trim()}
          >
            {novelistLoading ? "…" : "Add"}
          </button>
        </div>
        {novelists.length > 0 && (
          <div style={S.chips}>
            {novelists.map((n) => (
              <AvatarChip
                key={n.id}
                person={n}
                selected={n.id === selectedNovelistId}
                onSelect={() => setSelectedNovelistId(n.id)}
                onRemove={() => removeNovelist(n.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Muse picker */}
      <div style={S.pickerBlock}>
        <span style={S.label}>Muse (dialog voice)</span>
        <div style={S.addRow}>
          <input
            style={S.input}
            value={museIdInput}
            onChange={(e) => setMuseIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMuse()}
            placeholder="Paste muse id and Add"
          />
          <button
            type="button"
            style={S.button}
            onClick={addMuse}
            disabled={museLoading || !museIdInput.trim()}
          >
            {museLoading ? "…" : "Add"}
          </button>
        </div>
        {muses.length > 0 && (
          <div style={S.chips}>
            {muses.map((m) => (
              <AvatarChip
                key={m.id}
                person={m}
                selected={m.id === selectedMuseId}
                onSelect={() => setSelectedMuseId(m.id)}
                onRemove={() => removeMuse(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {lookupError && <p style={S.error}>{lookupError}</p>}

      <div style={S.grid}>
        <label style={S.field}>
          <span style={S.label}>Storyboard event id</span>
          <input
            style={S.input}
            value={storyboardEventId}
            onChange={(e) => setStoryboardEventId(e.target.value)}
            placeholder="f4fece2a-..."
          />
        </label>

        <label style={S.field}>
          <span style={S.label}>Storyboard id (upload prefix)</span>
          <input
            style={S.input}
            value={storyboardId}
            onChange={(e) => setStoryboardId(e.target.value)}
            placeholder="used for app-media/<storyboardId>"
          />
        </label>

        <label style={S.field}>
          <span style={S.label}>Font</span>
          <select
            style={S.input}
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label style={S.field}>
          <span style={S.label}>Dialog design</span>
          <select
            style={S.input}
            value={dialogDesign}
            onChange={(e) => setDialogDesign(e.target.value as DialogDesign)}
          >
            {DIALOG_DESIGNS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ ...S.field, marginTop: 16 }}>
        <span style={S.label}>Text</span>
        <textarea
          style={S.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={
            "Paste the thread text. Put spoken lines in quotes — “like this” —\nto turn them into dialog embeds. Blank lines separate paragraphs."
          }
        />
      </label>

      <div style={S.uploadRow}>
        <button
          type="button"
          style={S.button}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? "Uploading…"
            : imageUrl
              ? "Replace image"
              : "Upload image"}
        </button>
        {imageUrl && (
          <button
            type="button"
            style={S.buttonGhost}
            onClick={() => setImageUrl(null)}
          >
            Remove image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          onChange={handleImageChange}
        />
      </div>
      {uploadError && <p style={S.error}>{uploadError}</p>}
      {imageUrl && (
        <p style={S.uploadedUrl} title={imageUrl}>
          Uploaded: {imageUrl}
        </p>
      )}

      <div style={S.outputHeader}>
        <h2 style={S.h2}>Generated SQL</h2>
        <button
          type="button"
          style={S.button}
          onClick={handleCopy}
          disabled={!sql}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {sql ? (
        <pre style={S.pre}>{sql}</pre>
      ) : (
        <p style={S.sub}>
          Select a novelist, fill Storyboard event id, and add Text to generate.
        </p>
      )}

      <p style={S.sub}>
        Sender: {selectedNovelist ? selectedNovelist.name : "none"} · Voice:{" "}
        {selectedMuse ? selectedMuse.name : "anonymous"} · {blocks.length}{" "}
        block(s): {blocks.filter((b) => b.kind === "dialog").length} dialog,{" "}
        {blocks.filter((b) => b.kind === "narration").length} narration
        {imageUrl ? " + 1 image" : ""}.
      </p>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "32px 20px 80px",
    fontFamily: "system-ui, sans-serif",
    color: "#1a1a1a",
  },
  h1: { fontSize: 26, fontWeight: 700, margin: "0 0 6px" },
  h2: { fontSize: 18, fontWeight: 600, margin: 0 },
  sub: { fontSize: 13, color: "#666", margin: "6px 0" },
  pickerBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 16,
  },
  addRow: { display: "flex", gap: 8 },
  chips: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 },
  chipWrap: { position: "relative" },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 12px 5px 5px",
    border: "2px solid #ddd",
    borderRadius: 999,
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  chipSelected: {
    borderColor: "#4f46e5",
    boxShadow: "0 0 0 3px rgba(79,70,229,0.18)",
  },
  chipImg: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
  },
  chipFallback: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 700,
  },
  chipName: { fontWeight: 600, color: "#222" },
  chipRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    lineHeight: "16px",
    textAlign: "center",
    borderRadius: "50%",
    border: "none",
    background: "#c0392b",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 16,
  },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#444" },
  input: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    flex: 1,
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.5,
    resize: "vertical",
    fontFamily: "inherit",
  },
  uploadRow: { display: "flex", gap: 10, marginTop: 14, alignItems: "center" },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    background: "#4f46e5",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: 8,
    background: "#fff",
    color: "#444",
    fontSize: 14,
    cursor: "pointer",
  },
  error: { color: "#c0392b", fontSize: 13, margin: "8px 0 0" },
  uploadedUrl: {
    fontSize: 12,
    color: "#666",
    margin: "8px 0 0",
    wordBreak: "break-all",
  },
  outputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 10,
  },
  pre: {
    background: "#0f172a",
    color: "#e2e8f0",
    padding: 16,
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.55,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};
