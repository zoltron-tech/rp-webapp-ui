import type { Comment as CommentType } from "@nw/types";
import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";

export type CommentStoreType = CommentType & {
  commentAlert: "report" | "delete" | null;
};

type CommentStoreKey = keyof CommentStoreType;

export const useCommentState = <K extends CommentStoreKey>(key: K) => {
  const getFunction = createGetFunction<CommentStoreType, K>(key);
  return useStoreState<CommentStoreType, K>("comment", getFunction);
};

export const useCommentStateSet = () => {
  return useStoreSet<CommentStoreType>("comment");
};
