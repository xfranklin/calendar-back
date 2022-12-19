import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { FastifyReply } from "fastify";
import { UserService } from "../user/user.service";
import { RefreshRepository } from "./refresh.repository";
import { User } from "../user/entities/user.entity";
import { getUser } from "../user/helpers/getUser";

@Injectable()
export class JwtService {
  constructor(
    private readonly refreshRepository: RefreshRepository,
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {}

  public setCookies(
    access: string,
    refresh: string,
    response: FastifyReply,
    redirectUrl?: string,
    user?: ReturnType<typeof getUser>
  ) {
    response
      .cookie("ACCESS_TOKEN", access, {
        httpOnly: true
      })
      .cookie("REFRESH_TOKEN", refresh, {
        httpOnly: true
      });
    if (redirectUrl) {
      return response.redirect(redirectUrl);
    } else {
      response
        .status(HttpStatus.OK)
        .send({ status: HttpStatus.OK, ...(user && { user }) });
    }
  }

  public clearCookies(response: FastifyReply) {
    response
      .clearCookie("ACCESS_TOKEN", { httpOnly: true })
      .clearCookie("REFRESH_TOKEN", { httpOnly: true })
      .status(HttpStatus.OK)
      .send({ status: HttpStatus.OK });
  }

  public generateAccessToken({ _id, email, role, isVerified }: User): string {
    return jwt.sign(
      { type: "ACCESS", id: _id.toString(), email, role, isVerified },
      this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      {
        expiresIn: Number(this.configService.get<string>("ACCESS_EXPIRATION"))
      }
    );
  }

  public async generateRefreshToken(userId: string): Promise<string> {
    const ttl = Number(this.configService.get<string>("REFRESH_EXPIRATION"));
    const expiredAt = new Date(Date.now() + ttl * 1000);
    const refreshToken = jwt.sign(
      { type: "REFRESH", id: userId },
      this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: ttl
      }
    );
    const newRefresh = this.refreshRepository.create({
      userId,
      refreshToken,
      expiredAt
    });

    await this.refreshRepository.persistAndFlush(newRefresh);

    return refreshToken;
  }

  public async refreshToken(
    REFRESH_TOKEN: string,
    ACCESS_TOKEN: string,
    response: FastifyReply
  ) {
    this.verifyAccessToken(ACCESS_TOKEN);
    this.verifyRefreshToken(REFRESH_TOKEN);
    const { userId, id } = await this.findRefreshToken(REFRESH_TOKEN);
    await this.deleteRefreshById(id);
    const refreshToken = await this.generateRefreshToken(userId);
    const user = await this.userService.findUserById(userId);
    const accessToken = this.generateAccessToken(user);
    this.setCookies(accessToken, refreshToken, response);
  }

  public async deleteRefreshToken(refreshToken: string) {
    await this.refreshRepository.nativeDelete({ refreshToken });
  }

  // ********************************************
  // ╔═╗╦═╗╦╦  ╦╔═╗╔╦╗╔═╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  // ╠═╝╠╦╝║╚╗╔╝╠═╣ ║ ║╣   ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  // ╩  ╩╚═╩ ╚╝ ╩ ╩ ╩ ╚═╝  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  // ********************************************
  private async findRefreshToken(token: string) {
    const refreshToken = await this.refreshRepository.findOne({
      refreshToken: token
    });
    if (!refreshToken) {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
    return refreshToken;
  }

  private verifyRefreshToken(token: string) {
    try {
      jwt.verify(token, this.configService.get<string>("REFRESH_TOKEN_SECRET"));
    } catch {
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
  }

  private verifyAccessToken(token: string) {
    try {
      jwt.verify(token, this.configService.get<string>("ACCESS_TOKEN_SECRET"));
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        return;
      }
      throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException("ACCESS_TOKEN_NOT_EXPIRED", HttpStatus.BAD_REQUEST);
  }

  private async deleteRefreshById(id: string) {
    await this.refreshRepository.nativeDelete({ id: id });
  }
}
