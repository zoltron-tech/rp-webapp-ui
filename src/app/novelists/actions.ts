"use server";

import { Novelist } from "@/types";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
export const getNovelists = async () => {
	const URL = `${serverRuntimeConfig.NOVELIST_API}/portfolio/getNovelist`;

	const response = await fetch(URL, { cache: "no-store" });
	const novelists: Novelist[] = await response.json();

	return novelists;
};
