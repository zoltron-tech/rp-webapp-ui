import { TagsContainer } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 20, maxWidth: 460 };

export const MuseGenres = () => (
  <div style={wrap}>
    <TagsContainer
      tags={[
        { id: "t1", label: "high fantasy", color: "#34d399" },
        { id: "t2", label: "slow burn", color: "#f472b6" },
        { id: "t3", label: "enemies to lovers", color: "#f59e0b" },
        { id: "t4", label: "court intrigue", color: "#38bdf8" },
      ]}
    />
  </div>
);

export const ManyTagsWrapping = () => (
  <div style={wrap}>
    <TagsContainer
      tags={[
        { id: "t1", label: "sci-fi", color: "#38bdf8" },
        { id: "t2", label: "angst", color: "#fb7185" },
        { id: "t3", label: "fluff", color: "#f472b6" },
        { id: "t4", label: "canon", color: "#a78bfa" },
        { id: "t5", label: "war epic", color: "#f59e0b" },
        { id: "t6", label: "slice of life", color: "#34d399" },
      ]}
    />
  </div>
);

export const SingleTag = () => (
  <div style={wrap}>
    <TagsContainer tags={[{ id: "t1", label: "cozy mystery", color: "#a3e635" }]} />
  </div>
);
