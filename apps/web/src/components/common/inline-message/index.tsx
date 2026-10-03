"use client";

import type { ReactNode } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import styled from "styled-components";

export type InlineMessageVariant = "success" | "error" | "info" | "warning";

const Root = styled.div<{ $variant: InlineMessageVariant }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: var(--font-size-small);
  line-height: 1.5;

  ${({ $variant }) => {
    switch ($variant) {
      case "success":
        return `
          background: color-mix(in srgb, var(--grass-9) 10%, transparent);
          border: 1px solid var(--grass-9);
          color: var(--grass-12, var(--text));
        `;
      case "error":
        return `
          background: color-mix(in srgb, var(--tomato-9) 10%, transparent);
          border: 1px solid var(--tomato-9);
          color: var(--tomato-12, var(--text));
        `;
      case "info":
        return `
          background: color-mix(in srgb, var(--blue-9) 10%, transparent);
          border: 1px solid var(--blue-9);
          color: var(--blue-12, var(--text));
        `;
      case "warning":
        return `
          background: color-mix(in srgb, var(--amber-9) 10%, transparent);
          border: 1px solid var(--amber-9);
          color: var(--amber-12, var(--text));
        `;
    }
  }}

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-top: 2px;
  }

  p {
    margin: 0;
  }
`;

type Props = {
  variant: InlineMessageVariant;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const InlineMessage = ({
  variant,
  children,
  className,
  style,
}: Props) => (
  <Root $variant={variant} className={className} style={style}>
    <IoIosInformationCircleOutline />
    {children}
  </Root>
);
