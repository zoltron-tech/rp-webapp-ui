import { Username } from "rp-webapp";

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  alignItems: "flex-start",
  padding: 20,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "baseline",
  padding: 20,
  flexWrap: "wrap",
};

export const Default = () => (
  <div style={col}>
    <Username username="moonlit_scribe" />
    <Username username="inkspill_aria" />
  </div>
);

export const Primary = () => (
  <div style={col}>
    <Username username="junowrites" primary />
  </div>
);

export const AccentOverrides = () => (
  <div style={col}>
    <Username username="sable_quill" primary accentOverride="#38bdf8" />
    <Username username="emberlark" primary accentOverride="#f59e0b" />
    <Username username="lotus_verse" primary accentOverride="#f472b6" />
  </div>
);

export const InByline = () => (
  <div style={row}>
    <span style={{ opacity: 0.7, fontSize: 14 }}>New prompt from</span>
    <Username username="midnight_prose" primary />
    <span style={{ opacity: 0.7, fontSize: 14 }}>in Ashes of the Verse</span>
  </div>
);
