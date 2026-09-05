"use client";

import { useRedirectWhenLoggedOut } from "@/hooks/use-auth-redirect";
import { dynamic } from "@/lib/dynamic";
import { useParams } from "@/lib/navigation";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditStoryboardForm = dynamic(
  () => import("@/components/edit-storyboard"),
  { ssr: false },
);

export default function EditStoryBoardPage({}) {
  const id = useParams()?.id as string;
  useRedirectWhenLoggedOut(ROUTES.Novelists);

  return (
    <div>
      <DynamicEditStoryboardForm id={id} />
    </div>
  );
}
