"use client";

import { useRedirectWhenLoggedOut } from "@/hooks/use-auth-redirect";
import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditMuseCard = dynamic(() => import("@/components/edit-muse"), {
  ssr: false,
});

export default function EditMusePage({}) {
  const id = useParams()?.id as string;
  useRedirectWhenLoggedOut(ROUTES.Novelists);

  return (
    <div>
      <DynamicEditMuseCard id={id} />
    </div>
  );
}
