import { useState } from "react";
import { FilterSearch } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 16, maxWidth: 420 };

const MUSIC_FILTERS = [
  { id: "mine", label: "My songs" },
  { id: "friends", label: "Friends" },
  { id: "ambient", label: "Ambient" },
];

export const Empty = () => {
  const [value, setValue] = useState("");
  return (
    <div style={wrap}>
      <FilterSearch value={value} onChange={setValue} placeholder="Search muses..." />
    </div>
  );
};

export const WithQuery = () => {
  const [value, setValue] = useState("lighthouse");
  return (
    <div style={wrap}>
      <FilterSearch value={value} onChange={setValue} placeholder="Search prompts..." />
    </div>
  );
};

export const WithFilters = () => {
  const [value, setValue] = useState("");
  const [active, setActive] = useState<string[]>(["mine", "ambient"]);
  return (
    <div style={wrap}>
      <FilterSearch
        value={value}
        onChange={setValue}
        placeholder="Search your library..."
        filters={MUSIC_FILTERS}
        activeFilters={active}
        onFilterChange={setActive}
      />
    </div>
  );
};
