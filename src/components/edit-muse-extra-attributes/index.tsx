"use client";

import { useEffect, useState } from "react";
import { getMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import EditMuseExtraAttributesDataCard from "./edit-muse-extra-attributes-data-card";
import * as S from "./styled";

export type EditMuseExtraAttributesFormProps = {
  museId: string;
};

export const EditMuseExtraAttributesForm = ({
  museId,
}: EditMuseExtraAttributesFormProps) => {
  const authState = useGlobalState("authState");
  const { stopPageLoading, baseDataLoader } = usePageRouter();
  const [muse, setMuse] = useState<Muse | null>(null);

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    const fetchData = async () => {
      const result = await baseDataLoader(() => getMuseAction(museId));
      if (result) {
        setMuse(result);
      }
      stopPageLoading();
    };

    fetchData();
  }, [authState]);

  if (!muse) return null;

  return (
    <S.Container>
      <EditMuseExtraAttributesDataCard museId={museId} muse={muse} />
    </S.Container>
  );
};

export default EditMuseExtraAttributesForm;
