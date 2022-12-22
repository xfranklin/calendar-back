import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type UserData = { role; id; email };

export const UserDecorator = createParamDecorator(
  (data: keyof UserData, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log("request.user", request.user);
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
