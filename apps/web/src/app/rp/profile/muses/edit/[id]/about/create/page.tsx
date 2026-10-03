"use client";

import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { getMuseAboutSectionsAction } from "@/app/rp/muse/actions";
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
  const [sectionCount, setSectionCount] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!id) return;
    getMuseAboutSectionsAction(id).then((sections) => {
      setSectionCount(Array.isArray(sections) ? sections.length : 0);
    });
  }, [id]);

  if (isMobile) {
    return (
      <DynamicFullPageEditMuseAboutSection
        museId={id}
        sectionCount={sectionCount}
      />
    );
  }

  return <EditMuseAboutSectionForm museId={id} sectionCount={sectionCount} />;
}
