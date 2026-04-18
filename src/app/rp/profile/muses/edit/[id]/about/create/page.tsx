"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { EditMuseAboutSectionForm } from "@/components/edit-muse-about-section";
import { useWindowDimensions } from "@/hooks/use-window-dimentions";

const DynamicFullPageEditMuseAboutSection = dynamic(
  () =>
    import(
      "@/components/edit-muse-about-section/full-page-edit-muse-about-section"
    ),
  {
    ssr: false,
  },
);

export default function MuseAboutListSectionsPage() {
  const id = useParams()?.id as string;
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;

  if (isMobile) {
    return <DynamicFullPageEditMuseAboutSection museId={id} />;
  }

  return <EditMuseAboutSectionForm museId={id} />;
}
