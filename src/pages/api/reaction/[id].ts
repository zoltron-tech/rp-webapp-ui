import JWT from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

const validateJWT = (jwt: string) => {
  const decoded = JWT.decode(jwt, { complete: true });
  if (!decoded || typeof decoded.payload === "string" || !decoded.payload.exp) {
    return false;
  }
  const isValid = decoded.payload.exp * 1000 > Date.now();
  return isValid;
};

async function updateReaction(
  res: NextApiResponse,
  jwt: string,
  id: string,
  targetType: string,
) {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/react/${id}?targetType=${targetType}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "PATCH",
  });

  const result = await response.json();

  if (!response.ok) {
    return res
      .status(response.status)
      .json({ message: result.message || API_MESSAGE.Error });
  }

  return res.status(200).json({
    reacted: true,
    reactions: result.reactions || 0,
  });
}

async function deleteReaction(res: NextApiResponse, jwt: string, id: string) {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/react/${id}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  if (!response.ok) {
    return res
      .status(response.status)
      .json({ message: response.statusText || API_MESSAGE.Error });
  }
  const result = await response.json();

  return res.status(200).json({
    reacted: false,
    reactions: result.reactions || 0,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;
  const { id } = req.query;

  const jwt = req.cookies[AUTH_HEADER_NAME];
  if (!jwt || !validateJWT(jwt)) {
    return res.status(401).json({ error: API_MESSAGE.Unauthorized });
  }

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: API_MESSAGE.BadPayload });
  }

  switch (method) {
    case "PATCH": {
      const { targetType } = req.body;
      const allowedTargetTypes = ["PROMPT", "COMMENT", "REPLY", "MEDIA"];
      if (!allowedTargetTypes.includes(targetType)) {
        return res.status(400).json({
          error: `Invalid targetType: ${targetType}, allowed values: ${allowedTargetTypes.join(
            ", ",
          )}`,
        });
      }
      try {
        return updateReaction(res, jwt, id, targetType);
      } catch (_error) {
        return res.status(500).json({ error: "Failed to update reaction" });
      }
    }
    case "DELETE": {
      try {
        return deleteReaction(res, jwt, id);
      } catch (_error) {
        return res.status(500).json({ error: "Failed to delete reaction" });
      }
    }
    default:
      res.setHeader("Allow", ["PATCH", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
