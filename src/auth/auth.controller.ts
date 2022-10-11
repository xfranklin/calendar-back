import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { TokenDto } from "./dto/token.dto";
import { PasswordCreateDto } from "./dto/password-create.dto";
import { EmailDto } from "./dto/email.dto";

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
  async signUp(@Body() signUpData: SignUpDto, @Res() response: Response) {
    return await this.authService.signUp(signUpData, response);
  }

  /**
   * Sign In method
   *
   * @param loginData
   * @param response
   */
  @Post("login")
  async login(@Body() loginData: LoginDto, @Res() response: Response) {
    return await this.authService.login(loginData, response);
  }

  /**
   * Log Out method. Removes Refresh Token and access cookie
   *
   * @param request
   * @param response
   */
  @Post("logout")
  async logout(@Req() request: Request, @Res() response: Response) {
    return await this.authService.logout(request, response);
  }

  /**
   * Retrieve new refresh & access token if refresh token is valid
   *
   * @param request
   * @param response
   */
  @Get("refresh")
  async refresh(@Req() request: Request, @Res() response: Response) {
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
  async passwordForgot(@Body() _body: EmailDto) {
    return Promise.resolve();
  }

  @Post("password/create")
  async passwordCreate(@Body() body: PasswordCreateDto) {
    if (body) {
    }
  }
}
