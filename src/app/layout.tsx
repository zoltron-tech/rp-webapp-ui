import StyledComponentsRegistry from "./registry";
import { Toaster } from "react-hot-toast";

import "./globals.css";
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html>
			<body>
				<StyledComponentsRegistry>{children}</StyledComponentsRegistry>
				<Toaster />
			</body>
		</html>
	);
}
