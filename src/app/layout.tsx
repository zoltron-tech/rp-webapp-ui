import StyledComponentsRegistry from "./registry";

import "toastify-js/src/toastify.css";
import "./globals.css";
import "@novelist-world/ui/dist/styles.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
