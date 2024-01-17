"use server";

import { Novelist } from "@/types";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL, RP_NOVELIST_PORT } = serverRuntimeConfig;
export const getNovelists = async () => {
	const URL = `${RP_SERVICE_URL}:${RP_NOVELIST_PORT}/portfolio/getNovelist`;

	const response = await fetch(URL, { cache: "no-store" });
	const novelists: Novelist[] = await response.json();

	return novelists;
};
