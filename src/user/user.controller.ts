import { Controller, Get, Post, Req, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NoAuth } from "../decorators/no-auth.decorator";
import { Roles } from "../decorators/roles.decorator";
import { RoleEnum } from "./types/roles.enum";
import { UserService } from "./user.service";
import { OnboardingDto } from "./dto/onboarding.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async me(@Req() request) {
    return await this.userService.me(request?.user.id);
  }

  @Get("entrypoints")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async entrypoints(@Req() request) {
    return await this.userService.entrypoints(request?.user.id);
  }

  @Post("onboard")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async onboard(@Body() userData: OnboardingDto, @Req() request) {
    return await this.userService.onboard(request?.user.id, userData);
  }

  @Post("change-password")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async changePassword(
    @Body() passwordData: ChangePasswordDto,
    @Req() request
  ) {
    return await this.userService.changePassword(
      request?.user.id,
      passwordData
    );
  }

  @Post("all")
  @NoAuth()
  async all() {
    return await this.userService.testSend();
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
