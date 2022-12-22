import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import * as argon2 from "argon2";
import { JwtService } from "../jwt/jwt.service";
import { UserService } from "../user/user.service";
import { SignUpDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { EntrypointEnum } from "../user/types/entrypoints.enum";
import { SocialsService } from "../socials/socials.service";
import { ConfigService } from "@nestjs/config";
import { getUser } from "../user/helpers/getUser";
import { TokenDto } from "./dto/token.dto";
import { User } from "../user/entities/user.entity";
import { EmailDto } from "./dto/email.dto";
import { PasswordCreateDto } from "./dto/password-create.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly socialsService: SocialsService,
    private readonly configService: ConfigService
  ) {}

  // ┌─┐┬┌─┐┌┐┌┬ ┬┌─┐
  // └─┐││ ┬││││ │├─┘
  // └─┘┴└─┘┘└┘└─┘┴
  public async signUp(userDto: SignUpDto, response: FastifyReply) {
    const isEmailExist = await this.userService.isEmailExist(userDto.email);
    if (isEmailExist) {
      throw new HttpException("EMAIL_ALREADY_EXIST", HttpStatus.BAD_REQUEST);
    }

    const password = await argon2.hash(userDto.password);

    const user = await this.userService.create(
      { email: userDto.email },
      {
        type: EntrypointEnum.EMAIL,
        ...userDto,
        password
      }
    );
    await this.setCookies(user, response);
  }

  // ┬  ┌─┐┌─┐┬ ┌┐┌
  // │  │ ││ ┬│ │││
  // ┴─┘└─┘└─┘┴ ┘└┘
  public async login(userDto: LoginDto, response: FastifyReply) {
    const user = await this.userService.findUserByEmail(userDto.email);
    if (user?.entrypoints) {
      const emailEntrypoint = user.entrypoints
        .getItems()
        .find(({ type }) => type === EntrypointEnum.EMAIL);

      if (emailEntrypoint) {
        if (await argon2.verify(emailEntrypoint.password, userDto.password)) {
          await this.setCookies(user, response);
        }
      }
    }

    throw new HttpException(
      "INCORRECT_EMAIL_OR_PASSWORD",
      HttpStatus.BAD_REQUEST
    );
  }

  // ┌─┐┌─┐┌─┐┌─┐┬  ┌─┐
  // │ ┬│ ││ ││ ┬│  ├┤
  // └─┘└─┘└─┘└─┘┴─┘└─┘
  public async googleAuth(
    code: string,
    state: string,
    request: FastifyRequest,
    response: FastifyReply
  ) {
    if (request.cookies.GOOGLE_STATE !== state) {
      return response.redirect(302, this.configService.get<string>("APP_URL"));
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
        Buffer.from(id_token.split(".")[1], "base64").toString()
      );

      const user = await this.userService.findUserByEmail(email);
      if (user) {
        const hasEntrypoint = user.entrypoints
          .getItems()
          .find(({ clientId }) => clientId === sub);

        if (hasEntrypoint) {
          await this.setCookies(user, response, redirectUrl);
        } else {
          response.redirect(302, redirectUrl);
        }
      } else {
        const { given_name, family_name } =
          await this.socialsService.getGoogleUserInfo(access_token);
        const birthday = await this.socialsService.getGoogleUserBirthday(
          access_token
        );

        const user = await this.userService.create(
          {
            email,
            birthday,
            firstName: given_name,
            lastName: family_name,
            isVerified: true
          },
          {
            type: EntrypointEnum.GOOGLE,
            clientId: sub,
            email
          }
        );
        await this.setCookies(user, response, redirectUrl);
      }
    } catch (e) {
      console.error(`AUTH Google: ${e}`);
      response.redirect(302, this.configService.get<string>("APP_URL"));
    }
  }

  // ┌─┐┌─┐┌─┐┌─┐┌┐ ┌─┐┌─┐┬┌─
  // ├┤ ├─┤│  ├┤ ├┴┐│ ││ │├┴┐
  // └  ┴ ┴└─┘└─┘└─┘└─┘└─┘┴ ┴
  public async facebookAuth(
    code: string,
    state: string,
    request: FastifyRequest,
    response: FastifyReply
  ) {
    if (request.cookies.FACEBOOK_STATE !== state) {
      return response.redirect(302, this.configService.get<string>("APP_URL"));
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
        redirectUrl
      );
      const { id, email, birthday, first_name, last_name } =
        await this.socialsService.getFacebookUserInfo(access_token);

      const entrypoint = await this.userService.findEntrypointByClientId(
        EntrypointEnum.FACEBOOK,
        id
      );

      if (entrypoint?._id) {
        const user = await this.userService.findUserByEntryPoint(
          entrypoint?._id.toString()
        );
        return await this.setCookies(user, response, redirectUrl);
      } else {
        if (email) {
          const isExist = await this.userService.isEmailExist(email);
          if (isExist) {
            return response.redirect(302, redirectUrl);
          }
        }

        const user = await this.userService.create(
          {
            ...(birthday && {
              birthday: (() => {
                const [month, day, year] = birthday.split("/");
                return new Date(Date.UTC(year, Number(month) - 1, day));
              })()
            }),
            ...(email && { email }),
            ...(first_name && { firstName: first_name }),
            ...(last_name && { lastName: last_name }),
            isVerified: !!email
          },
          {
            type: EntrypointEnum.FACEBOOK,
            clientId: id,
            ...(email && { email })
          }
        );

        return await this.setCookies(user, response, redirectUrl);
      }
    } catch (e) {
      console.error(`AUTH Facebook: ${e}`);
      response.redirect(302, this.configService.get<string>("APP_URL"));
    }
  }

  // ┬─┐┌─┐┌─┐┬─┐┌─┐┌─┐┬ ┬
  // ├┬┘├┤ ├┤ ├┬┘├┤ └─┐├─┤
  // ┴└─└─┘└  ┴└─└─┘└─┘┴ ┴
  public async refresh(request: FastifyRequest, response: FastifyReply) {
    const { REFRESH_TOKEN, ACCESS_TOKEN } = request.cookies;
    await this.jwtService.refreshToken(REFRESH_TOKEN, ACCESS_TOKEN, response);
  }

  // ┬  ┌─┐┌─┐┌─┐┬ ┬┌┬┐
  // │  │ ││ ┬│ ││ │ │
  // ┴─┘└─┘└─┘└─┘└─┘ ┴
  public async logout(request: FastifyRequest, response: FastifyReply) {
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
    user: User,
    response: FastifyReply,
    redirectUrl?: string
  ) {
    const access = this.jwtService.generateAccessToken(user);
    const refresh = await this.jwtService.generateRefreshToken(
      user._id.toString()
    );
    const userData = getUser(user);
    this.jwtService.setCookies(
      access,
      refresh,
      response,
      redirectUrl,
      userData
    );
  }

  async validateEmail({ token }: TokenDto) {
    return Promise.resolve(token);
  }

  forgotPassword({ email }: EmailDto) {
    return Promise.resolve(email);
  }

  forgotPasswordCreate({ token, password }: PasswordCreateDto) {
    return Promise.resolve({ token, password });
  }
}
