import { Avatar, Dropdown } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-size="36" fill="#fff" text-anchor="middle" font-family="sans-serif">${letter}</text></svg>`,
  )}`;

// Dropdown is an absolutely-positioned surface (height 0, content overflows)
// meant to sit inside a relatively-positioned anchor.
const anchor: React.CSSProperties = { position: "relative", width: 300, height: 230 };
const panel: React.CSSProperties = {
  background: "var(--bg-3, #1e201e)",
  border: "1px solid var(--bg-5, #2f312e)",
  borderRadius: "var(--border-radius, 8px)",
  padding: 8,
  minWidth: 260,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 8px",
  borderRadius: 6,
};

export const MentionSuggestions = () => (
  <div style={{ padding: 24 }}>
    <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-secondary, #aab4af)" }}>
      Mentioning "@wr" in a reply…
    </p>
    <div style={anchor}>
      <Dropdown isVisible>
        <div style={panel}>
          {[
            { bg: "#1d3a31", n: "Wren Halloway", by: "muse · elena_inks" },
            { bg: "#3a2a1d", n: "Wraithborne", by: "muse · night_scribe" },
            { bg: "#2a1d3a", n: "wren_writes", by: "novelist" },
          ].map((m) => (
            <div style={row} key={m.n}>
              <Avatar src={portrait(m.bg, m.n.charAt(0).toUpperCase())} alt={m.n} size={34} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.n}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary, #aab4af)" }}>{m.by}</div>
              </div>
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  </div>
);

export const ThreadActionsMenu = () => (
  <div style={{ padding: 24, display: "flex", gap: 40 }}>
    <div>
      <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-secondary, #aab4af)" }}>Open</p>
      <div style={{ ...anchor, height: 190, width: 240 }}>
        <Dropdown isVisible>
          <div style={{ ...panel, minWidth: 210 }}>
            {["Reply as Wren", "Bookmark thread", "Mute notifications", "Leave story"].map((label, i) => (
              <div
                style={{
                  ...row,
                  fontSize: 14,
                  color: i === 3 ? "var(--tomato-9, #e5484d)" : "var(--text, #eceeed)",
                  background: i === 0 ? "var(--bg-5, #2f312e)" : "transparent",
                }}
                key={label}
              >
                {label}
              </div>
            ))}
          </div>
        </Dropdown>
      </div>
    </div>
    <div>
      <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-secondary, #aab4af)" }}>
        Hidden (isVisible=false)
      </p>
      <div style={{ ...anchor, height: 190, width: 240, border: "1px dashed var(--bg-5, #2f312e)", borderRadius: 8 }}>
        <Dropdown>
          <div style={{ ...panel, minWidth: 210 }}>
            <div style={row}>Reply as Wren</div>
          </div>
        </Dropdown>
      </div>
    </div>
  </div>
);
