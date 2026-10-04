import {
  verifyPasswordLength,
  verifyPasswordLowerCase,
  verifyPasswordNumber,
  verifyPasswordSpecialChar,
  verifyPasswordsMatch,
  verifyPasswordUpperCase,
} from "@nw/utils";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The six password rules, live.
 *
 * Same list, same order, same wording as `components/password-checks` on web —
 * and, more importantly, the same *functions*: every rule here is imported from
 * `@nw/utils`, so the two clients cannot come to disagree about what a valid
 * password is. That was one of the reasons `packages/utils` exists.
 *
 * Hidden until the user types, as on web.
 *
 * ## Only what is still wrong
 *
 * Web lists all six the whole time, ticking them off. That is six lines — some
 * ninety points — sitting between the fields and the button on the one screen
 * where the keyboard is always up, and five of them are saying "yes, still
 * fine" to a question nobody is asking any more.
 *
 * So a rule leaves the list once it passes, and when the last one goes the
 * block collapses to a single line of confirmation. The list is longest when
 * the password is worst and shortest at the moment the button lights up, which
 * is the moment the button most needs to be on screen. Nothing is hidden that
 * is still a problem.
 */
export const PasswordChecks = ({
  confirmPassword,
  password,
}: {
  confirmPassword: string;
  password: string;
}) => {
  const theme = useAppTheme();

  if (!password && !confirmPassword) return null;

  const rules = [
    {
      label: "Password must be at least 8 characters long.",
      valid: verifyPasswordLength(password),
    },
    {
      label: "Password must contain at least one uppercase letter.",
      valid: verifyPasswordUpperCase(password),
    },
    {
      label: "Password must contain at least one lowercase letter.",
      valid: verifyPasswordLowerCase(password),
    },
    {
      label: "Password must contain at least one number.",
      valid: verifyPasswordNumber(password),
    },
    {
      label: "Password must contain at least one special character.",
      valid: verifyPasswordSpecialChar(password),
    },
    {
      label: "Passwords must match.",
      valid: verifyPasswordsMatch(password, confirmPassword),
    },
  ];

  const unmet = rules.filter((rule) => !rule.valid);

  return (
    <View style={[styles.root, { backgroundColor: theme.cardBackgroundColor }]}>
      {unmet.length === 0 ? (
        <Text style={[styles.rule, { color: theme.success }]}>
          ✓ That password will do nicely.
        </Text>
      ) : (
        unmet.map((rule) => (
          <Text
            key={rule.label}
            style={[styles.rule, { color: theme.textGray }]}
          >
            • {rule.label}
          </Text>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  /*
   * Tight on purpose. Even shortened to the unmet rules this is a block dropped
   * into the middle of a form, and it appears the moment someone starts typing
   * — exactly when the fields below it still need to be reachable. The wording
   * stays byte-for-byte web's; only the leading does.
   */
  root: { borderRadius: radius.md, gap: 1, padding: space.s },
  rule: { fontSize: fontSize.meta, lineHeight: 15 },
});
