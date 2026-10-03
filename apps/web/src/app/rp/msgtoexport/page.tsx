"use client";

import type { SearchResult } from "@nw/types/common";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { getNovelistAction, searchAction } from "@/app/rp/novelists/actions";
import { API_MESSAGE } from "@/utils/constants";
import { uploadMedia } from "@/utils/upload-media";

type MessageType = "PROMPT" | "COMMENT" | "REPLY";

const PRIVACY_TYPES = [
  "PUBLIC",
  "FRIENDS",
  "MEMBERS",
  "CUSTOM",
  "ONLY_ME",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// VARCHAR(1000) limit on comments.text / replies.text
const COMMENT_REPLY_TEXT_LIMIT = 1000;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Converts plain text into the HTML the rich text editor produces:
 * each line becomes a <div> block and blank lines become <div><br></div>,
 * matching how contenteditable stores Enter-separated content.
 */
const toEditorHtml = (text: string) =>
  text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line.trim() === "" ? "<div><br></div>" : `<div>${escapeHtml(line)}</div>`,
    )
    .join("");

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

const sqlLiteral = (value: string) => `'${escapeSqlString(value)}'`;

type MuseListItem = {
  id: string;
  name: string;
  avatar: string | null;
};

const novelistDisplayName = (novelist: SearchResult) =>
  novelist.name ||
  `${novelist.firstName ?? ""} ${novelist.lastName ?? ""}`.trim() ||
  novelist.username ||
  novelist.id ||
  "Unknown";

const fieldStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #8884",
  borderRadius: "0.5rem",
  color: "inherit",
  font: "inherit",
  padding: "0.5rem 0.75rem",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.25rem",
  opacity: 0.8,
};

const rowStyle: React.CSSProperties = {
  marginBottom: "1rem",
};

export default function MsgToExportPage() {
  const [messageType, setMessageType] = useState<MessageType>("PROMPT");
  const [museIdInput, setMuseIdInput] = useState("");
  const [muses, setMuses] = useState<MuseListItem[]>([]);
  const [selectedMuseId, setSelectedMuseId] = useState<string | null>(null);
  const [museLookupLoading, setMuseLookupLoading] = useState(false);
  const [museLookupError, setMuseLookupError] = useState<string | null>(null);
  const [promptId, setPromptId] = useState("");
  const [promptIdLocked, setPromptIdLocked] = useState(false);
  const [commentId, setCommentId] = useState("");
  const [commentIdLocked, setCommentIdLocked] = useState(false);
  const [privacy, setPrivacy] =
    useState<(typeof PRIVACY_TYPES)[number]>("PUBLIC");
  const [message, setMessage] = useState("");
  const [sql, setSql] = useState("");
  const [copied, setCopied] = useState(false);

  const [novelistSearch, setNovelistSearch] = useState("");
  const [novelistResults, setNovelistResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sharedWith, setSharedWith] = useState<SearchResult[]>([]);

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const needsPromptId = messageType === "COMMENT";
  const needsCommentId = messageType === "REPLY";
  const needsSharedWith = messageType === "PROMPT" && privacy === "CUSTOM";

  // Debounced novelist search for the CUSTOM privacy "shared with" list.
  useEffect(() => {
    if (!needsSharedWith || !novelistSearch.trim()) {
      setNovelistResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchAction(novelistSearch.trim(), "novelist");
        if (!cancelled) {
          setNovelistResults(Array.isArray(results) ? results : []);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [novelistSearch, needsSharedWith]);

  const [isResolvingNovelist, setIsResolvingNovelist] = useState(false);
  const [novelistResolveError, setNovelistResolveError] = useState<
    string | null
  >(null);

  // The novelist search endpoint doesn't populate `id`, so resolve the full
  // novelist (which includes it) by username before adding to the list.
  const addSharedNovelist = useCallback(async (novelist: SearchResult) => {
    setNovelistResolveError(null);

    let resolved = novelist;
    if (!resolved.id) {
      if (!resolved.username) {
        setNovelistResolveError(
          "This novelist has no username to resolve an ID from.",
        );
        return;
      }

      setIsResolvingNovelist(true);
      try {
        const full = await getNovelistAction(resolved.username);
        if (!full || "message" in full || !full.id) {
          setNovelistResolveError(
            `Could not resolve an ID for @${resolved.username}.`,
          );
          return;
        }
        resolved = { ...novelist, id: full.id };
      } catch {
        setNovelistResolveError(
          `Could not resolve an ID for @${resolved.username}.`,
        );
        return;
      } finally {
        setIsResolvingNovelist(false);
      }
    }

    const toAdd = resolved;
    setSharedWith((prev) =>
      prev.some((n) => n.id === toAdd.id) ? prev : [...prev, toAdd],
    );
    setNovelistSearch("");
    setNovelistResults([]);
  }, []);

  const removeSharedNovelist = useCallback((id: string) => {
    setSharedWith((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Look up the muse by ID and add it (name + avatar) to the selectable list.
  const handleAddMuse = useCallback(async () => {
    const id = museIdInput.trim();
    setMuseLookupError(null);

    if (!UUID_REGEX.test(id)) {
      setMuseLookupError("Muse ID must be a valid UUID.");
      return;
    }

    if (muses.some((m) => m.id === id)) {
      setSelectedMuseId(id);
      setMuseIdInput("");
      return;
    }

    setMuseLookupLoading(true);
    try {
      const muse = await getMuseAction(id);
      if (!muse || "message" in muse || !muse.id) {
        setMuseLookupError("No muse found with that ID.");
        return;
      }

      const item: MuseListItem = {
        avatar: muse.avatar?.src || muse.image || null,
        id: muse.id,
        name:
          `${muse.firstName ?? ""} ${muse.lastName ?? ""}`.trim() || muse.id,
      };
      setMuses((prev) => [...prev, item]);
      setSelectedMuseId(item.id);
      setMuseIdInput("");
    } catch {
      setMuseLookupError("Could not look up that muse.");
    } finally {
      setMuseLookupLoading(false);
    }
  }, [museIdInput, muses]);

  const removeMuse = useCallback((id: string) => {
    setMuses((prev) => prev.filter((m) => m.id !== id));
    setSelectedMuseId((prev) => (prev === id ? null : prev));
  }, []);

  const handleMediaUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0] ?? null;
      // Reset the input so the same file can be re-selected after an error
      if (mediaInputRef.current) mediaInputRef.current.value = "";
      if (!file) return;

      setMediaError(null);
      setMediaUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploaded = await uploadMedia(formData);

        if (!uploaded || uploaded === API_MESSAGE.MediaError) {
          setMediaError("Upload failed. Are you logged in?");
          return;
        }

        setMediaUrl(uploaded);
      } catch {
        setMediaError("Upload failed. Are you logged in?");
      } finally {
        setMediaUploading(false);
      }
    },
    [],
  );

  const errors = useMemo(() => {
    const list: string[] = [];
    if (!selectedMuseId)
      list.push("Add a muse by ID and select it from the list.");

    if (needsPromptId) {
      if (!promptId.trim()) list.push("Prompt ID is required for a comment.");
      else if (!UUID_REGEX.test(promptId.trim()))
        list.push("Prompt ID must be a valid UUID.");
    }

    if (needsCommentId) {
      if (!commentId.trim()) list.push("Comment ID is required for a reply.");
      else if (!UUID_REGEX.test(commentId.trim()))
        list.push("Comment ID must be a valid UUID.");
    }

    if (needsSharedWith && sharedWith.length === 0)
      list.push("CUSTOM privacy requires at least one shared novelist.");

    if (!message.trim()) list.push("Message text is required.");

    return list;
  }, [
    selectedMuseId,
    promptId,
    commentId,
    message,
    needsPromptId,
    needsCommentId,
    needsSharedWith,
    sharedWith,
  ]);

  const formattedHtml = useMemo(() => toEditorHtml(message), [message]);

  const overTextLimit =
    messageType !== "PROMPT" && formattedHtml.length > COMMENT_REPLY_TEXT_LIMIT;

  const handleGenerate = useCallback(() => {
    if (!selectedMuseId) return;
    const id = crypto.randomUUID();
    const text = sqlLiteral(toEditorHtml(message));
    const muse = sqlLiteral(selectedMuseId);
    const media = mediaUrl.trim() ? sqlLiteral(mediaUrl.trim()) : "NULL";

    let statement = "";
    if (messageType === "PROMPT") {
      statement = [
        "INSERT INTO prompts (id, source_id, text, media, song, privacy, is_deleted, created_on)",
        `VALUES ('${id}', ${muse}, ${text}, ${media}, NULL, '${privacy}', false, now());`,
      ].join("\n");

      // CUSTOM privacy: grant access to each shared novelist via
      // privacy_access_holders (target_id = prompt id).
      if (privacy === "CUSTOM" && sharedWith.length > 0) {
        const accessInserts = sharedWith
          .filter((novelist) => novelist.id)
          .map((novelist) =>
            [
              `-- shared with: ${novelistDisplayName(novelist)}`,
              "INSERT INTO privacy_access_holders (id, target_id, novelist_id, created_on)",
              `VALUES ('${crypto.randomUUID()}', '${id}', ${sqlLiteral(novelist.id as string)}, now());`,
            ].join("\n"),
          );
        statement = [statement, ...accessInserts].join("\n\n");
      }
    } else if (messageType === "COMMENT") {
      statement = [
        "INSERT INTO comments (id, prompt_id, source_id, text, media, is_deleted, created_on)",
        `VALUES ('${id}', ${sqlLiteral(promptId.trim())}, ${muse}, ${text}, ${media}, false, now());`,
      ].join("\n");
    } else {
      statement = [
        "INSERT INTO replies (id, comment_id, source_id, text, media, is_deleted, created_on)",
        `VALUES ('${id}', ${sqlLiteral(commentId.trim())}, ${muse}, ${text}, ${media}, false, now());`,
      ].join("\n");
    }

    setSql(`-- ${messageType.toLowerCase()} id: ${id}\n${statement}`);
    setCopied(false);
  }, [
    messageType,
    selectedMuseId,
    promptId,
    commentId,
    privacy,
    message,
    sharedWith,
    mediaUrl,
  ]);

  // Clears the message, media, and generated SQL. Keeps the muses list, and
  // keeps the Prompt/Comment IDs when they are locked.
  const handleClear = useCallback(() => {
    setMessage("");
    setMediaUrl("");
    setMediaError(null);
    setSql("");
    setCopied(false);
    if (!promptIdLocked) setPromptId("");
    if (!commentIdLocked) setCommentId("");
  }, [promptIdLocked, commentIdLocked]);

  const handleCopy = useCallback(async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sql]);

  return (
    <div style={{ margin: "0 auto", maxWidth: "48rem", padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Message to SQL Export</h2>
      <p style={{ marginBottom: "1.5rem", opacity: 0.7 }}>
        Generates an SQL INSERT for a prompt, comment, or reply. The message
        text is converted to the rich text editor format (each line wrapped in a
        &lt;div&gt;, blank lines as &lt;div&gt;&lt;br&gt;&lt;/div&gt;).
      </p>

      <div style={rowStyle}>
        <span style={labelStyle}>Type</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["PROMPT", "COMMENT", "REPLY"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setMessageType(type);
                setSql("");
              }}
              style={{
                ...fieldStyle,
                background:
                  messageType === type
                    ? "var(--accent, #6c5ce7)"
                    : "transparent",
                color: messageType === type ? "#fff" : "inherit",
                cursor: "pointer",
                fontWeight: messageType === type ? 700 : 400,
                width: "auto",
              }}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle} htmlFor="muse-id">
          Muse (source_id)
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="muse-id"
            style={fieldStyle}
            value={museIdInput}
            onChange={(e) => setMuseIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddMuse();
              }
            }}
            placeholder="Muse ID, e.g. 3f2504e0-4f89-11d3-9a0c-0305e82c3301"
          />
          <button
            type="button"
            onClick={handleAddMuse}
            disabled={museLookupLoading || !museIdInput.trim()}
            style={{
              ...fieldStyle,
              cursor:
                museLookupLoading || !museIdInput.trim()
                  ? "not-allowed"
                  : "pointer",
              flexShrink: 0,
              width: "auto",
            }}
          >
            {museLookupLoading ? "Adding…" : "Add"}
          </button>
        </div>

        {museLookupError && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            {museLookupError}
          </p>
        )}

        {muses.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {muses.map((muse) => {
              const isSelected = muse.id === selectedMuseId;
              return (
                <div
                  key={muse.id}
                  onClick={() => setSelectedMuseId(muse.id)}
                  title={muse.id}
                  style={{
                    alignItems: "center",
                    background: isSelected
                      ? "var(--accent, #6c5ce7)"
                      : "#8882",
                    border: isSelected
                      ? "1px solid var(--accent, #6c5ce7)"
                      : "1px solid #8884",
                    borderRadius: "1.5rem",
                    color: isSelected ? "#fff" : "inherit",
                    cursor: "pointer",
                    display: "inline-flex",
                    fontSize: "0.85rem",
                    fontWeight: isSelected ? 700 : 400,
                    gap: "0.5rem",
                    padding: "0.25rem 0.75rem 0.25rem 0.25rem",
                  }}
                >
                  {muse.avatar ? (
                    <img
                      src={muse.avatar}
                      alt={muse.name}
                      style={{
                        borderRadius: "50%",
                        height: "1.75rem",
                        objectFit: "cover",
                        width: "1.75rem",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        alignItems: "center",
                        background: "#8884",
                        borderRadius: "50%",
                        display: "inline-flex",
                        height: "1.75rem",
                        justifyContent: "center",
                        width: "1.75rem",
                      }}
                    >
                      {muse.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {muse.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMuse(muse.id);
                    }}
                    aria-label={`Remove ${muse.name}`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      font: "inherit",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {needsPromptId && (
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="prompt-id">
            Prompt ID
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="prompt-id"
              style={{
                ...fieldStyle,
                opacity: promptIdLocked ? 0.6 : 1,
              }}
              value={promptId}
              readOnly={promptIdLocked}
              onChange={(e) => setPromptId(e.target.value)}
              placeholder="UUID of the prompt being commented on"
            />
            <button
              type="button"
              onClick={() => setPromptIdLocked((v) => !v)}
              title={
                promptIdLocked
                  ? "Unlock to edit Prompt ID"
                  : "Lock Prompt ID to prevent edits"
              }
              style={{
                ...fieldStyle,
                cursor: "pointer",
                flexShrink: 0,
                width: "auto",
              }}
            >
              {promptIdLocked ? "🔒 Locked" : "🔓 Lock"}
            </button>
          </div>
        </div>
      )}

      {needsCommentId && (
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="comment-id">
            Comment ID
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="comment-id"
              style={{
                ...fieldStyle,
                opacity: commentIdLocked ? 0.6 : 1,
              }}
              value={commentId}
              readOnly={commentIdLocked}
              onChange={(e) => setCommentId(e.target.value)}
              placeholder="UUID of the comment being replied to"
            />
            <button
              type="button"
              onClick={() => setCommentIdLocked((v) => !v)}
              title={
                commentIdLocked
                  ? "Unlock to edit Comment ID"
                  : "Lock Comment ID to prevent edits"
              }
              style={{
                ...fieldStyle,
                cursor: "pointer",
                flexShrink: 0,
                width: "auto",
              }}
            >
              {commentIdLocked ? "🔒 Locked" : "🔓 Lock"}
            </button>
          </div>
        </div>
      )}

      {messageType === "PROMPT" && (
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="privacy">
            Privacy
          </label>
          <select
            id="privacy"
            style={fieldStyle}
            value={privacy}
            onChange={(e) =>
              setPrivacy(e.target.value as (typeof PRIVACY_TYPES)[number])
            }
          >
            {PRIVACY_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {needsSharedWith && (
        <div style={rowStyle}>
          <label style={labelStyle} htmlFor="novelist-search">
            Shared with (novelist search)
          </label>
          <input
            id="novelist-search"
            style={fieldStyle}
            value={novelistSearch}
            onChange={(e) => setNovelistSearch(e.target.value)}
            placeholder="Search novelists by name or username"
            autoComplete="off"
          />

          {(isSearching || isResolvingNovelist) && (
            <p
              style={{
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                opacity: 0.6,
              }}
            >
              {isResolvingNovelist ? "Resolving novelist ID…" : "Searching…"}
            </p>
          )}

          {novelistResolveError && (
            <p
              style={{
                color: "#e74c3c",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              {novelistResolveError}
            </p>
          )}

          {!isSearching && novelistSearch.trim() !== "" && (
            <div
              style={{
                border: "1px solid #8884",
                borderRadius: "0.5rem",
                marginTop: "0.25rem",
                maxHeight: "14rem",
                overflowY: "auto",
              }}
            >
              {novelistResults.length === 0 ? (
                <p
                  style={{ margin: 0, opacity: 0.6, padding: "0.5rem 0.75rem" }}
                >
                  No novelists found.
                </p>
              ) : (
                novelistResults.map((novelist) => (
                  <button
                    key={novelist.id || novelist.username}
                    type="button"
                    disabled={isResolvingNovelist}
                    onClick={() => addSharedNovelist(novelist)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid #8882",
                      color: "inherit",
                      cursor: "pointer",
                      display: "block",
                      font: "inherit",
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {novelistDisplayName(novelist)}
                    {novelist.username && (
                      <span style={{ marginLeft: "0.5rem", opacity: 0.6 }}>
                        @{novelist.username}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {sharedWith.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {sharedWith.map((novelist) => (
                <span
                  key={novelist.id}
                  style={{
                    alignItems: "center",
                    background: "#8882",
                    border: "1px solid #8884",
                    borderRadius: "1rem",
                    display: "inline-flex",
                    fontSize: "0.85rem",
                    gap: "0.375rem",
                    padding: "0.25rem 0.75rem",
                  }}
                >
                  {novelistDisplayName(novelist)}
                  <button
                    type="button"
                    onClick={() => removeSharedNovelist(novelist.id as string)}
                    aria-label={`Remove ${novelistDisplayName(novelist)}`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      font: "inherit",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={rowStyle}>
        <label style={labelStyle} htmlFor="message-text">
          Message text
        </label>
        <textarea
          id="message-text"
          style={{ ...fieldStyle, minHeight: "10rem", resize: "vertical" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Plain text message. New lines are preserved."
        />
        {overTextLimit && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Warning: formatted text is {formattedHtml.length} characters — the{" "}
            {messageType.toLowerCase()} text column is VARCHAR(
            {COMMENT_REPLY_TEXT_LIMIT}).
          </p>
        )}
      </div>

      <div style={rowStyle}>
        <label style={labelStyle} htmlFor="media-file">
          Media (optional)
        </label>
        <div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
          <input
            id="media-file"
            ref={mediaInputRef}
            type="file"
            accept="audio/*,video/*,image/*"
            onChange={handleMediaUpload}
            disabled={mediaUploading}
            style={{ ...fieldStyle, cursor: "pointer", width: "auto" }}
          />
          {mediaUploading && <span style={{ opacity: 0.6 }}>Uploading…</span>}
        </div>
        <input
          style={{ ...fieldStyle, marginTop: "0.5rem" }}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="Media URL (filled after upload, or paste one manually)"
        />
        {mediaError && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            {mediaError}
          </p>
        )}
        {mediaUrl.trim() !== "" && (
          <button
            type="button"
            onClick={() => setMediaUrl("")}
            style={{
              ...fieldStyle,
              cursor: "pointer",
              fontSize: "0.85rem",
              marginTop: "0.5rem",
              width: "auto",
            }}
          >
            Clear media
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <ul
          style={{
            color: "#e74c3c",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={errors.length > 0 || mediaUploading}
          style={{
            ...fieldStyle,
            background:
              errors.length > 0 || mediaUploading
                ? "#8884"
                : "var(--accent, #6c5ce7)",
            color: "#fff",
            cursor:
              errors.length > 0 || mediaUploading ? "not-allowed" : "pointer",
            fontWeight: 700,
            width: "auto",
          }}
        >
          {mediaUploading ? "Uploading media…" : "Generate SQL"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            ...fieldStyle,
            cursor: "pointer",
            width: "auto",
          }}
        >
          Clear
        </button>
      </div>

      {sql && (
        <div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
            }}
          >
            <span style={labelStyle}>Generated SQL</span>
            <button
              type="button"
              onClick={handleCopy}
              style={{ ...fieldStyle, cursor: "pointer", width: "auto" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre
            style={{
              background: "#8881",
              border: "1px solid #8884",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              overflowX: "auto",
              padding: "1rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}
