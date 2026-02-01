"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { getNovelistByIdAction } from "../../novelists/actions";

export default function ProfilePage({}) {
  const params = useParams();
  const novelistId = params?.slug as string;
  const { baseDataLoader } = usePageRouter();

  const fetchNovelist = async (novelistId: string) => {
    const _novelist = await baseDataLoader(() =>
      getNovelistByIdAction(novelistId),
    );
    window.location.assign(
      ROUTES.Profile.View(_novelist?.username || "").Index,
    );
  };

  useEffect(() => {
    Logger.debug("ProfilePage");
    fetchNovelist(novelistId);
  }, []);
}
