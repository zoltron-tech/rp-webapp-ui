import { redirect } from "next/navigation";
import { ROUTES } from "@/utils/constants/routes";

export default function Home() {
  redirect(ROUTES.Novelists);
}
