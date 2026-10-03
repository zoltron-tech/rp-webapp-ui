"use client";

import classNames from "classnames";
import { Tooltip } from "radix-ui";
import { FaCheckCircle } from "react-icons/fa";
import { useGlobalState } from "@/context/store/stores";

interface EmailVerifiedBadgeProps {
  size?: number | null;
}

export function EmailVerifiedBadge({ size }: EmailVerifiedBadgeProps) {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span style={{ cursor: "default", display: "inline-flex" }}>
            <FaCheckCircle size={size ?? 18} color="var(--grass-9)" />
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
            Email is verified
            <Tooltip.Arrow style={{ fill: "var(--bg-6)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
