"use client";

import { useRedirectWhenLoggedOut } from "@/hooks/use-auth-redirect";
import { dynamic } from "@/lib/dynamic";
import { ROUTES } from "@/utils/constants/routes";

const DynamicEditStoryboardForm = dynamic(
  () => import("@/components/edit-storyboard"),
  { ssr: false },
);

export default function CreateStoryBoardPage({}) {
  useRedirectWhenLoggedOut(ROUTES.Novelists);

  return (
    <div>
      <DynamicEditStoryboardForm />
    </div>
  );
}
