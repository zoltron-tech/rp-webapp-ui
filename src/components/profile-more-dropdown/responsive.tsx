"use client";

import { useWindowDimensions } from "@/hooks/use-window-dimentions";
import { AppDropdownMenu } from "./index";
import { AppDropdownMenuMobile } from "./mobile";

type Variant = "bordered" | "minimal";

interface DropdownItem {
  label?: string;
  onClick?: () => void;
  variant?: "default" | "positive" | "danger";
  separator?: boolean;
  icon?: React.ReactNode;
}

interface AppDropdownMenuResponsiveProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  showUnread?: boolean;
  variant?: Variant;
  headerContent?: React.ReactNode;
}

/**
 * Responsive dropdown menu that automatically switches between desktop and mobile variants
 * based on screen size. On mobile (< 801px), displays as a bottom sheet.
 * On desktop, displays as a traditional dropdown.
 */
export const AppDropdownMenuResponsive = (
  props: AppDropdownMenuResponsiveProps,
) => {
  const { width } = useWindowDimensions();
  const isMobile = width !== null && width < 801;

  if (isMobile) {
    return <AppDropdownMenuMobile {...props} />;
  }

  return <AppDropdownMenu {...props} />;
};
