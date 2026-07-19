import { Button, Card } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 24, display: "flex", gap: 20, flexWrap: "wrap" };

export const AboutMuse = () => (
  <div style={wrap}>
    <Card width="420px" height="260px" padding="28px">
      <h3 style={{ margin: "0 0 10px", fontSize: 18 }}>Wren Halloway</h3>
      <p style={{ margin: 0, lineHeight: 1.6, color: "var(--text-secondary, #aab4af)" }}>
        Lighthouse keeper of the northern coast. She keeps the lamp burning
        through storm season, and trades stories with any sailor brave enough
        to climb the cliff stairs. Rarely leaves the tower before dawn.
      </p>
    </Card>
  </div>
);

export const CompactStats = () => (
  <div style={wrap}>
    <Card width="220px" height="150px" padding="20px">
      <p style={{ margin: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary, #aab4af)" }}>
        Story points
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 700 }}>1,320</p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--accent, #29a383)" }}>Level 6 novelist</p>
    </Card>
    <Card width="220px" height="150px" padding="20px">
      <p style={{ margin: 0, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-secondary, #aab4af)" }}>
        Active threads
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 700 }}>7</p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary, #aab4af)" }}>3 awaiting your reply</p>
    </Card>
  </div>
);

export const WithActions = () => (
  <div style={wrap}>
    <Card width="420px" height="220px" padding="24px">
      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Finish your storyboard</h3>
      <p style={{ margin: "0 0 16px", lineHeight: 1.5, color: "var(--text-secondary, #aab4af)" }}>
        "Storm Season" still needs a first event before other writers can join
        the thread.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" size="sm">Add an event</Button>
        <Button variant="secondary" size="sm">Later</Button>
      </div>
    </Card>
  </div>
);
