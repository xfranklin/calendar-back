import { UserType } from "../types/user.type";

export const getUser = (user: UserType) => {
  if (user) {
    const { entrypoints: _, ...userData } = user;
    return userData;
  }
  return null;
};
