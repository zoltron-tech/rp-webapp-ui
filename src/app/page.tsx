import { redirect } from "next/navigation";
import { getAuthCookie } from "@/app/actions";
import { ROUTES } from "@/utils/constants/routes";

export default async function Home() {
  const jwt = await getAuthCookie();
  if (jwt) {
    redirect(ROUTES.Profile.Index);
  }
  redirect(ROUTES.Novelists);
}
