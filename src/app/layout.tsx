"use client";

import { ContentContainer, TopBar } from "@/components";
import StyledComponentsRegistry from "./registry";
import { ThemeProvider, UIContextProvider } from "@/context";

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
					<UIContextProvider>
						<ThemeProvider>
							<TopBar />
							<ContentContainer>{children}</ContentContainer>
						</ThemeProvider>
					</UIContextProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
