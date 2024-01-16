import { redirect } from "next/navigation";

export default function Page404() {
	redirect("/");

	return <div>404 Page.</div>;
}
