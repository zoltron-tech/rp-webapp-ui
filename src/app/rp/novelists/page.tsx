"use client";
import { NovelistCarousel } from "@/components";
import { Novelist } from "@/types";
import { useEffect, useRef } from "react";

import { StoreProvider } from "@/context";
import { Logger } from "@/utils/services";

export default function NovelistsPage() {
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
  }, []);

  useEffect(() => {
    Logger.info("NovelistsPage rendered");
  });

  return (
    <StoreProvider<{ novelists: Novelist[] }> initial={{ novelists: [] }}>
      <NovelistCarousel />
    </StoreProvider>
  );
}
