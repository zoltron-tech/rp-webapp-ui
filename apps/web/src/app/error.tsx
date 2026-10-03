"use client";

import { useEffect } from "react";

/**
 * Catches otherwise-uncaught render errors for every route. Without this,
 * Next unmounts the whole tree on any client exception and the page reads
 * as a blank (near-black, per our dark theme) screen with no way back
 * short of a manual reload — this gives the reader a way out instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        alignItems: "center",
        background: "var(--bg-1, #141414)",
        color: "var(--text, #f2f2f2)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        justifyContent: "center",
        minHeight: "100dvh",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 16, margin: 0 }}>
        Something went wrong on this page.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: "var(--accent, #6d5efc)",
            border: "none",
            borderRadius: 8,
            color: "var(--bg-1, #141414)",
            cursor: "pointer",
            fontWeight: 600,
            padding: "10px 18px",
          }}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: "transparent",
            border: "1.5px solid var(--bg-6, #444)",
            borderRadius: 8,
            color: "var(--text, #f2f2f2)",
            cursor: "pointer",
            fontWeight: 600,
            padding: "10px 18px",
          }}
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
