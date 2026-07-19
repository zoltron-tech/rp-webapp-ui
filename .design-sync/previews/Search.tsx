import { Search } from "rp-webapp";

const renderItem = (result: { id: string; label: string; image?: string }, close: () => void) => (
  <div key={result.id} onClick={close} style={{ padding: "8px 12px", color: "var(--text)" }}>
    {result.label}
  </div>
);

export const Default = () => (
  <div style={{ padding: 16, maxWidth: 360 }}>
    <Search placeholder="Search novelists, muses, stories…" renderDropdownItem={renderItem as never} />
  </div>
);
