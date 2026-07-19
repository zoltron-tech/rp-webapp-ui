import { Button } from "rp-webapp";

const row: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: 16 };
const cell: React.CSSProperties = { width: "auto", minWidth: 120 };

export const Variants = () => (
  <div style={row}>
    <div style={cell}><Button variant="primary">Create Muse</Button></div>
    <div style={cell}><Button variant="secondary">Cancel</Button></div>
    <div style={cell}><Button variant="positive">Accept</Button></div>
    <div style={cell}><Button variant="negative">Delete</Button></div>
    <div style={cell}><Button variant="action">Follow</Button></div>
    <div style={cell}><Button variant="link">View profile</Button></div>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <div style={cell}><Button size="xs">Extra small</Button></div>
    <div style={cell}><Button size="sm">Small</Button></div>
    <div style={cell}><Button size="md">Medium</Button></div>
    <div style={cell}><Button size="lg">Large</Button></div>
  </div>
);

export const Shapes = () => (
  <div style={row}>
    <div style={cell}><Button shape="rounded">Rounded</Button></div>
    <div style={cell}><Button shape="rounded-edge">Rounded edge</Button></div>
    <div style={cell}><Button shape="square">Square</Button></div>
  </div>
);

export const States = () => (
  <div style={row}>
    <div style={cell}><Button disabled>Disabled</Button></div>
    <div style={cell}><Button loading>Saving…</Button></div>
  </div>
);
