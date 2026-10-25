"use client";

import { useState } from "react";
import { AboutSection } from "./about-section";
import { AccountSection } from "./account-section";
import { AppearanceSection } from "./appearance-section";
import { LandingSection } from "./landing-section";
import { PrivacySection } from "./privacy-section";
import * as S from "./styled";

type View = "landing" | "appearance" | "about" | "account" | "privacy";

export default function EditDataCard() {
  const [view, setView] = useState<View>("landing");

  const back = () => setView("landing");

  return (
    <S.Card>
      {view === "landing" && <LandingSection onSelect={setView} />}
      {view === "appearance" && <AppearanceSection onBack={back} />}
      {view === "about" && <AboutSection onBack={back} />}
      {view === "account" && <AccountSection onBack={back} />}
      {view === "privacy" && <PrivacySection onBack={back} />}
    </S.Card>
  );
}
