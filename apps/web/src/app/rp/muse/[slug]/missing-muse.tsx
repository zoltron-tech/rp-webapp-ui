"use client";

import { VanishedMuseArt } from "@/components/book-art";
import { MissingPage } from "@/components/deleted-content/missing-page";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";

/**
 * The page for a character that is not there — deleted, or never was.
 *
 * It stands where the muse card would have stood: in the middle of the
 * screen, at about the card's size, so the page reads as "this is the
 * character's page and the character is gone" rather than as a small notice
 * at the top of an empty one.
 */
export const MissingMuse = () => {
  const { routeToPage } = usePageRouter();

  return (
    <MissingPage
      art={<VanishedMuseArt />}
      title="Plot twist: this character got written out"
      message="No farewell scene, no dramatic last words. Just an empty card and one very suspicious novelist holding an eraser."
      aside="(Or the link is wrong. We checked under the bookshelf too.)"
      actionLabel="Meet characters who still exist"
      onAction={() => routeToPage(ROUTES.explore)}
    />
  );
};
