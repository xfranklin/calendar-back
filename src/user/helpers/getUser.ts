import { UserType } from "../types/user.type";

export const getUser = (user: UserType) => {
  if (user) {
    const { entrypoints, ...userData } = user;
    return userData;
  }
  return null;
};