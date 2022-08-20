import { Controller, Post, Get, Body, Query, Res, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import { Response, Request } from "express";
import { LoginDto } from "./dto/login.dto";
import { SocialsService } from "../socials/socials.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialsService: SocialsService,
  ) {}

  @Post("signup")
  async signUp(@Body() signUpData: SignUpDto, @Res() response: Response) {
    return await this.authService.signUp(signUpData, response);
  }

  @Post("login")
  async login(@Body() loginData: LoginDto, @Res() response: Response) {
    return await this.authService.login(loginData, response);
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res() response: Response) {
    return await this.authService.logout(request, response);
  }

  @Get("refresh")
  async refresh(@Req() request: Request, @Res() response: Response) {
    return await this.authService.refresh(request, response);
  }

  @Get("social/google")
  async getGoogleUrl(
    @Query("redirect_uri") redirectUrl,
    @Res() response: Response,
  ) {
    return this.socialsService.getGoogleAuthUrl(response, redirectUrl);
  }

  @Get("social/facebook")
  async getFacebookUrl(
    @Query("redirect_uri") redirectUrl,
    @Res() response: Response,
  ) {
    return this.socialsService.getFacebookAuthUrl(response, redirectUrl);
  }

  @Get("social/google-response")
  async googleAuth(
    @Query("code") code,
    @Query("state") state,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return await this.authService.googleAuth(code, state, request, response);
  }

  @Get("social/facebook-response")
  async facebookAuth(
    @Query("code") code,
    @Query("state") state,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return await this.authService.facebookAuth(code, state, request, response);
  }
}
