"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const DynamicEditMuseSectionCard = dynamic(
  () => import("@/components/edit-muse-about-section"),
  {
    ssr: false,
  },
);

export default function EditMuseAboutSectionPage() {
  const id = useParams()?.id as string;
  const sectionId = useParams()?.sectionId as string;

  console.log("EditMuseAboutSectionPage params:", { id, sectionId });

  return <DynamicEditMuseSectionCard museId={id} sectionId={sectionId} />;
}
