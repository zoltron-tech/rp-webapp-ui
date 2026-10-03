import type { ApiClient } from "@nw/api";
import type { ReactNode } from "react";
import { createContext, createElement, useContext } from "react";

/**
 * How a screen hook gets an API client without knowing which app it is in.
 *
 * The two clients differ in exactly the ways that matter: the web one sends
 * httpOnly cookies (`credentials: "include"`, `getToken` returning nothing),
 * and the native one attaches a bearer token out of SecureStore. Both are
 * `createApiClient` from `@nw/api`, built at the app root and handed down here.
 *
 * A hook importing the app's client singleton directly would tie this package
 * to one app — which `check:boundaries` forbids, and rightly.
 */
const ApiContext = createContext<ApiClient | null>(null);

export const ApiProvider = ({
  api,
  children,
}: {
  api: ApiClient;
  children: ReactNode;
}) => createElement(ApiContext.Provider, { value: api }, children);

export const useApi = (): ApiClient => {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error("useApi must be used within an <ApiProvider>");
  }
  return api;
};
