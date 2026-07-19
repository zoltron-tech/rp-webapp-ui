// BLOCKED COMPONENT — PasswordField (and its parent UpdatePasswordFields)
// render radix-ui Form.Field, which throws "`FormField` must be used within
// `Form`" unless wrapped in the app's Form.Root — and no Form/Form.Root is
// exported on the rp-webapp bundle. Verified live: both throw in capture
// (pageErrs: "Error: `FormField` must be used within `Form`").
// Per the blocked-component protocol this preview shows the closest
// renderable composition of the app's password UX: the legacy password
// Input (same reveal-toggle behavior) plus PasswordChecks, the strength
// checklist UpdatePasswordFields pairs with PasswordField.
import { Input, PasswordChecks } from "rp-webapp";

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 24,
  maxWidth: 420,
};

export const PasswordEntryLegacyInput = () => (
  <div style={col}>
    <Input
      label="Current password"
      name="current"
      type="password"
      defaultValue="keeper-of-the-lamp"
    />
  </div>
);

export const NewPasswordChecklist = () => (
  <div style={col}>
    <Input label="New password" name="password" type="password" defaultValue="StormSeason!7" />
    <Input label="Confirm password" name="confirm" type="password" defaultValue="StormSeason" />
    <PasswordChecks password="StormSeason!7" confirmPassword="StormSeason" />
  </div>
);
