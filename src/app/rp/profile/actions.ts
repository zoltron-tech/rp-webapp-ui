"use server";

import { authenticateAndGetJWT } from "@/app/actions";
import { WithMessage } from "@/types/common";
import { Logger } from "@/utils/services";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const uploadAvatar = async (formData: FormData) => {
  const _jwt = authenticateAndGetJWT();

  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/upload`;

  const file = formData.get("file");

  Logger.log("file", file);

  const response = await fetch(URL, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (response.status !== 200) {
    Logger.log("error", response.status, response.statusText);
    return { message: "Error uploading avatar" };
  }

  const result: WithMessage = await response.json();

  return result.message;
};

export const deleteAvatar = async (filename: string) => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/s3/delete/${filename}`;

  Logger.log("deleteAvatar", filename);
  const response = await fetch(URL, {
    method: "DELETE",
    cache: "no-store",
  });

  Logger.log("deleteAvatar: response", response);

  if (response.status !== 200) {
    return { message: "Error deleting avatar" };
  }

  const result = await response.json();

  return result;
};
