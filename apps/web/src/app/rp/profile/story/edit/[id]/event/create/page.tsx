"use client";

import { useRedirectWhenLoggedOut } from "@/hooks/use-auth-redirect";
import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditStoryboardEventForm = dynamic(
  () => import("@/components/edit-storyboard-event-card"),
  { ssr: false },
);

export default function CreateStoryBoardEventPage({}) {
  const storyboardId = useParams()?.id as string;
  useRedirectWhenLoggedOut(ROUTES.Novelists);

  return (
    <div>
      <DynamicEditStoryboardEventForm storyboardId={storyboardId} />
    </div>
  );
}
