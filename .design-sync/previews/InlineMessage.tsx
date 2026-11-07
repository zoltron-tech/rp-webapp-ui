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
        Messages in this conversation are encrypted in transit and at rest,
        and fade away after 14 days. Reported messages can be read by our
        support team.
      </p>
    </InlineMessage>
  </div>
);
