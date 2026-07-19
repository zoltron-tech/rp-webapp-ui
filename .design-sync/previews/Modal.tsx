import { useEffect } from "react";
import { Button, Modal } from "rp-webapp";

// Modal is closed by default; its VisibilityProvider listens for
// window "visibility-provider:open:<name>" events. Dispatch after mount
// (rendered as the LAST sibling so the provider's listeners exist first).
const OpenOnMount = ({ name }: { name: string }) => {
  useEffect(() => {
    window.dispatchEvent(new Event(`visibility-provider:open:${name}`));
  }, [name]);
  return null;
};

// The card harness story root has transform:translateZ(0), so the modal's
// position:fixed overlay sizes against the story root, not the viewport.
// The root's only in-flow child is this spacer — it gives the overlay area.
const stage: React.CSSProperties = { height: 620 };

export const ConfirmDeleteMuse = () => (
  <>
    <div style={stage} />
    <Modal name="delete-muse" width="380px">
      <h3 style={{ margin: "8px 0 12px", fontSize: 18 }}>Retire this muse?</h3>
      <p style={{ margin: "0 0 20px", textAlign: "center", lineHeight: 1.5, color: "var(--text-secondary, #aab4af)" }}>
        Wren Halloway will be removed from your roster. Threads she appears in
        stay readable, but she can no longer join new stories.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="negative">Retire muse</Button>
        <Button variant="secondary">Keep her</Button>
      </div>
    </Modal>
    <OpenOnMount name="delete-muse" />
  </>
);

export const StoryInviteModal = () => (
  <>
    <div style={stage} />
    <Modal name="story-invite" width="540px" maxHeight="80vh">
      <h3 style={{ margin: "8px 0 4px", fontSize: 18 }}>Join "Storm Season"</h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--accent, #29a383)" }}>
        elena_inks invited your muse Wren Halloway
      </p>
      <p style={{ margin: "0 0 18px", lineHeight: 1.6, textAlign: "center", color: "var(--text-secondary, #aab4af)" }}>
        The lamp went dark for the first time in forty years, and three ships
        are still out past the shoals. A slow-burn mystery thread, two to four
        writers, replies every few days.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="primary">Accept invite</Button>
        <Button variant="secondary">Decline</Button>
      </div>
    </Modal>
    <OpenOnMount name="story-invite" />
  </>
);
