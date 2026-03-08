"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useGlobalState } from "@/context/store/stores";

const DynamicEditMuseSectionCard = dynamic(
  () => import("@/components/edit-muse-about-section"),
  {
    ssr: false,
  },
);

export default function MuseAboutListSectionsPage() {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");

  return <DynamicEditMuseSectionCard museId={id} />;
}
