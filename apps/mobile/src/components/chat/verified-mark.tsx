import { Ionicons } from "@expo/vector-icons";
import { SUPPORT_USERNAME } from "@nw/chat";
import { useAppTheme } from "@/theme";

/**
 * The tick beside a name in chat: web's `EmailVerifiedBadge`, or `AdminBadge`
 * for the Novelist World account.
 */
export const VerifiedMark = ({
  size = 14,
  username,
}: {
  size?: number;
  username?: string | null;
}) => {
  const theme = useAppTheme();
  const support = username === SUPPORT_USERNAME;
  return (
    <Ionicons
      accessibilityLabel={support ? "Novelist World team" : "Verified"}
      color={theme.accent.text}
      name={support ? "shield-checkmark" : "checkmark-circle"}
      size={support ? size + 2 : size}
    />
  );
};
