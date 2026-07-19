import { InlineMessage } from "rp-webapp";

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 24,
  maxWidth: 520,
};

export const Variants = () => (
  <div style={col}>
    <InlineMessage variant="info">
      <p>Drafts autosave every few seconds while you write.</p>
    </InlineMessage>
    <InlineMessage variant="success">
      <p>Your reply was posted to "Storm Season".</p>
    </InlineMessage>
    <InlineMessage variant="warning">
      <p>This prompt closes to new writers in 2 days.</p>
    </InlineMessage>
    <InlineMessage variant="error">
      <p>Your reply could not be sent — you are offline.</p>
    </InlineMessage>
  </div>
);

export const EncryptionNotice = () => (
  <div style={col}>
    <InlineMessage variant="info">
      <p>
        Messages in this conversation are end-to-end encrypted. Only you and
        night_scribe can read them — not even Novelist World can. If you sign
        in on a new device, older messages stay locked until you restore your
        key.
      </p>
    </InlineMessage>
  </div>
);
