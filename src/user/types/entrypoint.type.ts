import { EntrypointEnum } from "./entrypoints.enum";

export type EntrypointType = {
  _id?: string;
  type?: EntrypointEnum;
  email?: string;
  password?: string;
  clientId?: string;
};
