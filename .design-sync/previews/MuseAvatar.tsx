import { MuseAvatar } from "rp-webapp";

const portrait = (bg: string, skin: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="${bg}"/><circle cx="120" cy="92" r="46" fill="${skin}"/><path d="M38 252c0-56 36-84 82-84s82 28 82 84z" fill="${skin}"/></svg>`,
  )}`;

const seraphine = portrait("#1f3d33", "#9fd8c2");
const kael = portrait("#3b2440", "#c9a3e0");
const ivara = portrait("#173042", "#8fc3e8");

const row: React.CSSProperties = {
  display: "flex",
  gap: 24,
  alignItems: "center",
  flexWrap: "wrap",
  padding: 20,
};

// In the app, parent containers size the `.avatar` root (intrinsic size is a
// 20px chip). This mirrors that composition at a profile-row size.
const Sized = ({ px, children }: { px: number; children: React.ReactNode }) => (
  <span className={`ds-sized-${px}`} style={{ display: "inline-flex" }}>
    <style>{`.ds-sized-${px} .avatar { width: ${px}px; height: ${px}px; }`}</style>
    {children}
  </span>
);

export const Canonical = () => (
  <div style={row}>
    <Sized px={72}>
      <MuseAvatar museId="muse-seraphine-01" image={seraphine} name="Seraphine Vale" />
    </Sized>
  </div>
);

export const AccentRings = () => (
  <div style={row}>
    <Sized px={64}>
      <MuseAvatar
        museId="muse-kael-02"
        image={kael}
        name="Kael Ashborn"
        useAccent
        accent="#c084fc"
      />
    </Sized>
    <Sized px={64}>
      <MuseAvatar
        museId="muse-ivara-03"
        image={ivara}
        name="Ivara Frostwind"
        useAccent
        accent="#38bdf8"
      />
    </Sized>
    <Sized px={64}>
      <MuseAvatar
        museId="muse-seraphine-01"
        image={seraphine}
        name="Seraphine Vale"
        useAccent
        accent="#34d399"
      />
    </Sized>
  </div>
);

export const CroppedAvatar = () => (
  <div style={row}>
    <Sized px={72}>
      <MuseAvatar
        museId="muse-kael-02"
        image={kael}
        name="Kael Ashborn"
        avatar={{
          src: kael,
          filterValues: { greyscale: 0, brightness: 100, blur: 0 },
          crop: { src: kael, x: 50, y: 20, width: 180, height: 180 },
        }}
      />
    </Sized>
    <Sized px={72}>
      <MuseAvatar
        museId="muse-ivara-03"
        image={ivara}
        name="Ivara Frostwind"
        avatar={{
          src: ivara,
          filterValues: { greyscale: 0, brightness: 100, blur: 0 },
          crop: { src: ivara, x: 35, y: 60, width: 140, height: 140 },
        }}
        useAccent
        accent="#38bdf8"
      />
    </Sized>
  </div>
);

export const FallbackInitial = () => (
  <div style={row}>
    <Sized px={64}>
      <MuseAvatar museId="muse-noimage-04" image="" name="Thorne Blackwood" />
    </Sized>
    <Sized px={64}>
      <MuseAvatar
        museId="muse-noimage-05"
        image=""
        name="Elara Nightsong"
        useAccent
        accent="#f472b6"
      />
    </Sized>
  </div>
);

export const InlineChipSize = () => (
  <div style={{ ...row, gap: 10 }}>
    <MuseAvatar museId="muse-seraphine-01" image={seraphine} name="Seraphine Vale" />
    <span style={{ fontSize: 13, opacity: 0.8 }}>
      Seraphine Vale replied in <em>Ashes of the Verse</em>
    </span>
  </div>
);
