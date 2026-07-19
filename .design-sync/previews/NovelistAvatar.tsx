import { NovelistAvatar } from "rp-webapp";

const portrait = (bg: string, skin: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="${bg}"/><circle cx="120" cy="92" r="46" fill="${skin}"/><path d="M38 252c0-56 36-84 82-84s82 28 82 84z" fill="${skin}"/></svg>`,
  )}`;

const aria = portrait("#233047", "#a9bde8");
const juno = portrait("#332017", "#e0a98a");
const sable = portrait("#1c3a2a", "#95d6ae");

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
      <NovelistAvatar username="inkspill_aria" image={aria} name="Aria Solenne" />
    </Sized>
  </div>
);

export const AccentPalette = () => (
  <div style={row}>
    <Sized px={64}>
      <NovelistAvatar
        username="inkspill_aria"
        image={aria}
        name="Aria Solenne"
        useAccent
        accent="0"
      />
    </Sized>
    <Sized px={64}>
      <NovelistAvatar
        username="junowrites"
        image={juno}
        name="Juno Marlowe"
        useAccent
        accent="1"
      />
    </Sized>
    <Sized px={64}>
      <NovelistAvatar
        username="sable_quill"
        image={sable}
        name="Sable Quill"
        useAccent
        accent="2"
      />
    </Sized>
    <Sized px={64}>
      <NovelistAvatar
        username="midnight_prose"
        image={aria}
        name="Mira Nocturne"
        useAccent
        accent="3"
      />
    </Sized>
    <Sized px={64}>
      <NovelistAvatar
        username="emberlark"
        image={juno}
        name="Ember Lark"
        useAccent
        accent="4"
      />
    </Sized>
  </div>
);

export const CroppedAvatar = () => (
  <div style={row}>
    <Sized px={72}>
      <NovelistAvatar
        username="junowrites"
        image={juno}
        name="Juno Marlowe"
        avatar={{
          src: juno,
          filterValues: { greyscale: 0, brightness: 100, blur: 0 },
          crop: { src: juno, x: 50, y: 25, width: 170, height: 170 },
        }}
        useAccent
        accent="6"
      />
    </Sized>
    <Sized px={72}>
      <NovelistAvatar
        username="sable_quill"
        image={sable}
        name="Sable Quill"
        avatar={{
          src: sable,
          filterValues: { greyscale: 0, brightness: 100, blur: 0 },
          crop: { src: sable, x: 40, y: 55, width: 150, height: 150 },
        }}
      />
    </Sized>
  </div>
);

export const FallbackInitial = () => (
  <div style={row}>
    <Sized px={64}>
      <NovelistAvatar username="quietchapters" image="" name="Rowan Hale" />
    </Sized>
    <Sized px={64}>
      <NovelistAvatar
        username="lotus_verse"
        image=""
        name="Lyra Voss"
        useAccent
        accent="7"
      />
    </Sized>
  </div>
);

export const InlineChipSize = () => (
  <div style={{ ...row, gap: 10 }}>
    <NovelistAvatar username="midnight_prose" image={aria} name="Mira Nocturne" />
    <span style={{ fontSize: 13, opacity: 0.8 }}>
      @midnight_prose posted a new prompt in <em>Starless Docks</em>
    </span>
  </div>
);
