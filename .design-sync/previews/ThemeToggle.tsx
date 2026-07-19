import { ThemeToggle } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 20 };

export const Default = () => (
  <div style={wrap}>
    <ThemeToggle />
  </div>
);

export const InSettingsRow = () => (
  <div style={{ ...wrap, maxWidth: 380 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Appearance</div>
        <div style={{ opacity: 0.6, fontSize: 13 }}>Switch between day and night mode</div>
      </div>
      <ThemeToggle />
    </div>
  </div>
);
