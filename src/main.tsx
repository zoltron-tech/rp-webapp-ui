/**
 * SPA entry point — replaces Next's root layout.
 *
 * The root layout's `<html>`, `<body>`, and `StyledComponentsRegistry` are
 * gone: index.html owns the document shell, and there is no SSR to register
 * styles for. Its `metadata` export moved into index.html as static tags.
 *
 * See REACT_MIGRATION_STEPS.md B1/B3.
 */

// These three are side-effect CSS imports and their ORDER IS MEANINGFUL —
// it is the order the root layout used. globals.css overrides toastify, and
// the design-system sheet lands last.
import "toastify-js/src/toastify.css";
import "./app/globals.css";
import "@novelist-world/ui/dist/styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CookiesProvider } from "react-cookie";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

const router = createBrowserRouter(routes);

createRoot(container).render(
  <StrictMode>
    <CookiesProvider>
      <RouterProvider router={router} />
    </CookiesProvider>
  </StrictMode>,
);
