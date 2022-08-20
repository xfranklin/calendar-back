import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NoAuth } from "../decorators/no-auth.decorator";
import { Roles } from "../decorators/roles.decorator";
import { RoleEnum } from "./types/roles.enum";
import { UserService } from "./user.service";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  me(@Req() request) {
    return this.userService.me(request?.user.id);
  }

  @Post("all")
  @NoAuth()
  all() {
    return { message: "all" };
  }

  @Post("user")
  @Roles(RoleEnum.USER)
  user() {
    return { message: "user" };
  }

  @Post("pro")
  @Roles(RoleEnum.PRO_USER)
  plus() {
    return { message: "pro" };
  }
}
