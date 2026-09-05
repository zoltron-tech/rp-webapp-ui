"use client";

import { useRedirectWhenLoggedOut } from "@/hooks/use-auth-redirect";
import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditMusicCard = dynamic(() => import("@/components/edit-music"), {
  ssr: false,
});

export default function CreateMusicPage({}) {
  const _id = useParams()?.id as string;
  useRedirectWhenLoggedOut(ROUTES.Novelists);

  return (
    <div>
      <DynamicEditMusicCard />
    </div>
  );
}
