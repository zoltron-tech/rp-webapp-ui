"use client";

import classNames from "classnames";
import { Tooltip } from "radix-ui";
import { IoShieldCheckmark } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";

interface AdminBadgeProps {
  size?: number | null;
}

export function AdminBadge({ size }: AdminBadgeProps) {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span style={{ cursor: "default", display: "inline-flex" }}>
            <IoShieldCheckmark size={size ?? 18} color="var(--grass-9)" />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={4}
            className={classNames([accent, theme])}
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--bg-6)",
              borderRadius: "6px",
              color: "var(--text)",
              fontSize: "12px",
              padding: "4px 10px",
              userSelect: "none",
              zIndex: 9999,
            }}
          >
            Admin
            <Tooltip.Arrow style={{ fill: "var(--bg-6)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
