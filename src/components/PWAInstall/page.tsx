"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import { BsPlusSquare } from "react-icons/bs";
import { IoShareOutline } from "react-icons/io5";
import { useGlobalState } from "@/context/store/stores";
import * as S from "./styled";

export default function PWAInstallButton() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const check = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobileUA =
        /iphone|ipad|ipod|android|webos|blackberry|windows phone|opera mini|iemobile|mobile|tablet/i.test(
          userAgent,
        );
      const isMobileWidth = window.innerWidth <= 1024;
      setIsMobileOrTablet(isMobileUA || isMobileWidth);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("App installed successfully");
    }
    setDeferredPrompt(null);
  };

  if (!isMobileOrTablet) {
    return (
      <S.PageContainer className={classNames([accent, theme])}>
        <S.MainHeading>Novelist World as an App</S.MainHeading>
        <S.MainSubtext>
          To install this app on your device, follow these steps:
          <ol style={{ margin: "1rem auto", maxWidth: 400, textAlign: "left" }}>
            <li>
              Tap{" "}
              <b>
                Share <IoShareOutline />
              </b>{" "}
              in your browser's toolbar.
            </li>
            <li>
              Scroll down and tap{" "}
              <b>
                Add to Home Screen <BsPlusSquare />
              </b>
              .
            </li>
            <li>Follow the prompts to add the app.</li>
          </ol>
          {/* <S.AccentText>Enjoy the best experience on iOS!</S.AccentText> */}
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
