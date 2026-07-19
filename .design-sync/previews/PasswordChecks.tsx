import { PasswordChecks } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 20, maxWidth: 420 };

export const AllFailing = () => (
  <div style={wrap}>
    <PasswordChecks password="story" confirmPassword="" />
  </div>
);

export const PartiallyValid = () => (
  <div style={wrap}>
    <PasswordChecks password="Inkwell42" confirmPassword="Inkwell42" />
  </div>
);

export const OnlyMismatch = () => (
  <div style={wrap}>
    <PasswordChecks password="Inkwell42!" confirmPassword="Inkwell42?" />
  </div>
);
