import {
  cloneElement,
  type FC,
  isValidElement,
  type ReactElement,
} from "react";
import { useVisibilityContext } from "@/context";
import { Logger } from "@/utils/services";

export interface Hideable {
  isVisible: boolean;
}

export interface VisibilityContentProps {
  children: ReactElement<Hideable>;
}

export const VisibilityContent: FC<VisibilityContentProps> = ({
  children,
}: VisibilityContentProps) => {
  const { isVisible } = useVisibilityContext();

  const clonned = isValidElement(children)
    ? cloneElement<Hideable>(children, { isVisible })
    : children;

  Logger.info("VisibilityContent rendered");

  return <>{clonned}</>;
};
