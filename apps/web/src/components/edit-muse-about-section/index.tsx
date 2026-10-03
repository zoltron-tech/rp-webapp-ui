"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { MuseAboutSection } from "@nw/types/novelist";
import { useEffect, useState } from "react";
import { getMuseAboutSectionAction } from "@/app/rp/muse/actions";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import EditMuseAboutSectionDataCard from "./edit-muse-about-section-data-card";
import * as S from "./styled";

export type EditMuseAboutSectionDataCardProps = {
  museId: string;
  sectionId?: string;
  sectionCount?: number;
};

export const EditMuseAboutSectionForm = ({
  sectionId,
  museId,
  sectionCount,
}: EditMuseAboutSectionDataCardProps) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const { stopPageLoading, baseDataLoader } = usePageRouter();
  const [sectionData, setSectionData] = useState<MuseAboutSection | null>(null);

  const fetchData = async () => {
    if (!sectionId || sectionId === "") {
      stopPageLoading();
      return;
    }

    const section = await baseDataLoader(() =>
      getMuseAboutSectionAction(sectionId),
    );

    if (section) {
      setSectionData(section);
    }
  };

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    fetchData();
  }, [authState]);

  return (
    <S.Container>
      <ShouldRender
        if={Boolean(
          novelist &&
            (sectionData || sectionId == null) &&
            (sectionId != null || sectionCount !== undefined),
        )}
      >
        <StoreProvider<MuseAboutSection>
          storeId="muse-about-section"
          initial={{
            id: sectionData?.id ?? null,
            image: sectionData?.image ?? null,
            ordinal:
              sectionData?.ordinal ??
              (sectionCount !== undefined ? sectionCount + 1 : 0),
            parentId: sectionData?.parentId ?? museId,
            text: sectionData?.text ?? null,
          }}
        >
          <EditMuseAboutSectionDataCard />
        </StoreProvider>
      </ShouldRender>
    </S.Container>
  );
};

export default EditMuseAboutSectionForm;
