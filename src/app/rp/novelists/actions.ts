"use server";

import { authenticateAndGetJWT, logout } from "@/app/actions";
import { Novelist } from "@/types";
import { AUTH_HEADER_NAME } from "@/utils/constants";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getNovelists = async () => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/all`;

  const response = await fetch(URL, { cache: "no-store" });
  const novelists: Novelist[] = await response.json();

  return novelists;
};

export const getUserNovelist = async () => {
  const jwt = authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/novelist/`;

  const response = await fetch(URL, {
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  } else if (response.status !== 200) {
    logout();
  }

  const novelist: Novelist = await response.json();

  return novelist;
};
