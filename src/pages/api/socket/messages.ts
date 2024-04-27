import { getUser } from "@/app/actions";
import { NextApiResponseServerIO } from "@/types/socket";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const user = await getUser();

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
