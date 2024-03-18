"use client";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicEditMuseCard = dynamic(
  () => import("@/components/edit-muse-card"),
  { ssr: false }
);

export default function EditMusePage({}) {
  const id = useParams().id as string;
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("EditMusePage", state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  return (
    <div>
      <DynamicEditMuseCard id={id} />
    </div>
  );
}
