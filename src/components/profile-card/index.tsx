"use client";
import type { Novelist } from "@nw/types";
import { type FC, useEffect, useState } from "react";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { Card } from "../common";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const { routeToPage } = usePageRouter();
  const [novelist, setNovelist] = useState<Novelist>();
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const user = useGlobalState("user");

  const fetchData = async () => {
    if (authState === "UNINITIALIZED") {
      routeToPage(ROUTES.Onboarding);
      return;
    }

    const fetchedNovelist = await getUserNovelist();

    if (!fetchedNovelist || "message" in fetchedNovelist) {
      setGlobalState({ authState: "UNINITIALIZED" });
      routeToPage(ROUTES.Onboarding);
      return;
    }

    setNovelist(fetchedNovelist);
  };

  useEffect(() => {
    if (authState !== "LOADING" && (!user || !novelist)) {
      fetchData();
    }
  }, [authState]);

  Logger.info("ProfileCard rendered");

  return <Card>Profile Card</Card>;
};
