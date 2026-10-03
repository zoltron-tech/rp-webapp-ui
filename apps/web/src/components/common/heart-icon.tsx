import classNames from "classnames";
import { AccessibleIcon } from "radix-ui";
import type { FC, HTMLProps } from "react";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";

type LikeIconProps = HTMLProps<SVGSVGElement> & {
  filled?: boolean;
};

const HeartIconInner: FC<LikeIconProps> = ({ filled }) => {
  const Icon = filled ? IoMdHeart : IoMdHeartEmpty;

  return (
    <Icon
      className={classNames("heart-icon", {
        "heart-icon-empty": !filled,
        "heart-icon-filled": filled,
      })}
      title={filled ? "Filled Heart" : "Empty Heart"}
      aria-label={filled ? "Filled Heart" : "Empty Heart"}
    />
  );
};

export const HeartIcon: FC<LikeIconProps> = ({ filled = false, ...rest }) => {
  return (
    <AccessibleIcon.Root label="Heart Icon">
      <HeartIconInner filled={filled} {...rest} />
    </AccessibleIcon.Root>
  );
};
