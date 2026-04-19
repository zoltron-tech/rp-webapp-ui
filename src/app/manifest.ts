// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#ffffff",
    description: "For writers, by writers.",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icons/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "384x384",
        src: "/icons/android-chrome-384x384.png",
        type: "image/png",
      },
      {
        sizes: "180x180",
        src: "/icons/apple-touch-icon.png",
        type: "image/png",
      },
      {
        sizes: "32x32",
        src: "/icons/favicon-32x32.png",
        type: "image/png",
      },
      {
        sizes: "16x16",
        src: "/icons/favicon-16x16.png",
        type: "image/png",
      },
    ],
    lang: "en",
    name: "Novelist World",
    orientation: "portrait-primary",
    scope: "/",
    short_name: "Novelist",
    start_url: "/",
    theme_color: "#1b5745",
    // Comment out screenshots for now to test
    // screenshots: [
    //   {
    //     form_factor: "narrow",
    //     label: "Home screen on mobile",
    //     sizes: "1080x1920",
    //     src: "/screenshots/mobile-home.png",
    //     type: "image/png",
    //   },
    //   {
    //     form_factor: "narrow",
    //     label: "Writing interface",
    //     sizes: "1080x1920",
    //     src: "/screenshots/mobile-writer.png",
    //     type: "image/png",
    //   },
    //   {
    //     form_factor: "wide",
    //     label: "Home screen on desktop",
    //     sizes: "1920x1080",
    //     src: "/screenshots/desktop-home.png",
    //     type: "image/png",
    //   },
    // ],
  };
}
