import { TopBar } from "@/components";
import StyledComponentsRegistry from "./registry";
import "./globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html>
			<body>
				<StyledComponentsRegistry>
					<TopBar />
					<main>{children}</main>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
