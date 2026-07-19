import { Input } from "rp-webapp";

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 24,
  maxWidth: 440,
};

const searchIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

export const StoryTitle = () => (
  <div style={col}>
    <Input
      label="Story title"
      name="storyTitle"
      placeholder="Name your storyboard"
      defaultValue="The Lighthouse at World's End"
    />
    <Input label="Opening line" name="openingLine" />
  </div>
);

export const ValidationStates = () => (
  <div style={col}>
    <Input
      label="Username"
      name="username"
      defaultValue="wren.halloway"
      message="This username is already penned by another novelist."
      messageType="error"
    />
    <Input
      label="Muse name"
      name="museName"
      defaultValue="Wren Halloway"
      message="Saved to your muse roster."
      messageType="success"
    />
    <Input
      label="Prompt tag"
      name="promptTag"
      defaultValue="#stormwatch"
      message="Tags with few followers reach fewer writers."
      messageType="warning"
    />
    <Input
      label="Invite code"
      name="inviteCode"
      defaultValue="NW-7HK2"
      message="Checking your invite…"
      messageType="processing"
    />
  </div>
);

export const PasswordEntry = () => (
  <div style={col}>
    <Input
      label="Password"
      name="password"
      type="password"
      defaultValue="keeper-of-the-lamp"
    />
  </div>
);

export const IconAndReadOnly = () => (
  <div style={col}>
    <Input
      label="Search muses"
      name="museSearch"
      icon={searchIcon}
      iconColor="var(--accent)"
      placeholder="Find a muse or novelist"
      defaultValue="lighthouse keeper"
    />
    <Input
      label="Joined"
      name="joined"
      defaultValue="March 2025"
      readOnly
    />
  </div>
);
