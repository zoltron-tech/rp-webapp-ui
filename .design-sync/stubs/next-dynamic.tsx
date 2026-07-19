// Browser-preview stub for next/dynamic — resolves the import eagerly via
// React.lazy; ssr flag ignored (previews are client-only).
import React from "react";

type Loader = () => Promise<{ default: React.ComponentType<unknown> } | React.ComponentType<unknown>>;

export default function dynamic(loader: Loader, _opts?: { ssr?: boolean; loading?: React.ComponentType }) {
  const Lazy = React.lazy(() =>
    Promise.resolve(loader()).then((m) => ("default" in (m as object) ? (m as { default: React.ComponentType<unknown> }) : { default: m as React.ComponentType<unknown> })),
  );
  return function DynamicStub(props: Record<string, unknown>) {
    return (
      <React.Suspense fallback={null}>
        <Lazy {...props} />
      </React.Suspense>
    );
  };
}
