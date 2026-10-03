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
import "@nw/fonts/fonts.css";
import "@novelist-world/ui/dist/styles.css";

import { ApiProvider, createQueryClient } from "@nw/features";
import { setLogger } from "@nw/utils";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { api } from "./lib/api";
import { routes } from "./routes";
import { Logger } from "./utils/services";

// Shared packages log through a seam that is silent until an app fills it in.
// Registering here, before anything renders, keeps `@nw/utils` hooks logging
// exactly as they did when they lived in `src/hooks`.
setLogger(Logger);

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

const router = createBrowserRouter(routes);

/**
 * react-query and the API client the shared hooks in `@nw/features` read.
 *
 * The client is this app's — cookie-credentialed, no bearer token — and is
 * handed to the package rather than imported by it, which is what lets the
 * same hook run against the native client on mobile.
 */
const queryClient = createQueryClient();

createRoot(container).render(
  <StrictMode>
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <ApiProvider api={api}>
          <RouterProvider router={router} />
        </ApiProvider>
      </QueryClientProvider>
    </CookiesProvider>
  </StrictMode>,
);
