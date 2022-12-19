import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { SocialsService } from "../socials/socials.service";

@Controller("auth/social")
export class SocialController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialsService: SocialsService
  ) {}

  @Get("google")
  async getGoogleUrl(
    @Query("redirect_uri") redirectUrl,
    @Res() response: FastifyReply
  ) {
    return this.socialsService.getGoogleAuthUrl(response, redirectUrl);
  }

  @Get("facebook")
  async getFacebookUrl(
    @Query("redirect_uri") redirectUrl,
    @Res() response: FastifyReply
  ) {
    return this.socialsService.getFacebookAuthUrl(response, redirectUrl);
  }

  @Get("google-response")
  async googleAuth(
    @Query("code") code,
    @Query("state") state,
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply
  ) {
    return await this.authService.googleAuth(code, state, request, response);
  }

  @Get("facebook-response")
  async facebookAuth(
    @Query("code") code,
    @Query("state") state,
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply
  ) {
    return await this.authService.facebookAuth(code, state, request, response);
  }
}
