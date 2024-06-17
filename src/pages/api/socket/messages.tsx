import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/socket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Auth sender
    // Check receiver
    // TODO: read messages from user.
  } catch (error) {
    console.log("MESSAGES_POST", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
