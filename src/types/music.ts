import type { Tag } from "./common";
import type { Friend } from "./novelist";

export interface Song {
  id: string;
  novelist: Friend;
  name: string;
  description: string | null;
  url: string;
  tags: Tag[];
}
