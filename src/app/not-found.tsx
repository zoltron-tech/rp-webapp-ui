import { redirect } from "next/navigation";
import { ROUTES } from "@/utils/constants/routes";

export default function Page404() {
  redirect(ROUTES.Novelists);
}
