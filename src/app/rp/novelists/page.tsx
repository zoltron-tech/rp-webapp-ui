"use client";

import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const NovelistCarouselDynamic = dynamic(
  () => import("@/components/novelist-carousel"),
  { ssr: false }
);

export default function NovelistsPage() {
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
  }, []);

  Logger.info("NovelistsPage rendered");

  return (
    <>
      <NovelistCarouselDynamic />
    </>
  );
}
