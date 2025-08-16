import {
  createGetFunction,
  useStoreSet,
  useStoreState,
} from "@/context/store/use-store";
import type { Comment as CommentType } from "@/types";

type CommentStoreKey = keyof CommentType;

export const useCommentState = <K extends CommentStoreKey>(key: K) => {
  const getFunction = createGetFunction<CommentType, K>(key);
  return useStoreState<CommentType, K>("comment", getFunction);
};

export const useCommentStateSet = () => {
  return useStoreSet<CommentType>("comment");
};
