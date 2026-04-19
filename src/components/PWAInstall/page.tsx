"use client";

import { useEffect, useState } from "react";
import * as S from "./styled";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // setShowButton(false);
      console.log("App installed successfully");
    }
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <S.PageContainer>
      <S.MainHeading>Install Novelist World</S.MainHeading>
      <S.MainSubtext>
        Get the best experience by installing our app on your device.
      </S.MainSubtext>
      <S.Button onClick={handleInstall}>📱 Install App</S.Button>
    </S.PageContainer>
  );
}
