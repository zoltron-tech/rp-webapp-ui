"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditMuseExtraAttributes = dynamic(
  () => import("@/components/edit-muse-extra-attributes"),
  { ssr: false },
);

export default function EditMuseExtraAttributesPage() {
  const id = useParams()?.id as string;
  const authState = useGlobalState("authState");
  const { routeToPage } = usePageRouter();

  useEffect(() => {
    if (authState === "LOGGED_OUT") {
      routeToPage(ROUTES.Login);
    }
  }, [authState]);

  return <DynamicEditMuseExtraAttributes museId={id} />;
}
