import { PrivacyLevel } from "@/types";
import { AccessibleIcon } from "radix-ui";
import { FC } from "react";
import { FaGlobeAmericas, FaUserFriends } from "react-icons/fa";
import { SiPrivateinternetaccess } from "react-icons/si";

const PrivacyIconInner: FC<{ privacy: PrivacyLevel }> = ({ privacy }) => {
  switch (privacy) {
    case "FRIENDS":
      return (
        <FaUserFriends
          title="friends"
          className="privacy-icon privacy-icon-friends"
        />
      );
    case "PUBLIC":
      return (
        <FaGlobeAmericas
          title="public"
          className="privacy-icon privacy-icon-public"
        />
      );
    case "ONLY_ME":
    default:
      return (
        <SiPrivateinternetaccess
          title="only me"
          className="privacy-icon privacy-icon-private"
        />
      );
  }
};

export const PrivacyIcon: FC<{ privacy: PrivacyLevel }> = ({ privacy }) => {
  return (
    <AccessibleIcon.Root label="Privacy Level">
      <PrivacyIconInner privacy={privacy} />
    </AccessibleIcon.Root>
  );
};
