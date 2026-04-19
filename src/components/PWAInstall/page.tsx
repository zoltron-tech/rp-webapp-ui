"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

export default function PWAInstallButton() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMobileOrTablet(
      /iphone|ipad|ipod|android|webos|blackberry|windows phone|opera mini|iemobile|mobile|tablet/i.test(
        userAgent,
      ),
    );
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

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

  if (isMobileOrTablet) {
    return (
      <S.PageContainer className={classNames([accent, theme])}>
        <S.MainHeading>Install Novelist World</S.MainHeading>
        <S.MainSubtext>
          To install this app on your iPhone or iPad:
          <ol style={{ margin: "1rem auto", maxWidth: 400, textAlign: "left" }}>
            <li>
              Tap <b>Share</b>{" "}
              <span role="img" aria-label="Share">
                &#x1f5d2;
              </span>{" "}
              in your browser's toolbar.
            </li>
            <li>
              Scroll down and tap <b>Add to Home Screen.</b>
            </li>
            <li>Follow the prompts to add the app.</li>
          </ol>
          <S.AccentText>Enjoy the best experience on iOS!</S.AccentText>
        </S.MainSubtext>
      </S.PageContainer>
    );
  }

  return (
    <S.PageContainer className={classNames([accent, theme])}>
      <S.MainHeading>Install Novelist World</S.MainHeading>
      <S.MainSubtext>
        Get the best experience by installing our app on your device.
      </S.MainSubtext>
      <S.Button onClick={handleInstall}>📱 Install App</S.Button>
    </S.PageContainer>
  );
}
