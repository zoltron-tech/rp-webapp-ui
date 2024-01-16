import { redirect } from "next/navigation";

export default function Home() {
	redirect("/rp/novelists");

	return <div>Home Page.</div>;
}
