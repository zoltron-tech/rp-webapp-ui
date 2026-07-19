import { ButtonGroup } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 20, maxWidth: 480 };

const noop = () => {};

export const ConfirmCancel = () => (
  <div style={wrap}>
    <ButtonGroup
      buttons={[
        { label: "Save muse", variant: "primary", onClick: noop },
        { label: "Cancel", variant: "secondary", onClick: noop },
      ]}
    />
  </div>
);

export const DestructiveConfirm = () => (
  <div style={wrap}>
    <ButtonGroup
      buttons={[
        { label: "Delete storyboard", variant: "negative", onClick: noop },
        { label: "Keep it", variant: "secondary", onClick: noop },
      ]}
    />
  </div>
);

export const ConnectionRequest = () => (
  <div style={wrap}>
    <ButtonGroup
      buttons={[
        { label: "Accept", variant: "positive", onClick: noop },
        { label: "Decline", variant: "negative", onClick: noop },
        { label: "View profile", variant: "link", onClick: noop },
      ]}
    />
  </div>
);
