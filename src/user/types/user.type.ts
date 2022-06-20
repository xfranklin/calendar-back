import { RoleEnum } from "./roles.enum";

export type UserType = {
  _id?: string;
  email?: string;
  role?: RoleEnum;
  isVerified?: boolean;
  isOnboarded?: boolean;
  firstName?: string;
  lastName?: string;
  birthday?: Date;
  entrypoints?: any[];
};
