"use client";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DynamicMessengerCard = dynamic(
  () => import("@/components/messenger-card"),
  { ssr: false }
);

export default function MessengerPage({}) {
  const { state } = useAuthContext();
  const { push } = useRouter();

  useEffect(() => {
    Logger.debug("MessengerPage", state);
    if (state === "LOGGED_OUT") {
      Logger.debug("pushing to home");
      push("/rp/novelists");
    }
  }, [state]);

  return (
    <div>
      <DynamicMessengerCard />
    </div>
  );
}
