import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { TokenDto } from "./dto/token.dto";
import { PasswordCreateDto } from "./dto/password-create.dto";
import { EmailDto } from "./dto/email.dto";
import { RecaptchaGuard } from "../guards/recaptcha.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Sign Up method
   *
   * @param signUpData
   * @param response
   */
  @Post("signup")
  @UseGuards(RecaptchaGuard)
  async signUp(@Body() signUpData: SignUpDto, @Res() response: FastifyReply) {
    return await this.authService.signUp(signUpData, response);
  }

  /**
   * Sign In method
   *
   * @param loginData
   * @param response
   */
  @Post("login")
  @UseGuards(RecaptchaGuard)
  async login(@Body() loginData: LoginDto, @Res() response: FastifyReply) {
    return await this.authService.login(loginData, response);
  }

  /**
   * Log Out method. Removes Refresh Token and access cookie
   *
   * @param request
   * @param response
   */
  @Post("logout")
  async logout(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    return await this.authService.logout(request, response);
  }

  /**
   * Retrieve new refresh & access token if refresh token is valid
   *
   * @param request
   * @param response
   */
  @Get("refresh")
  async refresh(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    return await this.authService.refresh(request, response);
  }

  /**
   * Validate email using token from email
   *
   * @param body
   */
  @Post("validate-email")
  async validateEmail(@Body() body: TokenDto) {
    return await this.authService.validateEmail(body);
  }

  /**
   * Send email with link for creating new password
   *
   * @param body
   */
  @Post("password/forgot")
  async passwordForgot(@Body() body: EmailDto) {
    return this.authService.forgotPassword(body);
  }

  /**
   * Create password using token from email link
   *
   * @param body
   */
  @Post("password/forgot/create")
  async passwordCreate(@Body() body: PasswordCreateDto) {
    return this.authService.forgotPasswordCreate(body);
  }
}
