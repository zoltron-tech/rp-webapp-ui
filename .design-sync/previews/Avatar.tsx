import { Avatar } from "rp-webapp";

const portrait = (bg: string, skin: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${bg}"/><circle cx="100" cy="78" r="38" fill="${skin}"/><path d="M32 210c0-46 30-70 68-70s68 24 68 70z" fill="${skin}"/></svg>`,
  )}`;

const seraphine = portrait("#1f3d33", "#9fd8c2");
const kael = portrait("#3b2440", "#c9a3e0");
const wren = portrait("#40301c", "#e6c38a");

const row: React.CSSProperties = {
  display: "flex",
  gap: 20,
  alignItems: "flex-end",
  flexWrap: "wrap",
  padding: 20,
};

export const Canonical = () => (
  <div style={row}>
    <Avatar src={seraphine} alt="Seraphine Vale" />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Avatar src={kael} alt="Kael Ashborn" size={40} />
    <Avatar src={kael} alt="Kael Ashborn" size={64} />
    <Avatar src={kael} alt="Kael Ashborn" size={100} />
    <Avatar src={kael} alt="Kael Ashborn" size={140} />
  </div>
);

export const HoverableWithName = () => (
  <div style={row}>
    <Avatar
      src={wren}
      alt="Wren of the Hollow"
      size={110}
      hoverable
      name="Wren of the Hollow"
    />
    <Avatar src={seraphine} alt="Seraphine Vale" size={110} hoverable name="Seraphine" />
  </div>
);
