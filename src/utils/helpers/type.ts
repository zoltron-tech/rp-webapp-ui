import { User } from "@/types";
import { None, Tagged, TypeValidator } from "@/types/common";
import { NONE } from "../constants";
import { Logger } from "../services";

export const isNone = (value: Tagged): value is None => value._tag === "None";

export const isUser = (value: Tagged): value is User => value._tag === "User";

export const validateUser: TypeValidator<User> = (value: any) => {
  Logger.info("validateUser", value);
  if (!value) return NONE;

  if (isUser(value)) {
    return value;
  }

  if (!value.username || !value.email) return NONE;

  if (typeof value.username !== "string" || typeof value.email !== "string")
    return NONE;

  return {
    _tag: "User",
    username: value.username,
    email: value.email,
  };
};
