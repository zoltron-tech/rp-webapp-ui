"use client";

import { TopBar } from "@/components";
import StyledComponentsRegistry from "./registry";
import { ThemeProvider } from "@/context";

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
					<ThemeProvider>
						<TopBar />
						<main>{children}</main>
					</ThemeProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
