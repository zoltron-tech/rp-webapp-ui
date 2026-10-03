import {
  cloneElement,
  type FC,
  isValidElement,
  type ReactElement,
} from "react";
import { useVisibilityContext } from "@/context";

export interface Clickable {
  onClick?: () => void;
}

export interface VisibilityTriggerProps {
  children: ReactElement<Clickable>;
}

export const VisibilityTrigger: FC<VisibilityTriggerProps> = ({
  children,
}: VisibilityTriggerProps) => {
  const { toggleVisibility } = useVisibilityContext();

  const clonned = isValidElement(children)
    ? cloneElement<Clickable>(children, { onClick: toggleVisibility })
    : children;

  return <>{clonned}</>;
};
