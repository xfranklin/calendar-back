import { User } from "../entities/user.entity";

export const getUser = (user: User): Omit<User, "entrypoints"> => {
  if (user) {
    const { entrypoints: _, ...userData } = user;
    return userData;
  }
  return null;
};
