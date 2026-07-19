import { BreadCrumb } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 24, maxWidth: 640 };

export const ProfileCrumb = () => (
  <div style={wrap}>
    <BreadCrumb username="elena_inks" />
  </div>
);

export const SectionCrumbs = () => (
  <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 14 }}>
    <BreadCrumb username="elena_inks" label="muses" />
    <BreadCrumb username="night_scribe" label="storyboards" />
    <BreadCrumb username="quill_and_ash" label="bookmarks" />
  </div>
);
