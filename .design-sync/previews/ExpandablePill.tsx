import { Avatar, ExpandablePill } from "rp-webapp";

const portrait = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="52" font-size="36" fill="#fff" text-anchor="middle" font-family="sans-serif">${letter}</text></svg>`,
  )}`;

const muses = [
  { bg: "#1d3a31", name: "Wren" },
  { bg: "#3a2a1d", name: "Caspian" },
  { bg: "#2a1d3a", name: "Isolde" },
  { bg: "#1d2a3a", name: "Marlow" },
  { bg: "#3a1d2a", name: "Sable" },
];

// The pill's scroll strip is rotated -90°; the app counter-rotates each
// avatar 90° (muses-pill's .rotate class) so faces stay upright.
const counterRotate: React.CSSProperties = { transform: "rotate(90deg)" };

const avatars = (size: number, upright = false) =>
  muses.map((m) => (
    <Avatar
      key={m.name}
      src={portrait(m.bg, m.name.charAt(0))}
      alt={m.name}
      name={m.name}
      size={size}
      hoverable
      style={upright ? undefined : counterRotate}
    />
  ));

// The pill sizes itself with container-query units against the app's
// "profile-content" container — recreate that ancestor here.
const profileContent: React.CSSProperties = {
  containerName: "profile-content",
  containerType: "inline-size",
  width: 560,
  padding: "24px 16px 40px",
};

export const MusesShelf = () => (
  <div style={profileContent}>
    <ExpandablePill
      tag="muses"
      expandable
      scrollableContent={avatars(65)}
      expandedContent={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>{avatars(65, true)}</div>
      }
    />
  </div>
);

export const FriendsPillNonExpandable = () => (
  <div style={profileContent}>
    <ExpandablePill
      tag="friends"
      expandable={false}
      scrollableContent={[
        <Avatar key="e" src={portrait("#1d3a31", "E")} alt="elena_inks" name="elena_inks" size={65} hoverable style={counterRotate} />,
        <Avatar key="n" src={portrait("#3a2a1d", "N")} alt="night_scribe" name="night_scribe" size={65} hoverable style={counterRotate} />,
        <Avatar key="q" src={portrait("#2a1d3a", "Q")} alt="quill_and_ash" name="quill_and_ash" size={65} hoverable style={counterRotate} />,
      ]}
      expandedContent={null}
    />
  </div>
);
