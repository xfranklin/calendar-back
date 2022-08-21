import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "../jwt/jwt.service";
import { UserService } from "../user/user.service";
import { SignUpDto } from "./dto/signup.dto";
import { Request, Response } from "express";
import * as argon2 from "argon2";
import { UserType } from "../user/types/user.type";
import { LoginDto } from "./dto/login.dto";
import { EntrypointEnum } from "../user/types/entrypoints.enum";
import { SocialsService } from "../socials/socials.service";
import { ConfigService } from "@nestjs/config";
import { getUser } from "../user/helpers/getUser";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly socialsService: SocialsService,
    private readonly configService: ConfigService,
  ) {}

  // ┌─┐┬┌─┐┌┐┌┬ ┬┌─┐
  // └─┐││ ┬││││ │├─┘
  // └─┘┴└─┘┘└┘└─┘┴
  public async signUp(userDto: SignUpDto, response: Response) {
    const isEmailExist = await this.userService.isEmailExist(userDto.email);
    if (isEmailExist) {
      throw new HttpException("EMAIL_ALREADY_EXIST", HttpStatus.BAD_REQUEST);
    }
    const password = await argon2.hash(userDto.password);
    const { _id } = await this.userService.createEntrypoint(
      EntrypointEnum.EMAIL,
      { ...userDto, password },
    );
    const user: UserType = await this.userService.create({
      email: userDto.email,
      entrypoints: [_id],
    });
    await this.setCookies(user, response);
  }

  // ┬  ┌─┐┌─┐┬┌┐┌
  // │  │ ││ ┬││││
  // ┴─┘└─┘└─┘┴┘└┘
  public async login(userDto: LoginDto, response: Response) {
    const user = await this.userService.findUserByEmail(userDto.email);
    if (!user?.entrypoints) {
      throw new HttpException(
        "INCORRECT_EMAIL_OR_PASSWORD",
        HttpStatus.BAD_REQUEST,
      );
    }
    const emailEntrypoint = user.entrypoints.find(
      ({ type }) => type === EntrypointEnum.EMAIL,
    );
    if (emailEntrypoint) {
      if (await argon2.verify(emailEntrypoint.password, userDto.password)) {
        await this.setCookies(user, response);
      } else {
        throw new HttpException(
          "INCORRECT_EMAIL_OR_PASSWORD",
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        "INCORRECT_EMAIL_OR_PASSWORD",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ┌─┐┌─┐┌─┐┌─┐┬  ┌─┐
  // │ ┬│ ││ ││ ┬│  ├┤
  // └─┘└─┘└─┘└─┘┴─┘└─┘
  public async googleAuth(
    code: string,
    state: string,
    request: Request,
    response: Response,
  ) {
    if (request.cookies.GOOGLE_STATE !== state) {
      return response.redirect(this.configService.get<string>("APP_URL"));
    }
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      const redirectUrl =
        this.configService
          .get<string>("DOMAINS_WHITE_LIST")
          .split("|")
          .find((domain) => domain === stateData.redirect_uri) ||
        this.configService.get<string>("APP_URL");

      const { id_token, access_token } =
        await this.socialsService.getGoogleTokens(code, redirectUrl);
      const { sub, email } = JSON.parse(
        Buffer.from(id_token.split(".")[1], "base64").toString(),
      );
      const user = await this.userService.findUserByEmail(email);
      if (user) {
        const hasEntrypoint = user.entrypoints.find(
          ({ clientId }) => clientId === sub,
        );
        if (hasEntrypoint) {
          await this.setCookies(user, response, redirectUrl);
        } else {
          response.redirect(redirectUrl);
        }
      } else {
        const { given_name, family_name } =
          await this.socialsService.getGoogleUserInfo(access_token);
        const birthday = await this.socialsService.getGoogleUserBirthday(
          access_token,
        );
        const { _id } = await this.userService.createEntrypoint(
          EntrypointEnum.GOOGLE,
          { clientId: sub, email },
        );
        const newUser = await this.userService.create({
          email,
          birthday,
          entrypoints: [_id],
          firstName: given_name,
          lastName: family_name,
        });
        await this.setCookies(newUser, response, redirectUrl);
      }
    } catch {
      response.redirect(this.configService.get<string>("APP_URL"));
    }
  }

  // ┌─┐┌─┐┌─┐┌─┐┌┐ ┌─┐┌─┐┬┌─
  // ├┤ ├─┤│  ├┤ ├┴┐│ ││ │├┴┐
  // └  ┴ ┴└─┘└─┘└─┘└─┘└─┘┴ ┴
  public async facebookAuth(
    code: string,
    state: string,
    request: Request,
    response: Response,
  ) {
    if (request.cookies.FACEBOOK_STATE !== state) {
      return response.redirect(this.configService.get<string>("APP_URL"));
    }
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      const redirectUrl =
        this.configService
          .get<string>("DOMAINS_WHITE_LIST")
          .split("|")
          .find((domain) => domain === stateData.redirect_uri) ||
        this.configService.get<string>("APP_URL");

      const { access_token } = await this.socialsService.getFacebookTokens(
        code,
        redirectUrl,
      );
      const { id, email, birthday, first_name, last_name } =
        await this.socialsService.getFacebookUserInfo(access_token);
      if (id) {
        const entrypoint = await this.userService.findEntrypointByClientId(
          EntrypointEnum.FACEBOOK,
          id,
        );
        if (entrypoint?._id) {
          const user = await this.userService.findUserByEntryPoint(
            entrypoint?._id,
          );
          if (user) {
            return await this.setCookies(user, response, redirectUrl);
          }
        } else {
          const { _id } = await this.userService.createEntrypoint(
            EntrypointEnum.FACEBOOK,
            { clientId: id, ...(email && { email }) },
          );
          const newUser = await this.userService.create({
            entrypoints: [_id],
            ...(birthday && { birthday: new Date(birthday) }),
            ...(email && { email }),
            ...(first_name && { firstName: first_name }),
            ...(last_name && { lastName: last_name }),
          });
          return await this.setCookies(newUser, response, redirectUrl);
        }
      } else {
        response.redirect(redirectUrl);
      }
    } catch {
      response.redirect(this.configService.get<string>("APP_URL"));
    }
  }

  // ┬─┐┌─┐┌─┐┬─┐┌─┐┌─┐┬ ┬
  // ├┬┘├┤ ├┤ ├┬┘├┤ └─┐├─┤
  // ┴└─└─┘└  ┴└─└─┘└─┘┴ ┴
  public async refresh(request: Request, response: Response) {
    const { REFRESH_TOKEN, ACCESS_TOKEN } = request.cookies;
    await this.jwtService.refreshToken(REFRESH_TOKEN, ACCESS_TOKEN, response);
  }

  // ┬  ┌─┐┌─┐┌─┐┬ ┬┌┬┐
  // │  │ ││ ┬│ ││ │ │
  // ┴─┘└─┘└─┘└─┘└─┘ ┴
  public async logout(request: Request, response: Response) {
    const { REFRESH_TOKEN } = request.cookies;
    await this.jwtService.deleteRefreshToken(REFRESH_TOKEN);
    await this.jwtService.clearCookies(response);
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************

  private async setCookies(
    user: UserType,
    response: Response,
    redirectUrl?: string,
  ) {
    const access = this.jwtService.generateAccessToken(user);
    const refresh = await this.jwtService.generateRefreshToken(user._id);
    const userData = getUser(user);
    this.jwtService.setCookies(
      access,
      refresh,
      response,
      redirectUrl,
      userData,
    );
  }
}
