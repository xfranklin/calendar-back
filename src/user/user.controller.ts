import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { NoAuth } from "../decorators/no-auth.decorator";
import { Roles } from "../decorators/roles.decorator";
import { RoleEnum } from "./types/roles.enum";
import { UserService } from "./user.service";
import { PersonalInfoDto } from "./dto/personalInfo.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";
import { UserDecorator } from "../decorators/user.decorator";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async me(@UserDecorator("id") userId: string) {
    return await this.userService.me(userId);
  }

  @Get("entrypoints")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async entrypoints(@UserDecorator("id") userId: string) {
    return await this.userService.entrypoints(userId);
  }

  @Post("onboard")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async onboard(
    @Body() userData: PersonalInfoDto,
    @UserDecorator("id") userId: string
  ) {
    return await this.userService.onboard(userId, userData);
  }

  @Post("update-personal-info")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async updatePersonalInfo(
    @Body() userData: PersonalInfoDto,
    @UserDecorator("id") userId: string
  ) {
    return await this.userService.updatePersonalInfo(userId, userData);
  }

  @Post("change-password")
  @Roles(RoleEnum.USER, RoleEnum.PRO_USER)
  async changePassword(
    @Body() passwordData: ChangePasswordDto,
    @UserDecorator("id") userId: string
  ) {
    return await this.userService.changePassword(userId, passwordData);
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
