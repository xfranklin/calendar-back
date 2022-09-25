import { HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom, map } from "rxjs";
import { GoogleOauthResponseType } from "./types/google-oauth-response.type";
import { Response } from "express";

@Injectable()
export class SocialsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  // ╔═╗╔═╗╔═╗╔═╗╦  ╔═╗  ╔═╗╦ ╦╔╦╗╦ ╦
  // ║ ╦║ ║║ ║║ ╦║  ║╣   ╠═╣║ ║ ║ ╠═╣
  // ╚═╝╚═╝╚═╝╚═╝╩═╝╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩
  getGoogleAuthUrl(response: Response, redirectUrl: string) {
    const CLIENT_ID = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const REDIRECT_URL = `${redirectUrl}/api/auth/social/google-response`;
    const RANDOM_STRING = Math.random().toString(36).substring(2, 15);
    const STATE = Buffer.from(
      JSON.stringify({ random: RANDOM_STRING, redirect_uri: redirectUrl })
    ).toString("base64");
    const SCOPE = [
      "profile",
      "email",
      "https://www.googleapis.com/auth/user.birthday.read"
    ].join("+");

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=code&scope=${SCOPE}&state=${STATE}`;
    response
      .cookie("GOOGLE_STATE", STATE, {
        httpOnly: true
      })
      .status(HttpStatus.OK)
      .json({ url });
  }

  async getGoogleTokens(code, redirectUrl): Promise<GoogleOauthResponseType> {
    const CLIENT_ID = this.configService.get<string>("GOOGLE_CLIENT_ID");
    const SECRET_KEY = this.configService.get<string>("GOOGLE_CLIENT_SECRET");
    const REDIRECT_URL = `${redirectUrl}/api/auth/social/google-response`;
    const url = `https://oauth2.googleapis.com/token`;
    const body = {
      code,
      client_id: CLIENT_ID,
      client_secret: SECRET_KEY,
      redirect_uri: REDIRECT_URL,
      grant_type: "authorization_code"
    };
    const response: GoogleOauthResponseType = await lastValueFrom(
      this.httpService.post(url, body).pipe(map((resp) => resp.data))
    );
    return response;
  }

  async getGoogleUserBirthday(token: string): Promise<any> {
    const url = `https://people.googleapis.com/v1/people/me?personFields=birthdays&access_token=${token}`;
    const { birthdays } = await lastValueFrom(
      this.httpService.get(url).pipe(map((resp) => resp.data))
    );
    const { date } = birthdays?.find(
      ({ metadata }) => metadata?.source?.type === "ACCOUNT"
    );
    if (date) {
      const { year, month, day } = date;
      if (year && month && day) {
        return new Date(year, month - 1, day);
      }
    }
    return null;
  }

  async getGoogleUserInfo(access_token: string): Promise<any> {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo`;
    const response = await lastValueFrom(
      this.httpService
        .get(url, { headers: { Authorization: `Bearer ${access_token}` } })
        .pipe(map((resp) => resp.data))
    );
    return response;
  }

  // ╔═╗╔═╗╔═╗╔═╗╔╗ ╔═╗╔═╗╦╔═  ╔═╗╦ ╦╔╦╗╦ ╦
  // ╠╣ ╠═╣║  ║╣ ╠╩╗║ ║║ ║╠╩╗  ╠═╣║ ║ ║ ╠═╣
  // ╚  ╩ ╩╚═╝╚═╝╚═╝╚═╝╚═╝╩ ╩  ╩ ╩╚═╝ ╩ ╩ ╩
  async getFacebookAuthUrl(response: Response, redirectUrl: string) {
    const CLIENT_ID = this.configService.get<string>("FACEBOOK_CLIENT_ID");
    const REDIRECT_URL = `${redirectUrl}/api/auth/social/facebook-response`;
    const RANDOM_STRING = Math.random().toString(36).substring(2, 15);
    const STATE = Buffer.from(
      JSON.stringify({ random: RANDOM_STRING, redirect_uri: redirectUrl })
    ).toString("base64");
    const SCOPE = ["email", "user_birthday"].join("+");

    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&state=${STATE}&response_type=code&scope=${SCOPE}`;
    response
      .cookie("FACEBOOK_STATE", STATE, {
        httpOnly: true
      })
      .status(HttpStatus.OK)
      .json({ url });
  }

  async getFacebookTokens(code: string, redirectUrl: string) {
    const CLIENT_ID = this.configService.get<string>("FACEBOOK_CLIENT_ID");
    const SECRET_KEY = this.configService.get<string>("FACEBOOK_CLIENT_SECRET");
    const REDIRECT_URL = `${redirectUrl}/api/auth/social/facebook-response`;
    const url = `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&client_secret=${SECRET_KEY}&code=${code}`;
    const response = await lastValueFrom(
      this.httpService.get(url).pipe(map((resp) => resp.data))
    );
    return response;
  }

  async getFacebookUserInfo(access_token: string) {
    const FIELDS = ["id", "email", "birthday", "first_name", "last_name"].join(
      ","
    );
    const url = `https://graph.facebook.com/v13.0/me?fields=${FIELDS}&access_token=${access_token}`;
    const response = await lastValueFrom(
      this.httpService.get(url).pipe(map((resp) => resp.data))
    );
    return response;
  }
}
