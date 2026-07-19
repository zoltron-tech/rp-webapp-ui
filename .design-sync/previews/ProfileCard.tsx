// ProfileCard takes no props: it fetches the logged-in novelist itself and
// currently renders a static placeholder Card body regardless of fetch
// result. This cell shows that complete (placeholder) render honestly.
import { ProfileCard } from "rp-webapp";

export const Default = () => (
  <div style={{ padding: 24, maxWidth: 420 }}>
    <ProfileCard />
  </div>
);
