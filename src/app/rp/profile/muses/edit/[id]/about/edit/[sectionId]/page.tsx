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

export default function EditMuseAboutSectionPage() {
  const id = useParams()?.id as string;
  const sectionId = useParams()?.sectionId as string;
  const { width } = useWindowDimensions();
  const isMobile = (width ?? 0) <= 800;

  if (isMobile) {
    return (
      <DynamicFullPageEditMuseAboutSection museId={id} sectionId={sectionId} />
    );
  }

  return <EditMuseAboutSectionForm museId={id} sectionId={sectionId} />;
}
